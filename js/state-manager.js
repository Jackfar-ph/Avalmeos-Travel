/**
 * StateManager - Centralized State Management for Avalmeo's Travel
 * Provides reactive data binding, caching, optimistic updates, and sync with backend
 */

class StateManager {
    constructor() {
        // Private state storage
        this._state = {
            destinations: { items: [], loading: false, error: null, lastUpdated: null },
            activities: { items: [], loading: false, error: null, lastUpdated: null },
            packages: { items: [], loading: false, error: null, lastUpdated: null },
            bookings: { items: [], loading: false, error: null, lastUpdated: null },
            user: { current: null, loading: false, error: null },
            ui: { notifications: [], modals: {}, sidebarOpen: false }
        };

        // Subscribers for reactive updates
        this._subscribers = new Map();
        
        // Cache configuration
        this._cacheConfig = {
            destinations: { ttl: 5 * 60 * 1000, enabled: true }, // 5 minutes
            activities: { ttl: 5 * 60 * 1000, enabled: true },
            packages: { ttl: 5 * 60 * 1000, enabled: true },
            bookings: { ttl: 1 * 60 * 1000, enabled: true } // 1 minute
        };

        // Pending operations queue for offline support
        this._operationQueue = [];
        this._isOnline = navigator.onLine;
        
        // Initialize event listeners
        this._initEventListeners();
        
        // Load cached data from localStorage
        this._loadCachedData();
        
        console.log('StateManager initialized');
    }

    // ============================================
    // STATE GETTERS
    // ============================================

    get state() {
        return this._deepFreeze({ ...this._state });
    }

    getDestinations() {
        return this._state.destinations.items;
    }

    getActivities() {
        return this._state.activities.items;
    }

    getPackages() {
        return this._state.packages.items;
    }

    getBookings() {
        return this._state.bookings.items;
    }

    getCurrentUser() {
        return this._state.user.current;
    }

    isLoading(entity) {
        return this._state[entity]?.loading || false;
    }

    getError(entity) {
        return this._state[entity]?.error || null;
    }

    // ============================================
    // SUBSCRIPTION SYSTEM
    // ============================================

    /**
     * Subscribe to state changes for a specific entity
     * @param {string} entity - Entity name (destinations, activities, packages, etc.)
     * @param {function} callback - Callback function to call on changes
     * @returns {function} Unsubscribe function
     */
    subscribe(entity, callback) {
        if (!this._subscribers.has(entity)) {
            this._subscribers.set(entity, new Set());
        }
        this._subscribers.get(entity).add(callback);
        
        // Return unsubscribe function
        return () => {
            this._subscribers.get(entity)?.delete(callback);
        };
    }

    /**
     * Notify all subscribers of a state change
     * @param {string} entity - Entity that changed
     * @param {string} operation - Operation type (CREATE, UPDATE, DELETE)
     * @param {object} data - Changed data
     */
    _notify(entity, operation, data) {
        const subscribers = this._subscribers.get(entity);
        if (subscribers) {
            subscribers.forEach(callback => {
                try {
                    callback(operation, data, this._state[entity].items);
                } catch (error) {
                    console.error(`Error in subscriber callback for ${entity}:`, error);
                }
            });
        }
        
        // Also notify global subscribers
        const globalSubs = this._subscribers.get('*');
        if (globalSubs) {
            globalSubs.forEach(callback => {
                try {
                    callback(entity, operation, data);
                } catch (error) {
                    console.error('Error in global subscriber callback:', error);
                }
            });
        }
    }

    // ============================================
    // DATA FETCHING WITH CACHING
    // ============================================

    /**
     * Fetch destinations from API with caching
     * @param {object} options - Fetch options (forceRefresh, filters, etc.)
     */
    async fetchDestinations(options = {}) {
        const { forceRefresh = false, filters = {} } = options;
        
        // Check cache validity
        const cacheKey = 'destinations';
        const cacheConfig = this._cacheConfig[cacheKey];
        
        if (!forceRefresh && cacheConfig?.enabled) {
            const cached = this._getFromCache(cacheKey);
            if (cached && !this._isCacheExpired(cacheKey)) {
                this._state.destinations.items = cached;
                this._notify('destinations', 'CACHE_HIT', cached);
                return cached;
            }
        }

        // Set loading state
        this._setLoading('destinations', true);
        this._setError('destinations', null);

        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`/api/destinations${queryParams ? '?' + queryParams : ''}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this._state.destinations.items = data.data;
                this._state.destinations.lastUpdated = new Date().toISOString();
                
                // Update cache
                this._setToCache(cacheKey, data.data);
                
                this._notify('destinations', 'FETCH', data.data);
                return data.data;
            } else {
                throw new Error(data.message || 'Failed to fetch destinations');
            }
        } catch (error) {
            console.error('Error fetching destinations:', error);
            this._setError('destinations', error.message);
            this._notify('destinations', 'ERROR', error);
            throw error;
        } finally {
            this._setLoading('destinations', false);
        }
    }

    /**
     * Fetch activities from API with caching
     * @param {object} options - Fetch options
     */
    async fetchActivities(options = {}) {
        const { forceRefresh = false, filters = {} } = options;
        
        const cacheKey = 'activities';
        const cacheConfig = this._cacheConfig[cacheKey];
        
        if (!forceRefresh && cacheConfig?.enabled) {
            const cached = this._getFromCache(cacheKey);
            if (cached && !this._isCacheExpired(cacheKey)) {
                this._state.activities.items = cached;
                this._notify('activities', 'CACHE_HIT', cached);
                return cached;
            }
        }

        this._setLoading('activities', true);
        this._setError('activities', null);

        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`/api/activities${queryParams ? '?' + queryParams : ''}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this._state.activities.items = data.data;
                this._state.activities.lastUpdated = new Date().toISOString();
                
                this._setToCache(cacheKey, data.data);
                
                this._notify('activities', 'FETCH', data.data);
                return data.data;
            } else {
                throw new Error(data.message || 'Failed to fetch activities');
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            this._setError('activities', error.message);
            this._notify('activities', 'ERROR', error);
            throw error;
        } finally {
            this._setLoading('activities', false);
        }
    }

    /**
     * Fetch packages from API with caching
     * @param {object} options - Fetch options
     */
    async fetchPackages(options = {}) {
        const { forceRefresh = false, filters = {} } = options;
        
        const cacheKey = 'packages';
        const cacheConfig = this._cacheConfig[cacheKey];
        
        if (!forceRefresh && cacheConfig?.enabled) {
            const cached = this._getFromCache(cacheKey);
            if (cached && !this._isCacheExpired(cacheKey)) {
                this._state.packages.items = cached;
                this._notify('packages', 'CACHE_HIT', cached);
                return cached;
            }
        }

        this._setLoading('packages', true);
        this._setError('packages', null);

        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`/api/packages${queryParams ? '?' + queryParams : ''}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this._state.packages.items = data.data;
                this._state.packages.lastUpdated = new Date().toISOString();
                
                this._setToCache(cacheKey, data.data);
                
                this._notify('packages', 'FETCH', data.data);
                return data.data;
            } else {
                throw new Error(data.message || 'Failed to fetch packages');
            }
        } catch (error) {
            console.error('Error fetching packages:', error);
            this._setError('packages', error.message);
            this._notify('packages', 'ERROR', error);
            throw error;
        } finally {
            this._setLoading('packages', false);
        }
    }

    // ============================================
    // CRUD OPERATIONS WITH OPTIMISTIC UPDATES
    // ============================================

    /**
     * Create a new destination with optimistic update
     * @param {object} data - Destination data
     */
    async createDestination(data) {
        const tempId = this._generateTempId();
        const optimisticData = { ...data, id: tempId, created_at: new Date().toISOString() };
        
        // Optimistic update - add to state immediately
        this._state.destinations.items.unshift(optimisticData);
        this._notify('destinations', 'CREATE', optimisticData);
        
        // Queue operation for retry if needed
        const operation = {
            type: 'CREATE',
            entity: 'destinations',
            data,
            tempId,
            timestamp: Date.now()
        };

        try {
            const token = localStorage.getItem('avalmeos_token');
            const response = await fetch('/api/admin/destinations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                // Replace temp data with actual data from server
                this._replaceTempData('destinations', tempId, result.data);
                this._notify('destinations', 'CREATE_COMPLETE', result.data);
                return result.data;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error creating destination:', error);
            // Rollback optimistic update
            this._rollback('destinations', tempId);
            this._notify('destinations', 'CREATE_ERROR', { tempId, error });
            throw error;
        }
    }

    /**
     * Update a destination with optimistic update
     * @param {string} id - Destination ID
     * @param {object} data - Updated data
     */
    async updateDestination(id, data) {
        const previousData = this._state.destinations.items.find(item => item.id === id);
        
        if (!previousData) {
            throw new Error('Destination not found');
        }

        // Create backup for rollback
        const backup = { ...previousData };
        
        // Optimistic update
        const updatedData = { ...previousData, ...data, updated_at: new Date().toISOString() };
        const index = this._state.destinations.items.findIndex(item => item.id === id);
        this._state.destinations.items[index] = updatedData;
        this._notify('destinations', 'UPDATE', updatedData);

        try {
            const token = localStorage.getItem('avalmeos_token');
            const response = await fetch(`/api/admin/destinations/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                this._state.destinations.items[index] = result.data;
                this._notify('destinations', 'UPDATE_COMPLETE', result.data);
                return result.data;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error updating destination:', error);
            // Rollback to previous data
            this._state.destinations.items[index] = backup;
            this._notify('destinations', 'UPDATE_ERROR', { id, error, previousData: backup });
            throw error;
        }
    }

    /**
     * Delete a destination with optimistic update
     * @param {string} id - Destination ID
     */
    async deleteDestination(id) {
        const index = this._state.destinations.items.findIndex(item => item.id === id);
        
        if (index === -1) {
            throw new Error('Destination not found');
        }

        // Backup for rollback
        const deletedData = this._state.destinations.items[index];
        
        // Optimistic delete
        this._state.destinations.items.splice(index, 1);
        this._notify('destinations', 'DELETE', deletedData);

        try {
            const token = localStorage.getItem('avalmeos_token');
            const response = await fetch(`/api/admin/destinations/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                this._notify('destinations', 'DELETE_COMPLETE', deletedData);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error deleting destination:', error);
            // Rollback
            this._state.destinations.items.splice(index, 0, deletedData);
            this._notify('destinations', 'DELETE_ERROR', { id, error, restoredData: deletedData });
            throw error;
        }
    }

    // ============================================
    // ACTIVITY CRUD OPERATIONS
    // ============================================

    async createActivity(data) {
        const tempId = this._generateTempId();
        const optimisticData = { ...data, id: tempId, created_at: new Date().toISOString() };
        
        this._state.activities.items.unshift(optimisticData);
        this._notify('activities', 'CREATE', optimisticData);

        try {
            const token = localStorage.getItem('avalmeos_token');
            const response = await fetch('/api/admin/activities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            
            if (result.success) {
                this._replaceTempData('activities', tempId, result.data);
                this._notify('activities', 'CREATE_COMPLETE', result.data);
                return result.data;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            this._rollback('activities', tempId);
            this._notify('activities', 'CREATE_ERROR', { tempId, error });
            throw error;
        }
    }

    async updateActivity(id, data) {
        const previousData = this._state.activities.items.find(item => item.id === id);
        if (!previousData) throw new Error('Activity not found');

        const backup = { ...previousData };
        const index = this._state.activities.items.findIndex(item => item.id === id);
        const updatedData = { ...previousData, ...data, updated_at: new Date().toISOString() };
        
        this._state.activities.items[index] = updatedData;
        this._notify('activities', 'UPDATE', updatedData);

        try {
            const token = localStorage.getItem('avalmeos_token');
            const response = await fetch(`/api/admin/activities/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            
            if (result.success) {
                this._state.activities.items[index] = result.data;
                this._notify('activities', 'UPDATE_COMPLETE', result.data);
                return result.data;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            this._state.activities.items[index] = backup;
            this._notify('activities', 'UPDATE_ERROR', { id, error, previousData: backup });
            throw error;
        }
    }

    async deleteActivity(id) {
        const index = this._state.activities.items.findIndex(item => item.id === id);
        if (index === -1) throw new Error('Activity not found');

        const deletedData = this._state.activities.items[index];
        this._state.activities.items.splice(index, 1);
        this._notify('activities', 'DELETE', deletedData);

        try {
            const token = localStorage.getItem('avalmeos_token');
            const response = await fetch(`/api/admin/activities/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            
            if (result.success) {
                this._notify('activities', 'DELETE_COMPLETE', deletedData);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            this._state.activities.items.splice(index, 0, deletedData);
            this._notify('activities', 'DELETE_ERROR', { id, error, restoredData: deletedData });
            throw error;
        }
    }

    // ============================================
    // PACKAGE CRUD OPERATIONS
    // ============================================

    async createPackage(data) {
        const tempId = this._generateTempId();
        const optimisticData = { ...data, id: tempId, created_at: new Date().toISOString() };
        
        this._state.packages.items.unshift(optimisticData);
        this._notify('packages', 'CREATE', optimisticData);

        try {
            const token = localStorage.getItem('avalmeos_token');
            const response = await fetch('/api/admin/packages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            
            if (result.success) {
                this._replaceTempData('packages', tempId, result.data);
                this._notify('packages', 'CREATE_COMPLETE', result.data);
                return result.data;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            this._rollback('packages', tempId);
            this._notify('packages', 'CREATE_ERROR', { tempId, error });
            throw error;
        }
    }

    async updatePackage(id, data) {
        const previousData = this._state.packages.items.find(item => item.id === id);
        if (!previousData) throw new Error('Package not found');

        const backup = { ...previousData };
        const index = this._state.packages.items.findIndex(item => item.id === id);
        const updatedData = { ...previousData, ...data, updated_at: new Date().toISOString() };
        
        this._state.packages.items[index] = updatedData;
        this._notify('packages', 'UPDATE', updatedData);

        try {
            const token = localStorage.getItem('avalmeos_token');
            const response = await fetch(`/api/admin/packages/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            
            if (result.success) {
                this._state.packages.items[index] = result.data;
                this._notify('packages', 'UPDATE_COMPLETE', result.data);
                return result.data;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            this._state.packages.items[index] = backup;
            this._notify('packages', 'UPDATE_ERROR', { id, error, previousData: backup });
            throw error;
        }
    }

    async deletePackage(id) {
        const index = this._state.packages.items.findIndex(item => item.id === id);
        if (index === -1) throw new Error('Package not found');

        const deletedData = this._state.packages.items[index];
        this._state.packages.items.splice(index, 1);
        this._notify('packages', 'DELETE', deletedData);

        try {
            const token = localStorage.getItem('avalmeos_token');
            const response = await fetch(`/api/admin/packages/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            
            if (result.success) {
                this._notify('packages', 'DELETE_COMPLETE', deletedData);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            this._state.packages.items.splice(index, 0, deletedData);
            this._notify('packages', 'DELETE_ERROR', { id, error, restoredData: deletedData });
            throw error;
        }
    }

    // ============================================
    // REALTIME UPDATE HANDLERS
    // ============================================

    /**
     * Handle realtime CREATE event from Supabase
     * @param {string} entity - Entity type
     * @param {object} data - New data
     */
    handleRealtimeCreate(entity, data) {
        if (!this._state[entity]) return;
        
        // Check if already exists
        const exists = this._state[entity].items.some(item => item.id === data.id);
        if (exists) return;
        
        this._state[entity].items.unshift(data);
        this._notify(entity, 'REALTIME_CREATE', data);
        console.log(`[StateManager] ${entity} created via realtime:`, data.name || data.title);
    }

    /**
     * Handle realtime UPDATE event from Supabase
     * @param {string} entity - Entity type
     * @param {object} data - Updated data
     */
    handleRealtimeUpdate(entity, data) {
        if (!this._state[entity]) return;
        
        const index = this._state[entity].items.findIndex(item => item.id === data.id);
        if (index === -1) return;
        
        this._state[entity].items[index] = { ...this._state[entity].items[index], ...data };
        this._notify(entity, 'REALTIME_UPDATE', data);
        console.log(`[StateManager] ${entity} updated via realtime:`, data.name || data.title);
    }

    /**
     * Handle realtime DELETE event from Supabase
     * @param {string} entity - Entity type
     * @param {object} data - Deleted data
     */
    handleRealtimeDelete(entity, data) {
        if (!this._state[entity]) return;
        
        const index = this._state[entity].items.findIndex(item => item.id === data.id);
        if (index === -1) return;
        
        const deleted = this._state[entity].items.splice(index, 1)[0];
        this._notify(entity, 'REALTIME_DELETE', deleted);
        console.log(`[StateManager] ${entity} deleted via realtime:`, deleted.name || deleted.title);
    }

    // ============================================
    // PRIVATE HELPER METHODS
    // ============================================

    _setLoading(entity, loading) {
        if (this._state[entity]) {
            this._state[entity].loading = loading;
        }
    }

    _setError(entity, error) {
        if (this._state[entity]) {
            this._state[entity].error = error;
        }
    }

    _generateTempId() {
        return 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    _replaceTempData(entity, tempId, realData) {
        const index = this._state[entity].items.findIndex(item => item.id === tempId);
        if (index !== -1) {
            this._state[entity].items[index] = realData;
        }
    }

    _rollback(entity, tempId) {
        const index = this._state[entity].items.findIndex(item => item.id === tempId);
        if (index !== -1) {
            this._state[entity].items.splice(index, 1);
        }
    }

    _getFromCache(key) {
        try {
            const cached = localStorage.getItem(`state_${key}`);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Error reading from cache:', error);
            return null;
        }
    }

    _setToCache(key, data) {
        try {
            const cacheData = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(`state_${key}`, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error writing to cache:', error);
        }
    }

    _isCacheExpired(key) {
        const config = this._cacheConfig[key];
        if (!config || !config.enabled) return true;
        
        const cached = this._getFromCache(key);
        if (!cached) return true;
        
        return Date.now() - cached.timestamp > config.ttl;
    }

    _loadCachedData() {
        ['destinations', 'activities', 'packages', 'bookings'].forEach(key => {
            const cached = this._getFromCache(key);
            if (cached && !this._isCacheExpired(key)) {
                if (this._state[key]) {
                    this._state[key].items = cached.data;
                    this._state[key].lastUpdated = new Date(cached.timestamp).toISOString();
                }
            }
        });
    }

    _initEventListeners() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this._isOnline = true;
            this._processOperationQueue();
            this._notify('system', 'ONLINE', {});
        });

        window.addEventListener('offline', () => {
            this._isOnline = false;
            this._notify('system', 'OFFLINE', {});
        });
    }

    _processOperationQueue() {
        if (!this._isOnline || this._operationQueue.length === 0) return;
        
        console.log(`[StateManager] Processing ${this._operationQueue.length} queued operations`);
        
        // Process queued operations
        // This would typically retry failed operations
        this._operationQueue = [];
    }

    _deepFreeze(obj) {
        const keys = Object.keys(obj);
        keys.forEach(key => {
            if (obj[key] && typeof obj[key] === 'object') {
                obj[key] = this._deepFreeze(obj[key]);
            }
        });
        return Object.freeze(obj);
    }

    // ============================================
    // CACHE MANAGEMENT
    // ============================================

    /**
     * Clear all cached data
     */
    clearCache() {
        Object.keys(this._cacheConfig).forEach(key => {
            localStorage.removeItem(`state_${key}`);
        });
        this._state.destinations.lastUpdated = null;
        this._state.activities.lastUpdated = null;
        this._state.packages.lastUpdated = null;
        this._state.bookings.lastUpdated = null;
        console.log('[StateManager] Cache cleared');
    }

    /**
     * Force refresh all entities
     */
    async refreshAll() {
        this.clearCache();
        await Promise.all([
            this.fetchDestinations({ forceRefresh: true }),
            this.fetchActivities({ forceRefresh: true }),
            this.fetchPackages({ forceRefresh: true })
        ]);
    }

    /**
     * Get cache status for all entities
     */
    getCacheStatus() {
        const status = {};
        Object.keys(this._cacheConfig).forEach(key => {
            const cached = this._getFromCache(key);
            status[key] = {
                cached: !!cached,
                timestamp: cached ? new Date(cached.timestamp).toISOString() : null,
                age: cached ? Date.now() - cached.timestamp : null,
                ttl: this._cacheConfig[key].ttl,
                itemCount: cached?.data?.length || 0
            };
        });
        return status;
    }
}

// Create global instance
window.stateManager = new StateManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StateManager;
}
