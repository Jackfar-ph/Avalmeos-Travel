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
    console.log('[Admin] Starting admin component initialization...');
    
    // Check if we're running from file:// protocol (common cause of issues)
    if (window.location.protocol === 'file:') {
        console.error('[Admin] ERROR: Admin panel must be accessed via HTTP server, not file://');
        document.body.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gray-100">
                <div class="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
                    <h1 class="text-2xl font-bold text-red-600 mb-4">Cannot Load Admin Panel</h1>
                    <p class="text-gray-600 mb-4">
                        The admin panel requires a web server to function properly.
                    </p>
                    <p class="text-sm text-gray-500 mb-4">
                        Please start the backend server and access admin.html through:
                        <code class="bg-gray-100 px-2 py-1 rounded">http://localhost:3000/admin.html</code>
                    </p>
                    <button onclick="window.location.href='index.html'" class="px-4 py-2 bg-[#1a4d41] text-white rounded-lg">
                        Go to Home Page
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    try {
        // Load all admin components
        await AdminComponents.loadAll();
        
        // Verify critical components loaded
        const activitiesPlaceholder = document.getElementById('activities-view-placeholder');
        const packagesPlaceholder = document.getElementById('packages-view-placeholder');
        
        if (!activitiesPlaceholder || activitiesPlaceholder.innerHTML.trim() === '') {
            console.error('[Admin] ERROR: Activities view failed to load');
        }
        if (!packagesPlaceholder || packagesPlaceholder.innerHTML.trim() === '') {
            console.error('[Admin] ERROR: Packages view failed to load');
        }
        
        console.log('[Admin] Admin components loaded, initializing module...');
        
        // Initialize the admin module
        AdminModule.init();
        
        // Setup admin login handlers and other UI functions
        setupAdminUI();
        
        console.log('[Admin] Initialization complete - admin panel ready');
    } catch (error) {
        console.error('[Admin] Error initializing admin components:', error);
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
    
    // Destination population functions
    window.populateActivityDestinations = populateActivityDestinations;
    window.populatePackageDestinations = populatePackageDestinations;
    
    // Tab loading functions
    window.loadDashboard = loadDashboard;
    window.loadBookings = loadBookings;
    window.loadDestinations = loadDestinations;
    window.loadActivities = loadActivities;
    window.loadPackages = loadPackages;
    window.loadUsers = loadUsers;
    window.loadInquiries = loadInquiries;
    window.loadAnalytics = loadAnalytics;
    window.initChatView = initChatView;
    window.loadChatConversations = loadChatConversations;
    window.selectChatConversation = selectChatConversation;
    window.sendChatReply = sendChatReply;
    window.filterChatConversations = filterChatConversations;
    window.updateChatStatus = updateChatStatus;
    
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
        
        // Populate destination dropdown
        populateActivityDestinations();
    }
}

/**
 * Populate destination dropdown for Activity modal
 */
async function populateActivityDestinations() {
    const select = document.getElementById('activity-destination');
    if (!select) return;
    
    console.log('[Admin] Populating activity destinations...');
    
    // Default destinations as fallback
    const defaultDestinations = ['Cebu City', 'Manila', 'Baguio', 'Davao City', 'Puerto Princesa', 'Iloilo', 'Palawan', 'Boracay', 'Siargao', 'El Nido'];
    
    try {
        if (typeof AdminApiService !== 'undefined') {
            const api = new AdminApiService();
            const response = await api.getDestinations();
            
            if (response.success && response.data && response.data.length > 0) {
                // Use API destinations
                const destinations = response.data.map(d => d.name).sort();
                select.innerHTML = `
                    <option value="">Select destination</option>
                    ${destinations.map(d => `<option value="${d}">${d}</option>`).join('')}
                `;
                console.log('[Admin] Loaded', destinations.length, 'destinations from API');
            } else {
                // Fall back to default destinations
                select.innerHTML = `
                    <option value="">Select destination</option>
                    ${defaultDestinations.map(d => `<option value="${d}">${d}</option>`).join('')}
                `;
                console.log('[Admin] Using default destinations');
            }
        } else {
            throw new Error('AdminApiService not available');
        }
    } catch (error) {
        console.warn('[Admin] Failed to load destinations from API, using defaults:', error.message);
        // Fall back to default destinations
        select.innerHTML = `
            <option value="">Select destination</option>
            ${defaultDestinations.map(d => `<option value="${d}">${d}</option>`).join('')}
        `;
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
    
    const destinationName = formData.get('destination_id') || document.getElementById('activity-destination')?.value;
    const activity_type = formData.get('activity_type') || document.getElementById('activity-type')?.value;
    
    // Validate required fields
    if (!name || !slug || !activity_type) {
        alert('Please fill in all required fields: Name, Slug, and Activity Type');
        return;
    }
    
    // Get image URL and validate
    let imageUrl = formData.get('image_url') || document.getElementById('activity-image')?.value || '';
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('Picture/')) {
        imageUrl = ''; // Clear invalid URL
    }
    
    const activityData = {
        name: name,
        slug: slug,
        destination_id: null, // Optional UUID
        destination_name: destinationName || null,
        description: formData.get('description') || document.getElementById('activity-description')?.value || '',
        short_description: formData.get('short_description') || document.getElementById('activity-short-description')?.value || '',
        activity_type: activity_type,
        duration: formData.get('duration') || document.getElementById('activity-duration')?.value || '',
        min_participants: parseInt(formData.get('min_participants') || document.getElementById('activity-min')?.value) || 1,
        max_participants: parseInt(formData.get('max_participants') || document.getElementById('activity-max')?.value) || 10,
        price: parseFloat(formData.get('price') || document.getElementById('activity-price')?.value) || 0,
        image_url: imageUrl || null,
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
            // Try to extract validation error details
            let errorMessage = error.message;
            if (error.response?.data?.errors) {
                const validationErrors = error.response.data.errors;
                const errorDetails = validationErrors.map(e => `${e.field}: ${e.message}`).join('\n');
                errorMessage = `Validation failed:\n${errorDetails}`;
            }
            alert('Error saving activity: ' + errorMessage);
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
        
        // Populate destination dropdown
        populatePackageDestinations();
    }
}

/**
 * Populate destination dropdown for Package modal
 */
async function populatePackageDestinations() {
    const select = document.getElementById('package-destination');
    if (!select) return;
    
    console.log('[Admin] Populating package destinations...');
    
    // Default destinations as fallback
    const defaultDestinations = ['Cebu City', 'Manila', 'Baguio', 'Davao City', 'Puerto Princesa', 'Iloilo', 'Palawan', 'Boracay', 'Siargao', 'El Nido'];
    
    try {
        if (typeof AdminApiService !== 'undefined') {
            const api = new AdminApiService();
            const response = await api.getDestinations();
            
            if (response.success && response.data && response.data.length > 0) {
                // Use API destinations
                const destinations = response.data.map(d => d.name).sort();
                select.innerHTML = `
                    <option value="">Select destination</option>
                    ${destinations.map(d => `<option value="${d}">${d}</option>`).join('')}
                `;
                console.log('[Admin] Loaded', destinations.length, 'destinations from API');
            } else {
                // Fall back to default destinations
                select.innerHTML = `
                    <option value="">Select destination</option>
                    ${defaultDestinations.map(d => `<option value="${d}">${d}</option>`).join('')}
                `;
                console.log('[Admin] Using default destinations');
            }
        } else {
            throw new Error('AdminApiService not available');
        }
    } catch (error) {
        console.warn('[Admin] Failed to load destinations from API, using defaults:', error.message);
        // Fall back to default destinations
        select.innerHTML = `
            <option value="">Select destination</option>
            ${defaultDestinations.map(d => `<option value="${d}">${d}</option>`).join('')}
        `;
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
    
    // Validate required fields
    if (!name || !slug) {
        alert('Please fill in all required fields: Name and Slug');
        return;
    }
    
    // Get activities as array
    const activitiesText = formData.get('activities') || document.getElementById('package-activities')?.value || '';
    const activities = activitiesText.split('\n').map(a => a.trim()).filter(a => a);
    
    // Get inclusions as array
    const inclusionsText = formData.get('inclusions') || document.getElementById('package-inclusions')?.value || '';
    const inclusions = inclusionsText.split(',').map(i => i.trim()).filter(i => i);
    
    // Get exclusions as array
    const exclusionsText = formData.get('exclusions') || document.getElementById('package-exclusions')?.value || '';
    const exclusions = exclusionsText.split(',').map(e => e.trim()).filter(e => e);
    
    // Get image URL and validate
    let imageUrl = formData.get('image_url') || document.getElementById('package-image')?.value || '';
    // If no image provided, use empty string (optional field)
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('Picture/')) {
        imageUrl = ''; // Clear invalid URL
    }
    
    const packageData = {
        name: name,
        slug: slug,
        destination_id: null, // Optional - not using UUID for now
        short_description: formData.get('short_description') || document.getElementById('package-short-description')?.value || '',
        description: formData.get('description') || document.getElementById('package-description')?.value || '',
        price: parseFloat(formData.get('price') || document.getElementById('package-price')?.value) || 0,
        duration: parseInt(formData.get('duration_days') || document.getElementById('package-duration')?.value) || 1,
        package_type: 'day-tour', // Default package type (valid value per validation)
        hero_image: imageUrl || null,
        activities: activities.length > 0 ? activities : [],
        inclusions: inclusions.length > 0 ? inclusions : [],
        exclusions: exclusions.length > 0 ? exclusions : [],
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
            // Try to extract validation error details
            let errorMessage = error.message;
            if (error.response?.data?.errors) {
                const validationErrors = error.response.data.errors;
                const errorDetails = validationErrors.map(e => `${e.field}: ${e.message}`).join('\n');
                errorMessage = `Validation failed:\n${errorDetails}`;
            }
            alert('Error saving package: ' + errorMessage);
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
    console.log('Loading dashboard - delegating to admin-tabs.js...');
    // This function is now just a wrapper that delegates to the real implementation in admin-tabs.js
    // The real loadDashboard is defined in admin-tabs.js and exposed via window there
    if (typeof window.loadDashboard === 'function') {
        // Call the window.loadDashboard which should be the one from admin-tabs.js
        await window.loadDashboard();
    } else {
        // Fallback - try to call the function directly from admin-tabs context
        console.error('[Admin] loadDashboard not available - admin-tabs.js may not be loaded');
        const dashboard = document.getElementById('admin-dashboard-tab');
        if (dashboard) {
            dashboard.innerHTML = '<div class="p-4 text-red-500">Error loading dashboard</div>';
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
    console.log('[Admin] Loading packages...');
    const packagesTab = document.getElementById('admin-packages-tab');
    if (!packagesTab) {
        console.error('[Admin] ERROR: admin-packages-tab not found in DOM');
        return;
    }
    
    console.log('[Admin] Rendering packages loading state...');
    
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
        console.error('[Admin] Error loading packages:', error);
        packagesTab.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-4 border-b flex justify-between items-center">
                    <h3 class="font-bold text-[#1a4d41]">Packages</h3>
                    <button onclick="addPackage()" class="px-4 py-2 bg-[#1a4d41] text-white rounded-lg text-sm hover:bg-opacity-90">
                        + Add Package
                    </button>
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
    if (!packagesTab) {
        console.error('[Admin] ERROR: admin-packages-tab not found in renderPackages');
        return;
    }
    
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
                <div class="flex items-center gap-4">
                    <span class="text-sm text-gray-500">${packages.length} packages</span>
                    <button onclick="addPackage()" class="px-4 py-2 bg-[#1a4d41] text-white rounded-lg text-sm hover:bg-opacity-90">
                        + Add Package
                    </button>
                </div>
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
                <button 
                    onclick="editUser('${user.id}')" 
                    class="text-[#1a4d41] hover:text-[#153d32] font-medium text-sm mr-2"
                >
                    Edit
                </button>
                <button 
                    onclick="toggleUserStatus('${user.id}', ${user.is_active})" 
                    class="px-2 py-1 text-xs rounded ${user.is_active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}"
                >
                    ${user.is_active ? 'Suspend' : 'Activate'}
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

// ============================================================================
// USER EDIT & STATUS FUNCTIONS
// ============================================================================

// Store current user being edited
let currentEditUserId = null;

// Open user edit modal
window.editUser = function(userId) {
    console.log('[User] Opening edit modal for user:', userId);
    const modal = document.getElementById('user-edit-modal');
    if (!modal) {
        console.error('[User] Edit modal not found');
        return;
    }
    
    // Find user data - we need to get it from the loaded users
    // Since we don't have direct access, we'll fetch it
    loadUserForEdit(userId);
}

async function loadUserForEdit(userId) {
    try {
        const api = window.adminApi;
        const response = await api.getUsers();
        
        if (response.success && response.data) {
            const user = response.data.find(u => u.id === userId);
            if (user) {
                currentEditUserId = userId;
                showUserEditModal(user);
            } else {
                throw new Error('User not found');
            }
        } else {
            throw new Error(response.message || 'Failed to load users');
        }
    } catch (error) {
        console.error('[User] Error loading user:', error);
        alert('Error loading user: ' + error.message);
    }
}

function showUserEditModal(user) {
    const modal = document.getElementById('user-edit-modal');
    const nameEl = document.getElementById('user-edit-name');
    const emailEl = document.getElementById('user-edit-email');
    const roleEl = document.getElementById('user-edit-role');
    const statusEl = document.getElementById('user-edit-status');
    const statusMsg = document.getElementById('user-edit-status-message');
    
    nameEl.textContent = user.name || user.email;
    emailEl.textContent = user.email;
    roleEl.value = user.role || 'user';
    statusEl.value = user.is_active ? 'true' : 'false';
    
    // Hide any previous status message
    statusMsg.classList.add('hidden');
    statusMsg.className = 'hidden p-3 rounded-lg text-sm';
    
    modal.classList.remove('hidden');
}

window.closeUserEditModal = function() {
    const modal = document.getElementById('user-edit-modal');
    if (modal) {
        modal.classList.add('hidden');
        currentEditUserId = null;
    }
}

window.submitUserEdit = async function(event) {
    event.preventDefault();
    
    if (!currentEditUserId) {
        return;
    }
    
    const roleEl = document.getElementById('user-edit-role');
    const statusEl = document.getElementById('user-edit-status');
    const statusMsg = document.getElementById('user-edit-status-message');
    const submitBtn = document.getElementById('user-edit-submit');
    
    const newRole = roleEl.value;
    const newStatus = statusEl.value === 'true';
    
    // Show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Saving...</span>';
    
    try {
        const api = window.adminApi;
        
        // Update role
        const roleResponse = await api.updateUserRole(currentEditUserId, newRole);
        if (!roleResponse.success) {
            throw new Error(roleResponse.message || 'Failed to update role');
        }
        
        // Update status
        const statusResponse = await api.updateUserStatus(currentEditUserId, newStatus);
        if (!statusResponse.success) {
            throw new Error(statusResponse.message || 'Failed to update status');
        }
        
        // Show success
        statusMsg.classList.remove('hidden');
        statusMsg.className = 'p-3 rounded-lg text-sm bg-green-100 text-green-700';
        statusMsg.textContent = 'User updated successfully!';
        
        // Close modal and reload
        setTimeout(() => {
            closeUserEditModal();
            loadUsers();
        }, 1000);
        
    } catch (error) {
        console.error('[User] Error updating user:', error);
        statusMsg.classList.remove('hidden');
        statusMsg.className = 'p-3 rounded-lg text-sm bg-red-100 text-red-700';
        statusMsg.textContent = 'Error: ' + error.message;
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Save Changes</span>';
    }
}

// Toggle user status (suspend/activate)
window.toggleUserStatus = async function(userId, currentIsActive) {
    const action = currentIsActive ? 'suspend' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
        return;
    }
    
    try {
        const api = window.adminApi;
        const newStatus = !currentIsActive;
        
        const response = await api.updateUserStatus(userId, newStatus);
        
        if (response.success) {
            alert(`User ${action}d successfully!`);
            loadUsers();
        } else {
            throw new Error(response.message || `Failed to ${action} user`);
        }
    } catch (error) {
        console.error('[User] Error toggling status:', error);
        alert('Error: ' + error.message);
    }
}

// Expose functions globally
window.loadUsers = loadUsers;
window.editUser = editUser;
window.toggleUserStatus = toggleUserStatus;

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

// =====================================================
// CHAT VIEW FUNCTIONS
// =====================================================

let selectedConversationId = null;
let currentChatFilter = 'active';
let chatPollingInterval = null;

function initChatView() {
    console.log('[Chat] Initializing chat view...');
    loadChatConversations();
}

function getAdminToken() {
    let token = localStorage.getItem('supabase_admin_token');
    if (!token) {
        token = localStorage.getItem('avalmeos_token');
    }
    if (!token) {
        const authData = localStorage.getItem('avalmeos_auth');
        if (authData) {
            try {
                const parsed = JSON.parse(authData);
                token = parsed.token;
            } catch (e) {}
        }
    }
    if (!token) {
        token = sessionStorage.getItem('supabase_admin_token');
    }
    console.log('[Chat] Token found:', token ? 'Yes' : 'No');
    return token;
}

async function loadChatConversations() {
    const container = document.getElementById('chat-conversations-list');
    if (!container) {
        console.error('[Chat] Container not found');
        return;
    }
    
    try {
        const token = getAdminToken();
        if (!token) {
            container.innerHTML = '<div class="p-4 text-center text-red-500">Please log in as admin</div>';
            return;
        }
        
        const baseUrl = window.API_BASE_URL || window.location.origin;
        const url = new URL(`${baseUrl}/api/admin/chat/conversations`);
        if (currentChatFilter) {
            url.searchParams.append('status', currentChatFilter);
        }
        
        console.log('[Chat] Loading conversations from:', url.toString());
        
        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('[Chat] Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Chat] Error response:', errorText);
            container.innerHTML = `<div class="p-4 text-center text-red-500">Error: ${response.status}</div>`;
            return;
        }
        
        const conversations = await response.json();
        console.log('[Chat] Loaded conversations:', conversations?.length || 0);
        
        if (!conversations || conversations.length === 0) {
            container.innerHTML = '<div class="p-4 text-center text-gray-500">No conversations yet. Users will appear here when they start a chat.</div>';
            return;
        }
        
        container.innerHTML = conversations.map(conv => `
            <div onclick="selectChatConversation('${conv.id}')" 
                class="p-4 border-b cursor-pointer hover:bg-gray-50 transition ${selectedConversationId === conv.id ? 'bg-blue-50 border-l-4 border-l-[#1a4d41]' : ''}"
                data-conversation-id="${conv.id}">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-bold text-[#1a4d41]">${escapeHtml(conv.user_name || 'Guest')}</h4>
                        <p class="text-sm text-gray-500">${escapeHtml(conv.last_message || 'No messages yet')}</p>
                    </div>
                    <div class="text-right">
                        <span class="text-xs text-gray-400">${formatChatTime(conv.last_message_time || conv.created_at)}</span>
                        <div class="mt-1">
                            <span class="px-2 py-0.5 rounded-full text-xs ${conv.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}">${conv.status}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('[Chat] Error loading conversations:', error);
        container.innerHTML = `<div class="p-4 text-center text-red-500">Error: ${error.message}</div>`;
    }
}

function filterChatConversations(status) {
    currentChatFilter = status;
    loadChatConversations();
}

async function selectChatConversation(conversationId) {
    selectedConversationId = conversationId;
    
    document.querySelectorAll('#chat-conversations-list > div').forEach(el => {
        el.classList.remove('bg-blue-50', 'border-l-4', 'border-l-[#1a4d41]');
        if (el.dataset.conversationId === conversationId) {
            el.classList.add('bg-blue-50', 'border-l-4', 'border-l-[#1a4d41]');
        }
    });
    
    document.getElementById('chat-reply-form').classList.remove('hidden');
    document.getElementById('chat-actions').classList.remove('hidden');
    
    await loadChatMessages(conversationId);
    startChatPolling(conversationId);
}

async function loadChatMessages(conversationId) {
    const messagesArea = document.getElementById('chat-messages-area');
    const header = document.getElementById('chat-user-name');
    const info = document.getElementById('chat-user-info');
    const statusSelect = document.getElementById('chat-status-select');
    
    try {
        const token = getAdminToken();
        const baseUrl = window.API_BASE_URL || window.location.origin;
        
        const response = await fetch(`${baseUrl}/api/admin/chat/conversations/${conversationId}/messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load messages');
        }
        
        const messages = await response.json();
        
        if (messages.length === 0) {
            messagesArea.innerHTML = '<div class="h-full flex items-center justify-center text-gray-400">No messages yet</div>';
            return;
        }
        
        messagesArea.innerHTML = messages.map(msg => `
            <div class="flex ${msg.sender_type === 'admin' ? 'justify-start' : 'justify-end'} mb-3">
                <div class="max-w-[70%] ${msg.sender_type === 'admin' ? 'bg-gray-100' : 'bg-[#1a4d41] text-white'} rounded-2xl px-4 py-2">
                    ${msg.sender_type === 'admin' ? `<div class="text-xs font-bold text-[#1a4d41] mb-1">${escapeHtml(msg.sender_name)} (Admin)</div>` : `<div class="text-xs font-bold text-white/80 mb-1">${escapeHtml(msg.sender_name)}</div>`}
                    <div class="text-sm">${escapeHtml(msg.message_text)}</div>
                    <div class="text-xs ${msg.sender_type === 'admin' ? 'text-gray-500' : 'text-white/70'} mt-1">
                        ${formatChatTime(msg.created_at)}
                    </div>
                </div>
            </div>
        `).join('');
        
        messagesArea.scrollTop = messagesArea.scrollHeight;
        
    } catch (error) {
        console.error('[Chat] Error loading messages:', error);
        messagesArea.innerHTML = '<div class="text-center text-red-500">Error loading messages</div>';
    }
}

async function sendChatReply() {
    const input = document.getElementById('chat-reply-input');
    const messageText = input.value.trim();
    
    if (!messageText || !selectedConversationId) return;
    
    try {
        const token = getAdminToken();
        const baseUrl = window.API_BASE_URL || window.location.origin;
        
        const response = await fetch(`${baseUrl}/api/admin/chat/conversations/${selectedConversationId}/reply`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message_text: messageText })
        });
        
        if (!response.ok) {
            throw new Error('Failed to send reply');
        }
        
        input.value = '';
        await loadChatMessages(selectedConversationId);
        
    } catch (error) {
        console.error('[Chat] Error sending reply:', error);
        alert('Failed to send reply. Please try again.');
    }
}

async function updateChatStatus() {
    const status = document.getElementById('chat-status-select').value;
    
    try {
        const token = getAdminToken();
        const baseUrl = window.API_BASE_URL || window.location.origin;
        
        const response = await fetch(`${baseUrl}/api/admin/chat/conversations/${selectedConversationId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update status');
        }
        
        loadChatConversations();
        
    } catch (error) {
        console.error('[Chat] Error updating status:', error);
        alert('Failed to update status');
    }
}

function startChatPolling(conversationId) {
    if (chatPollingInterval) clearInterval(chatPollingInterval);
    
    chatPollingInterval = setInterval(() => {
        if (selectedConversationId) {
            loadChatMessages(selectedConversationId);
        }
    }, 5000);
}

function stopChatPolling() {
    if (chatPollingInterval) {
        clearInterval(chatPollingInterval);
        chatPollingInterval = null;
    }
}

function formatChatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle enter key in reply input
function handleChatReplyKeypress(event) {
    if (event.key === 'Enter') {
        sendChatReply();
    }
}

window.handleChatReplyKeypress = handleChatReplyKeypress;

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
                        inquiry.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                    }">
                        ${inquiry.status}
                    </span>
                    <div class="flex gap-2">
                        <button 
                            onclick="deleteInquiry('${inquiry.id}')"
                            data-inquiry-id="${inquiry.id}"
                            class="text-red-500 hover:text-red-700 font-medium text-sm inquiry-delete-btn"
                        >
                            Delete
                        </button>
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

// Delete inquiry function
window.deleteInquiry = async function(inquiryId) {
    if (!confirm('Are you sure you want to delete this inquiry? This action cannot be undone.')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('avalmeos_token');
        if (!token) {
            throw new Error('Not authenticated. Please log in again.');
        }
        
        const response = await fetch(`/api/admin/inquiries/${inquiryId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Inquiry deleted successfully!');
            loadInquiries();
        } else {
            throw new Error(result.message || 'Failed to delete inquiry');
        }
    } catch (error) {
        console.error('[Delete Inquiry] Error:', error);
        alert('Error deleting inquiry: ' + error.message);
    }
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
    
    const status = 'resolved'; // Automatically set to resolved when replying
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
