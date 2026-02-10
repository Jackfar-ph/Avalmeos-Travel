/**
 * ============================================================================
 * Admin Dashboard View
 * ============================================================================
 * View layer for dashboard component
 * Single Responsibility: Handle dashboard UI rendering
 */

class DashboardView {
    /**
     * Render the complete dashboard
     * @param {Object} stats - Booking statistics object
     * @param {Array} recentBookings - Array of recent booking objects
     * @returns {string} HTML string for dashboard
     */
    static renderDashboard(stats, recentBookings) {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                ${this.renderStatCard('Total Bookings', stats.total, 'bg-blue-50', 'text-blue-600', '📋')}
                ${this.renderStatCard('Pending', stats.pending, 'bg-yellow-50', 'text-yellow-600', '⏳')}
                ${this.renderStatCard('Confirmed', stats.confirmed, 'bg-green-50', 'text-green-600', '✅')}
                ${this.renderStatCard('Total Revenue', formatPrice(stats.totalRevenue), 'bg-orange-50', 'text-orange-600', '💰')}
            </div>
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-4 border-b border-gray-100">
                    <h3 class="font-bold text-[#1a4d41]">Recent Bookings</h3>
                </div>
                <div class="overflow-x-auto">
                    ${this.renderRecentBookingsTable(recentBookings)}
                </div>
            </div>
        `;
    }

    /**
     * Render a single stat card
     * @param {string} label - Stat label
     * @param {string|number} value - Stat value
     * @param {string} bgClass - Background CSS class
     * @param {string} textClass - Text color CSS class
     * @param {string} icon - Icon emoji
     * @returns {string} HTML string for stat card
     */
    static renderStatCard(label, value, bgClass, textClass, icon) {
        return `
            <div class="${bgClass} p-4 rounded-xl shadow-sm border border-gray-100">
                <div class="text-gray-500 text-sm">${label}</div>
                <div class="text-2xl font-bold ${textClass}">${value}</div>
            </div>
        `;
    }

    /**
     * Render recent bookings table
     * @param {Array} bookings - Array of booking objects
     * @returns {string} HTML string for table
     */
    static renderRecentBookingsTable(bookings) {
        return `
            <table class="w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    ${bookings.length === 0 ? `
                        <tr>
                            <td colspan="7" class="px-4 py-8 text-center text-gray-500">No bookings yet</td>
                        </tr>
                    ` : bookings.map(booking => this.renderBookingRow(booking)).join('')}
                </tbody>
            </table>
        `;
    }

    /**
     * Render a single booking row
     * @param {Object} booking - Booking object
     * @returns {string} HTML string for table row
     */
    static renderBookingRow(booking) {
        const statusClass = this.getStatusClass(booking.status);
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-mono">${this.truncateId(booking.id)}</td>
                <td class="px-4 py-3">
                    <div class="text-sm font-medium text-[#1a4d41]">${booking.userName || 'Unknown'}</div>
                    <div class="text-xs text-gray-500">${booking.userEmail || ''}</div>
                </td>
                <td class="px-4 py-3 text-sm">
                    ${(booking.items || []).map(item => `
                        <div>${item.packageTitle || 'Item'} (${item.paxSize || 1} pax)</div>
                    `).join('')}
                </td>
                <td class="px-4 py-3 text-sm font-bold text-orange-500">${formatPrice(booking.total)}</td>
                <td class="px-4 py-3">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusClass}">
                        ${booking.status || 'pending'}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">${formatDate(booking.createdAt)}</td>
                <td class="px-4 py-3">
                    <div class="flex gap-2">
                        <button onclick="AdminBookingController.viewBookingDetails('${booking.id}')" 
                            class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600">
                            View
                        </button>
                        ${booking.status === 'pending' ? `
                            <button onclick="AdminBookingController.approveBooking('${booking.id}')" 
                                class="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 rounded text-white">
                                Approve
                            </button>
                            <button onclick="AdminBookingController.rejectBooking('${booking.id}')" 
                                class="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 rounded text-white">
                                Reject
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Get status badge CSS class based on status
     * @param {string} status - Booking status
     * @returns {string} CSS class string
     */
    static getStatusClass(status) {
        const statusClasses = {
            'pending': 'bg-yellow-100 text-yellow-700',
            'confirmed': 'bg-green-100 text-green-700',
            'completed': 'bg-blue-100 text-blue-700',
            'cancelled': 'bg-red-100 text-red-700',
            'rejected': 'bg-red-100 text-red-700'
        };
        return statusClasses[status] || 'bg-gray-100 text-gray-700';
    }

    /**
     * Truncate booking ID for display
     * @param {string} id - Full booking ID
     * @param {number} length - Truncation length
     * @returns {string} Truncated ID
     */
    static truncateId(id, length = 12) {
        return id ? (id.length > length ? id.slice(0, length) + '...' : id) : '';
    }

    /**
     * Render loading state
     * @returns {string} HTML for loading spinner
     */
    static renderLoading() {
        return `
            <div class="flex items-center justify-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d41]"></div>
            </div>
        `;
    }

    /**
     * Render empty state
     * @param {string} message - Empty state message
     * @returns {string} HTML for empty state
     */
    static renderEmptyState(message = 'No data found') {
        return `
            <div class="p-8 text-center">
                <svg class="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <p class="text-gray-500">${message}</p>
            </div>
        `;
    }
}

// Export for module usage
window.AdminDashboardView = DashboardView;
