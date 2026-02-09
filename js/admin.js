// --- Admin System ---

const ADMIN_KEY = 'avalmeos_admin';

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

// Package management
const ADMIN_PACKAGES_KEY = 'avalmeos_admin_packages';

function getAdminPackages() {
    return JSON.parse(localStorage.getItem(ADMIN_PACKAGES_KEY) || '{}');
}

function saveAdminPackages(packages) {
    localStorage.setItem(ADMIN_PACKAGES_KEY, JSON.stringify(packages));
}

function addAdminPackage(city, packageData) {
    const packages = getAdminPackages();
    packages[city] = packageData;
    saveAdminPackages(packages);
}

function updateAdminPackage(city, packageData) {
    const packages = getAdminPackages();
    if (packages[city]) {
        packages[city] = { ...packages[city], ...packageData };
        saveAdminPackages(packages);
    }
}

function deleteAdminPackage(city) {
    const packages = getAdminPackages();
    delete packages[city];
    saveAdminPackages(packages);
}

// Render package management
function renderPackageManagement() {
    const container = document.getElementById('package-management');
    if (!container) return;
    
    const packages = getAdminPackages();
    const cities = Object.keys(cityData);
    
    container.innerHTML = `
        <div class="mb-4">
            <button onclick="showAddPackageForm()" class="bg-[#1a4d41] text-white px-4 py-2 rounded-lg hover:bg-opacity-90">
                + Add New Package
            </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${cities.map(city => {
                const pkg = packageData[city];
                return `
                    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div class="font-bold text-[#1a4d41]">${city}</div>
                        <div class="text-sm text-gray-500">${pkg ? pkg.title : 'No package'}</div>
                        <div class="text-sm font-bold text-orange-500">${pkg ? pkg.price : '-'}</div>
                        <div class="flex gap-2 mt-3">
                            <button onclick="editPackage('${city}')" class="px-3 py-1 text-xs bg-blue-500 text-white rounded">Edit</button>
                            <button onclick="deletePackage('${city}')" class="px-3 py-1 text-xs bg-red-500 text-white rounded">Delete</button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Show add package form
function showAddPackageForm() {
    const modal = document.getElementById('package-form-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.getElementById('package-form-title').textContent = 'Add New Package';
        document.getElementById('package-form').reset();
    }
}

// Edit package
function editPackage(city) {
    const pkg = packageData[city];
    if (!pkg) return;
    
    const modal = document.getElementById('package-form-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.getElementById('package-form-title').textContent = `Edit ${city}`;
        document.getElementById('package-city').value = city;
        document.getElementById('package-title').value = pkg.title;
        document.getElementById('package-price').value = pkg.price;
        document.getElementById('package-details').value = pkg.details;
    }
}

// Delete package
function deletePackage(city) {
    if (confirm(`Are you sure you want to delete ${city} package?`)) {
        deleteAdminPackage(city);
        renderPackageManagement();
        showNotification('Package deleted', 'success');
    }
}

// Close package form modal
function closePackageFormModal() {
    const modal = document.getElementById('package-form-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Save package from form
function savePackageFromForm(formData) {
    const city = formData.city;
    const packageData = {
        title: formData.title,
        price: formData.price,
        details: formData.details,
        img: formData.img || 'Picture/default.jpg'
    };
    
    addAdminPackage(city, packageData);
    closePackageFormModal();
    renderPackageManagement();
    showNotification('Package saved successfully', 'success');
}
