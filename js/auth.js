// --- Authentication System ---

// Storage keys
const AUTH_KEY = 'avalmeos_auth';
const USERS_KEY = 'avalmeos_users';
const BOOKINGS_KEY = 'avalmeos_bookings';

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
        const auth = localStorage.getItem(AUTH_KEY);
        return auth ? JSON.parse(auth) : null;
    },
    
    // Check if user is logged in
    isLoggedIn() {
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
function registerUser(email, password, name, phone) {
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
        if (!validatePhone(phone)) {
            reject('Invalid Philippine phone number format (e.g., 09123456789)');
            return;
        }
        if (emailExists(email)) {
            reject('Email already registered');
            return;
        }

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
        
        // Save auth session
        const user = users[userKey];
        const authData = {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
            personalization: user.personalization || [],
            loggedInAt: new Date().toISOString()
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
        
        // Notify auth state listeners
        AuthState.notify();
        
        resolve(authData);
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

// Get current user
function getCurrentUser() {
    return AuthState.getCurrentUser();
}

// Check if user is logged in
function isLoggedIn() {
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

// Initialize auth on load
initUsers();
