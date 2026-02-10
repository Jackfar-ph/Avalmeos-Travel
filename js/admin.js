// --- Admin System ---

const ADMIN_KEY = 'avalmeos_admin';

console.log('js/admin.js is loading...');

// Placeholder image data URI for missing images (gray placeholder)
const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='%23cccccc' width='100' height='100'/%3E%3C/svg%3E";

// Get all bookings (BOOKINGS_KEY is defined in auth.js)

// Get all bookings
function getAllBookings() {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
}

// Save bookings
function saveAllBookings(bookings) {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

// Get booking by ID
function getBookingById(bookingId) {
    const bookings = getAllBookings();
    return bookings.find(b => b.id === bookingId);
}

// Update booking status
function updateBookingStatus(bookingId, status) {
    const bookings = getAllBookings();
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex !== -1) {
        bookings[bookingIndex].status = status;
        bookings[bookingIndex].updatedAt = new Date().toISOString();
        saveAllBookings(bookings);
        
        // Send notification email
        const booking = bookings[bookingIndex];
        sendEmailNotification(booking.userEmail, 'booking_status_update', booking);
        
        return true;
    }
    return false;
}

// Update payment status
function updatePaymentStatus(bookingId, paymentStatus) {
    const bookings = getAllBookings();
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex !== -1) {
        bookings[bookingIndex].paymentStatus = paymentStatus;
        bookings[bookingIndex].updatedAt = new Date().toISOString();
        saveAllBookings(bookings);
        return true;
    }
    return false;
}

// Delete booking
function deleteBooking(bookingId) {
    const bookings = getAllBookings();
    const filtered = bookings.filter(b => b.id !== bookingId);
    saveAllBookings(filtered);
}

// Get booking statistics
function getBookingStats() {
    const bookings = getAllBookings();
    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        rejected: bookings.filter(b => b.status === 'rejected').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        totalRevenue: bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.total, 0)
    };
    return stats;
}

// Render admin dashboard
function renderAdminDashboard() {
    const dashboard = document.getElementById('admin-dashboard');
    if (!dashboard) return;
    
    const stats = getBookingStats();
    const bookings = getAllBookings();
    
    dashboard.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div class="text-gray-500 text-sm">Total Bookings</div>
                <div class="text-2xl font-bold text-[#1a4d41]">${stats.total}</div>
            </div>
            <div class="bg-yellow-50 p-4 rounded-xl shadow-sm border border-yellow-100">
                <div class="text-yellow-600 text-sm">Pending</div>
                <div class="text-2xl font-bold text-yellow-600">${stats.pending}</div>
            </div>
            <div class="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100">
                <div class="text-green-600 text-sm">Confirmed</div>
                <div class="text-2xl font-bold text-green-600">${stats.confirmed}</div>
            </div>
            <div class="bg-orange-50 p-4 rounded-xl shadow-sm border border-orange-100">
                <div class="text-orange-600 text-sm">Total Revenue</div>
                <div class="text-2xl font-bold text-orange-600">${formatPrice(stats.totalRevenue)}</div>
            </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4 border-b border-gray-100">
                <h3 class="font-bold text-[#1a4d41]">All Bookings</h3>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${bookings.length === 0 ? `
                            <tr>
                                <td colspan="7" class="px-4 py-8 text-center text-gray-500">No bookings yet</td>
                            </tr>
                        ` : bookings.map(booking => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-4 py-3 text-sm font-mono">${booking.id.slice(0, 12)}...</td>
                                <td class="px-4 py-3">
                                    <div class="text-sm font-medium text-[#1a4d41]">${booking.userName}</div>
                                    <div class="text-xs text-gray-500">${booking.userEmail}</div>
                                </td>
                                <td class="px-4 py-3 text-sm">
                                    ${booking.items.map(item => `
                                        <div>${item.packageTitle} (${item.paxSize} pax)</div>
                                    `).join('')}
                                </td>
                                <td class="px-4 py-3 text-sm font-bold text-orange-500">${formatPrice(booking.total)}</td>
                                <td class="px-4 py-3">
                                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                        ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                                          booking.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                                          'bg-blue-100 text-blue-700'}">
                                        ${booking.status}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-sm text-gray-500">
                                    ${formatDate(booking.createdAt)}
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex gap-2">
                                        <button onclick="viewBookingDetails('${booking.id}')" 
                                            class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600">
                                            View
                                        </button>
                                        ${booking.status === 'pending' ? `
                                            <button onclick="approveBooking('${booking.id}')" 
                                                class="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 rounded text-white">
                                                Approve
                                            </button>
                                            <button onclick="rejectBooking('${booking.id}')" 
                                                class="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 rounded text-white">
                                                Reject
                                            </button>
                                        ` : ''}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Approve booking
function approveBooking(bookingId) {
    if (confirm('Are you sure you want to approve this booking?')) {
        updateBookingStatus(bookingId, 'confirmed');
        renderAdminDashboard();
        showNotification('Booking approved successfully', 'success');
    }
}

// Reject booking
function rejectBooking(bookingId) {
    const reason = prompt('Reason for rejection:');
    if (reason !== null) {
        updateBookingStatus(bookingId, 'rejected');
        renderAdminDashboard();
        showNotification('Booking rejected', 'error');
    }
}

// View booking details
function viewBookingDetails(bookingId) {
    const booking = getBookingById(bookingId);
    if (!booking) return;
    
    const modal = document.getElementById('booking-details-modal');
    const content = document.getElementById('booking-details-content');
    
    if (modal && content) {
        content.innerHTML = `
            <div class="space-y-4">
                <div class="flex justify-between items-center border-b pb-2">
                    <span class="text-gray-500">Booking ID:</span>
                    <span class="font-mono text-sm">${booking.id}</span>
                </div>
                <div class="flex justify-between items-center border-b pb-2">
                    <span class="text-gray-500">Customer:</span>
                    <span class="font-medium">${booking.userName}</span>
                </div>
                <div class="flex justify-between items-center border-b pb-2">
                    <span class="text-gray-500">Email:</span>
                    <span class="font-medium">${booking.userEmail}</span>
                </div>
                <div class="flex justify-between items-center border-b pb-2">
                    <span class="text-gray-500">Status:</span>
                    <span class="px-2 py-1 rounded-full text-xs font-medium bg-${booking.status === 'confirmed' ? 'green' : booking.status === 'rejected' ? 'red' : 'yellow'}-100 text-${booking.status === 'confirmed' ? 'green' : booking.status === 'rejected' ? 'red' : 'yellow'}-700">
                        ${booking.status}
                    </span>
                </div>
                <div class="border-b pb-2">
                    <span class="text-gray-500">Items:</span>
                    ${booking.items.map(item => `
                        <div class="mt-2 p-2 bg-gray-50 rounded">
                            <div class="font-medium">${item.packageTitle}</div>
                            <div class="text-sm text-gray-500">${item.city} • ${item.paxSize} pax</div>
                            <div class="text-sm text-gray-500">📅 ${formatDate(item.travelDate)}</div>
                            ${item.personalization.length > 0 ? `
                                <div class="text-sm mt-1">
                                    <span class="text-gray-500">Add-ons:</span>
                                    ${item.personalization.map(p => {
                                        const opt = getPersonalizationOptions().find(o => o.id === p);
                                        return opt ? `<span class="ml-1">${opt.icon} ${opt.name}</span>` : '';
                                    }).join(', ')}
                                </div>
                            ` : ''}
                            <div class="font-bold text-orange-500 mt-1">${formatPrice(item.totalPrice)}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="flex justify-between items-center pt-2">
                    <span class="text-gray-500 font-bold">Total Amount:</span>
                    <span class="text-xl font-bold text-orange-500">${formatPrice(booking.total)}</span>
                </div>
                <div class="text-xs text-gray-400 pt-2">
                    Created: ${formatDate(booking.createdAt)}
                </div>
            </div>
        `;
        modal.classList.remove('hidden');
    }
}

// Close booking details modal
function closeBookingDetailsModal() {
    const modal = document.getElementById('booking-details-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// ==========================================
// PACKAGE MANAGEMENT
// ==========================================

// Package storage key
const ADMIN_PACKAGES_KEY = 'avalmeos_admin_packages';

// Default packages data (fallback when no data exists)
const defaultPackages = [
    {
        id: 'pkg_001',
        name: 'Cebu City Package Tour',
        destination: 'Cebu City',
        price: 8500,
        duration: 3,
        type: 'all-inclusive',
        description: 'Explore the Queen City of the South with our comprehensive 3D2N package',
        image: 'Picture/Cebu City.jpg',
        activities: ['City Tour', 'Food Trip', 'Beach Visit', 'Simala Church'],
        inclusions: 'Hotel, Breakfast, Tour Guide, Transfers, Entrance Fees',
        exclusions: 'Airfare, Personal expenses, Tips',
        status: 'active',
        featured: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'pkg_002',
        name: 'Old Manila Heritage Tour',
        destination: 'Manila',
        price: 2400,
        duration: 1,
        type: 'day-tour',
        description: 'Discover the rich history of Manila through its heritage sites',
        image: 'Picture/Old Manila.jpg',
        activities: ['Intramuros Tour', 'Fort Santiago', 'San Agustin Church', 'Casa Real'],
        inclusions: 'Tour Guide, Transfers, Entrance Fees',
        exclusions: 'Meals, Personal expenses',
        status: 'active',
        featured: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 'pkg_003',
        name: 'Baguio City Package',
        destination: 'Baguio',
        price: 5900,
        duration: 3,
        type: 'all-inclusive',
        description: 'Escape to the Summer Capital of the Philippines',
        image: 'Picture/Baguio.jpg',
        activities: ['City Tour', 'Mines View Park', 'Wright Park', 'Session Road'],
        inclusions: 'Hotel, Breakfast, Tour Guide, Transfers',
        exclusions: 'Airfare, Personal expenses, Activities not mentioned',
        status: 'active',
        featured: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'pkg_004',
        name: 'Davao Highland Tour',
        destination: 'Davao City',
        price: 4200,
        duration: 1,
        type: 'day-tour',
        description: 'Experience the natural beauty of Davao\'s highlands',
        image: 'Picture/Davao.jpg',
        activities: ['Malagos Garden Resort', 'Eden Nature Park', 'Philippine Eagle Center'],
        inclusions: 'Tour Guide, Transfers, Entrance Fees, Lunch',
        exclusions: 'Personal expenses, Airfare',
        status: 'active',
        featured: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 'pkg_005',
        name: 'Puerto Princesa Package',
        destination: 'Puerto Princesa',
        price: 7200,
        duration: 3,
        type: 'all-inclusive',
        description: 'Explore the Underground River and more in Palawan',
        image: 'Picture/Puerto Princesa.jpg',
        activities: ['Underground River Tour', 'City Tour', 'Baker\'s Hill', 'Iwahig Prison'],
        inclusions: 'Hotel, Breakfast, Tour Guide, Transfers, Boat Tour',
        exclusions: 'Airfare, Personal expenses, Tips',
        status: 'active',
        featured: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'pkg_006',
        name: 'Iloilo City & Gigantes',
        destination: 'Iloilo',
        price: 6500,
        duration: 4,
        type: 'all-inclusive',
        description: 'Discover Iloilo City and the stunning Gigantes Islands',
        image: 'Picture/Iloilo.jpg',
        activities: ['City Tour', 'Gigantes Island Hopping', 'Heritage Churches', 'Dining at District'],
        inclusions: 'Hotel, All Meals, Tour Guide, Boat Tour, Transfers',
        exclusions: 'Airfare, Personal expenses',
        status: 'active',
        featured: false,
        createdAt: new Date().toISOString()
    }
];

// Get all packages from localStorage
function getAdminPackages() {
    const packages = localStorage.getItem(ADMIN_PACKAGES_KEY);
    if (!packages || packages === 'undefined' || packages === 'null') {
        // Initialize with default packages
        localStorage.setItem(ADMIN_PACKAGES_KEY, JSON.stringify(defaultPackages));
        return defaultPackages;
    }
    try {
        return JSON.parse(packages);
    } catch (e) {
        console.error('Error parsing packages:', e);
        return defaultPackages;
    }
}

// Save all packages to localStorage
function saveAdminPackages(packages) {
    localStorage.setItem(ADMIN_PACKAGES_KEY, JSON.stringify(packages));
}

// Get package by ID
function getPackageById(packageId) {
    const packages = getAdminPackages();
    return packages.find(p => p.id === packageId);
}

// Add new package
function addAdminPackage(packageData) {
    const packages = getAdminPackages();
    const newPackage = {
        ...packageData,
        id: 'pkg_' + Date.now(),
        createdAt: new Date().toISOString()
    };
    packages.push(newPackage);
    saveAdminPackages(packages);
    return newPackage;
}

// Update existing package
function updateAdminPackage(packageId, packageData) {
    const packages = getAdminPackages();
    const index = packages.findIndex(p => p.id === packageId);
    if (index !== -1) {
        packages[index] = {
            ...packages[index],
            ...packageData,
            updatedAt: new Date().toISOString()
        };
        saveAdminPackages(packages);
        return packages[index];
    }
    return null;
}

// Delete package
function deleteAdminPackage(packageId) {
    const packages = getAdminPackages();
    const filtered = packages.filter(p => p.id !== packageId);
    saveAdminPackages(filtered);
}

// Get package statistics
function getPackageStats() {
    const packages = getAdminPackages();
    return {
        total: packages.length,
        active: packages.filter(p => p.status === 'active').length,
        inactive: packages.filter(p => p.status === 'inactive').length,
        featured: packages.filter(p => p.featured === true).length
    };
}

// Load packages for the admin tab
async function loadPackages() {
    const tableBody = document.getElementById('admin-packages-table');
    const emptyState = document.getElementById('packages-empty-state');
    const destinationFilter = document.getElementById('package-filter-destination');
    
    if (!tableBody) return;
    
    // Show loading state
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="px-4 py-8 text-center">
                <div class="flex items-center justify-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a4d41]"></div>
                </div>
            </td>
        </tr>
    `;
    
    try {
        // Try to fetch from API first
        let packages = [];
        try {
            const response = await window.adminApi.getPackages();
            if (response.success && response.data && response.data.length > 0) {
                packages = response.data;
                // Also save to localStorage for offline/fallback
                localStorage.setItem(ADMIN_PACKAGES_KEY, JSON.stringify(packages));
            }
        } catch (apiError) {
            console.log('API not available, using localStorage:', apiError.message);
        }
        
        // Fallback to localStorage
        if (packages.length === 0) {
            packages = getAdminPackages();
        }
        
        // Update destination filter dropdown
        if (destinationFilter) {
            const destinations = [...new Set(packages.map(p => p.destination))].sort();
            if (destinations.length > 0) {
                destinationFilter.innerHTML = `
                    <option value="">All Destinations</option>
                    ${destinations.map(d => `<option value="${d}">${d}</option>`).join('')}
                `;
            }
        }
        
        // Render packages table
        renderPackagesTable(packages);
        
    } catch (error) {
        console.error('Error loading packages:', error);
        // Fallback to localStorage on error
        const packages = getAdminPackages();
        renderPackagesTable(packages);
    }
}

// Make loadPackages globally accessible
window.loadPackages = loadPackages;
console.log('window.loadPackages assigned:', typeof window.loadPackages);

// Render packages table
function renderPackagesTable(packages) {
    const tableBody = document.getElementById('admin-packages-table');
    const emptyState = document.getElementById('packages-empty-state');
    
    if (!tableBody) return;
    
    if (packages.length === 0) {
        tableBody.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    
    tableBody.innerHTML = packages.map(pkg => `
        <tr class="hover:bg-gray-50">
            <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                    <img src="${pkg.image || PLACEHOLDER_IMG}" alt="${pkg.name}" 
                         class="w-12 h-12 rounded-lg object-cover"
                         onerror="this.src=PLACEHOLDER_IMG">
                    <div>
                        <div class="font-medium text-[#1a4d41]">${pkg.name}</div>
                        ${pkg.featured ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">Featured</span>' : ''}
                    </div>
                </div>
            </td>
            <td class="px-4 py-4 text-sm">${pkg.destination}</td>
            <td class="px-4 py-4 text-sm font-bold text-orange-500">${formatPrice(pkg.price)}</td>
            <td class="px-4 py-4 text-sm">${pkg.duration} Day${pkg.duration > 1 ? 's' : ''}</td>
            <td class="px-4 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${pkg.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">
                    ${pkg.status === 'active' ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td class="px-4 py-4">
                <div class="flex gap-2">
                    <button onclick="editPackage('${pkg.id}')" 
                        class="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Edit
                    </button>
                    <button onclick="showDeletePackageModal('${pkg.id}')" 
                        class="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Filter packages
function filterPackages() {
    const destinationFilter = document.getElementById('package-filter-destination');
    const statusFilter = document.getElementById('package-filter-status');
    const searchInput = document.getElementById('package-search');
    
    const destination = destinationFilter ? destinationFilter.value : '';
    const status = statusFilter ? statusFilter.value : '';
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    
    let packages = getAdminPackages();
    
    if (destination) {
        packages = packages.filter(p => p.destination === destination);
    }
    
    if (status) {
        packages = packages.filter(p => p.status === status);
    }
    
    if (search) {
        packages = packages.filter(p => 
            p.name.toLowerCase().includes(search) ||
            p.destination.toLowerCase().includes(search) ||
            p.description.toLowerCase().includes(search)
        );
    }
    
    renderPackagesTable(packages);
}

// Search packages
function searchPackages() {
    filterPackages();
}

// Show add package modal
function showPackageModal() {
    const modal = document.getElementById('package-modal');
    const form = document.getElementById('package-form');
    const title = document.getElementById('package-modal-title');
    
    if (!modal || !form) return;
    
    // Reset form
    form.reset();
    document.getElementById('package-id').value = '';
    document.getElementById('package-status').checked = true;
    
    // Set title
    if (title) title.textContent = 'Add New Package';
    
    // Populate destination dropdown
    populatePackageDestinations();
    
    // Show modal
    modal.classList.remove('hidden');
}

// Populate destination dropdown in package form
function populatePackageDestinations() {
    const select = document.getElementById('package-destination');
    if (!select) return;
    
    // Get destinations from cityData or use defaults
    const destinations = window.cityData ? Object.keys(window.cityData) : 
        ['Cebu City', 'Manila', 'Baguio', 'Davao City', 'Puerto Princesa', 'Iloilo', 'Palawan', 'Boracay'];
    
    select.innerHTML = `
        <option value="">Select destination</option>
        ${destinations.map(d => `<option value="${d}">${d}</option>`).join('')}
    `;
}

// Edit package
function editPackage(packageId) {
    const pkg = getPackageById(packageId);
    if (!pkg) return;
    
    const modal = document.getElementById('package-modal');
    const form = document.getElementById('package-form');
    const title = document.getElementById('package-modal-title');
    
    if (!modal || !form) return;
    
    // Populate destination dropdown
    populatePackageDestinations();
    
    // Fill form with package data
    document.getElementById('package-id').value = pkg.id;
    document.getElementById('package-name').value = pkg.name || '';
    document.getElementById('package-destination').value = pkg.destination || '';
    document.getElementById('package-description').value = pkg.description || '';
    document.getElementById('package-price').value = pkg.price || '';
    document.getElementById('package-duration').value = pkg.duration || 1;
    document.getElementById('package-type').value = pkg.type || 'all-inclusive';
    document.getElementById('package-image').value = pkg.image || '';
    document.getElementById('package-inclusions').value = pkg.inclusions || '';
    document.getElementById('package-exclusions').value = pkg.exclusions || '';
    document.getElementById('package-featured').checked = pkg.featured || false;
    document.getElementById('package-status').checked = pkg.status === 'active';
    
    // Format activities array to textarea (one per line)
    const activitiesTextarea = document.getElementById('package-activities');
    if (activitiesTextarea && pkg.activities) {
        activitiesTextarea.value = pkg.activities.join('\n');
    }
    
    // Set title
    if (title) title.textContent = 'Edit Package';
    
    // Show modal
    modal.classList.remove('hidden');
}

// Close package modal
function closePackageModal() {
    const modal = document.getElementById('package-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Save package from form
async function savePackage(event) {
    event.preventDefault();
    
    const form = event.target;
    const packageId = document.getElementById('package-id').value;
    
    // Get activities from textarea (split by new line and filter empty)
    const activitiesTextarea = document.getElementById('package-activities');
    const activities = activitiesTextarea ? 
        activitiesTextarea.value.split('\n').map(a => a.trim()).filter(a => a) : [];
    
    const packageData = {
        name: document.getElementById('package-name').value,
        destination: document.getElementById('package-destination').value,
        description: document.getElementById('package-description').value,
        price: parseFloat(document.getElementById('package-price').value) || 0,
        duration: parseInt(document.getElementById('package-duration').value) || 1,
        type: document.getElementById('package-type').value,
        image: document.getElementById('package-image').value,
        inclusions: document.getElementById('package-inclusions').value,
        exclusions: document.getElementById('package-exclusions').value,
        activities: activities,
        featured: document.getElementById('package-featured').checked,
        status: document.getElementById('package-status').checked ? 'active' : 'inactive'
    };
    
    try {
        if (packageId && !packageId.startsWith('pkg_')) {
            // Has valid UUID - use API
            try {
                if (packageId) {
                    await window.adminApi.updatePackage(packageId, packageData);
                    showNotification('Package updated successfully', 'success');
                } else {
                    await window.adminApi.createPackage(packageData);
                    showNotification('Package created successfully', 'success');
                }
                closePackageModal();
                loadPackages();
                return;
            } catch (apiError) {
                console.log('API error, falling back to localStorage:', apiError.message);
            }
        }
        
        // Fallback to localStorage
        if (packageId) {
            // Update existing package
            const updated = updateAdminPackage(packageId, packageData);
            if (updated) {
                showNotification('Package updated successfully', 'success');
            } else {
                showNotification('Package not found', 'error');
            }
        } else {
            // Add new package
            addAdminPackage(packageData);
            showNotification('Package created successfully', 'success');
        }
        
        closePackageModal();
        loadPackages();
        
    } catch (error) {
        console.error('Error saving package:', error);
        showNotification('Error saving package', 'error');
    }
}

// Show delete confirmation modal
function showDeletePackageModal(packageId) {
    const pkg = getPackageById(packageId);
    if (!pkg) return;
    
    const modal = document.getElementById('delete-package-modal');
    const info = document.getElementById('delete-package-info');
    const confirmBtn = document.getElementById('confirm-delete-package-btn');
    
    if (!modal || !info) return;
    
    // Show package info
    info.innerHTML = `
        <div class="flex items-center gap-3">
            <img src="${pkg.image || PLACEHOLDER_IMG}" alt="${pkg.name}" 
                 class="w-16 h-16 rounded-lg object-cover"
                 onerror="this.src=PLACEHOLDER_IMG">
            <div>
                <div class="font-bold text-[#1a4d41]">${pkg.name}</div>
                <div class="text-sm text-gray-500">${pkg.destination} • ${pkg.duration} Days</div>
                <div class="text-sm font-bold text-orange-500">${formatPrice(pkg.price)}</div>
            </div>
        </div>
    `;
    
    // Set confirm button handler
    if (confirmBtn) {
        confirmBtn.onclick = async () => {
            // Try API first if it's a UUID (not a localStorage pkg_ id)
            if (packageId && !packageId.startsWith('pkg_')) {
                try {
                    await window.adminApi.deletePackage(packageId);
                    closeDeletePackageModal();
                    loadPackages();
                    showNotification('Package deleted successfully', 'success');
                    return;
                } catch (apiError) {
                    console.log('API delete error, falling back to localStorage:', apiError.message);
                }
            }
            
            // Fallback to localStorage
            deleteAdminPackage(packageId);
            closeDeletePackageModal();
            loadPackages();
            showNotification('Package deleted successfully', 'success');
        };
    }
    
    modal.classList.remove('hidden');
}

// Close delete confirmation modal
function closeDeletePackageModal() {
    const modal = document.getElementById('delete-package-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}
