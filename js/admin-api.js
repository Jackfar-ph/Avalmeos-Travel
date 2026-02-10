/**
 * Admin API Service
 * Handles all admin-specific API calls to the backend
 */

class AdminApiService {
  constructor() {
    this.baseUrl = 'http://localhost:3000/api';
  }

  // Helper for authenticated admin requests
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('avalmeos_token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Admin API request failed');
    }

    return data;
  }

  // ======================
  // DASHBOARD STATS
  // ======================

  async getDashboardStats() {
    return this.request('/admin/stats');
  }

  async getRecentBookings(limit = 10) {
    return this.request(`/admin/bookings?limit=${limit}&offset=0`);
  }

  // ======================
  // BOOKING MANAGEMENT
  // ======================

  async getBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/bookings${queryString ? '?' + queryString : ''}`);
  }

  async getBookingDetails(id) {
    return this.request(`/admin/bookings/${id}`);
  }

  async updateBookingStatus(id, status) {
    return this.request(`/admin/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async approveBooking(id) {
    return this.updateBookingStatus(id, 'confirmed');
  }

  async rejectBooking(id, reason) {
    return this.updateBookingStatus(id, 'rejected');
  }

  async completeBooking(id) {
    return this.updateBookingStatus(id, 'completed');
  }

  // ======================
  // DESTINATION MANAGEMENT
  // ======================

  async getDestinations() {
    return this.request('/destinations');
  }

  async createDestination(data) {
    return this.request('/admin/destinations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateDestination(id, data) {
    return this.request(`/admin/destinations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteDestination(id) {
    return this.request(`/admin/destinations/${id}`, {
      method: 'DELETE'
    });
  }

  // ======================
  // ACTIVITY MANAGEMENT
  // ======================

  async getActivities(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/activities${queryString ? '?' + queryString : ''}`);
  }

  async createActivity(data) {
    return this.request('/admin/activities', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateActivity(id, data) {
    return this.request(`/admin/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteActivity(id) {
    return this.request(`/admin/activities/${id}`, {
      method: 'DELETE'
    });
  }

  // ======================
  // PACKAGE MANAGEMENT
  // ======================

  async getPackages() {
    return this.request('/admin/packages');
  }

  async createPackage(data) {
    return this.request('/admin/packages', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updatePackage(id, data) {
    return this.request(`/admin/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deletePackage(id) {
    return this.request(`/admin/packages/${id}`, {
      method: 'DELETE'
    });
  }

  // ======================
  // USER MANAGEMENT
  // ======================

  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/users${queryString ? '?' + queryString : ''}`);
  }

  async updateUserRole(id, role) {
    return this.request(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  }

  async activateUser(id) {
    return this.request(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: true })
    });
  }

  async deactivateUser(id) {
    return this.request(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: false })
    });
  }

  // ======================
  // INQUIRY MANAGEMENT
  // ======================

  async getInquiries(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/inquiries${queryString ? '?' + queryString : ''}`);
  }

  async replyToInquiry(id, message) {
    return this.request(`/admin/inquiries/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }

  async updateInquiryStatus(id, status) {
    return this.request(`/admin/inquiries/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // ======================
  // ANALYTICS
  // ======================

  async getAnalytics(period = '30days') {
    return this.request(`/admin/analytics?period=${period}`);
  }
}

// Create global instance
window.adminApi = new AdminApiService();
