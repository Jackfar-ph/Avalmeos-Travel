/**
 * ============================================================================
 * Comprehensive AdminApiService - Authentication Solution
 * ============================================================================
 * 
 * This service provides:
 * - JWT token storage and management
 * - Automatic token refresh before expiration
 * - 401/403 error handling with retry mechanism
 * - Session state management across tabs
 * - Secure logout functionality
 */

class AdminApiService {
    constructor() {
        // Configuration
        this.baseUrl = window.API_BASE_URL || 'http://localhost:3000/api';
        this.timeout = 30000; // 30 seconds
        this.maxRetries = 2; // Retry failed requests max 2 times
        this.tokenRefreshThreshold = 5 * 60 * 1000; // Refresh if token expires within 5 minutes
        
        // Token storage keys (compatible with admin-auth.js)
        this.TOKEN_KEY = 'avalmeos_admin_token';
        this.REFRESH_TOKEN_KEY = 'avalmeos_admin_refresh_token';
        this.TOKEN_EXPIRY_KEY = 'avalmeos_admin_token_expiry';
        
        // State management
        this.isRefreshing = false;
        this.refreshPromise = null;
        this.failedRequests = [];
        
        // Bind methods for event listeners
        this._handleStorageEvent = this._handleStorageEvent.bind(this);
        this._handleVisibilityChange = this._handleVisibilityChange.bind(this);
        
        // Initialize event listeners for cross-tab sync
        this._initEventListeners();
        
        console.log('[AdminApiService] Initialized');
    }

    // ============================================
    // TOKEN MANAGEMENT
    // ============================================

    /**
     * Get stored access token - checks unified auth first
     */
    getToken() {
        // First check unified auth storage (main site)
        const authData = localStorage.getItem('avalmeos_auth');
        if (authData) {
            try {
                const parsed = JSON.parse(authData);
                if (parsed.token) {
                    return parsed.token;
                }
            } catch (e) {
                // Fall through to admin token
            }
        }
        
        // Fallback to admin-specific token
        const adminToken = localStorage.getItem(this.TOKEN_KEY);
        if (adminToken) {
            return adminToken;
        }
        
        // Additional fallback: check for avalmeos_token (used by admin.html auto-login)
        const simpleToken = localStorage.getItem('avalmeos_token');
        if (simpleToken) {
            return simpleToken;
        }
        
        return null;
    }

    /**
     * Get stored refresh token
     */
    getRefreshToken() {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    /**
     * Get token expiry timestamp
     */
    getTokenExpiry() {
        // First check unified auth storage
        const authData = localStorage.getItem('avalmeos_auth');
        if (authData) {
            try {
                const parsed = JSON.parse(authData);
                // If stored with loggedInAt, calculate expiry (7 days)
                if (parsed.loggedInAt) {
                    const loggedInAt = new Date(parsed.loggedInAt).getTime();
                    return loggedInAt + (7 * 24 * 60 * 60 * 1000);
                }
            } catch (e) {
                // Fall through
            }
        }
        
        const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
        if (expiry) {
            return parseInt(expiry, 10);
        }
        
        // If we have a token from avalmeos_token, assume 7 day expiry
        const simpleToken = localStorage.getItem('avalmeos_token');
        if (simpleToken) {
            return Date.now() + (7 * 24 * 60 * 60 * 1000);
        }
        
        return null;
    }

    /**
     * Store authentication data from login response
     */
    setAuthData(authData) {
        if (!authData || !authData.token) {
            console.error('[AdminApiService] No token provided to setAuthData');
            return;
        }

        // Store in unified format (shares with main site)
        const unifiedAuth = {
            ...authData.user,
            token: authData.token,
            refreshToken: authData.refreshToken,
            loggedInAt: new Date().toISOString()
        };
        localStorage.setItem('avalmeos_auth', JSON.stringify(unifiedAuth));
        
        // Also store admin-specific for backward compatibility
        localStorage.setItem(this.TOKEN_KEY, authData.token);
        
        if (authData.refreshToken) {
            localStorage.setItem(this.REFRESH_TOKEN_KEY, authData.refreshToken);
        }

        // Calculate and store expiry
        const expiresIn = authData.expiresIn || (7 * 24 * 60 * 60 * 1000);
        const expiry = Date.now() + expiresIn;
        localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());

        console.log('[AdminApiService] Unified auth data stored, token expires at:', new Date(expiry).toLocaleString());
    }

    /**
     * Clear all authentication data on logout
     */
    clearAuthData() {
        // Clear unified auth (affects main site too)
        localStorage.removeItem('avalmeos_auth');
        
        // Clear admin-specific
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
        localStorage.removeItem('avalmeos_admin_user');
        
        // Clear admin.html auto-login tokens (prevents infinite refresh loop)
        localStorage.removeItem('avalmeos_token');
        localStorage.removeItem('avalmeos_user');
        
        console.log('[AdminApiService] All auth data cleared');
    }

    /**
     * Check if token is valid (exists and not expired)
     * Handles tokens stored without expiry (e.g., avalmeos_token from admin.html)
     */
    isTokenValid() {
        const token = this.getToken();
        
        if (!token) {
            return false;
        }
        
        // For tokens stored without expiry (e.g., avalmeos_token from admin.html),
        // assume 7 day validity - getTokenExpiry() already handles this
        const expiry = this.getTokenExpiry();
        
        if (!expiry) {
            // Token exists but no expiry info - assume valid for 7 days
            return true;
        }
        
        // Add 1 minute buffer to prevent edge cases
        return Date.now() < (expiry - 60000);
    }

    /**
     * Check if token needs refresh (expires within threshold)
     */
    shouldRefreshToken() {
        const expiry = this.getTokenExpiry();
        if (!expiry) return false;
        return Date.now() >= (expiry - this.tokenRefreshThreshold);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.isTokenValid() && !!this.getToken();
    }

    // ============================================
    // TOKEN REFRESH
    // ============================================

    /**
     * Refresh the access token using refresh token
     */
    async refreshAccessToken() {
        // Prevent multiple simultaneous refresh attempts
        if (this.isRefreshing && this.refreshPromise) {
            return this.refreshPromise;
        }

        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        this.isRefreshing = true;
        
        this.refreshPromise = (async () => {
            try {
                console.log('[AdminApiService] Refreshing access token...');
                
                const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ refreshToken })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Token refresh failed');
                }

                // Store new tokens
                this.setAuthData({
                    token: data.data.token,
                    refreshToken: data.data.refreshToken || refreshToken,
                    expiresIn: data.data.expiresIn
                });

                console.log('[AdminApiService] Token refreshed successfully');
                return data.data.token;
            } catch (error) {
                console.error('[AdminApiService] Token refresh failed:', error);
                // Clear auth data and throw error to trigger logout
                this.clearAuthData();
                throw error;
            } finally {
                this.isRefreshing = false;
                this.refreshPromise = null;
            }
        })();

        return this.refreshPromise;
    }

    /**
     * Ensure we have a valid token (refresh if needed)
     */
    async ensureValidToken() {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated');
        }

        if (this.shouldRefreshToken()) {
            try {
                await this.refreshAccessToken();
            } catch (error) {
                // If refresh fails, try with existing token anyway
                // The API call will fail and trigger logout
                console.warn('[AdminApiService] Token refresh failed, proceeding with existing token');
            }
        }

        return this.getToken();
    }

    // ============================================
    // AUTHENTICATED API REQUESTS
    // ============================================

    /**
     * Get authorization headers with valid token
     */
    async getAuthHeaders() {
        const token = await this.ensureValidToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    /**
     * Make authenticated API request with automatic retry on 401/403
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        // Get auth headers
        const authHeaders = await this.getAuthHeaders();
        const headers = {
            ...authHeaders,
            ...options.headers
        };

        try {
            return await this._doRequest(url, options, headers);
        } catch (error) {
            // Handle authentication errors
            if (error.status === 401 || error.status === 403) {
                console.log('[AdminApiService] Auth error, attempting token refresh...');
                
                try {
                    // Try to refresh token
                    await this.refreshAccessToken();
                    
                    // Retry with new token
                    const newHeaders = await this.getAuthHeaders();
                    return await this._doRequest(url, options, newHeaders);
                } catch (refreshError) {
                    // Refresh failed, redirect to login
                    this.handleAuthFailure();
                    throw new Error('Session expired. Please log in again.');
                }
            }
            
            throw error;
        }
    }

    /**
     * Internal request handler
     */
    async _doRequest(url, options, headers) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Check content type to handle non-JSON responses
            const contentType = response.headers.get('content-type');
            const isJson = contentType && contentType.includes('application/json');
            
            // Parse error response
            if (!response.ok) {
                let errorData = {};
                let errorMessage = `HTTP error ${response.status}`;
                
                if (isJson) {
                    try {
                        errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch (e) {
                        // Failed to parse JSON error response
                    }
                } else {
                    // Non-JSON error response (HTML, plain text, etc.)
                    errorMessage = `Server error: ${response.status} ${response.statusText}`;
                }
                
                const error = new Error(errorMessage);
                error.status = response.status;
                error.data = errorData;
                throw error;
            }

            if (!isJson) {
                // Response is not JSON but was successful - this is unexpected
                const text = await response.text().catch(() => 'Unknown error');
                throw new Error(`Unexpected response format: ${text.substring(0, 100)}...`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timed out');
            }
            
            // Handle JSON parsing errors (e.g., HTML responses)
            if (error instanceof SyntaxError && error.message.includes('JSON')) {
                throw new Error('Invalid server response. Please ensure the backend server is running.');
            }
            
            throw error;
        }
    }

    /**
     * Handle authentication failure - redirect to login
     * Prevents infinite refresh loop by only reloading if no valid token exists
     */
    handleAuthFailure() {
        this.clearAuthData();
        
        // Show notification if notifications exist
        if (typeof window.showNotification === 'function') {
            window.showNotification('Your session has expired. Please log in again.', 'error');
        }
        
        // Only reload if we're on admin.html AND no token exists
        // This prevents infinite refresh loop when admin.html auto-login is used
        if (window.location.href.includes('admin.html')) {
            const hasToken = localStorage.getItem('avalmeos_token');
            if (!hasToken) {
                console.log('[AdminApiService] No token found, reloading page...');
                window.location.reload();
            } else {
                console.log('[AdminApiService] Token exists (avalmeos_token), auto-login will handle this');
            }
        }
    }

    // ============================================
    // EVENT LISTENERS FOR CROSS-TAB SYNC
    // ============================================

    _initEventListeners() {
        // Handle storage events (cross-tab communication)
        window.addEventListener('storage', this._handleStorageEvent);
        
        // Handle visibility change (refresh token when tab becomes active)
        document.addEventListener('visibilitychange', this._handleVisibilityChange);
    }

    _handleStorageEvent(event) {
        // If token was cleared in another tab, reload this tab
        if (event.key === this.TOKEN_KEY && !event.newValue) {
            console.log('[AdminApiService] Token cleared in another tab');
            this.handleAuthFailure();
        }
        
        // If token changed, update state
        if (event.key === this.TOKEN_KEY && event.newValue) {
            console.log('[AdminApiService] Token updated in another tab');
        }
    }

    _handleVisibilityChange() {
        // When tab becomes visible, check if token needs refresh
        if (document.visibilityState === 'visible' && this.isAuthenticated()) {
            if (this.shouldRefreshToken()) {
                console.log('[AdminApiService] Tab became active, refreshing token...');
                this.refreshAccessToken().catch(() => {});
            }
        }
    }

    // ============================================
    // AUTHENTICATION OPERATIONS
    // ============================================

    /**
     * Login with email and password
     */
    async login(email, password) {
        const response = await fetch(`${this.baseUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store authentication data
        this.setAuthData({
            token: data.data.token,
            refreshToken: data.data.refreshToken || null,
            expiresIn: 7 * 24 * 60 * 60 * 1000 // 7 days default
        });

        return data.data;
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            // Try to notify server (ignore errors)
            const token = this.getToken();
            if (token) {
                await fetch(`${this.baseUrl}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }).catch(() => {});
            }
        } catch (error) {
            console.warn('[AdminApiService] Logout API call failed:', error);
        }

        // Clear local auth data
        this.clearAuthData();

        // Redirect to login page
        if (window.location.href.includes('admin.html')) {
            window.location.reload();
        }
    }

    /**
     * Get current user info
     */
    async getCurrentUser() {
        return this.request('/auth/me');
    }

    // ============================================
    // CRUD OPERATIONS (Reusable Methods)
    // ============================================

    // Destinations
    async getDestinations() {
        return this.request('/admin/destinations');
    }

    async getDestination(id) {
        return this.request(`/admin/destinations/${id}`);
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

    // Activities
    async getActivities() {
        return this.request('/admin/activities/all');
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

    // Packages
    async getPackages() {
        return this.request('/admin/packages/all');
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

    // Bookings
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

    // Bookings
    async getBookings() {
        return this.request('/admin/bookings');
    }

    async updateBookingStatus(bookingId, status) {
        return this.request(`/admin/bookings/${bookingId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }

    // Inquiries
    async getInquiries() {
        return this.request('/admin/inquiries');
    }

    async updateInquiry(id, data) {
        return this.request(`/admin/inquiries/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    // Users
    async getUsers() {
        return this.request('/admin/users');
    }

    async updateUserRole(userId, role) {
        return this.request(`/admin/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({ role })
        });
    }

    // Analytics
    async getStats() {
        return this.request('/admin/stats');
    }

    // Alias for getStats - for backward compatibility
    async getDashboardStats() {
        return this.getStats();
    }

    async getAnalytics(period = '30d') {
        return this.request(`/admin/analytics?period=${period}`);
    }
}

// Create global instance
window.adminApi = new AdminApiService();
