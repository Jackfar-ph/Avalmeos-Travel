/**
 * Admin Tabs Module - Tab loading and switching functions
 * Part of the modular admin architecture
 * Supports both online (backend) and offline (localStorage) modes
 */

// Tab switching
function showAdminTab(tabName) {
    // Check authentication first
    const token = localStorage.getItem('avalmeos_token');
    const user = JSON.parse(localStorage.getItem('avalmeos_user') || 'null');
    
    if (!token || !user) {
        // Show login overlay
        const loginOverlay = document.getElementById('admin-login-overlay');
        if (loginOverlay) {
            loginOverlay.classList.remove('hidden');
        }
        return; // Don't switch tabs
    }
    
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

// Check if we're in offline mode
function isOfflineMode() {
    const token = localStorage.getItem('avalmeos_token');
    return token && token.startsWith('local-');
}

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

// Helper function for status badge colors
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

// Dashboard
async function loadDashboard() {
    const dashboard = document.getElementById('admin-dashboard');
    if (!dashboard) return;
    
    // Show loading
    dashboard.innerHTML = `
        <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d41]"></div>
        </div>
    `;
    
    if (isOfflineMode()) {
        // Offline mode - use local data
        const destCount = Object.keys(window.packageData || {}).length;
        dashboard.innerHTML = `
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p class="text-blue-700"><strong>Offline Mode</strong> - Using local data. Some features may be limited.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div class="text-gray-500 text-sm">Total Users</div>
                    <div class="text-2xl font-bold text-[#1a4d41]">1</div>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div class="text-gray-500 text-sm">Total Destinations</div>
                    <div class="text-2xl font-bold text-[#1a4d41]">${destCount}</div>
                </div>
                <div class="bg-yellow-50 p-4 rounded-xl shadow-sm border border-yellow-100">
                    <div class="text-yellow-600 text-sm">Pending Bookings</div>
                    <div class="text-2xl font-bold text-yellow-600">0</div>
                </div>
                <div class="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100">
                    <div class="text-green-600 text-sm">Total Revenue</div>
                    <div class="text-2xl font-bold text-green-600">$0.00</div>
                </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-4 border-b flex justify-between items-center">
                    <h3 class="font-bold text-[#1a4d41]">Quick Actions</h3>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button onclick="showAdminTab('destinations');" class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center">
                            <div class="text-2xl mb-2">📍</div>
                            <div class="text-sm font-medium">Manage Destinations</div>
                        </button>
                        <button onclick="showAdminTab('activities');" class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center">
                            <div class="text-2xl mb-2">🎯</div>
                            <div class="text-sm font-medium">Manage Activities</div>
                        </button>
                        <button onclick="showAdminTab('packages');" class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center">
                            <div class="text-2xl mb-2">📦</div>
                            <div class="text-sm font-medium">Manage Packages</div>
                        </button>
                        <button onclick="showAdminTab('bookings');" class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center">
                            <div class="text-2xl mb-2">📋</div>
                            <div class="text-sm font-medium">View Bookings</div>
                        </button>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    try {
        // Get dashboard stats from API
        const statsResponse = await adminApi.getDashboardStats();
        const stats = statsResponse.data;
        
        // Get recent bookings
        const recentResponse = await adminApi.getRecentBookings(5);
        const recentBookings = recentResponse.data || [];
        
        dashboard.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div class="text-gray-500 text-sm">Total Users</div>
                    <div class="text-2xl font-bold text-[#1a4d41]">${stats.totalUsers || 0}</div>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div class="text-gray-500 text-sm">Total Destinations</div>
                    <div class="text-2xl font-bold text-[#1a4d41]">${stats.totalDestinations || 0}</div>
                </div>
                <div class="bg-yellow-50 p-4 rounded-xl shadow-sm border border-yellow-100">
                    <div class="text-yellow-600 text-sm">Pending Bookings</div>
                    <div class="text-2xl font-bold text-yellow-600">${stats.pendingBookings || 0}</div>
                </div>
                <div class="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100">
                    <div class="text-green-600 text-sm">Total Revenue</div>
                    <div class="text-2xl font-bold text-green-600">${(stats.totalRevenue || 0).toLocaleString()}</div>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-4 border-b flex justify-between items-center">
                    <h3 class="font-bold text-[#1a4d41]">Recent Bookings</h3>
                    <button onclick="showAdminTab('bookings');" class="text-sm text-[#1a4d41] hover:underline">View All</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking #</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            ${recentBookings.length === 0 
                                ? '<tr><td colspan="4" class="px-4 py-8 text-center text-gray-500">No recent bookings</td></tr>'
                                : recentBookings.map(booking => `
                                    <tr>
                                        <td class="px-4 py-3 text-sm font-medium">#${booking.id.substring(0, 8)}</td>
                                        <td class="px-4 py-3 text-sm">${booking.guest_name || 'Guest'}</td>
                                        <td class="px-4 py-3 text-sm">${new Date(booking.created_at).toLocaleDateString()}</td>
                                        <td class="px-4 py-3">
                                            <span class="px-2 py-1 rounded-full text-xs ${getStatusClass(booking.status)}">
                                                ${booking.status || 'pending'}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        console.warn('[Admin] Dashboard API failed:', error);
        // Fallback to offline mode
        const destCount = Object.keys(window.packageData || {}).length;
        dashboard.innerHTML = `
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p class="text-yellow-700"><strong>Connection Error</strong> - Switched to offline mode.</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div class="text-gray-500 text-sm">Total Users</div>
                    <div class="text-2xl font-bold text-[#1a4d41]">1</div>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div class="text-gray-500 text-sm">Total Destinations</div>
                    <div class="text-2xl font-bold text-[#1a4d41]">${destCount}</div>
                </div>
                <div class="bg-yellow-50 p-4 rounded-xl shadow-sm border border-yellow-100">
                    <div class="text-yellow-600 text-sm">Pending Bookings</div>
                    <div class="text-2xl font-bold text-yellow-600">0</div>
                </div>
                <div class="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100">
                    <div class="text-green-600 text-sm">Total Revenue</div>
                    <div class="text-2xl font-bold text-green-600">$0.00</div>
                </div>
            </div>
        `;
    }
}

// Bookings
async function loadBookings() {
    console.log('[Admin] loadBookings called');
    const bookingsTab = document.getElementById('admin-bookings-tab');
    if (!bookingsTab) {
        console.log('[Admin] bookingsTab not found');
        return;
    }
    
    bookingsTab.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4 border-b flex justify-between items-center">
                <h3 class="font-bold text-[#1a4d41]">All Bookings</h3>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody id="admin-bookings-table" class="divide-y divide-gray-100">
                        <tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    try {
        if (typeof AdminApiService !== 'undefined') {
            console.log('[Admin] Calling AdminApiService.getBookings()...');
            const api = new AdminApiService();
            const response = await api.getBookings();
            console.log('[Admin] getBookings response:', response);
            
            const tableBody = document.getElementById('admin-bookings-table');
            if (!tableBody) {
                console.log('[Admin] admin-bookings-table not found');
                return;
            }
            
            if (response.success && response.data && response.data.length > 0) {
                tableBody.innerHTML = response.data.map(booking => `
                    <tr>
                        <td class="px-4 py-3 text-sm font-medium">#${booking.id}</td>
                        <td class="px-4 py-3 text-sm">${booking.guest_name || 'Guest'}</td>
                        <td class="px-4 py-3 text-sm">${booking.package_name || 'N/A'}</td>
                        <td class="px-4 py-3 text-sm">${new Date(booking.created_at).toLocaleDateString()}</td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 rounded-full text-xs ${getStatusClass(booking.status)}">
                                ${booking.status}
                            </span>
                        </td>
                    </tr>
                `).join('');
            } else {
                tableBody.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">No bookings found</td></tr>';
            }
        } else {
            console.log('[Admin] AdminApiService not available');
            throw new Error('AdminApiService not available');
        }
    } catch (error) {
        console.error('[Admin] Error loading bookings:', error);
        const tableBody = document.getElementById('admin-bookings-table');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-red-500">Error: ${error.message}</td></tr>`;
        }
    }
}

// Destinations
async function loadDestinations() {
    const destinationsTab = document.getElementById('admin-destinations-tab');
    if (!destinationsTab) return;
    
    // Update the tab content to show cards
    destinationsTab.innerHTML = `
        <h2 class="text-2xl font-bold mb-6">Destinations Management</h2>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4" id="mode-banner">
            <p class="text-green-700" id="mode-banner-text"><strong>Online Mode</strong> - Connected to backend.</p>
        </div>
        <div class="flex justify-between items-center mb-4">
            <p class="text-gray-600">Manage your travel destinations and packages</p>
            <button onclick="addDestination()" class="px-4 py-2 bg-[#1a4d41] text-white rounded-lg text-sm hover:bg-opacity-90 transition">
                + Add Destination
            </button>
        </div>
        <div id="admin-destinations-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <!-- Destinations rendered here as cards -->
            <div class="col-span-full text-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d41] mx-auto"></div>
                <p class="mt-4 text-gray-500">Loading destinations from database...</p>
            </div>
        </div>
    `;
    
    try {
        if (typeof AdminApiService !== 'undefined') {
            const api = new AdminApiService();
            const response = await api.getDestinations();
            
            if (response.success && response.data) {
                renderDestinations(response.data);
            } else {
                throw new Error(response.message || 'Failed to load destinations');
            }
        } else {
            throw new Error('AdminApiService not available');
        }
    } catch (error) {
        console.error('Error loading destinations:', error);
        const grid = document.getElementById('admin-destinations-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12 text-red-500">
                    <p>Error loading destinations: ${error.message}</p>
                    <button onclick="loadDestinations()" class="mt-4 px-4 py-2 bg-[#1a4d41] text-white rounded-lg hover:bg-[#153d32]">
                        Retry
                    </button>
                </div>
            `;
        }
    }
}

function renderDestinations(destinations) {
    const grid = document.getElementById('admin-destinations-grid');
    if (!grid) return;
    
    if (!destinations || destinations.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">No destinations found. Add your first destination!</div>';
        return;
    }
    
    grid.innerHTML = destinations.map(dest => `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div class="h-40 bg-gradient-to-br from-[#1a4d41] to-[#2d6a5a] flex items-center justify-center overflow-hidden">
                ${dest.hero_image ? 
                    `<img src="${dest.hero_image}" alt="${dest.name}" class="w-full h-full object-cover">` :
                    '<span class="text-4xl">📍</span>'
                }
            </div>
            <div class="p-4">
                <h3 class="font-bold text-[#1a4d41] text-lg mb-2">${dest.name}</h3>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">${dest.short_description || dest.description || 'No description'}</p>
                <div class="flex items-center justify-between">
                    <span class="text-xl font-bold text-orange-500">${dest.region || 'Philippines'}</span>
                    <div class="flex gap-2">
                        <button onclick="editDestination('${dest.id}')" class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition">Edit</button>
                        <button onclick="deleteDestination('${dest.id}')" class="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition">Delete</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Activities
async function loadActivities() {
    const activitiesTab = document.getElementById('admin-activities-tab');
    if (!activitiesTab) return;
    
    activitiesTab.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4 border-b flex justify-between items-center">
                <h3 class="font-bold text-[#1a4d41]">Activities</h3>
                <button onclick="addActivity()" class="px-4 py-2 bg-[#1a4d41] text-white rounded-lg text-sm hover:bg-opacity-90">
                    + Add Activity
                </button>
            </div>
            <div class="p-8 text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d41] mx-auto"></div>
                <p class="mt-4 text-gray-500">Loading activities from database...</p>
            </div>
        </div>
    `;
    
    try {
        if (typeof AdminApiService !== 'undefined') {
            const api = new AdminApiService();
            const response = await api.getActivities();
            
            if (response.success && response.data) {
                renderActivities(response.data);
            } else {
                throw new Error(response.message || 'Failed to load activities');
            }
        } else {
            throw new Error('AdminApiService not available');
        }
    } catch (error) {
        console.error('Error loading activities:', error);
        activitiesTab.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-4 border-b">
                    <h3 class="font-bold text-[#1a4d41]">Activities</h3>
                </div>
                <div class="p-8 text-center text-red-500">
                    <p>Error loading activities: ${error.message}</p>
                    <button onclick="loadActivities()" class="mt-4 px-4 py-2 bg-[#1a4d41] text-white rounded-lg hover:bg-[#153d32]">
                        Retry
                    </button>
                </div>
            </div>
        `;
    }
}

function renderActivities(activities) {
    const activitiesTab = document.getElementById('admin-activities-tab');
    if (!activitiesTab) return;
    
    if (!activities || activities.length === 0) {
        activitiesTab.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-4 border-b flex justify-between items-center">
                    <h3 class="font-bold text-[#1a4d41]">Activities</h3>
                    <button onclick="addActivity()" class="px-4 py-2 bg-[#1a4d41] text-white rounded-lg text-sm hover:bg-opacity-90">
                        + Add Activity
                    </button>
                </div>
                <div class="p-8 text-center text-gray-500">
                    No activities found. Add your first activity!
                </div>
            </div>
        `;
        return;
    }
    
    const activitiesHtml = activities.map(activity => `
        <div class="border-b border-gray-50 hover:bg-gray-50">
            <div class="p-4 flex justify-between items-center">
                <div class="flex items-center gap-4">
                    <div class="h-12 w-12 rounded-lg bg-gradient-to-br from-[#1a4d41] to-[#2d6a5a] flex items-center justify-center text-white font-bold">
                        ${activity.name ? activity.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div>
                        <h4 class="font-medium text-[#1a4d41]">${activity.name}</h4>
                        <p class="text-sm text-gray-500">${activity.destinations?.name || 'No destination'} • ${activity.activity_type || 'General'}</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <span class="font-bold text-orange-500">₱${activity.price?.toLocaleString() || 0}</span>
                    <button onclick="editActivity('${activity.id}')" class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">Edit</button>
                    <button onclick="deleteActivity('${activity.id}')" class="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
    
    activitiesTab.innerHTML = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4 border-b flex justify-between items-center">
                <h3 class="font-bold text-[#1a4d41]">Activities</h3>
                <span class="text-sm text-gray-500">${activities.length} activities</span>
            </div>
            <div class="divide-y divide-gray-50">
                ${activitiesHtml}
            </div>
        </div>
    `;
}

// Users - delegated to main.js implementation

// Inquiries - delegated to main.js implementation

// Packages - delegated to main.js implementation

// Analytics
async function loadAnalytics() {
    const analyticsTab = document.getElementById('admin-analytics-tab');
    if (!analyticsTab) return;
    
    // Show loading state
    analyticsTab.innerHTML = `
        <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d41]"></div>
        </div>
    `;
    
    try {
        // Fetch analytics data from API using available method
        const response = await adminApi.getAnalytics('30days');
        const data = response.data || {};
        
        // Extract data from response
        const stats = data.stats || {};
        const recentBookings = data.recent_bookings || [];
        const topDestinations = data.top_destinations || [];
        
        // Generate trend bars from recent bookings
        const trends = {};
        recentBookings.forEach(booking => {
            const date = booking.created_at ? booking.created_at.split('T')[0] : new Date().toISOString().split('T')[0];
            trends[date] = { count: (trends[date]?.count || 0) + 1 };
        });
        
        // Calculate totals
        const totalBookings = recentBookings.length;
        const totalRevenue = stats.total_revenue || 0;
        
        // Render analytics with real data
        analyticsTab.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Booking Trends Chart -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h3 class="font-bold text-lg mb-4">Booking Trends (Last 30 Days)</h3>
                    <div id="booking-trends-chart" class="h-64 flex flex-col items-center justify-center">
                        <div class="w-full">
                            <div class="flex items-end justify-center gap-2 h-48">
                                ${generateTrendBars(trends)}
                            </div>
                            <div class="flex justify-center gap-2 mt-2 text-xs text-gray-500">
                                <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
                            </div>
                        </div>
                        <p class="text-sm mt-4">Total Bookings: ${totalBookings}</p>
                    </div>
                </div>
                
                <!-- Top Destinations Chart -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h3 class="font-bold text-lg mb-4">Top Destinations</h3>
                    <div id="top-destinations-chart" class="h-64 flex flex-col items-center justify-center">
                        <div class="w-full px-4">
                            <div class="space-y-3">
                                ${generateDestinationBars(topDestinations)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Summary Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h4 class="font-bold text-gray-700 mb-2">Total Revenue</h4>
                    <p class="text-3xl font-bold text-[#1a4d41]">₱${totalRevenue.toLocaleString()}</p>
                    <p class="text-sm text-gray-500 mt-1">From ${totalBookings} bookings</p>
                </div>
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h4 class="font-bold text-gray-700 mb-2">Average Booking Value</h4>
                    <p class="text-3xl font-bold text-[#1a4d41]">₱${totalBookings > 0 ? Math.round(totalRevenue / totalBookings).toLocaleString() : 0}</p>
                    <p class="text-sm text-gray-500 mt-1">Based on ${totalBookings} bookings</p>
                </div>
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h4 class="font-bold text-gray-700 mb-2">Customer Satisfaction</h4>
                    <p class="text-3xl font-bold text-[#1a4d41]">${topDestinations[0]?.average_rating?.toFixed(1) || '4.8'}/5.0</p>
                    <p class="text-sm text-gray-500 mt-1">Based on reviews</p>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading analytics:', error);
        renderOfflineAnalytics();
    }
}

// Generate trend bars for chart
function generateTrendBars(trends) {
    const entries = Object.entries(trends);
    const maxCount = Math.max(...entries.map(([, data]) => data.count || 0), 1);
    
    // Take last 12 entries for display
    const recentTrends = entries.slice(-12);
    
    return recentTrends.map(([date, data]) => {
        const height = Math.max((data.count / maxCount) * 100, 10);
        const day = new Date(date).getDate();
        return `
            <div class="w-8 bg-[#1a4d41] rounded-t" style="height: ${height}%" title="${date}: ${data.count} bookings"></div>
        `;
    }).join('');
}

// Generate destination bars for chart
function generateDestinationBars(destinations) {
    const maxReviews = Math.max(...destinations.map(d => d.total_reviews || 0), 1);
    
    return destinations.map(dest => {
        const width = ((dest.total_reviews || 0) / maxReviews) * 100;
        return `
            <div class="flex items-center gap-2">
                <span class="w-24 text-sm text-gray-600 truncate">${dest.name || 'Unknown'}</span>
                <div class="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                    <div class="h-full bg-[#1a4d41] rounded" style="width: ${width}%"></div>
                </div>
                <span class="text-sm font-bold">${dest.total_reviews || 0}</span>
            </div>
        `;
    }).join('');
}

// Render offline analytics fallback
function renderOfflineAnalytics() {
    const analyticsTab = document.getElementById('admin-analytics-tab');
    if (!analyticsTab) return;
    
    analyticsTab.innerHTML = `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p class="text-blue-700"><strong>Offline Mode</strong> - Using cached data.</p>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h3 class="font-bold text-lg mb-4">Booking Trends (Last 30 Days)</h3>
                <div class="h-64 flex flex-col items-center justify-center text-gray-500">
                    <p>No data available in offline mode</p>
                </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h3 class="font-bold text-lg mb-4">Top Destinations</h3>
                <div class="h-64 flex flex-col items-center justify-center text-gray-500">
                    <p>No data available in offline mode</p>
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h4 class="font-bold text-gray-700 mb-2">Total Revenue</h4>
                <p class="text-3xl font-bold text-[#1a4d41]">₱0</p>
            </div>
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h4 class="font-bold text-gray-700 mb-2">Average Booking Value</h4>
                <p class="text-3xl font-bold text-[#1a4d41]">₱0</p>
            </div>
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h4 class="font-bold text-gray-700 mb-2">Customer Satisfaction</h4>
                <p class="text-3xl font-bold text-[#1a4d41]">—/5.0</p>
            </div>
        </div>
    `;
}

// ==========================
// CRUD Operations (Local)
// ==========================
// CRUD Operations for Destinations
// ==========================

function addDestination() {
    // Clear the form and show the modal for adding a new destination
    if (typeof showDestinationModal === 'function') {
        showDestinationModal();
    } else {
        alert('Modal not available. Please ensure the admin components are loaded.');
    }
}

function editDestination(id) {
    // Show the modal with existing destination data for editing
    if (typeof showDestinationModal === 'function') {
        // Load destination data and populate form
        const api = new AdminApiService();
        api.getDestinations().then(response => {
            if (response.success && response.data) {
                const destination = response.data.find(d => d.id === id);
                if (destination) {
                    showDestinationModal();
                    
                    // Populate form fields
                    document.getElementById('destination-modal-title').textContent = 'Edit Destination';
                    document.getElementById('destination-id').value = destination.id;
                    document.getElementById('destination-city').value = destination.name || '';
                    document.getElementById('destination-slug').value = destination.slug || '';
                    document.getElementById('destination-description').value = destination.description || '';
                    document.getElementById('destination-region').value = destination.region || '';
                    document.getElementById('destination-image').value = destination.hero_image || '';
                    document.getElementById('destination-featured').checked = destination.is_featured || false;
                }
            }
        }).catch(error => {
            console.error('Error loading destination for edit:', error);
            alert('Error loading destination: ' + error.message);
        });
    } else {
        alert('Modal not available. Please ensure the admin components are loaded.');
    }
}

function deleteDestination(id) {
    if (!confirm('Are you sure you want to delete this destination? This action cannot be undone.')) {
        return;
    }
    
    const api = new AdminApiService();
    api.deleteDestination(id).then(result => {
        if (result.success) {
            console.log('Destination deleted successfully:', result);
            alert('Destination deleted successfully!');
            // Notify other tabs about the change
            if (typeof notifyDataChange === 'function') {
                notifyDataChange('destinations');
            }
            // Refresh destinations list
            loadDestinations();
        } else {
            throw new Error(result.message || 'Failed to delete destination');
        }
    }).catch(error => {
        console.error('Error deleting destination:', error);
        alert('Error deleting destination: ' + error.message);
    });
}

function addActivity() {
    // Show the modal for adding a new activity
    if (typeof showActivityModal === 'function') {
        showActivityModal();
    } else {
        alert('Modal not available. Please ensure the admin components are loaded.');
    }
}

function editActivity(id) {
    // Show the modal with existing activity data for editing
    if (typeof showActivityModal === 'function') {
        const api = new AdminApiService();
        api.getActivities().then(response => {
            if (response.success && response.data) {
                const activity = response.data.find(a => a.id === id);
                if (activity) {
                    showActivityModal();
                    
                    // Populate form fields
                    document.getElementById('activity-modal-title').textContent = 'Edit Activity';
                    document.getElementById('activity-id').value = activity.id;
                    document.getElementById('activity-name').value = activity.name || '';
                    document.getElementById('activity-destination').value = activity.destination_id || '';
                    document.getElementById('activity-type').value = activity.activity_type || '';
                    document.getElementById('activity-description').value = activity.description || '';
                    document.getElementById('activity-price').value = activity.price || '';
                    document.getElementById('activity-duration').value = activity.duration || '';
                    document.getElementById('activity-image').value = activity.image || '';
                }
            }
        }).catch(error => {
            console.error('Error loading activity for edit:', error);
            alert('Error loading activity: ' + error.message);
        });
    } else {
        alert('Modal not available. Please ensure the admin components are loaded.');
    }
}

function deleteActivity(id) {
    if (!confirm('Are you sure you want to delete this activity? This action cannot be undone.')) {
        return;
    }
    
    const api = new AdminApiService();
    api.deleteActivity(id).then(result => {
        if (result.success) {
            console.log('Activity deleted successfully:', result);
            alert('Activity deleted successfully!');
            // Notify other tabs about the change
            if (typeof notifyDataChange === 'function') {
                notifyDataChange('activities');
            }
            // Refresh activities list
            loadActivities();
        } else {
            throw new Error(result.message || 'Failed to delete activity');
        }
    }).catch(error => {
        console.error('Error deleting activity:', error);
        alert('Error deleting activity: ' + error.message);
    });
}

// ==========================
// CRUD Operations for Packages
// ==========================

function addPackage() {
    // Show the modal for adding a new package
    if (typeof showPackageModal === 'function') {
        showPackageModal();
    } else {
        alert('Modal not available. Please ensure the admin components are loaded.');
    }
}

function editPackage(id) {
    // Show the modal with existing package data for editing
    if (typeof showPackageModal === 'function') {
        const api = new AdminApiService();
        api.getPackages().then(response => {
            if (response.success && response.data) {
                const pkg = response.data.find(p => p.id === id);
                if (pkg) {
                    showPackageModal();
                    
                    // Populate form fields
                    document.getElementById('package-modal-title').textContent = 'Edit Package';
                    document.getElementById('package-id').value = pkg.id;
                    document.getElementById('package-name').value = pkg.name || '';
                    document.getElementById('package-destination').value = pkg.destination_id || '';
                    document.getElementById('package-type').value = pkg.package_type || '';
                    document.getElementById('package-description').value = pkg.description || '';
                    document.getElementById('package-price').value = pkg.price || '';
                    document.getElementById('package-duration').value = pkg.duration || '';
                    document.getElementById('package-includes').value = pkg.includes || '';
                    document.getElementById('package-excludes').value = pkg.excludes || '';
                    document.getElementById('package-image').value = pkg.image || '';
                }
            }
        }).catch(error => {
            console.error('Error loading package for edit:', error);
            alert('Error loading package: ' + error.message);
        });
    } else {
        alert('Modal not available. Please ensure the admin components are loaded.');
    }
}

function deletePackage(id) {
    if (!confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
        return;
    }
    
    const api = new AdminApiService();
    api.deletePackage(id).then(result => {
        if (result.success) {
            console.log('Package deleted successfully:', result);
            alert('Package deleted successfully!');
            // Notify other tabs about the change
            if (typeof notifyDataChange === 'function') {
                notifyDataChange('packages');
            }
            // Refresh packages list
            loadPackages();
        } else {
            throw new Error(result.message || 'Failed to delete package');
        }
    }).catch(error => {
        console.error('Error deleting package:', error);
        alert('Error deleting package: ' + error.message);
    });
}

function viewUserDetails(id) {
    console.log('View user:', id);
}

async function updateBookingStatus(id, status) {
    try {
        await adminApi.updateBooking(id, { status });
        loadBookings();
    } catch (error) {
        console.error('Error updating booking:', error);
    }
}

/**
 * Notify other tabs about data changes
 */
function notifyDataChange(tableName) {
    try {
        const channel = new BroadcastChannel('avalmeos-sync');
        channel.postMessage({
            type: 'DATA_CHANGE',
            table: tableName,
            timestamp: new Date().toISOString()
        });
        console.log('[Admin] Notified data change for:', tableName);
    } catch (error) {
        console.warn('[Admin] Could not notify data change:', error);
    }
}
window.showAdminTab = showAdminTab;
window.loadTabData = loadTabData;
window.loadDashboard = loadDashboard;
window.loadBookings = loadBookings;
window.loadDestinations = loadDestinations;
window.loadActivities = loadActivities;
window.loadUsers = loadUsers;
window.loadInquiries = loadInquiries;
window.loadAnalytics = loadAnalytics;
window.addDestination = addDestination;
window.editDestination = editDestination;
window.deleteDestination = deleteDestination;
window.addActivity = addActivity;
window.editActivity = editActivity;
window.viewUserDetails = viewUserDetails;
window.updateBookingStatus = updateBookingStatus;
window.isOfflineMode = isOfflineMode;
