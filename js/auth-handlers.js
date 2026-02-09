// --- Login Handler ---
window.handleLogin = function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    loginUser(email, password)
        .then(user => {
            closeAuthModal();
            
            // Check if admin user - redirect to admin dashboard
            if (user.role === 'admin') {
                window.location.href = 'admin.html';
                return;
            }
            
            // Normal user - show welcome message
            if (typeof AuthUIManager !== 'undefined') {
                AuthUIManager.updateAuthUI();
            }
            
            showNotification(`Welcome back, ${user.name}!`, 'success');
        })
        .catch(error => {
            showNotification(error, 'error');
        });
};

// --- Signup Handler ---
window.handleSignup = function(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;
    
    registerUser(email, password, name, phone)
        .then(user => {
            closeAuthModal();
            // Force immediate UI update
            if (typeof AuthUIManager !== 'undefined') {
                AuthUIManager.updateAuthUI();
            }
            showNotification(`Welcome to Avalmeo's, ${user.name}!`, 'success');
        })
        .catch(error => {
            showNotification(error, 'error');
        });
};

// --- Logout Handler ---
window.logoutUser = function() {
    // Clear auth state
    localStorage.removeItem('avalmeos_auth');
    
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
