/**
 * ============================================================================
 * Admin Module - Main Entry Point
 * ============================================================================
 * Initializes the admin module structure and provides backward compatibility
 * Architecture: Controller-Service-View pattern with clear separation of concerns
 * Component-based architecture with dynamically loaded HTML components
 */

console.log('[Admin] main.js loaded');

// ============================================================================
// COMPONENT INITIALIZATION
// ============================================================================

/**
 * Initialize admin components
 * Called after components are loaded
 */
async function initAdminComponents() {
    console.log('Initializing admin components...');
    
    try {
        // Load all admin components
        await AdminComponents.loadAll();
        console.log('Admin components loaded, initializing module...');
        
        // Initialize the admin module
        AdminModule.init();
        
        // Setup admin login handlers and other UI functions
        setupAdminUI();
        
        console.log('Admin initialization complete');
    } catch (error) {
        console.error('Error initializing admin components:', error);
    }
}

/**
 * Setup admin UI functions that were previously inline
 */
function setupAdminUI() {
    // Expose admin UI functions globally
    window.checkAdminAccess = checkAdminAccess;
    window.handleAdminLogin = handleAdminLogin;
    window.showAdminInterface = showAdminInterface;
    window.logoutFromAdmin = logoutFromAdmin;
    window.toggleAdminMenu = toggleAdminMenu;
    window.closeAdminMenu = closeAdminMenu;
    window.showAdminTab = showAdminTab;
    window.loadTabData = loadTabData;
    window.getStatusClass = getStatusClass;
    window.isOfflineMode = isOfflineMode;
    
    // Modal functions
    window.closeBookingModal = closeBookingModal;
    window.showDestinationModal = showDestinationModal;
    window.closeDestinationModal = closeDestinationModal;
    window.saveDestination = saveDestination;
    window.showActivityModal = showActivityModal;
    window.closeActivityModal = closeActivityModal;
    window.saveActivity = saveActivity;
    window.showPackageModal = showPackageModal;
    window.closePackageModal = closePackageModal;
    window.savePackage = savePackage;
    window.showDeletePackageModal = showDeletePackageModal;
    window.closeDeletePackageModal = closeDeletePackageModal;
    
    // Tab loading functions
    window.loadDashboard = loadDashboard;
    window.loadBookings = loadBookings;
    window.loadDestinations = loadDestinations;
    window.loadActivities = loadActivities;
    window.loadPackages = loadPackages;
    window.loadUsers = loadUsers;
    window.loadInquiries = loadInquiries;
    window.loadAnalytics = loadAnalytics;
    
    // CRUD functions
    window.editDestination = editDestination;
    window.deleteDestination = deleteDestination;
    window.editActivity = editActivity;
    window.deleteActivity = deleteActivity;
    window.editPackage = editPackage;
    window.filterBookings = filterBookings;
    window.exportBookings = exportBookings;
    window.filterPackages = filterPackages;
    window.searchPackages = searchPackages;
    
    // Check admin access and show login if needed
    checkAdminAccess();
}

// ============================================================================
// ADMIN UI FUNCTIONS
// These functions were previously inline in admin.html
// ============================================================================

/**
 * Check admin access
 */
function checkAdminAccess() {
    const token = localStorage.getItem('avalmeos_token');
    const user = JSON.parse(localStorage.getItem('avalmeos_user') || 'null');
    
    if (!token || !user) {
        // Show login overlay
        const loginOverlay = document.getElementById('admin-login-overlay');
        if (loginOverlay) {
            loginOverlay.classList.remove('hidden');
        }
        return false;
    }
    
    if (user.role !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

/**
 * Handle admin login
 */
async function handleAdminLogin(event) {
    event.preventDefault();
    console.log('handleAdminLogin called');
    
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const errorEl = document.getElementById('admin-login-error');
    
    console.log('Login attempt for:', email);
    
    errorEl.classList.add('hidden');
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
            // Store token and user
            localStorage.setItem('avalmeos_token', data.data.token);
            localStorage.setItem('avalmeos_user', JSON.stringify(data.data.user));
            
            // Show dashboard
            showAdminInterface();
        } else {
            errorEl.textContent = data.message || 'Login failed. Check console.';
            errorEl.classList.remove('hidden');
            console.error('Login failed:', data);
        }
    } catch (error) {
        errorEl.textContent = 'Connection error. Make sure backend is running.';
        errorEl.classList.remove('hidden');
    }
}

/**
 * Show admin interface after login
 */
function showAdminInterface() {
    const loginOverlay = document.getElementById('admin-login-overlay');
    if (loginOverlay) {
        loginOverlay.classList.add('hidden');
    }
    
    const userStr = localStorage.getItem('avalmeos_user');
    let user = null;
    try {
        user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        console.error('Error parsing user:', e);
        user = null;
    }
    
    const adminUserName = document.getElementById('admin-user-name');
    if (adminUserName) {
        adminUserName.textContent = user?.first_name || user?.email?.split('@')[0] || 'Admin';
    }
    
    // Load dashboard data
    if (typeof loadDashboard === 'function') {
        loadDashboard();
    }
    
    // Start polling for updates
    setInterval(() => {
        if (typeof checkForUpdates === 'function') {
            checkForUpdates();
        }
    }, 30000);
}

/**
 * Logout from admin
 */
function logoutFromAdmin() {
    localStorage.removeItem('avalmeos_token');
    localStorage.removeItem('avalmeos_user');
    window.location.reload();
}

/**
 * Toggle admin mobile menu
 */
function toggleAdminMenu() {
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('admin-sidebar-overlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('hidden');
        // Prevent body scroll when menu is open
        document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    }
}

/**
 * Close admin mobile menu
 */
function closeAdminMenu() {
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('admin-sidebar-overlay');
    if (sidebar && overlay) {
        sidebar.classList.remove('open');
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// ============================================================================
// TAB FUNCTIONS
// These must be defined BEFORE components load because onclick handlers reference them
// ============================================================================

/**
 * Show admin tab
 */
function showAdminTab(tabName) {
    console.log('showAdminTab called:', tabName);
    
    // Hide all tabs using inline styles
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Show selected tab using inline styles
    const selectedTab = document.getElementById('admin-' + tabName + '-tab');
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }
    
    // Update sidebar button states
    document.querySelectorAll('#admin-sidebar button').forEach(btn => {
        btn.classList.remove('bg-[#1a4d41]', 'text-white');
        btn.classList.add('hover:bg-gray-100', 'text-gray-600');
    });
    
    const activeBtn = document.getElementById('tab-' + tabName);
    if (activeBtn) {
        activeBtn.classList.add('bg-[#1a4d41]', 'text-white');
        activeBtn.classList.remove('hover:bg-gray-100', 'text-gray-600');
    }
    
    // Load tab-specific data
    loadTabData(tabName);
}

/**
 * Check if we're in offline mode
 */
function isOfflineMode() {
    const token = localStorage.getItem('avalmeos_token');
    return token && token.startsWith('local-');
}

/**
 * Load tab-specific data
 */
async function loadTabData(tabName) {
    console.log('[Admin] Loading tab:', tabName, 'Offline mode:', isOfflineMode());
    
    switch (tabName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'bookings':
            loadBookings();
            break;
        case 'destinations':
            loadDestinations();
            break;
        case 'activities':
            loadActivities();
            break;
        case 'packages':
            loadPackages();
            break;
        case 'users':
            loadUsers();
            break;
        case 'inquiries':
            loadInquiries();
            break;
        case 'analytics':
            loadAnalytics();
            break;
    }
}

/**
 * Helper function for status badge colors
 */
function getStatusClass(status) {
    const statusClasses = {
        'pending': 'bg-yellow-100 text-yellow-700',
        'confirmed': 'bg-green-100 text-green-700',
        'completed': 'bg-blue-100 text-blue-700',
        'cancelled': 'bg-red-100 text-red-700',
        'active': 'bg-green-100 text-green-700',
        'inactive': 'bg-gray-100 text-gray-700'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-700';
}

// ============================================================================
// MODAL FUNCTIONS
// These must be defined before components load
// ============================================================================

// Booking Modal
function closeBookingModal() {
    const modal = document.getElementById('booking-details-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Destination Modal
function showDestinationModal() {
    const modal = document.getElementById('destination-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.getElementById('destination-modal-title').textContent = 'Add Destination';
        document.getElementById('destination-form').reset();
        document.getElementById('destination-id').value = '';
    }
}

function closeDestinationModal() {
    const modal = document.getElementById('destination-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function saveDestination(event) {
    event.preventDefault();
    console.log('Saving destination...');
    
    const form = document.getElementById('destination-form');
    if (!form) {
        console.error('Destination form not found');
        return;
    }
    
    // Get form data
    const formData = new FormData(form);
    const name = formData.get('name') || document.getElementById('destination-name')?.value;
    
    // Auto-generate slug if empty or make it valid
    let slug = formData.get('slug') || document.getElementById('destination-slug')?.value;
    if (!slug || slug.trim() === '') {
        slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    } else {
        // Ensure slug is lowercase and only contains letters, numbers, and hyphens
        slug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    // Get location and region
    const location = formData.get('location') || document.getElementById('destination-location')?.value;
    const region = formData.get('region') || document.getElementById('destination-region')?.value;
    
    // Validate required fields
    if (!name || !slug || !location || !region) {
        alert('Please fill in all required fields: Name, Slug, Location, and Region');
        return;
    }
    
    const destinationData = {
        name: name,
        slug: slug,
        description: formData.get('description') || document.getElementById('destination-description')?.value || '',
        short_description: formData.get('short_description') || document.getElementById('destination-short-description')?.value || '',
        location: location,
        region: region,
        country: 'Philippines',
        hero_image: formData.get('hero_image') || document.getElementById('destination-image')?.value || 'Picture/default-destination.jpg',
        is_featured: document.getElementById('destination-featured')?.checked || false,
        is_active: true
    };
    
    console.log('Sending destination data:', destinationData);
    
    // Get editing ID if available
    const editingId = document.getElementById('destination-id')?.value;
    
    // Use AdminApiService to save
    if (typeof AdminApiService !== 'undefined') {
        const api = new AdminApiService();
        
        const savePromise = editingId 
            ? api.updateDestination(editingId, destinationData)
            : api.createDestination(destinationData);
        
        savePromise.then(result => {
            console.log('Destination saved successfully:', result);
            alert('Destination saved successfully!');
            closeDestinationModal();
            // Notify other tabs about the change
            if (typeof notifyDataChange === 'function') {
                notifyDataChange('destinations');
            }
            // Refresh destinations list if available
            if (typeof loadDestinations === 'function') {
                loadDestinations();
            }
        }).catch(error => {
            console.error('Error saving destination:', error);
            alert('Error saving destination: ' + error.message);
        });
    } else {
        // Fallback if AdminApiService not available
        alert('Destination saved (placeholder mode)');
        closeDestinationModal();
    }
}

// Activity Modal
function showActivityModal() {
    const modal = document.getElementById('activity-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.getElementById('activity-modal-title').textContent = 'Add Activity';
        document.getElementById('activity-form').reset();
        document.getElementById('activity-id').value = '';
    }
}

function closeActivityModal() {
    const modal = document.getElementById('activity-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function saveActivity(event) {
    event.preventDefault();
    console.log('Saving activity...');
    
    const form = document.getElementById('activity-form');
    if (!form) {
        console.error('Activity form not found');
        return;
    }
    
    // Get form data
    const formData = new FormData(form);
    const name = formData.get('name') || document.getElementById('activity-name')?.value;
    
    // Auto-generate slug if empty or make it valid
    let slug = formData.get('slug') || document.getElementById('activity-slug')?.value;
    if (!slug || slug.trim() === '') {
        slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    } else {
        slug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    const destination_id = formData.get('destination_id') || document.getElementById('activity-destination')?.value;
    const activity_type = formData.get('activity_type') || document.getElementById('activity-type')?.value;
    
    // Validate required fields
    if (!name || !slug || !destination_id || !activity_type) {
        alert('Please fill in all required fields: Name, Slug, Destination, and Activity Type');
        return;
    }
    
    const activityData = {
        name: name,
        slug: slug,
        destination_id: destination_id,
        description: formData.get('description') || document.getElementById('activity-description')?.value || '',
        short_description: formData.get('short_description') || document.getElementById('activity-short-description')?.value || '',
        activity_type: activity_type,
        duration: formData.get('duration') || document.getElementById('activity-duration')?.value || '',
        min_participants: parseInt(formData.get('min_participants') || document.getElementById('activity-min')?.value) || 1,
        max_participants: parseInt(formData.get('max_participants') || document.getElementById('activity-max')?.value) || 10,
        price: parseFloat(formData.get('price') || document.getElementById('activity-price')?.value) || 0,
        image_url: formData.get('image_url') || document.getElementById('activity-image')?.value || 'Picture/default-activity.jpg',
        is_featured: document.getElementById('activity-featured')?.checked || false,
        is_active: true
    };
    
    console.log('Sending activity data:', activityData);
    
    // Get editing ID if available
    const editingId = document.getElementById('activity-id')?.value;
    
    // Use AdminApiService to save
    if (typeof AdminApiService !== 'undefined') {
        const api = new AdminApiService();
        
        const savePromise = editingId 
            ? api.updateActivity(editingId, activityData)
            : api.createActivity(activityData);
        
        savePromise.then(result => {
            console.log('Activity saved successfully:', result);
            alert('Activity saved successfully!');
            closeActivityModal();
            // Notify other tabs about the change
            if (typeof notifyDataChange === 'function') {
                notifyDataChange('activities');
            }
            // Refresh activities list if available
            if (typeof loadActivities === 'function') {
                loadActivities();
            }
        }).catch(error => {
            console.error('Error saving activity:', error);
            alert('Error saving activity: ' + error.message);
        });
    } else {
        // Fallback if AdminApiService not available
        alert('Activity saved (placeholder mode)');
        closeActivityModal();
    }
}

// Package Modal
function showPackageModal() {
    const modal = document.getElementById('package-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.getElementById('package-modal-title').textContent = 'Add Package';
        document.getElementById('package-form').reset();
        document.getElementById('package-id').value = '';
    }
}

function closePackageModal() {
    const modal = document.getElementById('package-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function savePackage(event) {
    event.preventDefault();
    console.log('Saving package...');
    
    const form = document.getElementById('package-form');
    if (!form) {
        console.error('Package form not found');
        return;
    }
    
    // Get form data
    const formData = new FormData(form);
    const name = formData.get('name') || document.getElementById('package-name')?.value;
    
    // Auto-generate slug if empty or make it valid
    let slug = formData.get('slug') || document.getElementById('package-slug')?.value;
    if (!slug || slug.trim() === '') {
        slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    } else {
        slug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    const destination_id = formData.get('destination_id') || document.getElementById('package-destination')?.value;
    
    // Validate required fields
    if (!name || !slug || !destination_id) {
        alert('Please fill in all required fields: Name, Slug, and Destination');
        return;
    }
    
    const packageData = {
        name: name,
        slug: slug,
        destination_id: destination_id || null,
        short_description: formData.get('short_description') || document.getElementById('package-short-description')?.value || '',
        description: formData.get('description') || document.getElementById('package-description')?.value || '',
        price: parseFloat(formData.get('price') || document.getElementById('package-price')?.value) || 0,
        duration_days: parseInt(formData.get('duration_days') || document.getElementById('package-duration')?.value) || 1,
        min_participants: parseInt(formData.get('min_participants') || document.getElementById('package-min')?.value) || 1,
        max_participants: parseInt(formData.get('max_participants') || document.getElementById('package-max')?.value) || 10,
        image_url: formData.get('image_url') || document.getElementById('package-image')?.value || 'Picture/default-package.jpg',
        activities: (formData.get('activities') || document.getElementById('package-activities')?.value || '').split('\n').map(a => a.trim()).filter(a => a),
        inclusions: (formData.get('inclusions') || document.getElementById('package-inclusions')?.value || '').split(',').map(i => i.trim()).filter(i => i),
        exclusions: (formData.get('exclusions') || document.getElementById('package-exclusions')?.value || '').split(',').map(e => e.trim()).filter(e => e),
        is_featured: document.getElementById('package-featured')?.checked || false,
        is_active: document.getElementById('package-status')?.checked || true
    };
    
    console.log('Sending package data:', packageData);
    
    // Get editing ID if available
    const editingId = document.getElementById('package-id')?.value;
    
    // Use AdminApiService to save
    if (typeof AdminApiService !== 'undefined') {
        const api = new AdminApiService();
        
        const savePromise = editingId 
            ? api.updatePackage(editingId, packageData)
            : api.createPackage(packageData);
        
        savePromise.then(result => {
            console.log('Package saved successfully:', result);
            alert('Package saved successfully!');
            closePackageModal();
            // Notify other tabs about the change
            if (typeof notifyDataChange === 'function') {
                notifyDataChange('packages');
            }
            // Refresh packages list if available
            if (typeof loadPackages === 'function') {
                loadPackages();
            }
        }).catch(error => {
            console.error('Error saving package:', error);
            alert('Error saving package: ' + error.message);
        });
    } else {
        // Fallback if AdminApiService not available
        alert('Package saved (placeholder mode)');
        closePackageModal();
    }
}

// Delete Package Modal
function showDeletePackageModal(packageId) {
    const modal = document.getElementById('delete-package-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeDeletePackageModal() {
    const modal = document.getElementById('delete-package-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// ============================================================================
// TAB DATA LOADING FUNCTIONS
// Placeholder implementations that delegate to admin.js if available
// ============================================================================

async function loadDashboard() {
    console.log('Loading dashboard...');
    if (typeof window.loadDashboard === 'function' && window.loadDashboard !== loadDashboard) {
        window.loadDashboard();
    } else {
        const dashboard = document.getElementById('admin-dashboard');
        if (dashboard) {
            dashboard.innerHTML = `
                <div class="flex items-center justify-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d41]"></div>
                </div>
            `;
        }
    }
}

async function loadBookings() {
    console.log('Loading bookings...');
    if (typeof window.loadBookings === 'function' && window.loadBookings !== loadBookings) {
        window.loadBookings();
    }
}

async function loadDestinations() {
    console.log('Loading destinations...');
    if (typeof window.loadDestinations === 'function' && window.loadDestinations !== loadDestinations) {
        window.loadDestinations();
    }
}

async function loadActivities() {
    console.log('Loading activities...');
    if (typeof window.loadActivities === 'function' && window.loadActivities !== loadActivities) {
        window.loadActivities();
    }
}

async function loadPackages() {
    console.log('Loading packages...');
    const packagesTab = document.getElementById('admin-packages-tab');
    if (!packagesTab) return;
    
    packagesTab.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4 border-b flex justify-between items-center">
                <h3 class="font-bold text-[#1a4d41]">Packages</h3>
                <button onclick="addPackage()" class="px-4 py-2 bg-[#1a4d41] text-white rounded-lg text-sm hover:bg-opacity-90">
                    + Add Package
                </button>
            </div>
            <div class="p-8 text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d41] mx-auto"></div>
                <p class="mt-4 text-gray-500">Loading packages...</p>
            </div>
        </div>
    `;
    
    try {
        if (typeof AdminApiService !== 'undefined') {
            const api = new AdminApiService();
            const response = await api.getPackages();
            
            if (response.success && response.data) {
                renderPackages(response.data);
            } else {
                throw new Error(response.message || 'Failed to load packages');
            }
        } else {
            throw new Error('AdminApiService not available');
        }
    } catch (error) {
        console.error('Error loading packages:', error);
        packagesTab.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-4 border-b">
                    <h3 class="font-bold text-[#1a4d41]">Packages</h3>
                </div>
                <div class="p-8 text-center text-red-500">
                    <p>Error loading packages: ${error.message}</p>
                    <button onclick="loadPackages()" class="mt-4 px-4 py-2 bg-[#1a4d41] text-white rounded-lg hover:bg-[#153d32]">
                        Retry
                    </button>
                </div>
            </div>
        `;
    }
}

function renderPackages(packages) {
    const packagesTab = document.getElementById('admin-packages-tab');
    if (!packagesTab) return;
    
    if (!packages || packages.length === 0) {
        packagesTab.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-4 border-b flex justify-between items-center">
                    <h3 class="font-bold text-[#1a4d41]">Packages</h3>
                    <button onclick="addPackage()" class="px-4 py-2 bg-[#1a4d41] text-white rounded-lg text-sm hover:bg-opacity-90">
                        + Add Package
                    </button>
                </div>
                <div class="p-8 text-center text-gray-500">
                    No packages found. Add your first package!
                </div>
            </div>
        `;
        return;
    }
    
    const packagesHtml = packages.map(pkg => `
        <div class="border-b border-gray-50 hover:bg-gray-50">
            <div class="p-4 flex justify-between items-center">
                <div class="flex items-center gap-4">
                    <div class="h-12 w-12 rounded-lg bg-gradient-to-br from-[#1a4d41] to-[#2d6a5a] flex items-center justify-center text-white font-bold">
                        ${pkg.name ? pkg.name.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div>
                        <h4 class="font-medium text-[#1a4d41]">${pkg.name}</h4>
                        <p class="text-sm text-gray-500">${pkg.destination?.name || 'No destination'} • ${pkg.package_type || 'Standard'}</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <span class="font-bold text-orange-500">₱${pkg.price?.toLocaleString() || 0}</span>
                    <button onclick="editPackage('${pkg.id}')" class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">Edit</button>
                    <button onclick="deletePackage('${pkg.id}')" class="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
    
    packagesTab.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4 border-b flex justify-between items-center">
                <h3 class="font-bold text-[#1a4d41]">Packages</h3>
                <span class="text-sm text-gray-500">${packages.length} packages</span>
            </div>
            <div class="divide-y divide-gray-50">
                ${packagesHtml}
            </div>
        </div>
    `;
}

async function loadUsers() {
    console.log('Loading users...');
    const usersTab = document.getElementById('admin-users-tab');
    if (!usersTab) return;
    
    // Show loading state
    usersTab.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4 border-b flex justify-between items-center">
                <h3 class="font-bold text-[#1a4d41]">Users</h3>
                <span class="text-sm text-gray-500">Loading...</span>
            </div>
            <div class="p-8 text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d41] mx-auto"></div>
            </div>
        </div>
    `;
    
    try {
        if (typeof AdminApiService !== 'undefined') {
            const api = new AdminApiService();
            const response = await api.getUsers();
            
            if (response.success && response.data) {
                renderUsers(usersTab, response.data);
            } else {
                throw new Error(response.message || 'Failed to load users');
            }
        } else {
            throw new Error('AdminApiService not available');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        usersTab.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-4 border-b">
                    <h3 class="font-bold text-[#1a4d41]">Users</h3>
                </div>
                <div class="p-8 text-center text-red-500">
                    <p>Error loading users: ${error.message}</p>
                    <button onclick="loadUsers()" class="mt-4 px-4 py-2 bg-[#1a4d41] text-white rounded-lg hover:bg-[#153d32]">
                        Retry
                    </button>
                </div>
            </div>
        `;
    }
}

function renderUsers(container, users) {
    if (!users || users.length === 0) {
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-4 border-b">
                    <h3 class="font-bold text-[#1a4d41]">Users</h3>
                </div>
                <div class="p-8 text-center text-gray-500">
                    No users found.
                </div>
            </div>
        `;
        return;
    }
    
    const usersHtml = users.map(user => `
        <tr class="border-b border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-3">
                <div class="flex items-center">
                    <div class="h-10 w-10 rounded-full bg-[#1a4d41] flex items-center justify-center text-white font-bold">
                        ${user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div class="ml-3">
                        <p class="font-medium text-[#1a4d41]">${user.name || user.email}</p>
                        <p class="text-sm text-gray-500">${user.email}</p>
                    </div>
                </div>
            </td>
            <td class="px-4 py-3">
                <span class="px-2 py-1 text-xs font-medium rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">
                    ${user.role}
                </span>
            </td>
            <td class="px-4 py-3">
                <span class="px-2 py-1 text-xs font-medium rounded-full ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">
                    ${user.is_active ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500">
                ${new Date(user.created_at).toLocaleDateString()}
            </td>
            <td class="px-4 py-3">
                <button class="text-[#1a4d41] hover:text-[#153d32] font-medium text-sm">
                    Edit
                </button>
            </td>
        </tr>
    `).join('');
    
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4 border-b flex justify-between items-center">
                <h3 class="font-bold text-[#1a4d41]">Users</h3>
                <span class="text-sm text-gray-500">${users.length} users</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        ${usersHtml}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

async function loadInquiries() {
    console.log('Loading inquiries...');
    const inquiriesTab = document.getElementById('admin-inquiries-tab');
    if (!inquiriesTab) {
        console.warn('[Inquiries] Tab element not found');
        return;
    }
    
    // Show loading state
    inquiriesTab.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4 border-b flex justify-between items-center">
                <h3 class="font-bold text-[#1a4d41]">Customer Inquiries</h3>
                <span class="text-sm text-gray-500">Loading...</span>
            </div>
            <div class="p-8 text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d41] mx-auto"></div>
            </div>
        </div>
    `;
    
    try {
        console.log('[Inquiries] Checking AdminApiService...');
        console.log('[Inquiries] AdminApiService exists:', typeof AdminApiService !== 'undefined');
        
        if (typeof AdminApiService !== 'undefined') {
            const api = new AdminApiService();
            console.log('[Inquiries] Calling getInquiries()...');
            const response = await api.getInquiries();
            console.log('[Inquiries] Response:', response);
            
            if (response.success && response.data) {
                console.log('[Inquiries] Rendering', response.data.length, 'inquiries');
                renderInquiries(inquiriesTab, response.data);
            } else {
                throw new Error(response.message || 'Failed to load inquiries');
            }
        } else {
            throw new Error('AdminApiService not available');
        }
    } catch (error) {
        console.error('[Inquiries] Error:', error);
        inquiriesTab.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-4 border-b">
                    <h3 class="font-bold text-[#1a4d41]">Customer Inquiries</h3>
                </div>
                <div class="p-8 text-center text-red-500">
                    <p>Error loading inquiries: ${error.message}</p>
                    <p class="text-sm text-gray-500 mt-2">Make sure backend is running and you're logged in as admin</p>
                    <button onclick="loadInquiries()" class="mt-4 px-4 py-2 bg-[#1a4d41] text-white rounded-lg hover:bg-[#153d32]">
                        Retry
                    </button>
                </div>
            </div>
        `;
    }
}

function renderInquiries(container, inquiries) {
    if (!inquiries || inquiries.length === 0) {
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-4 border-b">
                    <h3 class="font-bold text-[#1a4d41]">Customer Inquiries</h3>
                </div>
                <div class="p-8 text-center text-gray-500">
                    No inquiries found.
                </div>
            </div>
        `;
        return;
    }
    
    const inquiriesHtml = inquiries.map(inquiry => `
        <div class="border-b border-gray-50 p-4 hover:bg-gray-50">
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-medium text-[#1a4d41]">${inquiry.subject}</h4>
                    <p class="text-sm text-gray-600 mt-1">${inquiry.message}</p>
                    <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>${inquiry.name}</span>
                        <span>${inquiry.email}</span>
                        <span>${new Date(inquiry.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="flex flex-col items-end gap-2">
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${
                        inquiry.status === 'new' ? 'bg-yellow-100 text-yellow-700' :
                        inquiry.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        inquiry.status === 'responded' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                    }">
                        ${inquiry.status}
                    </span>
                    <button 
                        onclick="openInquiryReplyModal('${inquiry.id}')"
                        data-inquiry-id="${inquiry.id}"
                        class="text-[#1a4d41] hover:text-[#153d32] font-medium text-sm inquiry-reply-btn"
                    >
                        Reply
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4 border-b flex justify-between items-center">
                <h3 class="font-bold text-[#1a4d41]">Customer Inquiries</h3>
                <span class="text-sm text-gray-500">${inquiries.length} inquiries</span>
            </div>
            <div class="divide-y divide-gray-50">
                ${inquiriesHtml}
            </div>
        </div>
    `;
    
    // Add click handlers for reply buttons
    container.querySelectorAll('.inquiry-reply-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const inquiryId = btn.dataset.inquiryId;
            const inquiry = inquiries.find(i => i.id === inquiryId);
            if (inquiry) {
                openInquiryReplyModal(inquiry);
            }
        });
    });
}

// ============================================================================
// INQUIRY REPLY MODAL FUNCTIONS
// ============================================================================

let currentInquiryReplyId = null;

function openInquiryReplyModal(inquiry) {
    currentInquiryReplyId = inquiry.id;
    
    document.getElementById('inquiry-reply-to').textContent = `To: ${inquiry.name} (${inquiry.email})`;
    document.getElementById('inquiry-original-message').textContent = inquiry.message || inquiry.message_text || 'No message';
    document.getElementById('inquiry-reply-status').value = inquiry.status === 'new' ? 'in_progress' : inquiry.status;
    document.getElementById('inquiry-reply-message').value = inquiry.response || '';
    
    // Reset status message
    const statusMsg = document.getElementById('inquiry-reply-status-message');
    statusMsg.classList.add('hidden');
    statusMsg.className = 'hidden p-3 rounded-lg text-sm';
    
    // Show modal
    document.getElementById('inquiry-reply-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeInquiryReplyModal() {
    document.getElementById('inquiry-reply-modal').classList.add('hidden');
    document.body.style.overflow = '';
    currentInquiryReplyId = null;
}

async function submitInquiryReply(event) {
    event.preventDefault();
    
    const form = event.target;
    const statusMsg = document.getElementById('inquiry-reply-status-message');
    const submitBtn = document.getElementById('inquiry-reply-submit');
    
    const status = document.getElementById('inquiry-reply-status').value;
    const response = document.getElementById('inquiry-reply-message').value.trim();
    const sendReplyEmail = document.getElementById('inquiry-send-email').checked;
    
    if (!response) {
        showReplyStatus('Please enter a reply message', 'error');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending...</span>';
    
    try {
        console.log('[InquiryReply] Submitting reply for inquiry:', currentInquiryReplyId);
        
        const token = localStorage.getItem('avalmeos_token');
        if (!token) {
            throw new Error('Not authenticated. Please log in again.');
        }
        
        const responseData = await fetch(`/api/admin/inquiries/${currentInquiryReplyId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                status: status,
                response: response,
                sendReplyEmail: sendReplyEmail
            })
        });
        
        const result = await responseData.json();
        
        if (result.success) {
            console.log('[InquiryReply] Reply sent successfully');
            showReplyStatus('Reply sent successfully!', 'success');
            setTimeout(() => {
                closeInquiryReplyModal();
                loadInquiries();
            }, 1000);
        } else {
            throw new Error(result.message || 'Failed to send reply');
        }
    } catch (error) {
        console.error('[InquiryReply] Error:', error);
        showReplyStatus(error.message || 'Error sending reply', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Send Reply</span>';
    }
}

function showReplyStatus(message, type) {
    const statusMsg = document.getElementById('inquiry-reply-status-message');
    statusMsg.textContent = message;
    statusMsg.classList.remove('hidden');
    statusMsg.className = `p-3 rounded-lg text-sm ${type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`;
}

// Expose functions globally
window.openInquiryReplyModal = openInquiryReplyModal;
window.closeInquiryReplyModal = closeInquiryReplyModal;
window.submitInquiryReply = submitInquiryReply;

async function loadAnalytics() {
    console.log('Loading analytics...');
    // Analytics content is now embedded in the component
}

// ============================================================================
// CRUD FUNCTIONS FOR DESTINATIONS AND ACTIVITIES
// ============================================================================

function editDestination(destinationName) {
    console.log('Editing destination:', destinationName);
    showDestinationModal();
    // Populate form with destination data if editing
    const destinationInput = document.getElementById('destination-city');
    if (destinationInput) {
        destinationInput.value = destinationName;
        document.getElementById('destination-modal-title').textContent = 'Edit Destination';
    }
}

function deleteDestination(destinationName) {
    if (confirm('Are you sure you want to delete "' + destinationName + '"?')) {
        console.log('Deleting destination:', destinationName);
        alert('Destination deleted (placeholder)');
    }
}

function editActivity(activityId) {
    console.log('Editing activity:', activityId);
    showActivityModal();
}

function deleteActivity(activityId) {
    if (confirm('Are you sure you want to delete this activity?')) {
        console.log('Deleting activity:', activityId);
        alert('Activity deleted (placeholder)');
    }
}

async function editPackage(packageId) {
    console.log('Editing package:', packageId);
    
    // Show modal in edit mode
    showPackageModal();
    document.getElementById('package-modal-title').textContent = 'Edit Package';
    
    // Set hidden ID field
    document.getElementById('package-id').value = packageId;
    
    try {
        // Fetch package data from API or localStorage
        let pkg = null;
        
        // Try API first
        try {
            const response = await window.adminApi.getPackageById(packageId);
            if (response.success && response.data) {
                pkg = response.data;
            }
        } catch (e) {
            console.log('API not available, checking localStorage');
        }
        
        // Fallback to localStorage
        if (!pkg) {
            const packages = JSON.parse(localStorage.getItem('admin_packages') || '[]');
            pkg = packages.find(p => p.id == packageId);
        }
        
        if (!pkg) {
            console.error('Package not found:', packageId);
            alert('Package not found');
            return;
        }
        
        // Populate form fields
        document.getElementById('package-id').value = pkg.id || '';
        document.getElementById('package-name').value = pkg.name || '';
        document.getElementById('package-slug').value = pkg.slug || '';
        document.getElementById('package-short-description').value = pkg.short_description || '';
        document.getElementById('package-description').value = pkg.description || '';
        document.getElementById('package-price').value = pkg.price || '';
        document.getElementById('package-duration').value = pkg.duration_days || 3;
        document.getElementById('package-min').value = pkg.min_participants || 1;
        document.getElementById('package-max').value = pkg.max_participants || 10;
        document.getElementById('package-image').value = pkg.image_url || '';
        document.getElementById('package-activities').value = pkg.activities || '';
        document.getElementById('package-inclusions').value = pkg.inclusions || '';
        document.getElementById('package-exclusions').value = pkg.exclusions || '';
        
        // Handle checkboxes
        document.getElementById('package-featured').checked = pkg.is_featured === true || pkg.is_featured === 'true';
        document.getElementById('package-status').checked = pkg.is_active !== false && pkg.is_active !== 'false';
        
        // Set destination dropdown
        const destinationSelect = document.getElementById('package-destination');
        if (destinationSelect) {
            // First populate destinations if not already done
            await populatePackageDestinations();
            
            // Try to match by name, then by ID
            if (pkg.destination_id) {
                destinationSelect.value = pkg.destination_id;
            } else if (pkg.destination) {
                // Find option with matching destination name
                for (let option of destinationSelect.options) {
                    if (option.text.toLowerCase() === pkg.destination.toLowerCase()) {
                        destinationSelect.value = option.value;
                        break;
                    }
                }
            }
        }
        
        console.log('Package form populated:', pkg);
        
    } catch (error) {
        console.error('Error loading package for edit:', error);
        alert('Error loading package data');
    }
}

// Filter and search functions
function filterBookings() {
    console.log('Filtering bookings...');
    const status = document.getElementById('booking-filter-status')?.value || '';
    // Implement filtering logic
}

function exportBookings() {
    console.log('Exporting bookings...');
    alert('Exporting bookings as CSV (placeholder)');
}

function filterPackages() {
    console.log('Filtering packages...');
    // Implement filtering logic
}

function searchPackages() {
    console.log('Searching packages...');
    const search = document.getElementById('package-search')?.value || '';
    // Implement search logic
}

// ============================================================================
// DEPENDENCY ORDER (MUST BE LOADED IN THIS ORDER)
// ============================================================================
// 1. js/admin/components.js           - Component loader
// 2. js/admin/utils/constants.js        - Constants and configuration
// 3. js/admin/services/*.js             - Business logic services
// 4. js/admin/views/*.js               - UI rendering views
// 5. js/admin/controllers/*.js         - Controller coordination
// 6. js/admin/main.js                  - Initialization and backward compatibility
// ============================================================================

/**
 * AdminModule - Main namespace for admin functionality
 */
const AdminModule = {
    version: '1.0.0',
    initialized: false,
    
    /**
     * Initialize the admin module
     */
    init() {
        if (this.initialized) {
            console.warn('AdminModule already initialized');
            return;
        }
        
        console.log('Initializing AdminModule v' + this.version);
        
        // Initialize controllers
        this.initControllers();
        
        // Setup event listeners
        this.setupEventListeners();
        
        this.initialized = true;
        console.log('AdminModule initialized successfully');
    },
    
    /**
     * Initialize all controllers
     */
    initControllers() {
        // Initialize booking controller if on bookings page
        if (typeof AdminBookingController !== 'undefined') {
            AdminBookingController.init();
        }
        
        // Initialize package controller if on packages page
        if (typeof AdminPackageController !== 'undefined') {
            AdminPackageController.init();
        }
    },
    
    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Close modals on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    },
    
    /**
     * Close all open modals
     */
    closeAllModals() {
        const modals = [
            'booking-details-modal',
            'package-modal',
            'delete-package-modal',
            'destination-modal',
            'activity-modal'
        ];
        
        modals.forEach(id => {
            const modal = document.getElementById(id);
            if (modal && !modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
            }
        });
    },
    
    /**
     * Get module status
     */
    getStatus() {
        return {
            version: this.version,
            initialized: this.initialized,
            controllers: {
                booking: typeof AdminBookingController !== 'undefined',
                package: typeof AdminPackageController !== 'undefined'
            },
            services: {
                booking: typeof BookingService !== 'undefined',
                package: typeof PackageService !== 'undefined',
                notification: typeof NotificationService !== 'undefined',
                api: typeof AdminApiService !== 'undefined'
            },
            views: {
                dashboard: typeof DashboardView !== 'undefined',
                packages: typeof PackagesView !== 'undefined'
            }
        };
    }
};

// ============================================================================
// BACKWARD COMPATIBILITY LAYER
// ============================================================================
// Maps old function names to new modular structure for seamless migration

/**
 * Initialize admin functionality
 * Called when DOM is ready
 */
window.AdminInit = function() {
    AdminModule.init();
};

// Backward compatibility: Map legacy function names to new controllers
if (typeof BookingService !== 'undefined') {
    window.getAllBookings = BookingService.getAllBookings.bind(BookingService);
    window.getBookingById = BookingService.getBookingById.bind(BookingService);
    window.saveAllBookings = BookingService.saveAllBookings.bind(BookingService);
    window.updateBookingStatus = BookingService.updateBookingStatus.bind(BookingService);
    window.getBookingStats = BookingService.getBookingStats.bind(BookingService);
}

if (typeof PackageService !== 'undefined') {
    window.getAdminPackages = PackageService.getAllPackages.bind(PackageService);
    window.getPackageById = PackageService.getPackageById.bind(PackageService);
    window.addAdminPackage = PackageService.addPackage.bind(PackageService);
    window.updateAdminPackage = PackageService.updatePackage.bind(PackageService);
    window.deleteAdminPackage = PackageService.deletePackage.bind(PackageService);
    window.getPackageStats = PackageService.getPackageStats.bind(PackageService);
}

if (typeof AdminBookingController !== 'undefined') {
    window.renderAdminDashboard = AdminBookingController.renderDashboard.bind(AdminBookingController);
    window.approveBooking = AdminBookingController.approveBooking.bind(AdminBookingController);
    window.rejectBooking = AdminBookingController.rejectBooking.bind(AdminBookingController);
    window.viewBookingDetails = AdminBookingController.viewBookingDetails.bind(AdminBookingController);
    window.filterBookings = AdminBookingController.filterBookings.bind(AdminBookingController);
    window.exportBookings = AdminBookingController.exportBookings.bind(AdminBookingController);
}

if (typeof AdminPackageController !== 'undefined') {
    window.loadPackages = AdminPackageController.loadPackages.bind(AdminPackageController);
    window.renderPackagesTable = AdminPackageController.renderPackagesTable.bind(AdminPackageController);
    window.filterPackages = AdminPackageController.filterPackages.bind(AdminPackageController);
    window.searchPackages = AdminPackageController.searchPackages.bind(AdminPackageController);
    window.showPackageModal = AdminPackageController.showAddModal.bind(AdminPackageController);
    window.editPackage = AdminPackageController.editPackage.bind(AdminPackageController);
    window.savePackage = AdminPackageController.savePackage.bind(AdminPackageController);
    window.closePackageModal = AdminPackageController.closeModal.bind(AdminPackageController);
    window.showDeletePackageModal = AdminPackageController.showDeleteModal.bind(AdminPackageController);
    window.closeDeletePackageModal = AdminPackageController.closeDeleteModal.bind(AdminPackageController);
}

if (typeof NotificationService !== 'undefined') {
    window.AdminNotificationService = NotificationService;
}

// ============================================================================
// AUTO-INITIALIZATION
// ============================================================================
// Initialize admin when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Admin] DOMContentLoaded fired');
    // Start component initialization
    initAdminComponents();
});

// Export for module usage
window.AdminModule = AdminModule;
window.initAdminComponents = initAdminComponents;
