import TelegramBot from 'node-telegram-bot-api';
import prisma from '../prismaClient.js';

class TelegramService {
  constructor() {
    this.bot = null;
    this.botToken = null;
    this.chatId = null;
    this.io = null;
    this.messageMap = new Map(); // telegramMessageId -> { sessionId, timestamp }
    this.cleanupInterval = null;
    this.init();
  }

  setSocketIo(io) {
    this.io = io;
  }

  async init() {
    // Start cleanup interval (every 1 hour)
    if (!this.cleanupInterval) {
      this.cleanupInterval = setInterval(() => this.cleanupMessageMap(), 60 * 60 * 1000);
    }

    try {
      const settings = await prisma.settings.findFirst({ where: { id: 1 } });
      if (settings?.telegramBotToken) {
        this.startBot(settings.telegramBotToken, settings.telegramChatId);
      }
    } catch (error) {
      console.error('TelegramService: Failed to load settings', error);
    }
  }

  cleanupMessageMap() {
    const now = Date.now();
    const expiry = 24 * 60 * 60 * 1000; // 24 hours
    for (const [key, value] of this.messageMap.entries()) {
      if (now - value.timestamp > expiry) {
        this.messageMap.delete(key);
      }
    }
  }

  startBot(token, savedChatId) {
    // If bot already exists with same token, do nothing
    if (this.bot && this.botToken === token) {
      this.chatId = savedChatId; // Update chat ID just in case
      return;
    }

    // Stop existing bot if token changed
    if (this.bot) {
      try {
        this.bot.stopPolling();
      } catch (e) { /* ignore */ }
    }

    this.botToken = token;
    this.chatId = savedChatId;

    try {
      // Create new bot instance
      this.bot = new TelegramBot(token, { polling: true });
      console.log('TelegramService: Bot started');

      // Listen for /start command to capture Chat ID
      this.bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id.toString();
        const type = msg.chat.type; // 'private', 'group', 'supergroup', 'channel'
        console.log(`TelegramService: Received /start from ${chatId} (${type})`);
        
        let text = `👋 Hello!\n\n`;
        if (type === 'private') {
           text += `This is your personal <b>Chat ID</b>:\n<code>${chatId}</code>\n\nCopy this ID and paste it into the Admin Panel settings to receive notifications here.`;
        } else {
           text += `The <b>Chat ID</b> for this ${type} is:\n<code>${chatId}</code>\n\nCopy this ID and paste it into the Admin Panel settings to receive notifications in this group.`;
        }
        
        // Do NOT save automatically. Just tell the user their ID.
        this.bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
      });

      // Listen for replies
      this.bot.on('message', (msg) => {
        if (msg.text && !msg.text.startsWith('/')) {
          // Check if it's a reply to a forwarded message
          if (msg.reply_to_message) {
            const originalMsgId = msg.reply_to_message.message_id;
            const entry = this.messageMap.get(originalMsgId);
            
            if (entry && entry.sessionId) {
              // Save to DB first
              this.saveChatMessage(entry.sessionId, msg.text, 'ADMIN');

              if (this.io) {
                // Send to frontend room
                this.io.to(`session_${entry.sessionId}`).emit('admin_reply', { text: msg.text });
              }
              
              // Also map this new admin message to the same session, so admin can reply to their own reply
              this.messageMap.set(msg.message_id, { sessionId: entry.sessionId, timestamp: Date.now() });
            }
          }
        }
      });

      this.bot.on('polling_error', (error) => {
        console.error('TelegramService: Polling error', error.code); // Limit noise
      });

    } catch (error) {
      console.error('TelegramService: Failed to start bot', error);
    }
  }

  async reload() {
    await this.init();
  }

  async handleUserMessage(sessionId, text) {
    if (!this.bot || !this.chatId) return;
    
    try {
      // Save to DB
      await this.saveChatMessage(sessionId, text, 'USER');

      const sentMsg = await this.bot.sendMessage(this.chatId, `💬 <b>User Message:</b> (ID: ${sessionId})\n${text}`, { parse_mode: 'HTML' });
      this.messageMap.set(sentMsg.message_id, { sessionId, timestamp: Date.now() });
      
    } catch (e) {
      console.error('TelegramService: Failed to forward user message', e);
    }
  }

  async notifyNewBooking(booking) {
    if (!this.bot || !this.chatId) {
      console.warn('TelegramService: Cannot send notification. Bot not started or Chat ID missing.');
      return;
    }

    try {
      const { client, service, startTime, status, notes } = booking;
      
      const dateOptions = { 
        timeZone: 'Asia/Tehran', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        calendar: 'persian'
      };
      const dateStr = new Date(startTime).toLocaleString('fa-IR', dateOptions);
      
      const clientName = client?.name || 'ناشناس';
      const clientPhone = client?.phone || 'بدون شماره';
      const serviceName = service?.titleFa || service?.titleEn || 'خدمت عمومی';
      const notesText = notes ? `\n🗒 <b>یادداشت‌ها:</b> ${notes}` : '';

      const message = `🔔 <b>رزرو جدید دریافت شد</b>\n\n` +
        `👤 <b>مشتری:</b> ${clientName}\n` +
        `📞 <b>تلفن:</b> ${clientPhone}\n` +
        `💇‍♀️ <b>خدمت:</b> ${serviceName}\n` +
        `📅 <b>زمان:</b> ${dateStr}\n` +
        `📝 <b>وضعیت:</b> ${status}` +
        notesText + `\n\n` +
        `<i>برای ثبت یادداشت در سرور به این پیام پاسخ دهید.</i>`;

      await this.bot.sendMessage(this.chatId, message, { parse_mode: 'HTML' });
      console.log('TelegramService: Notification sent');
    } catch (error) {
      console.error('TelegramService: Failed to send notification', error.message);
    }
  }

  async notifyNewMessage(msgData) {
    if (!this.bot || !this.chatId) return;

    try {
      const { fromName, email, phone, subject, body } = msgData;
      
      const message = `📧 <b>پیام جدید از فرم تماس</b>\n\n` +
        `👤 <b>نام:</b> ${fromName}\n` +
        (email ? `✉️ <b>ایمیل:</b> ${email}\n` : '') +
        (phone ? `📞 <b>تلفن:</b> ${phone}\n` : '') +
        (subject ? `📌 <b>موضوع:</b> ${subject}\n` : '') +
        `\n📝 <b>پیام:</b>\n${body}`;

      await this.bot.sendMessage(this.chatId, message, { parse_mode: 'HTML' });
    } catch (error) {
      console.error('TelegramService: Failed to send message notification', error.message);
    }
  }

  async saveChatMessage(sessionId, text, sender) {
    try {
      await prisma.chatMessage.create({ data: { sessionId, text, sender } });
      // Trim history to last 200 messages per session to keep DB lean
      const old = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' },
        skip: 200,
        select: { id: true },
      });
      if (old.length) {
        await prisma.chatMessage.deleteMany({ where: { id: { in: old.map((o) => o.id) } } });
      }
    } catch (e) {
      console.error('TelegramService: Failed to save chat message', e);
    }
  }

  async getSessionHistory(sessionId) {
    try {
      const rows = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        take: 200,
      });
      return rows.map((r) => ({
        id: new Date(r.createdAt).getTime(),
        text: r.text,
        sender: r.sender === 'ADMIN' ? 'bot' : 'user',
        timestamp: r.createdAt,
      }));
    } catch (e) {
      console.error('TelegramService: Failed to fetch chat history', e);
      return [];
    }
  }
}

export default new TelegramService();
