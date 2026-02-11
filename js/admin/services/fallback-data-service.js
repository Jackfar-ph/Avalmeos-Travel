/**
 * Fallback Data Service
 * Provides data from data.js and localStorage when API is unavailable
 */

(function() {
    'use strict';
    
    const FallbackDataService = {
        /**
         * Get fallback data for a specific section
         */
        async getFallbackData(section) {
            const methods = {
                'dashboard': () => this.getDashboardData(),
                'destinations': () => this.getDestinations(),
                'activities': () => this.getActivities(),
                'packages': () => this.getPackages(),
                'bookings': () => this.getBookings(),
                'users': () => this.getUsers(),
                'inquiries': () => this.getInquiries(),
                'analytics': () => this.getAnalytics()
            };
            
            if (methods[section]) {
                return await methods[section]();
            }
            
            return { html: '<p>Section not found</p>', data: [] };
        },
        
        /**
         * Get dashboard stats
         */
        async getDashboardData() {
            const destinations = this.getDestinationsSync();
            const activities = this.getActivitiesSync();
            const bookings = this.getBookingsSync();
            
            const stats = {
                totalDestinations: destinations.length,
                totalActivities: activities.length,
                totalBookings: bookings.length,
                pendingBookings: bookings.filter(b => b.status === 'pending').length,
                totalRevenue: bookings
                    .filter(b => b.paymentStatus === 'paid')
                    .reduce((sum, b) => sum + (b.total || 0), 0)
            };
            
            return {
                html: this.renderDashboardStats(stats),
                data: stats
            };
        },
        
        /**
         * Get destinations (async)
         */
        async getDestinations() {
            return {
                html: this.renderDestinationsTable(this.getDestinationsSync()),
                data: this.getDestinationsSync()
            };
        },
        
        /**
         * Get destinations (sync - from data.js)
         */
        getDestinationsSync() {
            // Check if cityData is available from data.js
            if (typeof cityData !== 'undefined') {
                return Object.keys(cityData).map((city, index) => ({
                    id: `dest_${index + 1}`,
                    name: city,
                    activities_count: cityData[city].length,
                    is_active: true
                }));
            }
            
            // Fallback to default data
            return [
                { id: 'dest_1', name: 'Cebu City', activities_count: 4, is_active: true },
                { id: 'dest_2', name: 'Manila', activities_count: 4, is_active: true },
                { id: 'dest_3', name: 'Baguio', activities_count: 4, is_active: true },
                { id: 'dest_4', name: 'Davao City', activities_count: 4, is_active: true },
                { id: 'dest_5', name: 'Puerto Princesa', activities_count: 4, is_active: true },
                { id: 'dest_6', name: 'Iloilo', activities_count: 4, is_active: true }
            ];
        },
        
        /**
         * Get activities (async)
         */
        async getActivities() {
            return {
                html: this.renderActivitiesTable(this.getActivitiesSync()),
                data: this.getActivitiesSync()
            };
        },
        
        /**
         * Get activities (sync)
         */
        getActivitiesSync() {
            const activities = [];
            
            if (typeof cityData !== 'undefined') {
                Object.keys(cityData).forEach(city => {
                    cityData[city].forEach((activity, index) => {
                        activities.push({
                            id: `act_${city}_${index}`,
                            title: activity.title,
                            city: city,
                            price: activity.price,
                            rating: activity.rating,
                            img: activity.img,
                            is_active: true
                        });
                    });
                });
            }
            
            return activities;
        },
        
        /**
         * Get packages (async)
         */
        async getPackages() {
            return {
                html: this.renderPackagesTable(this.getPackagesSync()),
                data: this.getPackagesSync()
            };
        },
        
        /**
         * Get packages (sync)
         */
        getPackagesSync() {
            if (typeof packageData !== 'undefined') {
                return Object.keys(packageData).map((city, index) => ({
                    id: `pkg_${index + 1}`,
                    name: packageData[city].title,
                    destination: city,
                    price: packageData[city].price,
                    img: packageData[city].img,
                    is_active: true
                }));
            }
            
            return [
                { id: 'pkg_1', name: 'Cebu City Package Tour', destination: 'Cebu City', price: 8497, is_active: true },
                { id: 'pkg_2', name: 'Old Manila Heritage Tour', destination: 'Manila', price: 2399, is_active: true },
                { id: 'pkg_3', name: 'Baguio City Package', destination: 'Baguio', price: 5898, is_active: true },
                { id: 'pkg_4', name: 'Davao Highland Tour', destination: 'Davao City', price: 4198, is_active: true },
                { id: 'pkg_5', name: 'Puerto Princesa Package', destination: 'Puerto Princesa', price: 7198, is_active: true },
                { id: 'pkg_6', name: 'Iloilo City & Gigantes', destination: 'Iloilo', price: 6498, is_active: true }
            ];
        },
        
        /**
         * Get bookings (async)
         */
        async getBookings() {
            return {
                html: this.renderBookingsTable(this.getBookingsSync()),
                data: this.getBookingsSync()
            };
        },
        
        /**
         * Get bookings (sync - from localStorage)
         */
        getBookingsSync() {
            const bookingsKey = 'avalmeos_bookings';
            try {
                const bookings = localStorage.getItem(bookingsKey);
                if (bookings) {
                    return JSON.parse(bookings);
                }
            } catch (e) {
                console.warn('[FallbackData] Error reading bookings:', e);
            }
            
            return [];
        },
        
        /**
         * Get users (async)
         */
        async getUsers() {
            return {
                html: this.renderUsersTable(this.getUsersSync()),
                data: this.getUsersSync()
            };
        },
        
        /**
         * Get users (sync - from localStorage)
         */
        getUsersSync() {
            const usersKey = 'avalmeos_users';
            try {
                const users = localStorage.getItem(usersKey);
                if (users) {
                    const usersObj = JSON.parse(users);
                    return Object.values(usersObj);
                }
            } catch (e) {
                console.warn('[FallbackData] Error reading users:', e);
            }
            
            return [];
        },
        
        /**
         * Get inquiries (async)
         */
        async getInquiries() {
            return {
                html: this.renderInquiriesTable(this.getInquiriesSync()),
                data: this.getInquiriesSync()
            };
        },
        
        /**
         * Get inquiries (sync - from localStorage)
         */
        getInquiriesSync() {
            const inquiriesKey = 'avalmeos_inquiries';
            try {
                const inquiries = localStorage.getItem(inquiriesKey);
                if (inquiries) {
                    return JSON.parse(inquiries);
                }
            } catch (e) {
                console.warn('[FallbackData] Error reading inquiries:', e);
            }
            
            return [];
        },
        
        /**
         * Get analytics (async)
         */
        async getAnalytics() {
            const bookings = this.getBookingsSync();
            
            // Calculate analytics from bookings
            const analytics = {
                totalBookings: bookings.length,
                totalRevenue: bookings
                    .filter(b => b.paymentStatus === 'paid')
                    .reduce((sum, b) => sum + (b.total || 0), 0),
                bookingsByStatus: {
                    pending: bookings.filter(b => b.status === 'pending').length,
                    confirmed: bookings.filter(b => b.status === 'confirmed').length,
                    completed: bookings.filter(b => b.status === 'completed').length,
                    rejected: bookings.filter(b => b.status === 'rejected').length
                },
                bookingsTrend: this.calculateBookingsTrend(bookings)
            };
            
            return {
                html: this.renderAnalytics(analytics),
                data: analytics
            };
        },
        
        /**
         * Calculate bookings trend
         */
        calculateBookingsTrend(bookings) {
            const byDate = {};
            bookings.forEach(b => {
                const date = b.createdAt ? b.createdAt.split('T')[0] : new Date().toISOString().split('T')[0];
                byDate[date] = (byDate[date] || 0) + 1;
            });
            
            return byDate;
        },
        
        // ========== RENDER METHODS ==========
        
        renderDashboardStats(stats) {
            return `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div class="text-gray-500 text-sm">Total Destinations</div>
                        <div class="text-2xl font-bold text-[#1a4d41]">${stats.totalDestinations}</div>
                    </div>
                    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div class="text-gray-500 text-sm">Total Activities</div>
                        <div class="text-2xl font-bold text-[#1a4d41]">${stats.totalActivities}</div>
                    </div>
                    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div class="text-gray-500 text-sm">Total Bookings</div>
                        <div class="text-2xl font-bold text-[#1a4d41]">${stats.totalBookings}</div>
                    </div>
                    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div class="text-gray-500 text-sm">Pending Bookings</div>
                        <div class="text-2xl font-bold text-yellow-600">${stats.pendingBookings}</div>
                    </div>
                </div>
            `;
        },
        
        renderDestinationsTable(destinations) {
            if (!destinations || destinations.length === 0) {
                return `<div class="text-center py-8 text-gray-500">No destinations found</div>`;
            }
            
            return `
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activities</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            ${destinations.map(d => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-4 py-3 text-sm font-medium text-[#1a4d41]">${d.name || 'Unknown'}</td>
                                    <td class="px-4 py-3 text-sm text-gray-500">${d.activities_count || 0}</td>
                                    <td class="px-4 py-3">
                                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${d.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                                            ${d.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <button class="px-2 py-1 text-xs bg-[#1a4d41] text-white rounded hover:bg-opacity-90">Edit</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        },
        
        renderActivitiesTable(activities) {
            if (!activities || activities.length === 0) {
                return `<div class="text-center py-8 text-gray-500">No activities found</div>`;
            }
            
            return `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${activities.map(a => `
                        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <h4 class="font-bold text-[#1a4d41]">${a.title || 'Unknown'}</h4>
                            <p class="text-sm text-gray-500">${a.city || 'Unknown City'}</p>
                            <p class="text-orange-500 font-bold">₱${(a.price || 0).toLocaleString()}</p>
                            <p class="text-sm text-gray-500">★ ${a.rating || 'N/A'}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        },
        
        renderPackagesTable(packages) {
            if (!packages || packages.length === 0) {
                return `<div class="text-center py-8 text-gray-500">No packages found</div>`;
            }
            
            return `
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            ${packages.map(p => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-4 py-3 text-sm font-medium text-[#1a4d41]">${p.name || 'Unknown'}</td>
                                    <td class="px-4 py-3 text-sm text-gray-500">${p.destination || 'Unknown'}</td>
                                    <td class="px-4 py-3 text-sm font-bold text-orange-500">₱${(p.price || 0).toLocaleString()}</td>
                                    <td class="px-4 py-3">
                                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                                            ${p.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <button class="px-2 py-1 text-xs bg-[#1a4d41] text-white rounded hover:bg-opacity-90">Edit</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        },
        
        renderBookingsTable(bookings) {
            if (!bookings || bookings.length === 0) {
                return `<div class="text-center py-8 text-gray-500">No bookings found</div>`;
            }
            
            return `
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            ${bookings.map(b => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-4 py-3 text-sm font-mono">${(b.id || '').slice(0, 12)}...</td>
                                    <td class="px-4 py-3 text-sm">${b.guest_name || b.userName || 'Unknown'}</td>
                                    <td class="px-4 py-3 text-sm font-bold text-orange-500">₱${(b.total || 0).toLocaleString()}</td>
                                    <td class="px-4 py-3">
                                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                            ${b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                              b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                                              b.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                                              'bg-blue-100 text-blue-700'}">
                                            ${b.status || 'unknown'}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-sm text-gray-500">${b.createdAt ? b.createdAt.split('T')[0] : 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        },
        
        renderUsersTable(users) {
            if (!users || users.length === 0) {
                return `<div class="text-center py-8 text-gray-500">No users found</div>`;
            }
            
            return `
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            ${users.map(u => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-4 py-3 text-sm font-medium text-[#1a4d41]">${u.name || u.first_name || 'Unknown'}</td>
                                    <td class="px-4 py-3 text-sm text-gray-500">${u.email || 'Unknown'}</td>
                                    <td class="px-4 py-3">
                                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}">
                                            ${u.role || 'user'}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-sm text-gray-500">${u.createdAt ? u.createdAt.split('T')[0] : 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        },
        
        renderInquiriesTable(inquiries) {
            if (!inquiries || inquiries.length === 0) {
                return `<div class="text-center py-8 text-gray-500">No inquiries found</div>`;
            }
            
            return `
                <div class="space-y-4">
                    ${inquiries.map(i => `
                        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="font-bold text-[#1a4d41]">${i.name || 'Anonymous'}</h4>
                                    <p class="text-sm text-gray-500">${i.email || ''}</p>
                                    <p class="mt-2">${i.message || i.inquiry || ''}</p>
                                </div>
                                <span class="text-xs text-gray-400">${i.createdAt ? i.createdAt.split('T')[0] : ''}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        },
        
        renderAnalytics(analytics) {
            return `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div class="text-gray-500 text-sm">Total Bookings</div>
                        <div class="text-2xl font-bold text-[#1a4d41]">${analytics.totalBookings}</div>
                    </div>
                    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div class="text-gray-500 text-sm">Total Revenue</div>
                        <div class="text-2xl font-bold text-orange-500">₱${analytics.totalRevenue.toLocaleString()}</div>
                    </div>
                    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div class="text-gray-500 text-sm">Confirmed</div>
                        <div class="text-2xl font-bold text-green-600">${analytics.bookingsByStatus.confirmed}</div>
                    </div>
                    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div class="text-gray-500 text-sm">Pending</div>
                        <div class="text-2xl font-bold text-yellow-600">${analytics.bookingsByStatus.pending}</div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 class="font-bold text-[#1a4d41] mb-4">Booking Status Distribution</h3>
                    <div class="space-y-3">
                        ${Object.entries(analytics.bookingsByStatus).map(([status, count]) => `
                            <div class="flex items-center gap-3">
                                <span class="w-24 text-sm text-gray-600 capitalize">${status}</span>
                                <div class="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                                    <div class="h-full ${status === 'confirmed' ? 'bg-green-500' : status === 'pending' ? 'bg-yellow-500' : status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'}" style="width: ${analytics.totalBookings > 0 ? (count / analytics.totalBookings * 100) : 0}%"></div>
                                </div>
                                <span class="w-12 text-sm text-right font-medium">${count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    };
    
    // Export to global scope
    window.FallbackDataService = FallbackDataService;
    window.getFallbackData = async function(section) {
        return await FallbackDataService.getFallbackData(section);
    };
    
    console.log('[FallbackDataService] Initialized');
    
})();
