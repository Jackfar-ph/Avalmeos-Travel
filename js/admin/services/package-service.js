/**
 * ============================================================================
 * Admin Package Service
 * ============================================================================
 * Business logic layer for package management operations
 * Single Responsibility: Handle all package-related business logic
 */

class PackageService {
    /**
     * Default packages data as fallback when no data exists in localStorage
     * Provides initial sample packages for demonstration
     */
    static getDefaultPackages() {
        return [
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
    }

    /**
     * Get all packages from localStorage, initializing with defaults if needed
     * @returns {Array} Array of package objects
     */
    static getAllPackages() {
        try {
            const packages = localStorage.getItem(AdminConstants.STORAGE_KEYS.PACKAGES);
            
            // Check if packages exist and are valid
            if (!packages || packages === 'undefined' || packages === 'null') {
                // Initialize with default packages
                localStorage.setItem(
                    AdminConstants.STORAGE_KEYS.PACKAGES, 
                    JSON.stringify(this.getDefaultPackages())
                );
                return this.getDefaultPackages();
            }
            
            const parsed = JSON.parse(packages);
            return Array.isArray(parsed) ? parsed : this.getDefaultPackages();
        } catch (error) {
            console.error('Error fetching packages:', error);
            return this.getDefaultPackages();
        }
    }

    /**
     * Save all packages to localStorage
     * @param {Array} packages - Array of package objects to save
     */
    static saveAllPackages(packages) {
        localStorage.setItem(AdminConstants.STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
    }

    /**
     * Get a single package by ID
     * @param {string} packageId - The package ID to find
     * @returns {Object|null} Package object or null if not found
     */
    static getPackageById(packageId) {
        const packages = this.getAllPackages();
        return packages.find(p => p.id === packageId) || null;
    }

    /**
     * Add a new package
     * @param {Object} packageData - The package data to create
     * @returns {Object} The created package with generated ID
     */
    static addPackage(packageData) {
        const packages = this.getAllPackages();
        const newPackage = {
            ...packageData,
            id: 'pkg_' + Date.now(),
            createdAt: new Date().toISOString()
        };
        packages.push(newPackage);
        this.saveAllPackages(packages);
        return newPackage;
    }

    /**
     * Update an existing package
     * @param {string} packageId - The package ID to update
     * @param {Object} packageData - The updated package data
     * @returns {Object|null} Updated package or null if not found
     */
    static updatePackage(packageId, packageData) {
        const packages = this.getAllPackages();
        const index = packages.findIndex(p => p.id === packageId);
        
        if (index !== -1) {
            packages[index] = {
                ...packages[index],
                ...packageData,
                updatedAt: new Date().toISOString()
            };
            this.saveAllPackages(packages);
            return packages[index];
        }
        return null;
    }

    /**
     * Delete a package by ID
     * @param {string} packageId - The package ID to delete
     */
    static deletePackage(packageId) {
        const packages = this.getAllPackages();
        const filtered = packages.filter(p => p.id !== packageId);
        this.saveAllPackages(filtered);
    }

    /**
     * Get package statistics for dashboard
     * @returns {Object} Statistics object with counts
     */
    static getPackageStats() {
        const packages = this.getAllPackages();
        return {
            total: packages.length,
            active: packages.filter(p => p.status === AdminConstants.PACKAGE_STATUS.ACTIVE).length,
            inactive: packages.filter(p => p.status === AdminConstants.PACKAGE_STATUS.INACTIVE).length,
            featured: packages.filter(p => p.featured === true).length
        };
    }

    /**
     * Filter packages by destination
     * @param {string} destination - The destination to filter by
     * @returns {Array} Filtered package array
     */
    static filterByDestination(destination) {
        if (!destination) return this.getAllPackages();
        return this.getAllPackages().filter(p => p.destination === destination);
    }

    /**
     * Filter packages by status
     * @param {string} status - The status to filter by
     * @returns {Array} Filtered package array
     */
    static filterByStatus(status) {
        if (!status) return this.getAllPackages();
        return this.getAllPackages().filter(p => p.status === status);
    }

    /**
     * Search packages by name, destination, or description
     * @param {string} searchTerm - The search term
     * @returns {Array} Filtered package array
     */
    static searchPackages(searchTerm) {
        const term = searchTerm.toLowerCase();
        return this.getAllPackages().filter(p => 
            p.name?.toLowerCase().includes(term) ||
            p.destination?.toLowerCase().includes(term) ||
            p.description?.toLowerCase().includes(term)
        );
    }

    /**
     * Get all unique destinations from packages
     * @returns {Array} Sorted array of unique destination names
     */
    static getAllDestinations() {
        const packages = this.getAllPackages();
        return [...new Set(packages.map(p => p.destination))].sort();
    }

    /**
     * Toggle package featured status
     * @param {string} packageId - The package ID
     * @returns {boolean} True if toggled successfully
     */
    static toggleFeatured(packageId) {
        const pkg = this.getPackageById(packageId);
        if (pkg) {
            return this.updatePackage(packageId, { featured: !pkg.featured }) !== null;
        }
        return false;
    }

    /**
     * Toggle package active status
     * @param {string} packageId - The package ID
     * @returns {boolean} True if toggled successfully
     */
    static toggleStatus(packageId) {
        const pkg = this.getPackageById(packageId);
        if (pkg) {
            const newStatus = pkg.status === AdminConstants.PACKAGE_STATUS.ACTIVE 
                ? AdminConstants.PACKAGE_STATUS.INACTIVE 
                : AdminConstants.PACKAGE_STATUS.ACTIVE;
            return this.updatePackage(packageId, { status: newStatus }) !== null;
        }
        return false;
    }
}

// Export for module usage
window.AdminPackageService = PackageService;
