// --- Authentication System (Supabase Integration) ---
// This module now uses Supabase for user authentication

// Storage keys
const AUTH_KEY = 'avalmeos_auth';
const USERS_KEY = 'avalmeos_users';
const BOOKINGS_KEY = 'avalmeos_bookings';
const SUPABASE_AUTH_KEY = 'supabase_user_auth';

// Auth State Management
const AuthState = {
    listeners: [],
    
    // Get current state
    getState() {
        return {
            isLoggedIn: this.isLoggedIn(),
            user: this.getCurrentUser()
        };
    },
    
    // Subscribe to auth state changes
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    },
    
    // Notify all listeners of state change
    notify() {
        const state = this.getState();
        this.listeners.forEach(callback => callback(state));
    },
    
    // Get current user
    getCurrentUser() {
        // First check Supabase auth
        const supabaseAuth = localStorage.getItem('supabase_user_auth');
        if (supabaseAuth) {
            return JSON.parse(supabaseAuth);
        }
        // Fall back to local auth
        const auth = localStorage.getItem(AUTH_KEY);
        return auth ? JSON.parse(auth) : null;
    },
    
    // Check if user is logged in
    isLoggedIn() {
        // Check Supabase first
        const supabaseAuth = localStorage.getItem('supabase_user_auth');
        if (supabaseAuth) {
            return true;
        }
        // Fall back to local auth
        return this.getCurrentUser() !== null;
    }
};

// Initialize users if not exists
function initUsers() {
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
    }
}

// Get all users
function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
}

// Save users
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Check if email exists
function emailExists(email) {
    const users = getUsers();
    return users.hasOwnProperty(email.toLowerCase());
}

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone number (Philippines format)
function validatePhone(phone) {
    // Philippine phone formats: +639XXXXXXXXX, 09XXXXXXXXX, 639XXXXXXXXX
    const phoneRegex = /^(\+?63|0)9\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Validate password strength
function validatePassword(password) {
    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true, message: 'Password is strong' };
}

// Register new user
function registerUser(email, password, name, phone = '') {
    return new Promise((resolve, reject) => {
        // Validate inputs
        if (!validateEmail(email)) {
            reject('Invalid email format');
            return;
        }
        if (!validatePassword(password).valid) {
            reject(validatePassword(password).message);
            return;
        }
        
        // Phone validation is now optional - skip if empty
        
        // Check if email exists in local users FIRST (before attempting Supabase signup)
        if (emailExists(email)) {
            reject('Email already registered. Please use a different email or log in.');
            return;
        }

        // Try Supabase signup first if available
        if (window.supabaseAuth) {
            window.supabaseAuth.signUpWithEmail(email, password, { name, phone })
                .then(result => {
                    if (result.success) {
                        // Also save to local users for fallback
                        const users = getUsers();
                        const userId = 'user_' + Date.now();
                        
                        users[email.toLowerCase()] = {
                            id: userId,
                            email: email.toLowerCase(),
                            password: password,
                            name: name,
                            phone: phone,
                            role: 'user',
                            personalization: [],
                            createdAt: new Date().toISOString()
                        };
                        saveUsers(users);
                        
                        // Auto login after successful registration
                        loginUser(email, password).then(resolve).catch(reject);
                    } else {
                        // Check if error indicates email already exists
                        if (result.error && (result.error.includes('already been registered') || result.error.includes('already exists'))) {
                            reject('Email already registered. Please use a different email or log in.');
                        } else {
                            reject(result.error || 'Registration failed');
                        }
                    }
                })
                .catch(error => {
                    reject(error.message || 'Registration failed');
                });
        } else {
            // Fall back to local-only registration
            const users = getUsers();
            const userId = 'user_' + Date.now();
            
            users[email.toLowerCase()] = {
                id: userId,
                email: email.toLowerCase(),
                password: password,
                name: name,
                phone: phone,
                role: 'user',
                personalization: [],
                createdAt: new Date().toISOString()
            };
            
            saveUsers(users);
            
            // Auto login after registration
            loginUser(email, password).then(resolve).catch(reject);
        }
    });
}

// Login user
function loginUser(email, password) {
    return new Promise((resolve, reject) => {
        // Initialize users first (creates admin if not exists)
        initUsers();
        
        const users = getUsers();
        const userKey = email.toLowerCase();
        
        if (!users[userKey]) {
            reject('User not found');
            return;
        }
        
        if (users[userKey].password !== password) {
            reject('Invalid password');
            return;
        }
        
        // Create user object for session (without password)
        const userData = {
            id: users[userKey].id,
            email: users[userKey].email,
            name: users[userKey].name,
            phone: users[userKey].phone,
            role: users[userKey].role,
            personalization: users[userKey].personalization,
            createdAt: users[userKey].createdAt
        };
        
        // Save auth session to BOTH keys for UI compatibility
        // supabase_user_auth is checked first by the UI
        localStorage.setItem(SUPABASE_AUTH_KEY, JSON.stringify(userData));
        localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
        
        // Notify auth state listeners
        AuthState.notify();
        
        resolve(userData);
    });
}

// Logout user
function logoutUser() {
    localStorage.removeItem(AUTH_KEY);
    
    // Notify auth state listeners about logout
    AuthState.notify();
    
    // Reload page to restore original UI state
    window.location.reload();
}

// Admin logout - clears admin-specific tokens
function logoutFromAdmin() {
    localStorage.removeItem('avalmeos_token');
    localStorage.removeItem('avalmeos_user');
    window.location.reload();
}

// Get current user - checks Supabase first, then falls back to localStorage
function getCurrentUser() {
    // First check Supabase auth
    const supabaseUser = localStorage.getItem(SUPABASE_AUTH_KEY);
    if (supabaseUser) {
        const user = JSON.parse(supabaseUser);
        
        // Check if user is admin email - update role if needed
        if (user.email && user.email.toLowerCase() === 'admin@avalmeos.com' && user.role !== 'admin') {
            user.role = 'admin';
            localStorage.setItem(SUPABASE_AUTH_KEY, JSON.stringify(user));
        }
        
        return user;
    }
    // Fall back to local auth
    return AuthState.getCurrentUser();
}

// Check if user is logged in - checks Supabase first
function isLoggedIn() {
    // Check Supabase auth first
    const supabaseUser = localStorage.getItem(SUPABASE_AUTH_KEY);
    if (supabaseUser) {
        return true;
    }
    // Fall back to local auth
    return AuthState.isLoggedIn();
}

// Check if current user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Update user personalization
function updateUserPersonalization(personalization) {
    const user = getCurrentUser();
    if (!user) return false;
    
    const users = getUsers();
    if (users[user.email]) {
        users[user.email].personalization = personalization;
        saveUsers(users);
        
        // Update current session
        user.personalization = personalization;
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        return true;
    }
    return false;
}

// Update user profile
function updateUserProfile(updates) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Not logged in' };
    
    const users = getUsers();
    if (!users[user.email]) {
        return { success: false, message: 'User not found' };
    }
    
    // Validate if updating email or phone
    if (updates.email && !validateEmail(updates.email)) {
        return { success: false, message: 'Invalid email format' };
    }
    if (updates.phone && !validatePhone(updates.phone)) {
        return { success: false, message: 'Invalid phone format' };
    }
    
    // Update user data
    const userKey = user.email;
    users[userKey] = { ...users[userKey], ...updates };
    saveUsers(users);
    
    // Update session
    user.email = updates.email || user.email;
    user.name = updates.name || user.name;
    user.phone = updates.phone || user.phone;
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    
    // Notify auth state listeners
    AuthState.notify();
    
    return { success: true, message: 'Profile updated' };
}

// Initialize auth on load - check Supabase session
async function initAuth() {
    // Check for Supabase session
    if (window.supabaseAuth) {
        window.supabaseAuth.initSupabaseAuth();
        
        // Check and refresh session
        const isValid = await window.supabaseAuth.checkAndRefreshSession();
        if (isValid) {
            // Update UI if user is logged in
            const user = window.supabaseAuth.getStoredUser();
            if (user) {
                // Force UI update
                if (typeof AuthUIManager !== 'undefined') {
                    AuthUIManager.updateAuthUI();
                }
                if (typeof window.updateAuthUI === 'function') {
                    window.updateAuthUI();
                }
            }
        } else {
            // Supabase session check failed - check for local auth
            const localAuth = localStorage.getItem(AUTH_KEY);
            if (localAuth) {
                // Copy local auth to supabase_user_auth for UI compatibility
                const user = JSON.parse(localAuth);
                localStorage.setItem(SUPABASE_AUTH_KEY, JSON.stringify(user));
                console.log('[Auth] Restored auth from local storage');
                
                // Update UI
                if (typeof AuthUIManager !== 'undefined') {
                    AuthUIManager.updateAuthUI();
                }
                if (typeof window.updateAuthUI === 'function') {
                    window.updateAuthUI();
                }
            }
        }
    }
    
    // Also initialize local users
    initUsers();
}

// Listen for componentsLoaded event to update UI after components load
document.addEventListener('componentsLoaded', function() {
    console.log('[Auth] componentsLoaded event fired!');
    // Check if user is logged in via Supabase
    const supabaseAuth = localStorage.getItem('supabase_user_auth');
    console.log('[Auth] supabase_user_auth in localStorage:', supabaseAuth ? 'FOUND' : 'NOT FOUND');
    if (supabaseAuth) {
        console.log('[Auth] User found in localStorage, updating UI...');
        const user = JSON.parse(supabaseAuth);
        
        // Check which elements exist
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        const userName = document.getElementById('user-display-name');
        const mobileAuth = document.getElementById('mobile-auth');
        const mobileUserMenu = document.getElementById('mobile-user-menu');
        
        console.log('[Auth] Element checks:');
        console.log('  auth-buttons:', authButtons ? 'EXISTS' : 'NOT FOUND');
        console.log('  user-menu:', userMenu ? 'EXISTS' : 'NOT FOUND');
        console.log('  user-display-name:', userName ? 'EXISTS' : 'NOT FOUND');
        console.log('  mobile-auth:', mobileAuth ? 'EXISTS' : 'NOT FOUND');
        console.log('  mobile-user-menu:', mobileUserMenu ? 'EXISTS' : 'NOT FOUND');
        
        // Hide auth buttons, show user menu - FORCE both class AND style
        if (authButtons) {
            authButtons.classList.add('hidden');
            authButtons.style.display = 'none !important';
            console.log('[Auth] Hidden auth-buttons');
        }
        if (userMenu) {
            userMenu.classList.remove('hidden');
            userMenu.style.display = 'flex !important';
            console.log('[Auth] Showed user-menu');
        }
        if (userName) userName.textContent = user.name || user.email.split('@')[0];
        
        // Mobile menu
        if (mobileAuth) {
            mobileAuth.classList.add('hidden');
            mobileAuth.style.display = 'none !important';
        }
        if (mobileUserMenu) {
            mobileUserMenu.classList.remove('hidden');
            mobileUserMenu.style.display = 'flex !important';
        }
        const mobileUserNameEl = document.getElementById('mobile-user-name');
        if (mobileUserNameEl) mobileUserNameEl.textContent = user.name || user.email.split('@')[0];
        
        console.log('[Auth] UI updated for user:', user.email);
        
        // Verify the changes stuck - check after a short delay
        setTimeout(() => {
            console.log('[Auth] Verification - auth-buttons display:', authButtons ? authButtons.style.display : 'N/A');
            console.log('[Auth] Verification - user-menu display:', userMenu ? userMenu.style.display : 'N/A');
            console.log('[Auth] Verification - auth-buttons classList:', authButtons ? authButtons.classList.toString() : 'N/A');
            console.log('[Auth] Verification - user-menu classList:', userMenu ? userMenu.classList.toString() : 'N/A');
        }, 500);
    } else {
        console.log('[Auth] No user found in localStorage');
    }
});

// Initialize on load
initAuth();

// Force UI update every second - keep running until user is found in localStorage
let forceUpdateCount = 0;
const forceUpdateInterval = setInterval(() => {
    const supabaseAuth = localStorage.getItem('supabase_user_auth');
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const adminLink = document.getElementById('admin-link');
    
    // Only run if elements exist
    if (!authButtons || !userMenu) {
        return;
    }
    
    // Always update UI based on current auth state
    if (supabaseAuth) {
        let user = JSON.parse(supabaseAuth);
        
        // Check if user is admin email - update role if needed
        if (user.email && user.email.toLowerCase() === 'admin@avalmeos.com' && user.role !== 'admin') {
            user.role = 'admin';
            localStorage.setItem('supabase_user_auth', JSON.stringify(user));
        }
        
        authButtons.style.display = 'none';
        authButtons.classList.add('hidden');
        userMenu.style.display = 'flex';
        userMenu.classList.remove('hidden');
        
        const userName = document.getElementById('user-display-name');
        if (userName) userName.textContent = user.name || user.email.split('@')[0];
        
        // Show/hide admin link based on role
        if (adminLink) {
            if (user.role === 'admin') {
                adminLink.classList.remove('hidden');
                adminLink.style.display = 'block';
            } else {
                adminLink.classList.add('hidden');
                adminLink.style.display = 'none';
            }
        }
        
        // Only log first few times to avoid console spam
        if (forceUpdateCount < 3) {
            console.log('[Auth] Force update #' + forceUpdateCount + ' - user found, UI updated');
        }
    } else {
        // Not logged in - show auth buttons
        authButtons.style.display = 'flex';
        authButtons.classList.remove('hidden');
        userMenu.style.display = 'none';
        userMenu.classList.add('hidden');
        
        // Hide admin link
        if (adminLink) {
            adminLink.classList.add('hidden');
            adminLink.style.display = 'none';
        }
        
        // Only log first few times to avoid console spam
        if (forceUpdateCount < 3) {
            console.log('[Auth] Force update #' + forceUpdateCount + ' - no user');
        }
    }
    
    forceUpdateCount++;
    // Keep running but with minimal logging after initial load
}, 1000);

// Listen for storage changes (for when user logs in/out in another tab or same tab)
window.addEventListener('storage', function(e) {
    if (e.key === 'supabase_user_auth') {
        console.log('[Auth] Storage changed, updating UI...');
        const supabaseAuth = localStorage.getItem('supabase_user_auth');
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        
        if (supabaseAuth) {
            const user = JSON.parse(supabaseAuth);
            if (authButtons) {
                authButtons.style.display = 'none';
                authButtons.classList.add('hidden');
            }
            if (userMenu) {
                userMenu.style.display = 'flex';
                userMenu.classList.remove('hidden');
                const userName = document.getElementById('user-display-name');
                if (userName) userName.textContent = user.name || user.email.split('@')[0];
            }
        } else {
            // Not logged in
            if (authButtons) {
                authButtons.style.display = 'flex';
                authButtons.classList.remove('hidden');
            }
            if (userMenu) {
                userMenu.style.display = 'none';
                userMenu.classList.add('hidden');
            }
        }
    }
});
