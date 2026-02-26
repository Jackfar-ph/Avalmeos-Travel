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
        'chat-view-placeholder': 'ChatView.html',
        'analytics-view-placeholder': 'AnalyticsView.html',
        'booking-modal-placeholder': 'BookingModal.html',
        'destination-modal-placeholder': 'DestinationModal.html',
        'activity-modal-placeholder': 'ActivityModal.html',
        'package-modal-placeholder': 'PackageModal.html',
        'delete-package-modal-placeholder': 'DeletePackageModal.html',
        'inquiry-reply-modal-placeholder': 'InquiryReplyModal.html',
        'user-modal-placeholder': 'UserModal.html'
    },
    
    /**
     * Load a single component by placeholder ID
     */
    async loadComponent(placeholderId) {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) {
            console.error(`[AdminComponents] ERROR: Placeholder not found: ${placeholderId}`);
            return null;
        }
        
        const componentFile = this.components[placeholderId];
        if (!componentFile) {
            console.error(`[AdminComponents] ERROR: No component mapped for placeholder: ${placeholderId}`);
            return null;
        }
        
        try {
            const response = await fetch(`${this.basePath}${componentFile}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const html = await response.text();
            placeholder.innerHTML = html;
            console.log(`[AdminComponents] Loaded: ${componentFile} -> ${placeholderId}`);
            return html;
        } catch (error) {
            console.error(`[AdminComponents] ERROR loading ${componentFile}:`, error);
            // Show error message in placeholder
            placeholder.innerHTML = `
                <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 class="text-red-700 font-bold">Failed to load component</h3>
                    <p class="text-red-600">${componentFile}</p>
                    <p class="text-sm text-red-500">${error.message}</p>
                    <button onclick="location.reload()" class="mt-2 px-4 py-2 bg-red-600 text-white rounded">
                        Retry
                    </button>
                </div>
            `;
            return null;
        }
    },
    
    /**
     * Load all admin components
     */
    async loadAll() {
        console.log('[AdminComponents] Starting to load all components...');
        const loadPromises = [];
        const componentNames = [];
        
        for (const [placeholderId, componentFile] of Object.entries(this.components)) {
            loadPromises.push(this.loadComponent(placeholderId));
            componentNames.push(componentFile);
        }
        
        console.log('[AdminComponents] Loading these components:', componentNames.join(', '));
        
        const results = await Promise.all(loadPromises);
        const successCount = results.filter(r => r !== null).length;
        const failCount = results.filter(r => r === null).length;
        
        console.log(`[AdminComponents] Load complete: ${successCount} succeeded, ${failCount} failed`);
        
        if (failCount > 0) {
            console.warn('[AdminComponents] WARNING: Some components failed to load. Check errors above.');
        }
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
            this.loadComponent('chat-view-placeholder'),
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
            this.loadComponent('inquiry-reply-modal-placeholder'),
            this.loadComponent('user-modal-placeholder')
        ]);
    }
};

// Expose to global scope
window.AdminComponents = AdminComponents;
