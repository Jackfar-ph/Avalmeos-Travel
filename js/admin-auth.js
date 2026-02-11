/**
 * ============================================================================
 * Unified Admin Authentication Handler
 * ============================================================================
 * 
 * Handles admin login/logout with unified JWT token management.
 * This file provides admin-specific auth functions that:
 * 1. First checks for existing JWT token from main site login
 * 2. If user is admin, converts/uses that token for admin access
 * 3. Falls back to admin-specific login if needed
 */

// Unified token storage keys
const UNIFIED_TOKEN_KEY = 'avalmeos_auth'; // Same as main site

/**
 * Get JWT token from main site storage
 */
function getUnifiedToken() {
    // First try: Check main site auth storage
    const authData = localStorage.getItem(UNIFIED_TOKEN_KEY);
    if (authData) {
        try {
            const parsed = JSON.parse(authData);
            // Check if it's a JWT token format (should have token field from API login)
            if (parsed.token) {
                return parsed.token;
            }
            // Check if it's stored directly
            if (typeof parsed === 'string' && parsed.includes('.')) {
                return parsed;
            }
        } catch (e) {
            console.warn('[AdminAuth] Failed to parse main auth data:', e);
        }
    }
    
    // Fallback: Check admin-specific token
    return localStorage.getItem('avalmeos_admin_token');
}

/**
 * Get current user from main site storage
 */
function getUnifiedUser() {
    const authData = localStorage.getItem(UNIFIED_TOKEN_KEY);
    if (authData) {
        try {
            const parsed = JSON.parse(authData);
            // Return user object if available
            if (parsed.user || parsed.data?.user) {
                return parsed.user || parsed.data?.user;
            }
            // Return parsed directly if it's the user object
            if (parsed.id && parsed.email) {
                return parsed;
            }
        } catch (e) {
            console.warn('[AdminAuth] Failed to parse user data:', e);
        }
    }
    
    // Fallback: Check admin-specific user
    const adminUser = localStorage.getItem('avalmeos_admin_user');
    if (adminUser) {
        try {
            return JSON.parse(adminUser);
        } catch (e) {}
    }
    
    return null;
}

/**
 * Check if user is authenticated as admin
 */
function isUnifiedAdminAuthenticated() {
    const user = getUnifiedUser();
    const token = getUnifiedToken();
    
    if (!user || !token) return false;
    
    // Check if user has admin role
    if (user.role !== 'admin') {
        console.log('[AdminAuth] User is not admin:', user.role);
        return false;
    }
    
    return true;
}

/**
 * Store unified authentication data (shares with main site)
 */
function setUnifiedAuthData(data) {
    // Store in main site format for shared access
    if (data.token) {
        localStorage.setItem(UNIFIED_TOKEN_KEY, JSON.stringify({
            ...data.user,
            token: data.token,
            refreshToken: data.refreshToken,
            loggedInAt: new Date().toISOString()
        }));
    }
    
    // Also store admin-specific for backward compatibility
    if (data.token) {
        localStorage.setItem('avalmeos_admin_token', data.token);
    }
    if (data.refreshToken) {
        localStorage.setItem('avalmeos_admin_refresh_token', data.refreshToken);
    }
    
    // Store expiry
    const expiresIn = data.expiresIn || (7 * 24 * 60 * 60 * 1000);
    const expiry = Date.now() + expiresIn;
    localStorage.setItem('avalmeos_admin_token_expiry', expiry.toString());
    
    // Store user
    if (data.user) {
        localStorage.setItem('avalmeos_admin_user', JSON.stringify(data.user));
    }
}

/**
 * Clear all auth data (both main and admin)
 */
function clearUnifiedAuthData() {
    localStorage.removeItem(UNIFIED_TOKEN_KEY);
    localStorage.removeItem('avalmeos_admin_token');
    localStorage.removeItem('avalmeos_admin_refresh_token');
    localStorage.removeItem('avalmeos_admin_token_expiry');
    localStorage.removeItem('avalmeos_admin_user');
}

/**
 * Admin login function - uses backend API
 */
async function adminLogin(email, password) {
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
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

        // Store auth data (shared with main site)
        setUnifiedAuthData(data.data);

        console.log('[AdminAuth] Login successful, token stored for unified auth');
        return data.data;
    } catch (error) {
        console.error('[AdminAuth] Login failed:', error);
        throw error;
    }
}

/**
 * Admin logout function - clears all auth data
 */
async function adminLogout() {
    try {
        const token = getUnifiedToken();
        if (token) {
            await fetch('http://localhost:3000/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }).catch(() => {});
        }
    } catch (error) {
        console.warn('[AdminAuth] Logout API call failed:', error);
    }

    // Clear all auth data
    clearUnifiedAuthData();

    // Reload to reset UI
    if (window.location.href.includes('admin.html')) {
        window.location.reload();
    }
}

/**
 * Check if admin panel should be visible - handles unified auth
 */
function checkUnifiedAdminAuth() {
    const loginOverlay = document.getElementById('admin-login-overlay');
    const adminContent = document.querySelector('.admin-content-area');
    const sidebar = document.getElementById('admin-sidebar');
    
    // Check if user is logged in and is admin
    const isAdmin = isUnifiedAdminAuthenticated();
    
    if (!isAdmin) {
        // Hide admin content, show login
        if (loginOverlay) loginOverlay.style.display = 'flex';
        if (adminContent) adminContent.style.display = 'none';
        if (sidebar) sidebar.style.display = 'none';
        return false;
    } else {
        // Show admin content, hide login
        if (loginOverlay) loginOverlay.style.display = 'none';
        if (adminContent) adminContent.style.display = 'block';
        if (sidebar) sidebar.style.display = 'block';
        
        // Update user name display
        const userNameEl = document.getElementById('admin-user-name');
        const user = getUnifiedUser();
        if (userNameEl && user) {
            userNameEl.textContent = user.first_name || user.name || user.email || 'Admin';
        }
        
        return true;
    }
}

/**
 * Handle admin login form submission
 */
window.handleAdminLogin = async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const errorEl = document.getElementById('admin-login-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Show loading state
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
    }
    
    try {
        const result = await adminLogin(email, password);
        
        // Check if user is admin
        if (result.user && result.user.role === 'admin') {
            // Login successful - unified auth will handle everything
            checkUnifiedAdminAuth();
            
            // Load dashboard data
            if (typeof window.loadAdminDashboard === 'function') {
                window.loadAdminDashboard();
            }
            
            // Show success notification
            if (typeof window.showNotification === 'function') {
                window.showNotification('Welcome, ' + (result.user.first_name || result.user.name || 'Admin') + '!', 'success');
            }
        } else {
            // Not an admin
            clearUnifiedAuthData();
            throw new Error('Access denied. Admin privileges required.');
        }
    } catch (error) {
        if (errorEl) {
            errorEl.textContent = error.message;
            errorEl.classList.remove('hidden');
        }
        
        if (typeof window.showNotification === 'function') {
            window.showNotification(error.message || 'Login failed', 'error');
        }
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login as Admin';
        }
    }
};

/**
 * Handle admin logout
 */
window.logoutFromAdmin = function() {
    if (confirm('Are you sure you want to logout?')) {
        adminLogout();
    }
};

/**
 * Initialize unified admin auth on page load
 */
function initUnifiedAdminAuth() {
    // Check auth on load
    checkUnifiedAdminAuth();
    
    // Listen for auth changes from other tabs
    window.addEventListener('storage', function(e) {
        if (e.key === UNIFIED_TOKEN_KEY) {
            console.log('[AdminAuth] Auth changed in another tab');
            checkUnifiedAdminAuth();
        }
    });
}

// Make functions globally available
window.getUnifiedToken = getUnifiedToken;
window.getUnifiedUser = getUnifiedUser;
window.isUnifiedAdminAuthenticated = isUnifiedAdminAuthenticated;
window.setUnifiedAuthData = setUnifiedAuthData;
window.clearUnifiedAuthData = clearUnifiedAuthData;
window.adminLogin = adminLogin;
window.adminLogout = adminLogout;
window.checkUnifiedAdminAuth = checkUnifiedAdminAuth;
window.initUnifiedAdminAuth = initUnifiedAdminAuth;
