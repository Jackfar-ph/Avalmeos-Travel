/**
 * ============================================================================
 * Admin Notification Service
 * ============================================================================
 * Business logic layer for notification management
 * Single Responsibility: Handle admin notifications
 */

class NotificationService {
    /**
     * Get storage key for notifications
     * @returns {string} Storage key
     */
    static getStorageKey() {
        return AdminConstants.STORAGE_KEYS.NOTIFICATIONS;
    }

    /**
     * Get all notifications
     * @returns {Array} Array of notification objects
     */
    static getNotifications() {
        try {
            const notifications = localStorage.getItem(this.getStorageKey());
            return notifications ? JSON.parse(notifications) : [];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    /**
     * Save notifications to storage
     * @param {Array} notifications - Array of notification objects
     */
    static saveNotifications(notifications) {
        localStorage.setItem(this.getStorageKey(), JSON.stringify(notifications));
    }

    /**
     * Add a new notification
     * @param {Object} notificationData - The notification data
     * @returns {Object} The created notification
     */
    static addNotification(notificationData) {
        const notifications = this.getNotifications();
        const notification = {
            id: 'notif_' + Date.now(),
            ...notificationData,
            read: false,
            createdAt: new Date().toISOString()
        };
        notifications.unshift(notification);
        this.saveNotifications(notifications);
        return notification;
    }

    /**
     * Mark notification as read
     * @param {string} notificationId - The notification ID
     */
    static markAsRead(notificationId) {
        const notifications = this.getNotifications();
        const index = notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            notifications[index].read = true;
            this.saveNotifications(notifications);
        }
    }

    /**
     * Mark all notifications as read
     */
    static markAllAsRead() {
        const notifications = this.getNotifications();
        notifications.forEach(n => n.read = true);
        this.saveNotifications(notifications);
    }

    /**
     * Delete a notification
     * @param {string} notificationId - The notification ID
     */
    static deleteNotification(notificationId) {
        const notifications = this.getNotifications();
        const filtered = notifications.filter(n => n.id !== notificationId);
        this.saveNotifications(filtered);
    }

    /**
     * Clear all notifications
     */
    static clearAll() {
        localStorage.removeItem(this.getStorageKey());
    }

    /**
     * Get unread notification count
     * @returns {number} Count of unread notifications
     */
    static getUnreadCount() {
        return this.getNotifications().filter(n => !n.read).length;
    }

    /**
     * Add a booking notification
     * @param {Object} booking - The booking object
     */
    static notifyNewBooking(booking) {
        return this.addNotification({
            type: 'booking',
            title: 'New Booking',
            message: `${booking.userName} made a new booking`,
            data: { bookingId: booking.id }
        });
    }

    /**
     * Add a status update notification
     * @param {Object} booking - The booking object
     * @param {string} oldStatus - Previous status
     * @param {string} newStatus - New status
     */
    static notifyStatusUpdate(booking, oldStatus, newStatus) {
        return this.addNotification({
            type: 'status_update',
            title: 'Booking Status Updated',
            message: `Booking ${booking.id.slice(0, 8)}... status changed from ${oldStatus} to ${newStatus}`,
            data: { bookingId: booking.id, oldStatus, newStatus }
        });
    }

    /**
     * Add an inquiry notification
     * @param {Object} inquiry - The inquiry object
     */
    static notifyNewInquiry(inquiry) {
        return this.addNotification({
            type: 'inquiry',
            title: 'New Inquiry',
            message: `${inquiry.name} sent a new inquiry: ${inquiry.subject}`,
            data: { inquiryId: inquiry.id }
        });
    }
}

// Export for module usage
window.AdminNotificationService = NotificationService;
