/**
 * ============================================================================
 * Supabase Admin Authentication Handler
 * ============================================================================
 * 
 * Handles admin login/logout using Supabase authentication.
 * This file provides admin-specific auth functions that:
 * 1. Authenticate with Supabase using email/password
 * 2. Store and manage Supabase session tokens
 * 3. Verify admin role from user profile
 */

// Supabase configuration
const SUPABASE_URL = 'https://jdxxfmtconqowzgtegou.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkeHhmbXRjb25xb3d6Z3RlZ291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1ODQyOTAsImV4cCI6MjA4NjE2MDI5MH0.USgx6RdvH9lddGgW8ulT82MZmStM4nUC-pJKEWzRkrk';

// Supabase client initialization
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Get Supabase session token
 */
function getSupabaseToken() {
    const session = supabase.auth.getSession();
    return session.data?.access_token;
}

/**
 * Get current user from Supabase session
 */
function getSupabaseUser() {
    const session = supabase.auth.getSession();
    const user = session.data?.user;
    
    if (user) {
        // Get user profile from Supabase
        return supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()
            .then(({ data, error }) => {
                if (error) {
                    console.error('[AdminAuth] Failed to get user profile:', error);
                    return user;
                }
                return { ...user, ...data };
            })
            .catch(() => user);
    }
    
    return null;
}

/**
 * Check if user is authenticated as admin
 */
async function isSupabaseAdminAuthenticated() {
    const session = supabase.auth.getSession();
    const user = session.data?.user;
    
    if (!user) return false;
    
    // Get user profile to check role
    const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
    
    if (error) {
        console.error('[AdminAuth] Failed to get user profile:', error);
        return false;
    }
    
    // Check if user has admin role
    if (profile?.role !== 'admin') {
        console.log('[AdminAuth] User is not admin:', profile?.role);
        return false;
    }
    
    return true;
}

/**
 * Store Supabase authentication data
 */
async function storeSupabaseAuthData(user) {
    // Store user profile
    if (user) {
        localStorage.setItem('supabase_admin_user', JSON.stringify(user));
    }
    
    // Store session token (Supabase handles this internally)
    const session = supabase.auth.getSession();
    if (session.data?.access_token) {
        localStorage.setItem('supabase_admin_token', session.data.access_token);
    }
}

/**
 * Clear Supabase authentication data
 */
async function clearSupabaseAuthData() {
    // Clear Supabase session
    await supabase.auth.signOut();
    
    // Clear local storage
    localStorage.removeItem('supabase_admin_user');
    localStorage.removeItem('supabase_admin_token');
    localStorage.removeItem('supabase_admin_refresh_token');
    localStorage.removeItem('supabase_admin_token_expiry');
}

/**
 * Admin login function - uses Supabase auth
 */
async function adminLogin(email, password) {
    try {
        const { data: { session }, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw new Error(error.message || 'Login failed');
        }

        // Get user profile and check if admin
        const { data: user, error: userError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

        if (userError) {
            throw new Error('Failed to retrieve user profile');
        }

        // Check if user has admin role
        if (user.role !== 'admin') {
            await clearSupabaseAuthData();
            throw new Error('Access denied. Admin privileges required.');
        }

        // Store auth data
        await storeSupabaseAuthData(user);

        console.log('[AdminAuth] Login successful, Supabase session stored');
        return { user, token: session.access_token };
    } catch (error) {
        console.error('[AdminAuth] Login failed:', error);
        throw error;
    }
}

/**
 * Admin logout function - clears Supabase auth data
 */
async function adminLogout() {
    try {
        await clearSupabaseAuthData();
    } catch (error) {
        console.warn('[AdminAuth] Logout API call failed:', error);
    }

    // Reload to reset UI
    if (window.location.href.includes('admin.html')) {
        window.location.reload();
    }
}

/**
 * Check if admin panel should be visible - handles Supabase auth
 */
async function checkSupabaseAdminAuth() {
    const loginOverlay = document.getElementById('admin-login-overlay');
    const adminContent = document.querySelector('.admin-content-area');
    const sidebar = document.getElementById('admin-sidebar');
    
    // Check if user is logged in and is admin
    const isAdmin = await isSupabaseAdminAuthenticated();
    
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
        const user = await getSupabaseUser();
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
            // Login successful - Supabase auth will handle everything
            await checkSupabaseAdminAuth();
            
            // Load dashboard data
            if (typeof window.loadAdminDashboard === 'function') {
                window.loadAdminDashboard();
            }
            
            // Show success notification
            if (typeof window.showNotification === 'function') {
                window.showNotification('Welcome, ' + (result.user.first_name || result.user.name || result.user.email || 'Admin') + '!', 'success');
            }
        } else {
            // Not an admin
            await clearSupabaseAuthData();
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
    checkSupabaseAdminAuth();
    
    // Listen for auth changes from other tabs
    window.addEventListener('storage', function(e) {
        if (e.key === 'supabase_admin_token') {
            console.log('[AdminAuth] Auth changed in another tab');
            checkSupabaseAdminAuth();
        }
    });
}

// Make functions globally available
window.getSupabaseToken = getSupabaseToken;
window.getSupabaseUser = getSupabaseUser;
window.isSupabaseAdminAuthenticated = isSupabaseAdminAuthenticated;
window.storeSupabaseAuthData = storeSupabaseAuthData;
window.clearSupabaseAuthData = clearSupabaseAuthData;
window.adminLogin = adminLogin;
window.adminLogout = adminLogout;
window.checkSupabaseAdminAuth = checkSupabaseAdminAuth;
window.initSupabaseAdminAuth = initSupabaseAdminAuth;

// Test login function for debugging
async function testAdminLogin() {
    try {
        console.log('🔍 Testing admin login with admin@avalmeos.com / admin123...');
        
        const result = await adminLogin('admin@avalmeos.com', 'admin123');
        
        if (result && result.user && result.user.role === 'admin') {
            console.log('✅ Login successful!');
            console.log('👤 User:', result.user);
            console.log('🔐 Token:', result.token.substring(0, 20) + '...');
            
            // Check if admin panel is visible
            const isAdminVisible = await checkSupabaseAdminAuth();
            console.log('📋 Admin panel visible:', isAdminVisible);
            
            return true;
        } else {
            console.error('❌ Login failed: User is not admin or invalid credentials');
            return false;
        }
    } catch (error) {
        console.error('❌ Login error:', error.message);
        return false;
    }
}

// Check if test admin user exists
async function checkTestAdminUser() {
    try {
        console.log('🔍 Checking if test admin user exists...');
        
        const { data: users, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', 'admin@avalmeos.com')
            .single();
        
        if (error) {
            console.error('❌ Error checking user:', error.message);
            return false;
        }
        
        if (users) {
            console.log('✅ Test admin user exists!');
            console.log('👤 User:', users);
            console.log('📋 Role:', users.role);
            return true;
        } else {
            console.log('❌ Test admin user not found');
            return false;
        }
    } catch (error) {
        console.error('❌ Error checking user:', error.message);
        return false;
    }
}

// Create test admin user
async function createTestAdminUser() {
    try {
        console.log('🔱 Creating test admin user...');
        
        // First create the user in auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: 'admin@avalmeos.com',
            password: 'admin123'
        });
        
        if (authError) {
            console.error('❌ Error creating auth user:', authError.message);
            return false;
        }
        
        // Then create the user profile
        const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .insert({
                user_id: authData.user.id,
                email: 'admin@avalmeos.com',
                first_name: 'Admin',
                last_name: 'User',
                role: 'admin'
            })
            .select()
            .single();
        
        if (profileError) {
            console.error('❌ Error creating user profile:', profileError.message);
            return false;
        }
        
        console.log('✅ Test admin user created successfully!');
        console.log('👤 User:', profileData);
        console.log('📋 Role:', profileData.role);
        return true;
    } catch (error) {
        console.error('❌ Error creating test admin user:', error.message);
        return false;
    }
}

// Auto-create admin user if not found
async function ensureAdminUserExists() {
    const userExists = await checkTestAdminUser();
    if (!userExists) {
        console.log('🚀 Creating admin user...');
        const created = await createTestAdminUser();
        if (created) {
            console.log('✅ Admin user created successfully!');
        } else {
            console.error('❌ Failed to create admin user');
        }
    } else {
        console.log('✅ Admin user already exists');
    }
}

// Auto-run user check when page loads
window.addEventListener('load', async function() {
    console.log('🔍 Checking admin user...');
    await ensureAdminUserExists();
});

// Initialize test on page load
window.testAdminAuth = async function() {
    await testAdminLogin();
};

// Initialize user check on page load
window.checkAdminUser = async function() {
    await checkTestAdminUser();
};

// Auto-run user check when page loads
window.addEventListener('load', async function() {
    console.log('🔍 Checking admin user...');
    await checkTestAdminUser();
});
