import prisma from '../prismaClient.js';

class NotificationService {
  
  async getSettings() {
    try {
      const settings = await prisma.settings.findFirst({ where: { id: 1 } });
      return {
        phone: settings?.whatsappPhone,
        apiKey: settings?.whatsappApiKey
      };
    } catch (error) {
      console.error('NotificationService: Failed to fetch settings', error);
      return { phone: null, apiKey: null };
    }
  }

  /**
   * Send a WhatsApp message using CallMeBot
   * @param {string} message - The text message to send
   */
  async sendWhatsApp(message) {
    const { phone, apiKey } = await this.getSettings();

    if (!apiKey || !phone) {
      console.warn('NotificationService: Missing whatsappPhone or whatsappApiKey in Settings. Skipping WhatsApp notification.');
      return;
    }

    try {
      // CallMeBot API: https://api.callmebot.com/whatsapp.php?phone=[phone]&text=[text]&apikey=[apikey]
      const encodedMessage = encodeURIComponent(message);
      const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMessage}&apikey=${apiKey}`;
      
      // Using global fetch (Node 18+)
      const response = await fetch(url);
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`CallMeBot error: ${response.status} ${text}`);
      }
      
      console.log(`NotificationService: WhatsApp sent to ${phone}`);
    } catch (error) {
      console.error('NotificationService: Failed to send WhatsApp', error.message);
    }
  }

  /**
   * Notify admin about a new booking
   * @param {object} booking - The booking object (must include client and service)
   */
  async notifyAdminNewBooking(booking) {
    try {
      const { client, service, startTime, status, notes } = booking;
      
      // Format date to Persian/Tehran time
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
      const notesText = notes ? `\n🗒 *Notes:* ${notes}` : '';

      const message = `🔔 *New Booking Received*\n\n` +
        `👤 *Client:* ${clientName}\n` +
        `📞 *Phone:* ${clientPhone}\n` +
        `💇‍♀️ *Service:* ${serviceName}\n` +
        `📅 *Time:* ${dateStr}\n` +
        `📝 *Status:* ${status}` +
        notesText + `\n\n` +
        `_Check admin panel for details._`;

      await this.sendWhatsApp(message);
    } catch (error) {
      console.error('NotificationService: Error preparing booking notification', error);
    }
  }
}

export default new NotificationService();
