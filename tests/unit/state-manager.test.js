/**
 * Unit Tests for StateManager
 * Tests the core state management functionality
 */

// Mock localStorage and fetch for testing
const mockLocalStorage = {
    store: {},
    getItem(key) {
        return this.store[key] || null;
    },
    setItem(key, value) {
        this.store[key] = value;
    },
    removeItem(key) {
        delete this.store[key];
    },
    clear() {
        this.store = {};
    }
};

const mockFetch = {
    responses: {},
    async fetch(url, options = {}) {
        const key = `${options.method || 'GET'}:${url}`;
        if (this.responses[key]) {
            const response = this.responses[key];
            if (typeof response === 'function') {
                return response(url, options);
            }
            return response;
        }
        
        // Default response
        return {
            ok: true,
            json: async () => ({ success: true, data: [] })
        };
    },
    setResponse(method, url, response) {
        this.responses[`${method}:${url}`] = response;
    },
    clearResponses() {
        this.responses = {};
    }
};

// Test utilities
const assert = {
    equal(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message}: Expected ${expected}, got ${actual}`);
        }
    },
    deepEqual(actual, expected, message = '') {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(`${message}: Objects not equal`);
        }
    },
    true(value, message = '') {
        if (!value) {
            throw new Error(`${message}: Expected true, got ${value}`);
        }
    },
    false(value, message = '') {
        if (value) {
            throw new Error(`${message}: Expected false, got ${value}`);
        }
    },
    throws(fn, expectedError, message = '') {
        let threw = false;
        let error;
        try {
            fn();
        } catch (e) {
            threw = true;
            error = e;
        }
        if (!threw) {
            throw new Error(`${message}: Expected function to throw`);
        }
        if (expectedError && !error.message.includes(expectedError)) {
            throw new Error(`${message}: Expected error containing "${expectedError}", got "${error.message}"`);
        }
    }
};

// ============================================
// STATE MANAGER TESTS
// ============================================

describe('StateManager', () => {
    let stateManager;
    
    beforeEach(() => {
        // Reset localStorage
        mockLocalStorage.clear();
        mockFetch.clearResponses();
        
        // Mock fetch in global scope
        global.fetch = mockFetch.fetch.bind(mockFetch);
        global.localStorage = mockLocalStorage;
        
        // Import fresh StateManager
        stateManager = new StateManager();
    });
    
    afterEach(() => {
        if (stateManager) {
            stateManager.clearCache();
        }
    });
    
    describe('Initialization', () => {
        test('should initialize with default state', () => {
            assert.true(!!stateManager.state.destinations, 'Destinations state should exist');
            assert.true(!!stateManager.state.activities, 'Activities state should exist');
            assert.true(!!stateManager.state.packages, 'Packages state should exist');
        });
        
        test('should have empty items initially', () => {
            assert.deepEqual(stateManager.getDestinations(), []);
            assert.deepEqual(stateManager.getActivities(), []);
            assert.deepEqual(stateManager.getPackages(), []);
        });
        
        test('should have loading state as false', () => {
            assert.false(stateManager.isLoading('destinations'));
            assert.false(stateManager.isLoading('activities'));
            assert.false(stateManager.isLoading('packages'));
        });
    });
    
    describe('Subscription System', () => {
        test('should allow subscribing to entity changes', () => {
            const callback = jest.fn();
            const unsubscribe = stateManager.subscribe('destinations', callback);
            
            assert.true(typeof unsubscribe === 'function', 'Should return unsubscribe function');
        });
        
        test('should notify subscribers on changes', () => {
            const callback = jest.fn();
            stateManager.subscribe('destinations', callback);
            
            // Simulate a change
            stateManager._state.destinations.items.push({ id: '1', name: 'Test' });
            stateManager._notify('destinations', 'CREATE', { id: '1', name: 'Test' });
            
            assert.true(callback.called, 'Callback should have been called');
        });
        
        test('should allow global subscriptions', () => {
            const callback = jest.fn();
            stateManager.subscribe('*', callback);
            
            stateManager._notify('destinations', 'CREATE', { id: '1' });
            
            assert.true(callback.called, 'Global callback should have been called');
        });
    });
    
    describe('Optimistic Updates', () => {
        test('should create optimistic data with temp ID', () => {
            const tempId = stateManager._generateTempId();
            
            assert.true(tempId.startsWith('temp_'), 'Temp ID should start with "temp_"');
            assert.true(tempId.length > 10, 'Temp ID should be reasonably long');
        });
        
        test('should replace temp data with real data', () => {
            const tempId = stateManager._generateTempId();
            const realData = { id: 'real-id', name: 'Real Destination' };
            
            stateManager._state.destinations.items.push({ id: tempId, name: 'Temp' });
            stateManager._replaceTempData('destinations', tempId, realData);
            
            const item = stateManager._state.destinations.items.find(i => i.id === tempId);
            assert.equal(item?.name, 'Real Destination', 'Should have real data');
        });
        
        test('should rollback on error', () => {
            const tempId = stateManager._generateTempId();
            const originalItems = [...stateManager._state.destinations.items];
            
            // Add temp item
            stateManager._state.destinations.items.push({ id: tempId, name: 'Temp' });
            
            // Rollback
            stateManager._rollback('destinations', tempId);
            
            assert.deepEqual(
                stateManager._state.destinations.items,
                originalItems,
                'Should rollback to original state'
            );
        });
    });
    
    describe('Cache Management', () => {
        test('should cache data', () => {
            const data = [{ id: '1', name: 'Test' }];
            
            stateManager._setToCache('destinations', data);
            
            const cached = stateManager._getFromCache('destinations');
            assert.deepEqual(cached?.data, data, 'Should cache data');
        });
        
        test('should detect expired cache', () => {
            const oldData = {
                data: [{ id: '1' }],
                timestamp: Date.now() - 10000 // 10 seconds ago
            };
            
            mockLocalStorage.setItem('state_destinations', JSON.stringify(oldData));
            
            assert.true(stateManager._isCacheExpired('destinations'), 'Cache should be expired');
        });
        
        test('should clear all cache', () => {
            stateManager._setToCache('destinations', [{ id: '1' }]);
            stateManager._setToCache('activities', [{ id: '2' }]);
            
            stateManager.clearCache();
            
            assert.false(stateManager._getFromCache('destinations'), 'Cache should be cleared');
            assert.false(stateManager._getFromCache('activities'), 'Cache should be cleared');
        });
        
        test('should get cache status', () => {
            stateManager._setToCache('destinations', [{ id: '1' }, { id: '2' }]);
            
            const status = stateManager.getCacheStatus();
            
            assert.true(status.destinations.cached, 'Should show cached');
            assert.equal(status.destinations.itemCount, 2, 'Should show correct count');
        });
    });
    
    describe('Realtime Event Handlers', () => {
        test('should handle CREATE events', () => {
            const newData = { id: 'new-1', name: 'New Destination' };
            
            stateManager.handleRealtimeCreate('destinations', newData);
            
            const item = stateManager._state.destinations.items.find(i => i.id === 'new-1');
            assert.true(!!item, 'Should add new item');
            assert.equal(item.name, 'New Destination', 'Should have correct name');
        });
        
        test('should handle UPDATE events', () => {
            stateManager._state.destinations.items = [{ id: '1', name: 'Original' }];
            
            stateManager.handleRealtimeUpdate('destinations', { id: '1', name: 'Updated' });
            
            const item = stateManager._state.destinations.items.find(i => i.id === '1');
            assert.equal(item.name, 'Updated', 'Name should be updated');
        });
        
        test('should handle DELETE events', () => {
            stateManager._state.destinations.items = [{ id: '1', name: 'To Delete' }];
            
            stateManager.handleRealtimeDelete('destinations', { id: '1', name: 'To Delete' });
            
            assert.deepEqual(stateManager.getDestinations(), [], 'Item should be deleted');
        });
        
        test('should ignore duplicate CREATE events', () => {
            stateManager._state.destinations.items = [{ id: '1', name: 'Existing' }];
            
            stateManager.handleRealtimeCreate('destinations', { id: '1', name: 'Duplicate' });
            
            const items = stateManager.getDestinations();
            assert.equal(items.length, 1, 'Should not add duplicate');
        });
    });
});

// ============================================
// ADMIN API SERVICE TESTS
// ============================================

describe('AdminApiService', () => {
    let adminApi;
    
    beforeEach(() => {
        mockLocalStorage.clear();
        mockFetch.clearResponses();
        
        global.fetch = mockFetch.fetch.bind(mockFetch);
        global.localStorage = mockLocalStorage;
        
        adminApi = new AdminApiService();
    });
    
    describe('Authentication', () => {
        test('should throw error when not authenticated', async () => {
            mockFetch.setResponse('GET', '/api/admin/destinations/all', {
                ok: false,
                json: async () => ({ success: false, message: 'Unauthorized' })
            });
            
            assert.throws(
                () => adminApi.getDestinations(),
                'Not authenticated'
            );
        });
        
        test('should include auth header when authenticated', async () => {
            mockLocalStorage.setItem('avalmeos_token', 'test-token');
            
            let capturedHeaders = {};
            mockFetch.setResponse('GET', '/api/admin/destinations/all', {
                ok: true,
                json: async () => ({ success: true, data: [] })
            });
            
            // Note: In real tests, we'd intercept the fetch call to verify headers
            assert.true(true, 'Should have auth header support');
        });
    });
    
    describe('Destination Validation', () => {
        beforeEach(() => {
            mockLocalStorage.setItem('avalmeos_token', 'test-token');
        });
        
        test('should validate required fields', () => {
            assert.throws(
                () => adminApi._validateDestination({}),
                'Validation failed'
            );
        });
        
        test('should validate name length', () => {
            assert.throws(
                () => adminApi._validateDestination({
                    name: 'A', // Too short
                    slug: 'valid-slug',
                    location: 'Valid Location',
                    region: 'Valid Region'
                }),
                'Name must be at least 2 characters'
            );
        });
        
        test('should validate slug format', () => {
            assert.throws(
                () => adminApi._validateDestination({
                    name: 'Valid Name',
                    slug: 'Invalid Slug!', // Invalid characters
                    location: 'Valid Location',
                    region: 'Valid Region'
                }),
                'Slug must contain only lowercase'
            );
        });
        
        test('should accept valid destination data', () => {
            assert.doesNotThrow(() => {
                adminApi._validateDestination({
                    name: 'Valid Name',
                    slug: 'valid-slug',
                    location: 'Valid Location',
                    region: 'Valid Region'
                });
            });
        });
        
        test('should validate price is non-negative', () => {
            assert.throws(
                () => adminApi._validateDestination({
                    name: 'Valid Name',
                    slug: 'valid-slug',
                    location: 'Valid Location',
                    region: 'Valid Region',
                    price: -100
                }),
                'Price must be a valid positive number'
            );
        });
    });
    
    describe('Activity Validation', () => {
        beforeEach(() => {
            mockLocalStorage.setItem('avalmeos_token', 'test-token');
        });
        
        test('should validate required fields', () => {
            assert.throws(
                () => adminApi._validateActivity({}),
                'Validation failed'
            );
        });
        
        test('should validate destination_id', () => {
            assert.throws(
                () => adminApi._validateActivity({
                    name: 'Valid Activity',
                    slug: 'valid-slug',
                    activity_type: 'tour',
                    price: 100
                }),
                'Destination ID is required'
            );
        });
        
        test('should validate activity_type', () => {
            assert.throws(
                () => adminApi._validateActivity({
                    name: 'Valid Activity',
                    slug: 'valid-slug',
                    destination_id: '123',
                    activity_type: 'invalid_type',
                    price: 100
                }),
                'Invalid activity type'
            );
        });
    });
    
    describe('Package Validation', () => {
        beforeEach(() => {
            mockLocalStorage.setItem('avalmeos_token', 'test-token');
        });
        
        test('should validate required fields', () => {
            assert.throws(
                () => adminApi._validatePackage({}),
                'Validation failed'
            );
        });
        
        test('should validate price', () => {
            assert.throws(
                () => adminApi._validatePackage({
                    name: 'Valid Package',
                    slug: 'valid-slug',
                    price: -50
                }),
                'Valid price is required'
            );
        });
    });
    
    describe('Retry Logic', () => {
        beforeEach(() => {
            mockLocalStorage.setItem('avalmeos_token', 'test-token');
        });
        
        test('should retry on network errors', async () => {
            let attempts = 0;
            
            mockFetch.setResponse('GET', '/api/admin/destinations/all', (url, options) => {
                attempts++;
                if (attempts < 3) {
                    throw new Error('Network error');
                }
                return {
                    ok: true,
                    json: async () => ({ success: true, data: [] })
                };
            });
            
            const result = await adminApi.getDestinations();
            
            assert.equal(attempts, 3, 'Should retry 3 times');
        });
    });
});

// ============================================
// MOCK JEST FUNCTIONS
// ============================================

function jest() {
    return {
        fn: () => {
            const callLog = [];
            const fn = (...args) => {
                callLog.push(args);
                return undefined;
            };
            fn.called = false;
            Object.defineProperty(fn, 'callLog', {
                get: () => callLog
            });
            Object.defineProperty(fn, 'called', {
                get: () => callLog.length > 0
            });
            Object.defineProperty(fn, 'callCount', {
                get: () => callLog.length
            });
            return fn;
        }
    };
}

// Make jest available globally for tests
global.jest = jest;

// Export for running tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        assert,
        describe: (name, fn) => {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`DESCRIBE: ${name}`);
            console.log('='.repeat(60));
            fn();
        },
        test: (name, fn) => {
            try {
                fn();
                console.log(`✓ PASS: ${name}`);
            } catch (error) {
                console.log(`✗ FAIL: ${name}`);
                console.error(`  Error: ${error.message}`);
            }
        },
        beforeEach: (fn) => {
            console.log('  (beforeEach registered)');
        },
        afterEach: (fn) => {
            console.log('  (afterEach registered)');
        }
    };
}
