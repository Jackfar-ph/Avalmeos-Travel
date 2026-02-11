/**
 * Admin Core Module - Core admin functions (login, logout, notifications, mobile menu)
 * Part of the modular admin architecture
 */

// API Base URL - should match backend server
const API_BASE_URL = 'http://localhost:3000/api';

// Check admin access
function checkAdminAccess() {
    const token = localStorage.getItem('avalmeos_token');
    const user = JSON.parse(localStorage.getItem('avalmeos_user') || 'null');
    
    if (!token || !user) {
        window.location.href = 'index.html?redirect=admin';
        return false;
    }
    
    if (user.role !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Initialize users for local auth (if not exists)
function initLocalUsers() {
    const USERS_KEY = 'avalmeos_users';
    let users = localStorage.getItem(USERS_KEY);
    if (!users) {
        const defaultUsers = {
            'admin@avalmeos.com': {
                email: 'admin@avalmeos.com',
                password: 'admin123',
                name: 'Admin',
                role: 'admin',
                createdAt: new Date().toISOString()
            }
        };
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
        console.log('[Admin] Local users initialized');
    }
}

// Get local users
function getLocalUsers() {
    const USERS_KEY = 'avalmeos_users';
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
}

// Authenticate user locally (for offline mode only)
function authenticateLocalUser(email, password) {
    const users = getLocalUsers();
    const userKey = email.toLowerCase();
    
    if (!users[userKey]) {
        return { success: false, message: 'User not found' };
    }
    
    if (users[userKey].password !== password) {
        return { success: false, message: 'Invalid password' };
    }
    
    return { success: true, user: users[userKey] };
}

// Initialize admin module
document.addEventListener('DOMContentLoaded', async function() {
    console.log('[Admin] Initializing...');
    
    // Initialize local users first
    initLocalUsers();
    
    // Check if already logged in with valid backend token
    const token = localStorage.getItem('avalmeos_token');
    let user = null;
    try {
        const userStr = localStorage.getItem('avalmeos_user');
        if (userStr && userStr !== 'undefined' && userStr !== 'null') {
            user = JSON.parse(userStr);
        }
    } catch (e) {
        console.error('Error parsing user:', e);
        user = null;
    }
    
    // Check if we have a valid backend token (not a local fake token)
    const isLocalToken = token && token.startsWith('local-');
    
    if (token && user && user.role === 'admin' && !isLocalToken) {
        // Already logged in with valid backend token
        console.log('[Admin] Existing backend session found');
        showAdminInterface();
        return;
    }
    
    // Try to login with backend
    console.log('[Admin] Attempting backend login...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: 'admin@avalmeos.com', 
                password: 'admin123' 
            })
        });
        
        console.log('[Admin] Backend response status:', response.status);
        
        const data = await response.json();
        console.log('[Admin] Backend response:', data);
        
        if (response.ok && data.success) {
            console.log('[Admin] Backend login SUCCESS');
            localStorage.setItem('avalmeos_token', data.data.token);
            localStorage.setItem('avalmeos_user', JSON.stringify(data.data.user));
            showAdminInterface();
            return;
        } else {
            console.warn('[Admin] Backend login FAILED:', data.message || 'Unknown error');
        }
    } catch (error) {
        console.warn('[Admin] Backend connection FAILED:', error.message);
    }
    
    console.log('[Admin] Falling back to offline mode...');
    
    // Fallback to local authentication
    const localAuth = authenticateLocalUser('admin@avalmeos.com', 'admin123');
    if (localAuth.success) {
        console.log('[Admin] Local auth SUCCESS');
        localStorage.setItem('avalmeos_token', 'local-token-' + Date.now());
        localStorage.setItem('avalmeos_user', JSON.stringify({
            id: 1,
            email: localAuth.user.email,
            name: localAuth.user.name,
            role: localAuth.user.role
        }));
        showAdminInterface();
    } else {
        console.error('[Admin] Local auth FAILED:', localAuth.message);
        // Show login overlay
        const overlay = document.getElementById('admin-login-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }
});

// Handle admin login
async function handleAdminLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const errorEl = document.getElementById('admin-login-error');
    
    errorEl.classList.add('hidden');
    console.log('[Admin] Manual login attempt:', email);
    
    // Try backend login first
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            console.log('[Admin] Manual login SUCCESS');
            localStorage.setItem('avalmeos_token', data.data.token);
            localStorage.setItem('avalmeos_user', JSON.stringify(data.data.user));
            showAdminInterface();
            return;
        }
        
        console.warn('[Admin] Manual login FAILED:', data.message);
    } catch (error) {
        console.warn('[Admin] Manual login ERROR:', error.message);
    }
    
    // Try local authentication as fallback
    const localAuth = authenticateLocalUser(email, password);
    if (localAuth.success) {
        console.log('[Admin] Manual login (offline) SUCCESS');
        localStorage.setItem('avalmeos_token', 'local-token-' + Date.now());
        localStorage.setItem('avalmeos_user', JSON.stringify({
            id: 1,
            email: localAuth.user.email,
            name: localAuth.user.name,
            role: localAuth.user.role
        }));
        
        showAdminInterface();
    } else {
        errorEl.textContent = localAuth.message || 'Invalid credentials';
        errorEl.classList.remove('hidden');
    }
}

// Show admin interface after login
function showAdminInterface() {
    const overlay = document.getElementById('admin-login-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
    }
    
    const userStr = localStorage.getItem('avalmeos_user');
    let user = null;
    try {
        user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        console.error('Error parsing user:', e);
        user = null;
    }
    document.getElementById('admin-user-name').textContent = user?.first_name || user?.name || user?.email?.split('@')[0] || 'Admin';
    
    // Load dashboard data
    loadDashboard();
    
    // Start polling for updates
    setInterval(checkForUpdates, 30000);
}

// Logout from admin
function logoutFromAdmin() {
    console.log('[Admin] Logging out...');
    localStorage.removeItem('avalmeos_token');
    localStorage.removeItem('avalmeos_user');
    console.log('[Admin] Logged out, reloading...');
    window.location.reload();
}

// Mobile menu functions
function toggleAdminMenu() {
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('admin-sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('hidden');
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
}

function closeAdminMenu() {
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('admin-sidebar-overlay');
    sidebar.classList.remove('open');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
}

// Notification functions
function toggleNotifications() {
    const dropdown = document.getElementById('notification-dropdown');
    dropdown.classList.toggle('hidden');
}

function checkForUpdates() {
    console.log('Checking for updates...');
}

function renderNotification(type, message, time) {
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };
    return `
        <div class="flex items-start gap-3 p-3 hover:bg-gray-50 ${type === 'error' ? 'text-red-600' : ''}">
            <span class="text-lg">${icons[type] || icons.info}</span>
            <div class="flex-1">
                <p class="text-sm text-gray-700">${message}</p>
                <span class="text-xs text-gray-400">${time}</span>
            </div>
        </div>
    `;
}

// Export functions to window for global access
window.checkAdminAccess = checkAdminAccess;
window.handleAdminLogin = handleAdminLogin;
window.showAdminInterface = showAdminInterface;
window.logoutFromAdmin = logoutFromAdmin;
window.toggleAdminMenu = toggleAdminMenu;
window.closeAdminMenu = closeAdminMenu;
window.toggleNotifications = toggleNotifications;
window.checkForUpdates = checkForUpdates;
window.renderNotification = renderNotification;
window.initLocalUsers = initLocalUsers;
window.authenticateLocalUser = authenticateLocalUser;
