/**
 * ============================================================================
 * Admin Booking Controller
 * ============================================================================
 * Controller layer for booking management
 * Coordinates between BookingService (business logic) and DashboardView (UI)
 */

class BookingController {
    /**
     * Container element for dashboard
     */
    static get dashboardContainer() {
        return document.getElementById('admin-dashboard');
    }

    /**
     * Container element for bookings table
     */
    static get bookingsTableContainer() {
        return document.getElementById('admin-bookings-table');
    }

    /**
     * Initialize booking management
     */
    static init() {
        this.renderDashboard();
    }

    /**
     * Render the complete dashboard
     */
    static async renderDashboard() {
        if (!this.dashboardContainer) return;

        this.dashboardContainer.innerHTML = DashboardView.renderLoading();

        try {
            const stats = BookingService.getBookingStats();
            const recentBookings = BookingService.getRecentBookings(5);
            
            this.dashboardContainer.innerHTML = DashboardView.renderDashboard(stats, recentBookings);
        } catch (error) {
            console.error('Error rendering dashboard:', error);
            this.dashboardContainer.innerHTML = DashboardView.renderEmptyState('Error loading dashboard');
        }
    }

    /**
     * Render bookings table
     */
    static renderBookingsTable() {
        if (!this.bookingsTableContainer) return;

        try {
            const bookings = BookingService.getAllBookings();
            this.bookingsTableContainer.innerHTML = DashboardView.renderRecentBookingsTable(bookings);
        } catch (error) {
            console.error('Error rendering bookings table:', error);
        }
    }

    /**
     * Approve a booking
     * @param {string} bookingId - Booking ID to approve
     */
    static approveBooking(bookingId) {
        if (!confirm('Are you sure you want to approve this booking?')) {
            return;
        }

        try {
            BookingService.updateBookingStatus(bookingId, AdminConstants.BOOKING_STATUS.CONFIRMED);
            this.renderDashboard();
            this.showNotification('Booking approved successfully', 'success');
        } catch (error) {
            console.error('Error approving booking:', error);
            this.showNotification('Error approving booking', 'error');
        }
    }

    /**
     * Reject a booking
     * @param {string} bookingId - Booking ID to reject
     */
    static rejectBooking(bookingId) {
        const reason = prompt('Reason for rejection:');
        if (reason === null) {
            return; // User cancelled
        }

        try {
            BookingService.updateBookingStatus(bookingId, AdminConstants.BOOKING_STATUS.REJECTED);
            this.renderDashboard();
            this.showNotification('Booking rejected', 'error');
        } catch (error) {
            console.error('Error rejecting booking:', error);
            this.showNotification('Error rejecting booking', 'error');
        }
    }

    /**
     * View booking details in modal
     * @param {string} bookingId - Booking ID to view
     */
    static viewBookingDetails(bookingId) {
        const booking = BookingService.getBookingById(bookingId);
        if (!booking) {
            this.showNotification('Booking not found', 'error');
            return;
        }

        const modal = document.getElementById('booking-details-modal');
        const content = document.getElementById('booking-details-content');
        
        if (modal && content) {
            content.innerHTML = this.renderBookingDetails(booking);
            modal.classList.remove('hidden');
        }
    }

    /**
     * Render booking details for modal
     * @param {Object} booking - Booking object
     * @returns {string} HTML string for details
     */
    static renderBookingDetails(booking) {
        return `
            <div class="space-y-4">
                <div class="flex justify-between items-center border-b pb-2">
                    <span class="text-gray-500">Booking ID:</span>
                    <span class="font-mono text-sm">${booking.id}</span>
                </div>
                <div class="flex justify-between items-center border-b pb-2">
                    <span class="text-gray-500">Customer:</span>
                    <span class="font-medium">${booking.userName}</span>
                </div>
                <div class="flex justify-between items-center border-b pb-2">
                    <span class="text-gray-500">Email:</span>
                    <span class="font-medium">${booking.userEmail}</span>
                </div>
                <div class="flex justify-between items-center border-b pb-2">
                    <span class="text-gray-500">Status:</span>
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${this.getStatusClass(booking.status)}">
                        ${booking.status}
                    </span>
                </div>
                <div class="border-b pb-2">
                    <span class="text-gray-500">Items:</span>
                    ${(booking.items || []).map(item => `
                        <div class="mt-2 p-2 bg-gray-50 rounded">
                            <div class="font-medium">${item.packageTitle}</div>
                            <div class="text-sm text-gray-500">${item.city} • ${item.paxSize} pax</div>
                            <div class="text-sm text-gray-500">📅 ${formatDate(item.travelDate)}</div>
                            ${item.personalization?.length > 0 ? `
                                <div class="text-sm mt-1">
                                    <span class="text-gray-500">Add-ons:</span>
                                    ${item.personalization.map(p => {
                                        const opt = getPersonalizationOptions().find(o => o.id === p);
                                        return opt ? `<span class="ml-1">${opt.icon} ${opt.name}</span>` : '';
                                    }).join(', ')}
                                </div>
                            ` : ''}
                            <div class="font-bold text-orange-500 mt-1">${formatPrice(item.totalPrice)}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="flex justify-between items-center pt-2">
                    <span class="text-gray-500 font-bold">Total Amount:</span>
                    <span class="text-xl font-bold text-orange-500">${formatPrice(booking.total)}</span>
                </div>
                <div class="text-xs text-gray-400 pt-2">
                    Created: ${formatDate(booking.createdAt)}
                </div>
            </div>
        `;
    }

    /**
     * Get status badge CSS class
     * @param {string} status - Booking status
     * @returns {string} CSS class string
     */
    static getStatusClass(status) {
        const classes = {
            'pending': 'bg-yellow-100 text-yellow-700',
            'confirmed': 'bg-green-100 text-green-700',
            'completed': 'bg-blue-100 text-blue-700',
            'cancelled': 'bg-red-100 text-red-700',
            'rejected': 'bg-red-100 text-red-700'
        };
        return classes[status] || 'bg-gray-100 text-gray-700';
    }

    /**
     * Filter bookings by status
     * @param {string} status - Status to filter by
     */
    static filterBookings(status) {
        const bookings = status 
            ? BookingService.getAllBookings().filter(b => b.status === status)
            : BookingService.getAllBookings();
        this.bookingsTableContainer.innerHTML = DashboardView.renderRecentBookingsTable(bookings);
    }

    /**
     * Export bookings to CSV
     */
    static exportBookings() {
        const bookings = BookingService.getAllBookings();
        if (bookings.length === 0) {
            this.showNotification('No bookings to export', 'error');
            return;
        }

        const headers = ['ID', 'Customer', 'Email', 'Total', 'Status', 'Date'];
        const rows = bookings.map(b => [
            b.id,
            b.userName,
            b.userEmail,
            b.total,
            b.status,
            b.createdAt
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Bookings exported successfully', 'success');
    }

    /**
     * Show notification (wrapper for global notification system)
     * @param {string} message - Message to display
     * @param {string} type - Notification type (success, error, info)
     */
    static showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Export for module usage and global access
window.AdminBookingController = BookingController;
