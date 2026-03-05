// --- Login Handler ---
window.handleLogin = function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Check if Supabase auth is available
    if (window.supabaseAuth) {
        // Use Supabase email/password auth
        window.supabaseAuth.signInWithEmail(email, password)
            .then(result => {
                if (result.success) {
                    handleLoginSuccess(result.user);
                } else {
                    showNotification(result.error || 'Login failed', 'error');
                }
            })
            .catch(error => {
                showNotification(error.message || 'Login failed', 'error');
            });
    } else {
        // Fall back to local auth
        loginUser(email, password)
            .then(user => {
                handleLoginSuccess(user);
            })
            .catch(error => {
                showNotification(error, 'error');
            });
    }
};

// Handle successful login (common for both Supabase and local auth)
function handleLoginSuccess(user) {
    console.log('[Auth] Login successful, user:', user);
    
    closeAuthModal();
    
    // Check if admin user - redirect to admin dashboard
    if (user.role === 'admin') {
        window.location.href = 'admin.html';
        return;
    }
    
    // Use the helper function to update UI
    updateAuthUIElements(user);
    
    // Show welcome message
    showNotification(`Welcome back, ${user.name || user.email.split('@')[0]}!`, 'success');
}

// --- Google OAuth Handler ---
window.handleGoogleLogin = function(e) {
    if (e) e.preventDefault();
    
    if (!window.supabaseAuth) {
        showNotification('Authentication service not available', 'error');
        return;
    }
    
    // Show loading state
    const googleBtn = document.getElementById('google-login-btn');
    if (googleBtn) {
        googleBtn.disabled = true;
        googleBtn.innerHTML = '<span class="animate-spin">⏳</span> Connecting...';
    }
    
    window.supabaseAuth.signInWithGoogle()
        .then(result => {
            if (!result.success) {
                showNotification(result.error || 'Google sign-in failed', 'error');
                
                // Reset button
                if (googleBtn) {
                    googleBtn.disabled = false;
                    googleBtn.innerHTML = getGoogleButtonHTML();
                }
            }
            // If successful, Supabase will redirect
        })
        .catch(error => {
            showNotification(error.message || 'Google sign-in failed', 'error');
            
            // Reset button
            if (googleBtn) {
                googleBtn.disabled = false;
                googleBtn.innerHTML = getGoogleButtonHTML();
            }
        });
};

// Helper function to get Google button HTML
function getGoogleButtonHTML() {
    return `<svg class="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    <span>Continue with Google</span>`;
}

// --- Signup Handler ---
window.handleSignup = function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const phone = ''; // Phone number removed from signup
    const password = document.getElementById('signup-password').value;
    
    // Show loading state
    const signupBtn = document.querySelector('#signup-form button[type="submit"]');
    if (signupBtn) {
        signupBtn.disabled = true;
        signupBtn.textContent = 'Creating Account...';
    }
    
    registerUser(email, password, name, phone)
        .then(user => {
            console.log('[Auth] Signup successful, user:', user);
            
            // Close modal first
            closeAuthModal();
            
            // Get the user from localStorage to ensure we have correct data
            const storedAuth = localStorage.getItem('avalmeos_auth');
            const supabaseAuth = localStorage.getItem('supabase_user_auth');
            const authData = storedAuth ? JSON.parse(storedAuth) : (supabaseAuth ? JSON.parse(supabaseAuth) : user);
            
            console.log('[Auth] Auth data from storage:', authData);
            
            // Show success notification
            showNotification(`Welcome to Avalmeo's, ${authData.name || authData.email.split('@')[0]}! Your account has been created.`, 'success');
            
            // Update UI to show logged in state BEFORE reload
            if (typeof updateAuthUIElements === 'function') {
                updateAuthUIElements(authData);
            }
            if (typeof AuthUIManager !== 'undefined') {
                AuthUIManager.updateAuthUI();
            }
            if (typeof updateAuthUI === 'function') {
                updateAuthUI();
            }
            
            // Reload page to ensure UI properly reflects logged-in state
            setTimeout(() => {
                window.location.reload();
            }, 500);
            
            // Reset button state
            if (signupBtn) {
                signupBtn.disabled = false;
                signupBtn.textContent = 'Create Account';
            }
        })
        .catch(error => {
            console.error('[Auth] Signup error:', error);
            // Show error notification
            showNotification(error, 'error');
            
            // Reset button state
            if (signupBtn) {
                signupBtn.disabled = false;
                signupBtn.textContent = 'Create Account';
            }
        });
};

// Helper function to update auth UI elements
function updateAuthUIElements(user) {
    if (!user) {
        console.warn('[Auth] No user data provided to updateAuthUIElements');
        return;
    }
    
    const userDisplayName = user.name || user.email.split('@')[0];
    
    // Desktop menu elements
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-display-name');
    const adminLink = document.getElementById('admin-link');
    
    // Mobile menu elements
    const mobileAuth = document.getElementById('mobile-auth');
    const mobileUserMenu = document.getElementById('mobile-user-menu');
    const mobileUserName = document.getElementById('mobile-user-name');
    const mobileAdminLink = document.getElementById('mobile-admin-link');
    
    console.log('[Auth] Updating UI with user:', userDisplayName);
    console.log('[Auth] Elements found - authButtons:', !!authButtons, 'userMenu:', !!userMenu);
    
    // Hide auth buttons, show user menu - desktop
    if (authButtons) {
        authButtons.classList.add('hidden');
        authButtons.style.display = 'none';
    }
    if (userMenu) {
        userMenu.classList.remove('hidden');
        userMenu.style.display = 'flex';
    }
    if (userName) {
        userName.textContent = userDisplayName;
    }
    
    // Hide admin link for non-admin users
    if (adminLink) {
        adminLink.classList.add('hidden');
        adminLink.style.display = 'none';
    }
    
    // Mobile menu
    if (mobileAuth) {
        mobileAuth.classList.add('hidden');
        mobileAuth.style.display = 'none';
    }
    if (mobileUserMenu) {
        mobileUserMenu.classList.remove('hidden');
        mobileUserMenu.style.display = 'flex';
    }
    if (mobileUserName) {
        mobileUserName.textContent = userDisplayName;
    }
    if (mobileAdminLink) {
        mobileAdminLink.classList.add('hidden');
        mobileAdminLink.style.display = 'none';
    }
    
    // Also call the AuthUIManager for any other updates
    if (typeof AuthUIManager !== 'undefined') {
        AuthUIManager.updateAuthUI();
    }
    
    if (typeof window.updateAuthUI === 'function') {
        window.updateAuthUI();
    }
}

// Make it globally accessible
window.updateAuthUIElements = updateAuthUIElements;

// --- Logout Handler ---
window.logoutUser = function() {
    // Clear both local and Supabase auth state
    localStorage.removeItem('avalmeos_auth');
    localStorage.removeItem('supabase_user_auth');
    
    // Also sign out from Supabase
    if (typeof window.supabaseAuth !== 'undefined' && window.supabaseAuth.signOutUser) {
        window.supabaseAuth.signOutUser();
    }
    
    // Restore UI elements immediately
    restoreAuthUI();
    
    // Show notification
    showNotification('You have been logged out', 'info');
    
    // Reload page to fully reset state
    setTimeout(() => {
        window.location.reload();
    }, 500);
};

// --- Restore Auth UI ---
function restoreAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const adminLink = document.getElementById('admin-link');
    const mobileAuth = document.getElementById('mobile-auth');
    const mobileUserMenu = document.getElementById('mobile-user-menu');
    
    // Show auth buttons, hide user menu
    if (authButtons) {
        authButtons.classList.remove('hidden');
        authButtons.style.display = 'flex';
    }
    if (userMenu) {
        userMenu.classList.add('hidden');
        userMenu.style.display = 'none';
    }
    if (adminLink) {
        adminLink.classList.add('hidden');
        adminLink.style.display = 'none';
    }
    
    // Mobile menu
    if (mobileAuth) {
        mobileAuth.classList.remove('hidden');
        mobileAuth.style.display = 'flex';
    }
    if (mobileUserMenu) {
        mobileUserMenu.classList.add('hidden');
        mobileUserMenu.style.display = 'none';
    }
    
    // Update cart count
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
}

// Make restoreAuthUI globally available
window.restoreAuthUI = restoreAuthUI;

// --- Auth UI State Manager ---
const AuthUIManager = {
    // Initialize auth UI based on current state
    init() {
        this.updateAuthUI();
    },
    
    // Update auth UI elements
    updateAuthUI() {
        const user = getCurrentUser();
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        const userName = document.getElementById('user-display-name');
        const adminLink = document.getElementById('admin-link');
        const mobileAuth = document.getElementById('mobile-auth');
        const mobileUserMenu = document.getElementById('mobile-user-menu');
        const mobileAdminLink = document.getElementById('mobile-admin-link');
        const mobileUserName = document.getElementById('mobile-user-name');
        
        if (user) {
            // User is logged in - hide auth buttons, show user menu
            if (authButtons) {
                authButtons.classList.add('hidden');
                authButtons.style.display = 'none';
            }
            if (userMenu) {
                userMenu.classList.remove('hidden');
                userMenu.style.display = 'flex';
            }
            if (userName) userName.textContent = user.name;
            
            // Show admin link if user is admin
            if (adminLink) {
                if (user.role === 'admin') {
                    adminLink.classList.remove('hidden');
                    adminLink.style.display = 'block';
                } else {
                    adminLink.classList.add('hidden');
                    adminLink.style.display = 'none';
                }
            }
            
            // Mobile menu
            if (mobileAuth) {
                mobileAuth.classList.add('hidden');
                mobileAuth.style.display = 'none';
            }
            if (mobileUserMenu) {
                mobileUserMenu.classList.remove('hidden');
                mobileUserMenu.style.display = 'flex';
            }
            if (mobileUserName) mobileUserName.textContent = user.name;
            if (mobileAdminLink) {
                if (user.role === 'admin') {
                    mobileAdminLink.classList.remove('hidden');
                    mobileAdminLink.style.display = 'block';
                } else {
                    mobileAdminLink.classList.add('hidden');
                    mobileAdminLink.style.display = 'none';
                }
            }
        } else {
            // User is not logged in - show auth buttons, hide user menu
            if (authButtons) {
                authButtons.classList.remove('hidden');
                authButtons.style.display = 'flex';
            }
            if (userMenu) {
                userMenu.classList.add('hidden');
                userMenu.style.display = 'none';
            }
            if (adminLink) {
                adminLink.classList.add('hidden');
                adminLink.style.display = 'none';
            }
            
            // Mobile menu
            if (mobileAuth) {
                mobileAuth.classList.remove('hidden');
                mobileAuth.style.display = 'flex';
            }
            if (mobileUserMenu) {
                mobileUserMenu.classList.add('hidden');
                mobileUserMenu.style.display = 'none';
            }
            if (mobileAdminLink) {
                mobileAdminLink.classList.add('hidden');
                mobileAdminLink.style.display = 'none';
            }
        }
        
        // Update cart count
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
    }
};

// Expose updateAuthUI globally
window.updateAuthUI = function() {
    if (typeof AuthUIManager !== 'undefined') {
        AuthUIManager.updateAuthUI();
    }
};

// --- Admin Dashboard Functions ---
window.openAdminDashboard = function() {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        showNotification('Access denied. Admin only.', 'error');
        return;
    }
    
    const modal = document.getElementById('admin-dashboard-modal');
    if (modal) {
        modal.classList.remove('hidden');
        renderAdminDashboard();
    }
};

window.closeAdminDashboard = function() {
    const modal = document.getElementById('admin-dashboard-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
};

// --- Booking Details Functions ---
window.viewBookingDetails = function(bookingId) {
    viewBookingDetails(bookingId);
};

window.approveBooking = function(bookingId) {
    approveBooking(bookingId);
};

window.rejectBooking = function(bookingId) {
    rejectBooking(bookingId);
};

window.closeBookingDetailsModal = function() {
    closeBookingDetailsModal();
};

// --- Package Management Functions ---
window.showAddPackageForm = function() {
    showAddPackageForm();
};

window.editPackage = function(city) {
    editPackage(city);
};

window.deletePackage = function(city) {
    deletePackage(city);
};

window.closePackageFormModal = function() {
    closePackageFormModal();
};

// Handle package form submission
document.addEventListener('submit', function(e) {
    if (e.target && e.target.id === 'package-form') {
        e.preventDefault();
        const formData = {
            city: document.getElementById('package-city').value,
            title: document.getElementById('package-title').value,
            price: document.getElementById('package-price').value,
            details: document.getElementById('package-details').value
        };
        savePackageFromForm(formData);
    }
});

// --- Chat Functions ---
window.sendQuickReply = function(text) {
    sendChatMessage(text);
};

// --- User Dropdown Toggle ---
window.toggleUserDropdown = function() {
    const dropdown = document.getElementById('dropdown-menu');
    const arrow = document.getElementById('dropdown-arrow');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
        if (arrow) {
            arrow.classList.toggle('rotate-180');
        }
    }
};

// --- Initialize on componentsLoaded event ---
// Registration function for click-outside listener
window.setupDropdownListener = function() {
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('user-dropdown');
        const menu = document.getElementById('dropdown-menu');
        
        if (dropdown && menu && !dropdown.contains(e.target)) {
            menu.classList.add('hidden');
            const arrow = document.getElementById('dropdown-arrow');
            if (arrow) {
                arrow.classList.remove('rotate-180');
            }
        }
    });
};

// Listen for componentsLoaded to set up dropdown listener
document.addEventListener('componentsLoaded', function() {
    if (typeof AuthUIManager !== 'undefined') {
        AuthUIManager.init();
    }
    
    if (typeof updateAuthUI === 'function') {
        updateAuthUI();
    }
    
    window.setupDropdownListener();
});

// Handle back/forward navigation (bfcache)
window.addEventListener('pageshow', function(event) {
    // Re-initialize auth UI when page is shown from bfcache
    if (typeof AuthUIManager !== 'undefined') {
        AuthUIManager.updateAuthUI();
    }
    
    if (typeof updateAuthUI === 'function') {
        updateAuthUI();
    }
});
