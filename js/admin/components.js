/**
 * Admin Component Loader
 * Loads admin components dynamically into placeholder divs
 */

const AdminComponents = {
    // Base path for admin components
    basePath: 'components/admin/',
    
    // Component definitions mapping placeholder IDs to component files
    components: {
        'admin-login-placeholder': 'AdminLogin.html',
        'admin-navbar-placeholder': 'AdminNavbar.html',
        'admin-sidebar-placeholder': 'AdminSidebar.html',
        'dashboard-view-placeholder': 'DashboardView.html',
        'bookings-view-placeholder': 'BookingsView.html',
        'destinations-view-placeholder': 'DestinationsView.html',
        'activities-view-placeholder': 'ActivitiesView.html',
        'packages-view-placeholder': 'PackagesView.html',
        'users-view-placeholder': 'UsersView.html',
        'inquiries-view-placeholder': 'InquiriesView.html',
        'analytics-view-placeholder': 'AnalyticsView.html',
        'booking-modal-placeholder': 'BookingModal.html',
        'destination-modal-placeholder': 'DestinationModal.html',
        'activity-modal-placeholder': 'ActivityModal.html',
        'package-modal-placeholder': 'PackageModal.html',
        'delete-package-modal-placeholder': 'DeletePackageModal.html',
        'inquiry-reply-modal-placeholder': 'InquiryReplyModal.html'
    },
    
    /**
     * Load a single component by placeholder ID
     */
    async loadComponent(placeholderId) {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) {
            console.warn(`Placeholder not found: ${placeholderId}`);
            return null;
        }
        
        const componentFile = this.components[placeholderId];
        if (!componentFile) {
            console.warn(`No component mapped for placeholder: ${placeholderId}`);
            return null;
        }
        
        try {
            const response = await fetch(`${this.basePath}${componentFile}`);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${response.status}`);
            }
            const html = await response.text();
            placeholder.innerHTML = html;
            console.log(`Loaded component: ${componentFile} -> ${placeholderId}`);
            return html;
        } catch (error) {
            console.error(`Error loading component ${componentFile}:`, error);
            return null;
        }
    },
    
    /**
     * Load all admin components
     */
    async loadAll() {
        console.log('Loading admin components...');
        const loadPromises = [];
        
        for (const [placeholderId, componentFile] of Object.entries(this.components)) {
            loadPromises.push(this.loadComponent(placeholderId));
        }
        
        await Promise.all(loadPromises);
        console.log('All admin components loaded');
    },
    
    /**
     * Load only shell components (navbar + sidebar)
     */
    async loadShell() {
        console.log('Loading admin shell components...');
        await Promise.all([
            this.loadComponent('admin-login-placeholder'),
            this.loadComponent('admin-navbar-placeholder'),
            this.loadComponent('admin-sidebar-placeholder')
        ]);
    },
    
    /**
     * Load only view components
     */
    async loadViews() {
        console.log('Loading admin view components...');
        await Promise.all([
            this.loadComponent('dashboard-view-placeholder'),
            this.loadComponent('bookings-view-placeholder'),
            this.loadComponent('destinations-view-placeholder'),
            this.loadComponent('activities-view-placeholder'),
            this.loadComponent('packages-view-placeholder'),
            this.loadComponent('users-view-placeholder'),
            this.loadComponent('inquiries-view-placeholder'),
            this.loadComponent('analytics-view-placeholder')
        ]);
    },
    
    /**
     * Load only modal components
     */
    async loadModals() {
        console.log('Loading admin modal components...');
        await Promise.all([
            this.loadComponent('booking-modal-placeholder'),
            this.loadComponent('destination-modal-placeholder'),
            this.loadComponent('activity-modal-placeholder'),
            this.loadComponent('package-modal-placeholder'),
            this.loadComponent('delete-package-modal-placeholder'),
            this.loadComponent('inquiry-reply-modal-placeholder')
        ]);
    }
};

// Expose to global scope
window.AdminComponents = AdminComponents;
