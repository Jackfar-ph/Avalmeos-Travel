/**
 * ============================================================================
 * Admin Booking Service
 * ============================================================================
 * Business logic layer for booking management operations
 * Single Responsibility: Handle all booking-related business logic
 */

class BookingService {
    /**
     * Get all bookings from localStorage
     * @returns {Array} Array of booking objects
     */
    static getAllBookings() {
        try {
            const bookings = localStorage.getItem(AdminConstants.STORAGE_KEYS.BOOKINGS);
            return bookings ? JSON.parse(bookings) : [];
        } catch (error) {
            console.error('Error fetching bookings:', error);
            return [];
        }
    }

    /**
     * Get a single booking by ID
     * @param {string} bookingId - The booking ID to find
     * @returns {Object|null} Booking object or null if not found
     */
    static getBookingById(bookingId) {
        const bookings = this.getAllBookings();
        return bookings.find(b => b.id === bookingId) || null;
    }

    /**
     * Save all bookings to localStorage
     * @param {Array} bookings - Array of booking objects to save
     */
    static saveAllBookings(bookings) {
        localStorage.setItem(AdminConstants.STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    }

    /**
     * Create a new booking
     * @param {Object} bookingData - The booking data to create
     * @returns {Object} The created booking with generated ID
     */
    static createBooking(bookingData) {
        const bookings = this.getAllBookings();
        const newBooking = {
            ...bookingData,
            id: 'booking_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        bookings.push(newBooking);
        this.saveAllBookings(bookings);
        return newBooking;
    }

    /**
     * Update an existing booking's status
     * @param {string} bookingId - The booking ID to update
     * @param {string} status - The new status value
     * @returns {boolean} True if update was successful
     */
    static updateBookingStatus(bookingId, status) {
        const bookings = this.getAllBookings();
        const bookingIndex = bookings.findIndex(b => b.id === bookingId);
        
        if (bookingIndex !== -1) {
            bookings[bookingIndex].status = status;
            bookings[bookingIndex].updatedAt = new Date().toISOString();
            this.saveAllBookings(bookings);
            return true;
        }
        return false;
    }

    /**
     * Update booking payment status
     * @param {string} bookingId - The booking ID
     * @param {string} paymentStatus - The new payment status
     * @returns {boolean} True if update was successful
     */
    static updatePaymentStatus(bookingId, paymentStatus) {
        const bookings = this.getAllBookings();
        const bookingIndex = bookings.findIndex(b => b.id === bookingId);
        
        if (bookingIndex !== -1) {
            bookings[bookingIndex].paymentStatus = paymentStatus;
            bookings[bookingIndex].updatedAt = new Date().toISOString();
            this.saveAllBookings(bookings);
            return true;
        }
        return false;
    }

    /**
     * Delete a booking by ID
     * @param {string} bookingId - The booking ID to delete
     */
    static deleteBooking(bookingId) {
        const bookings = this.getAllBookings();
        const filtered = bookings.filter(b => b.id !== bookingId);
        this.saveAllBookings(filtered);
    }

    /**
     * Get booking statistics for dashboard
     * @returns {Object} Statistics object with counts and totals
     */
    static getBookingStats() {
        const bookings = this.getAllBookings();
        const stats = {
            total: bookings.length,
            pending: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0,
            rejected: 0,
            totalRevenue: 0,
            paidBookings: 0
        };

        bookings.forEach(booking => {
            // Count by status
            if (booking.status) {
                stats[booking.status] = (stats[booking.status] || 0) + 1;
            }
            
            // Calculate revenue from paid bookings
            if (booking.paymentStatus === 'paid') {
                stats.paidBookings++;
                stats.totalRevenue += parseFloat(booking.total) || 0;
            }
        });

        return stats;
    }

    /**
     * Filter bookings by status
     * @param {string} status - The status to filter by
     * @returns {Array} Filtered booking array
     */
    static filterByStatus(status) {
        if (!status) return this.getAllBookings();
        return this.getAllBookings().filter(b => b.status === status);
    }

    /**
     * Search bookings by customer name or email
     * @param {string} searchTerm - The search term
     * @returns {Array} Filtered booking array
     */
    static searchBookings(searchTerm) {
        const term = searchTerm.toLowerCase();
        return this.getAllBookings().filter(b => 
            b.userName?.toLowerCase().includes(term) ||
            b.userEmail?.toLowerCase().includes(term) ||
            b.id?.toLowerCase().includes(term)
        );
    }

    /**
     * Get recent bookings with limit
     * @param {number} limit - Maximum number of bookings to return
     * @returns {Array} Array of recent bookings
     */
    static getRecentBookings(limit = 10) {
        return this.getAllBookings()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }
}

// Export for module usage
window.AdminBookingService = BookingService;
