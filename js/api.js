/**
 * Avalmeo's Travel API Client
 * Frontend service for communicating with the backend API
 */

const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Helper for making API requests
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Get token from localStorage
    const token = localStorage.getItem('avalmeos_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ======================
  // AUTHENTICATION
  // ======================

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  logout() {
    localStorage.removeItem('avalmeos_token');
    localStorage.removeItem('avalmeos_user');
  }

  isAuthenticated() {
    return !!localStorage.getItem('avalmeos_token');
  }

  // ======================
  // DESTINATIONS
  // ======================

  async getDestinations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/destinations${queryString ? '?' + queryString : ''}`);
  }

  async getDestination(slug) {
    return this.request(`/destinations/${slug}`);
  }

  // ======================
  // ACTIVITIES
  // ======================

  async getActivities(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/activities${queryString ? '?' + queryString : ''}`);
  }

  async getActivity(slug) {
    return this.request(`/activities/${slug}`);
  }

  // ======================
  // PACKAGES
  // ======================

  async getPackages(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/packages${queryString ? '?' + queryString : ''}`);
  }

  // ======================
  // PERSONALIZATIONS
  // ======================

  async getPersonalizations() {
    return this.request('/personalizations');
  }

  // ======================
  // BOOKINGS
  // ======================

  async createBooking(bookingData) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }

  async getMyBookings() {
    return this.request('/bookings/my');
  }

  async getBooking(id) {
    return this.request(`/bookings/${id}`);
  }

  async cancelBooking(id) {
    return this.request(`/bookings/${id}/cancel`, {
      method: 'POST'
    });
  }

  // ======================
  // INQUIRIES
  // ======================

  async submitInquiry(inquiryData) {
    return this.request('/inquiries', {
      method: 'POST',
      body: JSON.stringify(inquiryData)
    });
  }

  // ======================
  // ADMIN
  // ======================

  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAllBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/bookings${queryString ? '?' + queryString : ''}`);
  }

  async updateBookingStatus(id, status) {
    return this.request(`/admin/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async getAllInquiries() {
    return this.request('/admin/inquiries');
  }
}

// Create global instance
const api = new ApiService();

// Export for use
window.api = api;
