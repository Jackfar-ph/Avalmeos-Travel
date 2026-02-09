// --- Email Notification System ---

const EMAIL_NOTIFICATIONS_KEY = 'avalmeos_email_notifications';

// Email templates
const emailTemplates = {
    booking_confirmation: {
        subject: 'Booking Confirmation - Avalmeo\'s Travel',
        template: (booking) => `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #1a4d41, #2d7a6a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee; }
                    .item { padding: 10px 0; border-bottom: 1px solid #eee; }
                    .total { font-size: 24px; font-weight: bold; color: #ea580c; margin-top: 20px; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    .button { display: inline-block; background: #1a4d41; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✈️ Avalmeo's Travel</h1>
                        <p>Booking Confirmation</p>
                    </div>
                    <div class="content">
                        <h2>Hi ${booking.userName},</h2>
                        <p>Thank you for your booking! We've received your request and will process it within 24 hours.</p>
                        
                        <div class="booking-details">
                            <h3>Booking Details</h3>
                            <p><strong>Booking ID:</strong> ${booking.id}</p>
                            <p><strong>Date:</strong> ${formatDate(booking.createdAt)}</p>
                            
                            ${booking.items.map(item => `
                                <div class="item">
                                    <p><strong>${item.packageTitle}</strong></p>
                                    <p>📍 ${item.city} | 👥 ${item.paxSize} pax | 📅 ${formatDate(item.travelDate)}</p>
                                    ${item.personalization.length > 0 ? `
                                        <p><small>Add-ons: ${item.personalization.map(p => {
                                            const opt = getPersonalizationOptions().find(o => o.id === p);
                                            return opt ? `${opt.icon} ${opt.name}` : '';
                                        }).join(', ')}</small></p>
                                    ` : ''}
                                </div>
                            `).join('')}
                            
                            <div class="total">Total: ${formatPrice(booking.total)}</div>
                        </div>
                        
                        <p><strong>Next Steps:</strong></p>
                        <ul>
                            <li>Our team will review your booking</li>
                            <li>You'll receive a confirmation email once approved</li>
                            <li>Payment instructions will be sent via SMS/Email</li>
                        </ul>
                        
                        <p>Need help? Reply to this email or contact us directly.</p>
                        
                        <a href="#" class="button">View Your Booking</a>
                    </div>
                    <div class="footer">
                        <p>© 2024 Avalmeo's Travel. All rights reserved.</p>
                        <p>Made with ❤️ in the Philippines</p>
                    </div>
                </div>
            </body>
            </html>
        `
    },
    
    booking_status_update: {
        subject: 'Booking Update - Avalmeo\'s Travel',
        template: (booking) => `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #1a4d41, #2d7a6a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .status { padding: 15px 30px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
                    .status.confirmed { background: #dcfce7; color: #166534; }
                    .status.rejected { background: #fee2e2; color: #991b1b; }
                    .status.pending { background: #fef3c7; color: #92400e; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    .button { display: inline-block; background: #1a4d41; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✈️ Avalmeo's Travel</h1>
                        <p>Booking Update</p>
                    </div>
                    <div class="content">
                        <h2>Hi ${booking.userName},</h2>
                        <p>Your booking status has been updated!</p>
                        
                        <div class="status ${booking.status}">
                            ${booking.status.toUpperCase()}
                        </div>
                        
                        <p><strong>Booking ID:</strong> ${booking.id}</p>
                        <p><strong>Updated:</strong> ${formatDate(booking.updatedAt || booking.createdAt)}</p>
                        
                        ${booking.status === 'confirmed' ? `
                            <p>🎉 Congratulations! Your booking has been confirmed. Our team will contact you shortly with payment details and travel itinerary.</p>
                        ` : ''}
                        
                        ${booking.status === 'rejected' ? `
                            <p>We're sorry, but your booking could not be processed at this time. This may be due to:</p>
                            <ul>
                                <li>Unavailability of the selected dates</li>
                                <li>Package no longer available</li>
                                <li>Other circumstances</li>
                            </ul>
                            <p>Please contact us for alternative options or a full refund.</p>
                        ` : ''}
                        
                        <a href="#" class="button">View Booking Details</a>
                    </div>
                    <div class="footer">
                        <p>© 2024 Avalmeo's Travel. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    },
    
    payment_reminder: {
        subject: 'Payment Reminder - Avalmeo\'s Travel',
        template: (booking) => `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ea580c, #f97316); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .amount { font-size: 36px; font-weight: bold; color: #ea580c; text-align: center; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    .button { display: inline-block; background: #ea580c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>💰 Payment Reminder</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${booking.userName},</h2>
                        <p>This is a friendly reminder to complete your payment for booking <strong>${booking.id}</strong>.</p>
                        
                        <div class="amount">${formatPrice(booking.total)}</div>
                        
                        <p><strong>Payment Due:</strong> Within 48 hours to confirm your reservation</p>
                        
                        <a href="#" class="button">Pay Now</a>
                        
                        <p><small>If you've already made the payment, please disregard this message.</small></p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Avalmeo's Travel. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }
};

// Send email notification
function sendEmailNotification(email, templateType, data) {
    const template = emailTemplates[templateType];
    if (!template) {
        console.error('Email template not found:', templateType);
        return false;
    }
    
    const emailData = {
        id: 'email_' + Date.now(),
        to: email,
        subject: template.subject,
        body: template.template(data),
        sentAt: new Date().toISOString(),
        status: 'sent',
        type: templateType
    };
    
    // Save to local storage (simulating email sent)
    const notifications = getEmailNotifications();
    notifications.push(emailData);
    saveEmailNotifications(notifications);
    
    // Show in-app notification
    showNotification(`Email sent to ${email}`, 'success');
    
    return emailData;
}

// Get email notifications
function getEmailNotifications() {
    return JSON.parse(localStorage.getItem(EMAIL_NOTIFICATIONS_KEY) || '[]');
}

// Save email notifications
function saveEmailNotifications(notifications) {
    localStorage.setItem(EMAIL_NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

// Get user notifications
function getUserNotifications(email) {
    const notifications = getEmailNotifications();
    return notifications.filter(n => n.to === email);
}

// Show in-app notification
function showNotification(message, type = 'info') {
    // Check if notification container exists
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
        document.body.appendChild(container);
    }
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    const notification = document.createElement('div');
    notification.className = `${colors[type] || colors.info} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse`;
    notification.innerHTML = `
        <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}</span>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Mark notification as read
function markNotificationRead(notificationId) {
    const notifications = getEmailNotifications();
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
        notifications[index].read = true;
        saveEmailNotifications(notifications);
    }
}

// Delete notification
function deleteNotification(notificationId) {
    const notifications = getEmailNotifications();
    const filtered = notifications.filter(n => n.id !== notificationId);
    saveEmailNotifications(filtered);
}

// Clear all notifications
function clearAllNotifications() {
    localStorage.removeItem(EMAIL_NOTIFICATIONS_KEY);
}
