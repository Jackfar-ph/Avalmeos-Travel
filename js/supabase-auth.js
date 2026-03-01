/**
 * ============================================================================
 * Supabase User Authentication Module
 * ============================================================================
 * 
 * Handles user authentication via Supabase OAuth (Google).
 * This module provides:
 * 1. Google OAuth sign-in for users
 * 2. Session management with Supabase
 * 3. State parameter handling for security
 * 4. Auth state change listeners
 * 5. Graceful error handling
 */

// Supabase configuration (same as admin-auth.js)
const SUPABASE_URL = 'https://jdxxfmtconqowzgtegou.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkeHhmbXRjb25xb3d6Z3RlZ291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1ODQyOTAsImV4cCI6MjA4NjE2MDI5MH0.USgx6RdvH9lddGgW8ulT82MZmStM4nUC-pJKEWzRkrk';

// Storage keys
const SUPABASE_USER_KEY = 'supabase_user_auth';
const OAUTH_STATE_KEY = 'oauth_state';

// Initialize Supabase client
let supabaseAuth = null;

// Initialize Supabase client
function initSupabaseAuth() {
    if (!supabaseAuth && window.supabase) {
        supabaseAuth = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabaseAuth;
}

// Get Supabase client
function getSupabaseAuth() {
    if (!supabaseAuth) {
        initSupabaseAuth();
    }
    return supabaseAuth;
}

/**
 * Generate a random state parameter for OAuth security
 * This prevents CSRF attacks
 */
function generateState() {
    const state = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem(OAUTH_STATE_KEY, state);
    return state;
}

/**
 * Get stored OAuth state
 */
function getStoredState() {
    return sessionStorage.getItem(OAUTH_STATE_KEY);
}

/**
 * Clear OAuth state
 */
function clearOAuthState() {
    sessionStorage.removeItem(OAUTH_STATE_KEY);
}

/**
 * Sign in with Google OAuth
 */
async function signInWithGoogle() {
    const supabase = getSupabaseAuth();
    
    try {
        // Generate state for security
        const state = generateState();
        
        // Get the current URL to redirect back after auth
        // This automatically uses whatever port the app is running on
        const currentUrl = window.location.origin + window.location.pathname;
        
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: currentUrl,
                scopes: 'email profile'
            }
        });
        
        if (error) {
            throw error;
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('[SupabaseAuth] Google sign-in error:', error);
        return { 
            success: false, 
            error: formatAuthError(error) 
        };
    }
}

/**
 * Sign in with email and password (optional - for users who prefer email)
 */
async function signInWithEmail(email, password) {
    const supabase = getSupabaseAuth();
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            throw error;
        }
        
        // Store user session and get enriched user data with role
        let userData;
        if (data.session) {
            userData = await storeUserSession(data.session, data.user);
        }
        
        return { success: true, user: userData || data.user, session: data.session };
    } catch (error) {
        console.error('[SupabaseAuth] Email sign-in error:', error);
        return { 
            success: false, 
            error: formatAuthError(error) 
        };
    }
}

/**
 * Sign up with email and password (optional)
 */
async function signUpWithEmail(email, password, userData = {}) {
    const supabase = getSupabaseAuth();
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: userData.name || '',
                    phone: userData.phone || ''
                }
            }
        });
        
        if (error) {
            throw error;
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('[SupabaseAuth] Email sign-up error:', error);
        return { 
            success: false, 
            error: formatAuthError(error) 
        };
    }
}

/**
 * Sign out the user
 */
async function signOutUser() {
    const supabase = getSupabaseAuth();
    
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            throw error;
        }
        
        // Clear local storage
        localStorage.removeItem(SUPABASE_USER_KEY);
        localStorage.removeItem('supabase_user_auth');
        
        return { success: true };
    } catch (error) {
        console.error('[SupabaseAuth] Sign out error:', error);
        return { 
            success: false, 
            error: formatAuthError(error) 
        };
    }
}

/**
 * Store user session in localStorage
 */
async function storeUserSession(session, user) {
    const userData = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || 
              user.user_metadata?.name || 
              user.email?.split('@')[0],
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        phone: user.user_metadata?.phone || '',
        role: user.email?.toLowerCase() === 'admin@avalmeos.com' ? 'admin' : 'user', // Set admin role for admin email
        provider: user.app_metadata?.provider || 'email',
        loggedInAt: new Date().toISOString()
    };
    
    // Save user data to localStorage for persistence
    localStorage.setItem(SUPABASE_USER_KEY, JSON.stringify(userData));
    
    // Also save to the key that getCurrentUser() checks
    localStorage.setItem(SUPABASE_AUTH_KEY, JSON.stringify(userData));
    
    // Notify auth state listeners
    if (typeof AuthState !== 'undefined') {
        AuthState.notify();
    }
    
    return userData;
}

/**
 * Get current user from Supabase session
 */
async function getCurrentSupabaseUser() {
    const supabase = getSupabaseAuth();
    
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            throw error;
        }
        
        if (!session) {
            return null;
        }
        
        return {
            user: session.user,
            session: session
        };
    } catch (error) {
        console.error('[SupabaseAuth] Get session error:', error);
        return null;
    }
}

/**
 * Check if user is logged in via Supabase
 */
async function isSupabaseUserLoggedIn() {
    const supabase = getSupabaseAuth();
    
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('[SupabaseAuth] Session check error:', error);
            return false;
        }
        
        return session !== null;
    } catch (error) {
        console.error('[SupabaseAuth] Session check error:', error);
        return false;
    }
}

/**
 * Get stored user from localStorage
 */
function getStoredUser() {
    const stored = localStorage.getItem(SUPABASE_USER_KEY);
    return stored ? JSON.parse(stored) : null;
}

/**
 * Initialize auth state listener
 */
function initAuthStateListener() {
    const supabase = getSupabaseAuth();
    
    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('[SupabaseAuth] Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
            console.log('[SupabaseAuth] User signed in:', session.user);
            await storeUserSession(session, session.user);
            
            // Update UI - direct manipulation
            const authButtons = document.getElementById('auth-buttons');
            const userMenu = document.getElementById('user-menu');
            if (authButtons) {
                authButtons.style.display = 'none';
                authButtons.classList.add('hidden');
            }
            if (userMenu) {
                userMenu.style.display = 'flex';
                userMenu.classList.remove('hidden');
                const userName = document.getElementById('user-display-name');
                if (userName) userName.textContent = session.user.email;
            }
            
            // Also try AuthUIManager
            if (typeof AuthUIManager !== 'undefined') {
                AuthUIManager.updateAuthUI();
            }
            
            // Check if there's a redirect pending
            const redirectUrl = sessionStorage.getItem('auth_redirect_url');
            if (redirectUrl) {
                sessionStorage.removeItem('auth_redirect_url');
                window.location.href = redirectUrl;
            }
        } else if (event === 'SIGNED_OUT') {
            console.log('[SupabaseAuth] User signed out');
            localStorage.removeItem(SUPABASE_USER_KEY);
            localStorage.removeItem('supabase_user_auth');
            clearOAuthState();
            
            // Update UI
            if (typeof AuthUIManager !== 'undefined') {
                AuthUIManager.updateAuthUI();
            }
        } else if (event === 'TOKEN_REFRESHED' && session) {
            console.log('[SupabaseAuth] Token refreshed');
            await storeUserSession(session, session.user);
        } else if (event === 'USER_UPDATED' && session) {
            console.log('[SupabaseAuth] User updated');
            await storeUserSession(session, session.user);
        }
    });
}

/**
 * Handle OAuth callback
 * Called when user returns from OAuth redirect
 */
async function handleOAuthCallback() {
    const supabase = getSupabaseAuth();
    
    // Wait for Supabase to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
        // Get the session from URL hash (Supabase puts it there)
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
            throw error;
        }
        
        if (data.session) {
            console.log('[SupabaseAuth] OAuth callback - session found');
            await storeUserSession(data.session, data.session.user);
            
            // Close auth modal if open
            if (typeof closeAuthModal === 'function') {
                closeAuthModal();
            }
            
            // Update UI
            if (typeof AuthUIManager !== 'undefined') {
                AuthUIManager.updateAuthUI();
            }
            
            // Show welcome notification
            if (typeof showNotification === 'function') {
                showNotification('Welcome! You are now signed in.', 'success');
            }
            
            // Clean up URL hash without reloading
            if (window.location.hash) {
                history.replaceState(null, '', window.location.pathname);
            }
            
            return { success: true, user: data.session.user };
        } else {
            console.log('[SupabaseAuth] OAuth callback - no session');
            return { success: false, error: 'No session found' };
        }
    } catch (error) {
        console.error('[SupabaseAuth] OAuth callback error:', error);
        return { 
            success: false, 
            error: formatAuthError(error) 
        };
    }
}

/**
 * Format authentication error messages
 */
function formatAuthError(error) {
    if (!error) return 'An unknown error occurred';
    
    const message = error.message || error.error_description || error.toString();
    
    // Map common errors to user-friendly messages
    const errorMap = {
        'Invalid login credentials': 'Invalid email or password',
        'Email not confirmed': 'Please confirm your email address',
        'User already registered': 'An account with this email already exists',
        'OAuth sign-in failed': 'Failed to sign in with Google. Please try again.',
        'Network request failed': 'Network error. Please check your connection.',
        'Too many requests': 'Too many attempts. Please try again later.',
        'User not found': 'No account found with this email',
        'Invalid email': 'Please enter a valid email address',
        'Password too short': 'Password must be at least 6 characters'
    };
    
    for (const [key, value] of Object.entries(errorMap)) {
        if (message.toLowerCase().includes(key.toLowerCase())) {
            return value;
        }
    }
    
    return message;
}

/**
 * Check if session is expired and handle refresh
 */
async function checkAndRefreshSession() {
    const supabase = getSupabaseAuth();
    
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            throw error;
        }
        
        if (!session) {
            // No session, clear stored user
            localStorage.removeItem(SUPABASE_USER_KEY);
            localStorage.removeItem('supabase_user_auth');
            return false;
        }
        
        // Check if session is expired
        const expiresAt = session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        
        if (expiresAt && expiresAt < now) {
            // Session expired, try to refresh
            const { data, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError) {
                console.log('[SupabaseAuth] Session refresh failed:', refreshError);
                localStorage.removeItem(SUPABASE_USER_KEY);
                localStorage.removeItem('supabase_user_auth');
                return false;
            }
            
            if (data.session) {
                await storeUserSession(data.session, data.session.user);
                return true;
            }
        }
        
        // Session is valid
        return true;
    } catch (error) {
        console.error('[SupabaseAuth] Session check error:', error);
        return false;
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    console.log('[SupabaseAuth] DOMContentLoaded - initializing...');
    initSupabaseAuth();
    initAuthStateListener();
    
    // Check for OAuth callback (URL contains hash params) - handle before session check
    const hasOAuthCallback = window.location.hash.includes('access_token') || 
                             window.location.hash.includes('error');
    
    if (hasOAuthCallback) {
        console.log('[SupabaseAuth] OAuth callback detected, handling...');
        // Give Supabase a moment to process the callback
        setTimeout(() => {
            handleOAuthCallback();
        }, 100);
    } else {
        console.log('[SupabaseAuth] No OAuth callback detected');
    }
    
    // Check for existing session after a short delay to ensure Supabase is ready
    // This ensures the client is fully initialized before checking session
    setTimeout(() => {
        checkExistingSession();
    }, 150);
});

/**
 * Check for existing Supabase session on page load
 * This ensures UI is updated if user already has a valid session
 */
async function checkExistingSession() {
    const supabase = getSupabaseAuth();
    
    if (!supabase) {
        console.log('[SupabaseAuth] Supabase client not ready, retrying...');
        // Retry after a short delay
        setTimeout(checkExistingSession, 100);
        return;
    }
    
    try {
        // First try to get session - this might return null if not loaded yet
        let { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('[SupabaseAuth] Error checking existing session:', error);
            return;
        }
        
        // If no session, wait briefly and try again (session might be loading)
        if (!session) {
            console.log('[SupabaseAuth] No session found initially, waiting...');
            await new Promise(resolve => setTimeout(resolve, 200));
            const result = await supabase.auth.getSession();
            session = result.data.session;
        }
        
        if (session) {
            console.log('[SupabaseAuth] Existing session found on page load');
            await storeUserSession(session, session.user);
            
            // Update UI
            if (typeof AuthUIManager !== 'undefined') {
                AuthUIManager.updateAuthUI();
            }
            
            // Clear the hash to clean URL
            if (window.location.hash) {
                history.replaceState(null, '', window.location.pathname);
            }
        } else {
            console.log('[SupabaseAuth] No existing session found');
        }
    } catch (error) {
        console.error('[SupabaseAuth] Error in checkExistingSession:', error);
    }
}

// Make functions globally available
window.supabaseAuth = {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOutUser,
    getCurrentSupabaseUser,
    isSupabaseUserLoggedIn,
    getStoredUser,
    handleOAuthCallback,
    checkAndRefreshSession,
    initSupabaseAuth,
    getSupabaseAuth
};
