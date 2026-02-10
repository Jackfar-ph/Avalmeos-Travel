/**
 * ============================================================================
 * Admin Module - Main Entry Point
 * ============================================================================
 * Initializes the admin module structure and provides backward compatibility
 * Architecture: Controller-Service-View pattern with clear separation of concerns
 */

// ============================================================================
// DEPENDENCY ORDER (MUST BE LOADED IN THIS ORDER)
// ============================================================================
// 1. js/admin/utils/constants.js     - Constants and configuration
// 2. js/admin/services/*.js          - Business logic services
// 3. js/admin/views/*.js            - UI rendering views
// 4. js/admin/controllers/*.js      - Controller coordination
// 5. js/admin/main.js               - Initialization and backward compatibility
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
    window.updateBookingStatus = BookingService.updateBookingStatus.bind(BookingService);
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
// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AdminModule.init();
});

// Export for module usage
window.AdminModule = AdminModule;
