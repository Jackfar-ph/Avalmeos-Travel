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

    /**
     * Get admin dashboard statistics
     * @returns {Promise<Object>} Stats data
     */
    async getStats() {
        return this.request('/admin/stats');
    }

    /**
     * Get all bookings for admin
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Bookings data
     */
    async getBookings(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/admin/bookings${queryString ? '?' + queryString : ''}`);
    }

    /**
     * Update booking status
     * @param {string} bookingId - Booking ID
     * @param {string} status - New status
     * @returns {Promise<Object>} Updated booking
     */
    async updateBookingStatus(bookingId, status) {
        return this.request(`/admin/bookings/${bookingId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }

    /**
     * Get all inquiries for admin
     * @returns {Promise<Object>} Inquiries data
     */
    async getInquiries() {
        return this.request('/admin/inquiries');
    }

    /**
     * Update inquiry status
     * @param {string} inquiryId - Inquiry ID
     * @param {Object} data - Update data (status, response)
     * @returns {Promise<Object>} Updated inquiry
     */
    async updateInquiry(inquiryId, data) {
        return this.request(`/admin/inquiries/${inquiryId}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    /**
     * Get all destinations for admin
     * @returns {Promise<Object>} Destinations data
     */
    async getDestinations() {
        return this.request('/admin/destinations');
    }

    /**
     * Create new destination
     * @param {Object} destinationData - Destination data
     * @returns {Promise<Object>} Created destination
     */
    async createDestination(destinationData) {
        return this.request('/admin/destinations', {
            method: 'POST',
            body: JSON.stringify(destinationData)
        });
    }

    /**
     * Update destination
     * @param {string} destinationId - Destination ID
     * @param {Object} destinationData - Updated data
     * @returns {Promise<Object>} Updated destination
     */
    async updateDestination(destinationId, destinationData) {
        return this.request(`/admin/destinations/${destinationId}`, {
            method: 'PUT',
            body: JSON.stringify(destinationData)
        });
    }

    /**
     * Delete destination
     * @param {string} destinationId - Destination ID
     * @returns {Promise<Object>} Response
     */
    async deleteDestination(destinationId) {
        return this.request(`/admin/destinations/${destinationId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Get all activities for admin
     * @returns {Promise<Object>} Activities data
     */
    async getActivities() {
        return this.request('/admin/activities');
    }

    /**
     * Create new activity
     * @param {Object} activityData - Activity data
     * @returns {Promise<Object>} Created activity
     */
    async createActivity(activityData) {
        return this.request('/admin/activities', {
            method: 'POST',
            body: JSON.stringify(activityData)
        });
    }

    /**
     * Update activity
     * @param {string} activityId - Activity ID
     * @param {Object} activityData - Updated data
     * @returns {Promise<Object>} Updated activity
     */
    async updateActivity(activityId, activityData) {
        return this.request(`/admin/activities/${activityId}`, {
            method: 'PUT',
            body: JSON.stringify(activityData)
        });
    }

    /**
     * Delete activity
     * @param {string} activityId - Activity ID
     * @returns {Promise<Object>} Response
     */
    async deleteActivity(activityId) {
        return this.request(`/admin/activities/${activityId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Get all packages for admin
     * @returns {Promise<Object>} Packages data
     */
    async getPackages() {
        return this.request('/admin/packages');
    }

    /**
     * Create new package
     * @param {Object} packageData - Package data
     * @returns {Promise<Object>} Created package
     */
    async createPackage(packageData) {
        return this.request('/admin/packages', {
            method: 'POST',
            body: JSON.stringify(packageData)
        });
    }

    /**
     * Update package
     * @param {string} packageId - Package ID
     * @param {Object} packageData - Updated data
     * @returns {Promise<Object>} Updated package
     */
    async updatePackage(packageId, packageData) {
        return this.request(`/admin/packages/${packageId}`, {
            method: 'PUT',
            body: JSON.stringify(packageData)
        });
    }

    /**
     * Delete package
     * @param {string} packageId - Package ID
     * @returns {Promise<Object>} Response
     */
    async deletePackage(packageId) {
        return this.request(`/admin/packages/${packageId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Get all users for admin
     * @returns {Promise<Object>} Users data
     */
    async getUsers() {
        return this.request('/admin/users');
    }

    /**
     * Update user status
     * @param {string} userId - User ID
     * @param {Object} userData - Updated data
     * @returns {Promise<Object>} Updated user
     */
    async updateUser(userId, userData) {
        return this.request(`/admin/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }
}

// Create global instance
window.adminApi = new AdminApiService();
