/**
 * Email Service using Resend
 * Handles transactional emails for the Avalmeo's Travel platform
 */

const { Resend } = require('resend');

class EmailService {
    constructor() {
        this.resend = process.env.RESEND_API_KEY 
            ? new Resend(process.env.RESEND_API_KEY) 
            : null;
        this.fromEmail = process.env.FROM_EMAIL || 'noreply@avalmeos-travel.com';
        this.fromName = process.env.FROM_NAME || 'Avalmeo\'s Travel';
        this.adminEmail = process.env.ADMIN_EMAIL || 'avalmeostravel@gmail.com';
    }

    /**
     * Send an inquiry reply email to the customer
     * @param {Object} params - Email parameters
     * @param {string} params.to - Customer email address
     * @param {string} params.customerName - Customer's name
     * @param {string} params.subject - Original inquiry subject
     * @param {string} params.replyMessage - Admin's reply message
     * @param {string} params.adminName - Admin's name (optional)
     */
    async sendInquiryReply({ to, customerName, subject, replyMessage, adminName = 'Avalmeo\'s Travel Team' }) {
        if (!this.resend) {
            console.log('[EmailService] Resend not configured - email would be sent to:', to);
            console.log('[EmailService] Subject:', subject);
            console.log('[EmailService] Message:', replyMessage);
            return { success: true, mock: true };
        }

        try {
            const data = await this.resend.emails.send({
                from: `${this.fromName} <${this.fromEmail}>`,
                to: to,
                reply_to: this.adminEmail,
                subject: `Re: ${subject}`,
                html: this.generateReplyEmailHtml({ customerName, subject, replyMessage, adminName })
            });

            console.log('[EmailService] Reply sent successfully to:', to);
            return { success: true, data };
        } catch (error) {
            console.error('[EmailService] Error sending reply:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send notification to admin when new inquiry is received
     * @param {Object} inquiry - Inquiry details
     */
    async sendNewInquiryNotification(inquiry) {
        if (!this.resend) {
            console.log('[EmailService] New inquiry notification would be sent to:', this.adminEmail);
            return { success: true, mock: true };
        }

        try {
            const data = await this.resend.emails.send({
                from: `${this.fromName} <${this.fromEmail}>`,
                to: this.adminEmail,
                subject: `New Inquiry: ${inquiry.subject}`,
                html: this.generateNotificationEmailHtml(inquiry)
            });

            console.log('[EmailService] Notification sent to admin');
            return { success: true, data };
        } catch (error) {
            console.error('[EmailService] Error sending notification:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate HTML for reply email
     */
    generateReplyEmailHtml({ customerName, subject, replyMessage, adminName }) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Avalmeo's Travel</h1>
    </div>
    
    <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="font-size: 16px;">Hi ${customerName},</p>
        
        <p style="font-size: 16px;">Thank you for reaching out to us. Here's our response to your inquiry:</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${subject}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${replyMessage}</p>
        </div>
        
        <p style="font-size: 16px;">If you have any further questions, feel free to reply to this email or contact us directly.</p>
        
        <p style="font-size: 16px; margin-top: 30px;">
            Best regards,<br>
            <strong>${adminName}</strong>
        </p>
    </div>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 0 0 8px 8px; text-align: center;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
            © ${new Date().getFullYear()} Avalmeo's Travel. All rights reserved.
        </p>
    </div>
</body>
</html>
        `;
    }

    /**
     * Generate HTML for new inquiry notification to admin
     */
    generateNotificationEmailHtml(inquiry) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">New Inquiry Received</h1>
    </div>
    
    <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="font-size: 16px;">A new inquiry has been submitted on the Avalmeo's Travel website.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${inquiry.name} (${inquiry.email})</p>
            ${inquiry.phone ? `<p style="margin: 0 0 10px 0;"><strong>Phone:</strong> ${inquiry.phone}</p>` : ''}
            <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${inquiry.subject}</p>
            <p style="margin: 0;"><strong>Message:</strong></p>
            <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${inquiry.message}</p>
        </div>
        
        <p style="font-size: 16px;">
            <a href="${process.env.ADMIN_URL || 'http://localhost:3000/admin.html'}#/inquiries" 
               style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                View in Admin Panel
            </a>
        </p>
    </div>
</body>
</html>
        `;
    }
}

module.exports = new EmailService();
