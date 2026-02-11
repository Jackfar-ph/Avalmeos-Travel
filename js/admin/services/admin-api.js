/**
 * ============================================================================
 * Admin API Service
 * ============================================================================
 * API client for communicating with the backend admin endpoints
 * Handles all HTTP communication for admin operations
 */

class AdminApiService {
    /**
     * Base URL for API requests - defaults to localhost:3000
     * Can be overridden by environment variable
     */
    constructor() {
        this.baseUrl = window.API_BASE_URL || 'http://localhost:3000/api';
    }

    /**
     * Get authorization header with JWT token
     * @returns {Object} Headers object with Authorization
     */
    getAuthHeaders() {
        const token = localStorage.getItem('avalmeos_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    /**
     * Make API request with error handling
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} Response data
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders(),
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`Admin API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    // =====================
    // DASHBOARD STATS
    // =====================

    async getDashboardStats() {
        return this.request('/admin/dashboard/stats');
    }

    async getRecentBookings(limit = 5) {
        return this.request(`/admin/bookings/recent?limit=${limit}`);
    }

    // =====================
    // ANALYTICS
    // =====================

    async getAnalytics(timeRange = '30d') {
        return this.request(`/admin/analytics?timeRange=${timeRange}`);
    }

    async getBookingTrends(days = 30) {
        return this.request(`/admin/analytics/booking-trends?days=${days}`);
    }

    async getTopDestinations(limit = 5) {
        return this.request(`/admin/analytics/top-destinations?limit=${limit}`);
    }

    async getRevenueStats() {
        return this.request('/admin/analytics/revenue');
    }

    // =====================
    // STATS & BOOKINGS
    // =====================

    async getStats() {
        return this.request('/admin/stats');
    }

    async getBookings(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/admin/bookings${queryString ? '?' + queryString : ''}`);
    }

    async updateBookingStatus(bookingId, status) {
        return this.request(`/admin/bookings/${bookingId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }

    // =====================
    // INQUIRIES
    // =====================

    async getInquiries() {
        return this.request('/admin/inquiries');
    }

    async updateInquiry(inquiryId, data) {
        return this.request(`/admin/inquiries/${inquiryId}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    // =====================
    // DESTINATIONS
    // =====================

    async getDestinations() {
        return this.request('/admin/destinations/all');
    }

    async createDestination(destinationData) {
        return this.request('/admin/destinations', {
            method: 'POST',
            body: JSON.stringify(destinationData)
        });
    }

    async updateDestination(destinationId, destinationData) {
        return this.request(`/admin/destinations/${destinationId}`, {
            method: 'PUT',
            body: JSON.stringify(destinationData)
        });
    }

    async deleteDestination(destinationId) {
        return this.request(`/admin/destinations/${destinationId}`, {
            method: 'DELETE'
        });
    }

    async deactivateDestination(id) {
        return this.request(`/admin/destinations/${id}/deactivate`, {
            method: 'PATCH'
        });
    }

    async activateDestination(id) {
        return this.request(`/admin/destinations/${id}/activate`, {
            method: 'PATCH'
        });
    }

    // =====================
    // ACTIVITIES
    // =====================

    async getActivities() {
        return this.request('/admin/activities/all');
    }

    async createActivity(activityData) {
        return this.request('/admin/activities', {
            method: 'POST',
            body: JSON.stringify(activityData)
        });
    }

    async updateActivity(activityId, activityData) {
        return this.request(`/admin/activities/${activityId}`, {
            method: 'PUT',
            body: JSON.stringify(activityData)
        });
    }

    async deleteActivity(activityId) {
        return this.request(`/admin/activities/${activityId}`, {
            method: 'DELETE'
        });
    }

    async deactivateActivity(id) {
        return this.request(`/admin/activities/${id}/deactivate`, {
            method: 'PATCH'
        });
    }

    async activateActivity(id) {
        return this.request(`/admin/activities/${id}/activate`, {
            method: 'PATCH'
        });
    }

    // =====================
    // PACKAGES
    // =====================

    async getPackages() {
        return this.request('/admin/packages/all');
    }

    async getPackageById(packageId) {
        return this.request(`/packages/${packageId}`);
    }

    async createPackage(packageData) {
        return this.request('/admin/packages', {
            method: 'POST',
            body: JSON.stringify(packageData)
        });
    }

    async updatePackage(packageId, packageData) {
        return this.request(`/admin/packages/${packageId}`, {
            method: 'PUT',
            body: JSON.stringify(packageData)
        });
    }

    async deletePackage(packageId) {
        return this.request(`/admin/packages/${packageId}`, {
            method: 'DELETE'
        });
    }

    async deactivatePackage(id) {
        return this.request(`/admin/packages/${id}/deactivate`, {
            method: 'PATCH'
        });
    }

    async activatePackage(id) {
        return this.request(`/admin/packages/${id}/activate`, {
            method: 'PATCH'
        });
    }

    // =====================
    // USERS
    // =====================

    async getUsers() {
        return this.request('/admin/users');
    }

    async updateUser(userId, userData) {
        return this.request(`/admin/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }
}

// Create global instance
window.adminApi = new AdminApiService();
