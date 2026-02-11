/**
 * RealtimeSync Service - HTTP Polling with BroadcastChannel
 * Handles data synchronization between admin panel and home page
 * Uses HTTP API polling and BroadcastChannel for cross-tab sync
 */

class RealtimeSync {
    constructor(options = {}) {
        this.tableName = options.tableName || 'destinations';
        this.onRealtimeChange = options.onRealtimeChange || (() => {});
        this.onConnectionChange = options.onConnectionChange || (() => {});
        
        // Connection state
        this.isConnected = false;
        this.connectionAttempts = 0;
        this.maxRetries = 3;
        this.retryDelay = 2000;
        
        // Polling configuration
        this.pollingEnabled = true;
        this.pollingInterval = options.pollingInterval || 30000; // 30 seconds
        this.pollingTimer = null;
        
        // BroadcastChannel for cross-tab sync
        this.broadcastChannel = null;
        this.isCrossTabSyncEnabled = true;
        
        // Last known state for change detection
        this.lastDataHash = null;
        
        // Event handlers
        this.eventHandlers = new Map();
        
        // Initialize
        this._init();
    }
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    async _init() {
        console.log('[RealtimeSync] Initializing...');
        
        try {
            // Initialize BroadcastChannel for cross-tab sync
            this._initBroadcastChannel();
            
            // Attempt initial data fetch
            await this._fetchAndCompare();
            
            // Start polling
            this._startPolling();
            
            // Mark as connected
            this.isConnected = true;
            console.log('[RealtimeSync] Initialization complete');
            
            // Notify connection status
            this._emit('connection', { status: 'connected' });
            
        } catch (error) {
            console.error('[RealtimeSync] Initialization error:', error);
            this._enableRetry();
        }
    }
    
    _initBroadcastChannel() {
        try {
            this.broadcastChannel = new BroadcastChannel('avalmeos-sync');
            this.broadcastChannel.onmessage = (event) => {
                if (event.data && event.data.type === 'DATA_CHANGE') {
                    console.log('[RealtimeSync] Received cross-tab sync message:', event.data);
                    this._handleRemoteChange(event.data);
                }
            };
            console.log('[RealtimeSync] BroadcastChannel initialized');
        } catch (error) {
            console.warn('[RealtimeSync] BroadcastChannel not available:', error);
            this.isCrossTabSyncEnabled = false;
        }
    }
    
    // ============================================
    // DATA FETCHING
    // ============================================
    
    async _fetchData() {
        const endpoints = {
            destinations: '/api/destinations',
            activities: '/api/activities',
            packages: '/api/packages'
        };
        
        const endpoint = endpoints[this.tableName] || endpoints.destinations;
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    }
    
    async _fetchAndCompare() {
        try {
            const data = await this._fetchData();
            const dataHash = this._hashData(data);
            
            // Always store initial hash on first load
            if (this.lastDataHash === null) {
                this.lastDataHash = dataHash;
                // Notify initial data load - call onRealtimeChange with 'INIT' type
                console.log('[RealtimeSync] Initial data loaded, notifying...');
                if (this.onRealtimeChange) {
                    this.onRealtimeChange('INIT', data);
                }
            } else if (dataHash !== this.lastDataHash) {
                // Data changed - notify listeners
                console.log('[RealtimeSync] Data changed, notifying...');
                this.lastDataHash = dataHash;
                
                // Call onRealtimeChange callback with data
                if (this.onRealtimeChange) {
                    this.onRealtimeChange('UPDATE', data);
                }
                
                // Also emit event for other listeners
                this._emit('data', {
                    table: this.tableName,
                    data: data
                });
            }
            
            this.connectionAttempts = 0;
            return data;
            
        } catch (error) {
            console.error('[RealtimeSync] Error fetching data:', error);
            this.connectionAttempts++;
            
            if (this.connectionAttempts >= this.maxRetries) {
                this._emit('connection', { status: 'disconnected', error: error.message });
            }
            
            throw error;
        }
    }
    
    _hashData(data) {
        // Simple hash function for change detection
        return JSON.stringify(data).split('').reduce((hash, char) => {
            return ((hash << 5) - hash) + char.charCodeAt(0);
        }, 0).toString();
    }
    
    // ============================================
    // POLLING
    // ============================================
    
    _startPolling() {
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
        }
        
        this.pollingTimer = setInterval(async () => {
            try {
                await this._fetchAndCompare();
            } catch (error) {
                console.error('[RealtimeSync] Polling error:', error);
            }
        }, this.pollingInterval);
        
        console.log(`[RealtimeSync] Polling started (${this.pollingInterval}ms)`);
    }
    
    _stopPolling() {
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
            this.pollingTimer = null;
            console.log('[RealtimeSync] Polling stopped');
        }
    }
    
    _enableRetry() {
        const delay = this.retryDelay * Math.pow(2, this.connectionAttempts);
        console.log(`[RealtimeSync] Retrying in ${delay}ms (attempt ${this.connectionAttempts}/${this.maxRetries})`);
        
        setTimeout(async () => {
            try {
                await this._fetchAndCompare();
                this.isConnected = true;
                this._startPolling();
                this._emit('connection', { status: 'connected' });
            } catch (error) {
                this._enableRetry();
            }
        }, delay);
    }
    
    // ============================================
    // CROSS-TAB SYNC
    // ============================================
    
    _broadcastChange(type, data) {
        if (this.isCrossTabSyncEnabled && this.broadcastChannel) {
            this.broadcastChannel.postMessage({
                type: 'DATA_CHANGE',
                table: this.tableName,
                changeType: type,
                data: data,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    _handleRemoteChange(message) {
        // Notify the registered callback
        if (this.onRealtimeChange) {
            this.onRealtimeChange(message.changeType, message.data);
        }
    }
    
    // ============================================
    // EVENT HANDLING
    // ============================================
    
    _emit(event, data) {
        // Notify registered handlers
        if (this.onConnectionChange && event === 'connection') {
            this.onConnectionChange(data);
        }
        
        // Store event for later
        this.eventHandlers.set(event, data);
    }
    
    on(event, handler) {
        if (event === 'connection' && this.onConnectionChange) {
            this.onConnectionChange = handler;
        }
    }
    
    // ============================================
    // PUBLIC API
    // ============================================
    
    /**
     * Subscribe to changes for a specific table
     */
    subscribe(tableName, callback) {
        if (this.tableName === tableName && callback) {
            const originalCallback = this.onRealtimeChange;
            this.onRealtimeChange = (type, data) => {
                originalCallback(type, data);
                callback(type, data);
            };
        }
    }
    
    /**
     * Force refresh data
     */
    async refresh() {
        this.lastDataHash = null; // Force refresh
        return this._fetchAndCompare();
    }
    
    /**
     * Stop synchronization
     */
    disconnect() {
        console.log('[RealtimeSync] Disconnecting...');
        this._stopPolling();
        
        if (this.broadcastChannel) {
            this.broadcastChannel.close();
            this.broadcastChannel = null;
        }
        
        this.isConnected = false;
        this._emit('connection', { status: 'disconnected' });
    }
    
    /**
     * Restart synchronization
     */
    reconnect() {
        console.log('[RealtimeSync] Reconnecting...');
        this.connectionAttempts = 0;
        this._init();
    }
    
    /**
     * Update polling interval
     */
    setPollingInterval(interval) {
        this.pollingInterval = interval;
        if (this.isConnected) {
            this._stopPolling();
            this._startPolling();
        }
    }
}

// Create and export global instance factory
window.RealtimeSync = RealtimeSync;
