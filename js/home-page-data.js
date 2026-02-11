/**
 * Home Page Data Service
 * Handles dynamic data fetching and real-time updates for the home page
 * 
 * USAGE:
 * - This is a singleton service. Use window.homePageDataService to access it.
 * - Initialize with: window.homePageDataService.init()
 * - Load destinations with: window.homePageDataService.loadDestinations()
 * - Get destinations with: window.homePageDataService.getDestinations()
 */

class HomePageDataService {
    constructor() {
        this.initialized = false;
        this.initializing = false;
        this.dataSources = {
            destinations: null,
            activities: null,
            packages: null
        };
        
        // Configuration
        this.refreshInterval = 60000; // Auto-refresh every 60 seconds
        this.refreshTimer = null;
        
        // Don't auto-initialize - wait for explicit init() call
        console.log('[HomePageData] Service created. Call init() to initialize.');
    }

    // Singleton instance getter
    static getInstance() {
        if (!window._homePageDataServiceInstance) {
            window._homePageDataServiceInstance = new HomePageDataService();
        }
        return window._homePageDataServiceInstance;
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    async init() {
        // Prevent multiple simultaneous initializations
        if (this.initialized) {
            console.log('[HomePageData] Already initialized');
            return;
        }
        
        if (this.initializing) {
            console.log('[HomePageData] Initialization in progress...');
            return;
        }
        
        this.initializing = true;
        console.log('[HomePageData] Initializing...');

        try {
            // Load initial data
            await this.loadAllData();
            
            // Set up real-time subscriptions
            this.setupRealtimeSubscriptions();
            
            // Set up auto-refresh
            this.startAutoRefresh();
            
            this.initialized = true;
            this.initializing = false;
            console.log('[HomePageData] Initialization complete');
            
        } catch (error) {
            this.initializing = false;
            console.error('[HomePageData] Initialization error:', error);
        }
    }

    // ============================================
    // DATA LOADING
    // ============================================

    async loadAllData() {
        console.log('[HomePageData] Loading all data...');
        
        try {
            console.log('[HomePageData] About to load destinations...');
            // Load destinations
            await this.loadDestinations();
            console.log('[HomePageData] Destinations loaded successfully');
            
            console.log('[HomePageData] About to load activities...');
            // Load activities
            await this.loadActivities();
            console.log('[HomePageData] Activities loaded successfully');
            
            console.log('[HomePageData] About to load packages...');
            // Load packages
            await this.loadPackages();
            console.log('[HomePageData] Packages loaded successfully');
            
            // Dispatch event that data is ready
            document.dispatchEvent(new CustomEvent('homePageDataReady'));
            
            console.log('[HomePageData] All data loaded');
            
        } catch (error) {
            console.error('[HomePageData] Error loading data:', error);
            console.error('[HomePageData] Error stack:', error.stack);
            // Still dispatch event even on error so UI can handle it
            document.dispatchEvent(new CustomEvent('homePageDataReady'));
        }
    }

    async loadDestinations() {
        console.log('[HomePageData] Loading destinations...');
        
        try {
            const response = await fetch('/api/destinations?is_active=true');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.dataSources.destinations = data.data;
                console.log(`[HomePageData] Loaded ${data.data.length} destinations`);
                
                // Update StateManager
                if (window.stateManager) {
                    window.stateManager._state.destinations.items = data.data;
                    window.stateManager._state.destinations.lastUpdated = new Date().toISOString();
                }
                
                return data.data;
            } else {
                throw new Error(data.message || 'Failed to load destinations');
            }
        } catch (error) {
            console.error('[HomePageData] Error loading destinations:', error);
            throw error;
        }
    }

    async loadActivities() {
        console.log('[HomePageData] Loading activities...');
        
        try {
            const response = await fetch('/api/activities?is_active=true');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.dataSources.activities = data.data;
                console.log(`[HomePageData] Loaded ${data.data.length} activities`);
                
                // Update StateManager
                if (window.stateManager) {
                    window.stateManager._state.activities.items = data.data;
                    window.stateManager._state.activities.lastUpdated = new Date().toISOString();
                }
                
                return data.data;
            } else {
                throw new Error(data.message || 'Failed to load activities');
            }
        } catch (error) {
            console.error('[HomePageData] Error loading activities:', error);
            throw error;
        }
    }

    async loadPackages() {
        console.log('[HomePageData] Loading packages...');
        
        try {
            const response = await fetch('/api/packages?is_active=true');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.dataSources.packages = data.data;
                console.log(`[HomePageData] Loaded ${data.data.length} packages`);
                
                // Update StateManager
                if (window.stateManager) {
                    window.stateManager._state.packages.items = data.data;
                    window.stateManager._state.packages.lastUpdated = new Date().toISOString();
                }
                
                return data.data;
            } else {
                throw new Error(data.message || 'Failed to load packages');
            }
        } catch (error) {
            console.error('[HomePageData] Error loading packages:', error);
            throw error;
        }
    }

    // ============================================
    // REAL-TIME SUBSCRIPTIONS
    // ============================================

    setupRealtimeSubscriptions() {
        console.log('[HomePageData] Setting up real-time subscriptions...');
        
        // Set up BroadcastChannel for cross-tab sync
        try {
            this.broadcastChannel = new BroadcastChannel('avalmeos-sync');
            this.broadcastChannel.onmessage = (event) => {
                if (event.data && event.data.type === 'DATA_CHANGE') {
                    console.log('[HomePageData] Received data change:', event.data);
                    this.handleRemoteDataChange(event.data);
                }
            };
            console.log('[HomePageData] BroadcastChannel initialized');
        } catch (error) {
            console.warn('[HomePageData] BroadcastChannel not available:', error);
        }
        
        // Subscribe to destination changes
        if (window.stateManager) {
            window.stateManager.subscribe('destinations', (operation, data) => {
                this.handleDestinationChange(operation, data);
            });
        }
        
        // Subscribe to activity changes
        if (window.stateManager) {
            window.stateManager.subscribe('activities', (operation, data) => {
                this.handleActivityChange(operation, data);
            });
        }
        
        // Subscribe to package changes
        if (window.stateManager) {
            window.stateManager.subscribe('packages', (operation, data) => {
                this.handlePackageChange(operation, data);
            });
        }
        
        // Subscribe to realtime sync events
        if (window.realtimeSync) {
            window.realtimeSync.on('change', (event) => {
                this.handleRealtimeChange(event);
            });
        }
    }
    
    handleRemoteDataChange(data) {
        console.log('[HomePageData] Handling remote data change:', data);
        
        // Reload data from server to get fresh data (use 'table' from notifyDataChange)
        const entityType = data.table || data.entityType;
        switch (entityType) {
            case 'destinations':
                this.loadDestinations().then(data => {
                    this.renderDestinations();
                    // Show notification
                    this.showDataUpdateNotification('destinations');
                });
                break;
            case 'activities':
                this.loadActivities().then(data => {
                    this.renderActivities();
                    this.showDataUpdateNotification('activities');
                });
                break;
            case 'packages':
                this.loadPackages().then(data => {
                    this.renderPackages();
                    this.showDataUpdateNotification('packages');
                });
                break;
        }
    }
    
    showDataUpdateNotification(entityType) {
        // Dispatch custom event for UI to handle notification
        window.dispatchEvent(new CustomEvent('dataUpdated', {
            detail: { entityType }
        }));
    }

    handleDestinationChange(operation, data) {
        console.log(`[HomePageData] Destination ${operation}:`, data);
        
        switch (operation) {
            case 'CREATE':
            case 'REALTIME_CREATE':
                if (!this.dataSources.destinations.find(d => d.id === data.id)) {
                    this.dataSources.destinations.unshift(data);
                    this.renderDestinations();
                }
                break;
                
            case 'UPDATE':
            case 'REALTIME_UPDATE':
                const destIndex = this.dataSources.destinations.findIndex(d => d.id === data.id);
                if (destIndex !== -1) {
                    this.dataSources.destinations[destIndex] = { ...this.dataSources.destinations[destIndex], ...data };
                    this.renderDestinations();
                }
                break;
                
            case 'DELETE':
            case 'REALTIME_DELETE':
                this.dataSources.destinations = this.dataSources.destinations.filter(d => d.id !== data.id);
                this.renderDestinations();
                break;
        }
        
        // Show notification for changes
        this.showDataChangeNotification('destination', operation, data.name);
    }

    handleActivityChange(operation, data) {
        console.log(`[HomePageData] Activity ${operation}:`, data);
        
        switch (operation) {
            case 'CREATE':
            case 'REALTIME_CREATE':
                if (!this.dataSources.activities.find(a => a.id === data.id)) {
                    this.dataSources.activities.unshift(data);
                    this.renderActivities();
                }
                break;
                
            case 'UPDATE':
            case 'REALTIME_UPDATE':
                const actIndex = this.dataSources.activities.findIndex(a => a.id === data.id);
                if (actIndex !== -1) {
                    this.dataSources.activities[actIndex] = { ...this.dataSources.activities[actIndex], ...data };
                    this.renderActivities();
                }
                break;
                
            case 'DELETE':
            case 'REALTIME_DELETE':
                this.dataSources.activities = this.dataSources.activities.filter(a => a.id !== data.id);
                this.renderActivities();
                break;
        }
        
        this.showDataChangeNotification('activity', operation, data.name);
    }

    handlePackageChange(operation, data) {
        console.log(`[HomePageData] Package ${operation}:`, data);
        
        switch (operation) {
            case 'CREATE':
            case 'REALTIME_CREATE':
                if (!this.dataSources.packages.find(p => p.id === data.id)) {
                    this.dataSources.packages.unshift(data);
                    this.renderPackages();
                }
                break;
                
            case 'UPDATE':
            case 'REALTIME_UPDATE':
                const pkgIndex = this.dataSources.packages.findIndex(p => p.id === data.id);
                if (pkgIndex !== -1) {
                    this.dataSources.packages[pkgIndex] = { ...this.dataSources.packages[pkgIndex], ...data };
                    this.renderPackages();
                }
                break;
                
            case 'DELETE':
            case 'REALTIME_DELETE':
                this.dataSources.packages = this.dataSources.packages.filter(p => p.id !== data.id);
                this.renderPackages();
                break;
        }
        
        this.showDataChangeNotification('package', operation, data.name);
    }

    handleRealtimeChange(event) {
        console.log('[HomePageData] Realtime change:', event);
        
        // Show subtle notification
        if (window.showNotification) {
            window.showNotification(`New ${event.entity} data available`, 'info', 3000);
        }
    }

    // ============================================
    // RENDERING METHODS
    // ============================================

    renderDestinations() {
        const container = document.getElementById('destinations-container');
        if (!container) {
            return;
        }
        
        // Check if we have data
        if (!this.dataSources.destinations || this.dataSources.destinations.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">No destinations found</div>';
            return;
        }
        
        // Render destinations with consistent styling
        container.innerHTML = this.dataSources.destinations.map(dest => `
            <div onclick="navigateToCity('${encodeURIComponent(dest.name)}')" class="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer shadow-lg hover:shadow-xl transition-all">
                <img src="${dest.hero_image || 'Picture/placeholder.jpg'}" 
                     class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                     onerror="this.src='Picture/placeholder.jpg'"
                     alt="${dest.name}">
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div class="absolute bottom-5 left-5 text-white">
                    <p class="text-xs uppercase tracking-widest opacity-80">${dest.region || 'Philippines'}</p>
                    <h3 class="font-bold text-lg">${dest.name}</h3>
                </div>
            </div>
        `).join('');
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('destinationsRendered'));
    }

    renderActivities() {
        const container = document.getElementById('activities-container');
        if (!container || !this.dataSources.activities) {
            return;
        }
        
        // Render activities
        container.innerHTML = this.dataSources.activities.map(activity => `
            <div class="activity-card" data-id="${activity.id}">
                <img src="${activity.hero_image || 'Picture/placeholder.jpg'}" 
                     alt="${activity.name}"
                     onerror="this.src='Picture/placeholder.jpg'">
                <div class="activity-info">
                    <h4>${activity.name}</h4>
                    <p class="price">${this.formatPrice(activity.price)}</p>
                    <p class="rating">★ ${activity.average_rating || 'N/A'}</p>
                </div>
            </div>
        `).join('');
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('activitiesRendered'));
    }

    renderPackages() {
        const container = document.getElementById('packages-container');
        if (!container || !this.dataSources.packages) {
            return;
        }
        
        // Render packages
        container.innerHTML = this.dataSources.packages.map(pkg => `
            <div class="package-card" data-id="${pkg.id}">
                <img src="${pkg.hero_image || 'Picture/placeholder.jpg'}" 
                     alt="${pkg.name}"
                     onerror="this.src='Picture/placeholder.jpg'">
                <div class="package-info">
                    <h4>${pkg.name}</h4>
                    <p class="duration">${pkg.duration} Days</p>
                    <p class="price">From ${this.formatPrice(pkg.price)}</p>
                    <button class="btn-book" onclick="openBookingModal('${pkg.name}')">Book Full Package</button>
                </div>
            </div>
        `).join('');
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('packagesRendered'));
    }

    // ============================================
    // AUTO-REFRESH
    // ============================================

    startAutoRefresh() {
        console.log(`[HomePageData] Starting auto-refresh every ${this.refreshInterval}ms`);
        
        this.refreshTimer = setInterval(async () => {
            console.log('[HomePageData] Auto-refreshing data...');
            
            try {
                await this.loadAllData();
            } catch (error) {
                console.error('[HomePageData] Auto-refresh error:', error);
            }
        }, this.refreshInterval);
    }

    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
            console.log('[HomePageData] Auto-refresh stopped');
        }
    }

    setRefreshInterval(interval) {
        if (interval < 10000) {
            console.warn('[HomePageData] Refresh interval must be at least 10 seconds');
            interval = 10000;
        }
        
        this.refreshInterval = interval;
        
        // Restart with new interval
        this.stopAutoRefresh();
        this.startAutoRefresh();
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    formatPrice(price, currency = 'PHP') {
        if (!price) return 'Contact us';
        
        const formatter = new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        
        return formatter.format(price);
    }

    showDataChangeNotification(entity, operation, name) {
        if (!window.showNotification) return;
        
        const operationText = {
            'CREATE': 'added',
            'UPDATE': 'updated',
            'DELETE': 'removed'
        };
        
        const message = `${entity.charAt(0).toUpperCase() + entity.slice(1)} "${name}" has been ${operationText[operation]}`;
        
        window.showNotification(message, 'info', 5000);
    }

    // ============================================
    // DATA ACCESS
    // ============================================

    getDestinations() {
        return this.dataSources.destinations || [];
    }

    getActivities() {
        return this.dataSources.activities || [];
    }

    getPackages() {
        return this.dataSources.packages || [];
    }

    getFeaturedDestinations() {
        return (this.dataSources.destinations || []).filter(d => d.is_featured);
    }

    getFeaturedActivities() {
        return (this.dataSources.activities || []).filter(a => a.is_featured);
    }

    getFeaturedPackages() {
        return (this.dataSources.packages || []).filter(p => p.is_featured);
    }

    getDestinationById(id) {
        return (this.dataSources.destinations || []).find(d => d.id === id);
    }

    getActivityById(id) {
        return (this.dataSources.activities || []).find(a => a.id === id);
    }

    getPackageById(id) {
        return (this.dataSources.packages || []).find(p => p.id === id);
    }

    // ============================================
    // CLEANUP
    // ============================================

    destroy() {
        console.log('[HomePageData] Destroying...');
        
        // Stop auto-refresh
        this.stopAutoRefresh();
        
        // Unsubscribe from realtime
        if (window.realtimeSync) {
            window.realtimeSync.disconnect();
        }
        
        this.initialized = false;
        this.dataSources = {
            destinations: null,
            activities: null,
            packages: null
        };
        
        console.log('[HomePageData] Destroyed');
    }
}

// Create global singleton instance (not auto-initialized)
window.homePageDataService = HomePageDataService.getInstance();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HomePageDataService;
}
