import TelegramBot from 'node-telegram-bot-api';
import prisma from '../prismaClient.js';

class TelegramService {
  constructor() {
    this.bot = null;
    this.botToken = null;
    this.chatId = null;
    this.init();
  }

  async init() {
    try {
      const settings = await prisma.settings.findFirst({ where: { id: 1 } });
      if (settings?.telegramBotToken) {
        this.startBot(settings.telegramBotToken, settings.telegramChatId);
      }
    } catch (error) {
      console.error('TelegramService: Failed to load settings', error);
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
          console.log(`TelegramService: Received message from ${msg.chat.id}: ${msg.text}`);
          // Here you can process the reply (e.g., save to DB, forward to another system)
          // For now, we just acknowledge receipt
          // this.bot.sendMessage(msg.chat.id, 'Message received by backend.');
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
      
      const clientName = client?.name || 'Unknown Client';
      const clientPhone = client?.phone || 'No Phone';
      const serviceName = service?.titleEn || service?.titleFa || 'General Service';
      const notesText = notes ? `\n🗒 <b>Notes:</b> ${notes}` : '';

      const message = `🔔 <b>New Booking Received</b>\n\n` +
        `👤 <b>Client:</b> ${clientName}\n` +
        `📞 <b>Phone:</b> ${clientPhone}\n` +
        `💇‍♀️ <b>Service:</b> ${serviceName}\n` +
        `📅 <b>Time:</b> ${dateStr}\n` +
        `📝 <b>Status:</b> ${status}` +
        notesText + `\n\n` +
        `<i>Reply to this message to log a note on the server.</i>`;

      await this.bot.sendMessage(this.chatId, message, { parse_mode: 'HTML' });
      console.log('TelegramService: Notification sent');
    } catch (error) {
      console.error('TelegramService: Failed to send notification', error.message);
    }
  }
}

export default new TelegramService();
