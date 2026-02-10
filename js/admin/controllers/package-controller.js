/**
 * ============================================================================
 * Admin Package Controller
 * ============================================================================
 * Controller layer for package management
 * Coordinates between PackageService (business logic) and PackagesView (UI)
 */

class PackageController {
    /**
     * Container element for packages table
     */
    static get packagesTableContainer() {
        return document.getElementById('admin-packages-table');
    }

    /**
     * Container element for empty state
     */
    static get emptyStateContainer() {
        return document.getElementById('packages-empty-state');
    }

    /**
     * Container element for destination filter
     */
    static get destinationFilterContainer() {
        return document.getElementById('package-filter-destination');
    }

    /**
     * Initialize package management
     */
    static async init() {
        await this.loadPackages();
    }

    /**
     * Load packages from service and render table
     */
    static async loadPackages() {
        if (!this.packagesTableContainer) return;

        this.packagesTableContainer.innerHTML = PackagesView.renderLoading();

        try {
            // Try to fetch from API first
            let packages = [];
            try {
                const response = await window.adminApi.getPackages();
                if (response.success && response.data?.length > 0) {
                    packages = response.data;
                    // Save to localStorage for offline/fallback
                    localStorage.setItem(AdminConstants.STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
                }
            } catch (apiError) {
                console.log('API not available, using localStorage:', apiError.message);
            }

            // Fallback to localStorage
            if (packages.length === 0) {
                packages = PackageService.getAllPackages();
            }

            // Update destination filter
            this.updateDestinationFilter(packages);

            // Render table
            this.renderPackagesTable(packages);
        } catch (error) {
            console.error('Error loading packages:', error);
            this.packagesTableContainer.innerHTML = `
                <tr><td colspan="6" class="px-4 py-8 text-center text-red-500">Error loading packages</td></tr>
            `;
        }
    }

    /**
     * Update destination filter dropdown
     * @param {Array} packages - Array of package objects
     */
    static updateDestinationFilter(packages) {
        if (!this.destinationFilterContainer) return;

        const destinations = [...new Set(packages.map(p => p.destination))].sort();
        
        this.destinationFilterContainer.innerHTML = `
            <option value="">All Destinations</option>
            ${destinations.map(d => `<option value="${d}">${d}</option>`).join('')}
        `;
    }

    /**
     * Render packages table
     * @param {Array} packages - Array of package objects
     */
    static renderPackagesTable(packages) {
        if (!this.packagesTableContainer) return;

        if (packages.length === 0) {
            this.packagesTableContainer.innerHTML = '';
            if (this.emptyStateContainer) {
                this.emptyStateContainer.classList.remove('hidden');
            }
            return;
        }

        if (this.emptyStateContainer) {
            this.emptyStateContainer.classList.add('hidden');
        }

        this.packagesTableContainer.innerHTML = PackagesView.renderPackagesTable(packages);
    }

    /**
     * Filter packages based on current filter values
     */
    static filterPackages() {
        const destination = document.getElementById('package-filter-destination')?.value || '';
        const status = document.getElementById('package-filter-status')?.value || '';
        const search = document.getElementById('package-search')?.value.toLowerCase() || '';

        let packages = PackageService.getAllPackages();

        // Apply filters
        if (destination) {
            packages = packages.filter(p => p.destination === destination);
        }
        if (status) {
            packages = packages.filter(p => p.status === status);
        }
        if (search) {
            packages = packages.filter(p => 
                p.name?.toLowerCase().includes(search) ||
                p.destination?.toLowerCase().includes(search) ||
                p.description?.toLowerCase().includes(search)
            );
        }

        this.renderPackagesTable(packages);
    }

    /**
     * Show add package modal
     */
    static showAddModal() {
        const modal = document.getElementById('package-modal');
        const title = document.getElementById('package-modal-title');
        const formContainer = document.getElementById('package-form-container');
        
        if (!modal || !formContainer) return;

        // Reset form
        document.getElementById('package-form')?.reset();
        document.getElementById('package-id').value = '';
        
        // Set default values
        document.getElementById('package-status').checked = true;
        
        if (title) title.textContent = 'Add New Package';

        // Populate destinations
        this.populateDestinationDropdown();

        // Show modal
        modal.classList.remove('hidden');
    }

    /**
     * Show edit package modal
     * @param {string} packageId - Package ID to edit
     */
    static editPackage(packageId) {
        const pkg = PackageService.getPackageById(packageId);
        if (!pkg) {
            this.showNotification('Package not found', 'error');
            return;
        }

        const modal = document.getElementById('package-modal');
        const title = document.getElementById('package-modal-title');
        const formContainer = document.getElementById('package-form-container');
        
        if (!modal || !formContainer) return;

        // Populate destinations
        this.populateDestinationDropdown();

        // Fill form with package data
        document.getElementById('package-id').value = pkg.id;
        document.getElementById('package-name').value = pkg.name || '';
        document.getElementById('package-destination').value = pkg.destination || '';
        document.getElementById('package-description').value = pkg.description || '';
        document.getElementById('package-price').value = pkg.price || '';
        document.getElementById('package-duration').value = pkg.duration || 1;
        document.getElementById('package-type').value = pkg.type || 'all-inclusive';
        document.getElementById('package-image').value = pkg.image || '';
        document.getElementById('package-inclusions').value = pkg.inclusions || '';
        document.getElementById('package-exclusions').value = pkg.exclusions || '';
        document.getElementById('package-featured').checked = pkg.featured || false;
        document.getElementById('package-status').checked = pkg.status === 'active';

        // Format activities array to textarea
        const activitiesTextarea = document.getElementById('package-activities');
        if (activitiesTextarea && pkg.activities) {
            activitiesTextarea.value = pkg.activities.join('\n');
        }

        if (title) title.textContent = 'Edit Package';

        modal.classList.remove('hidden');
    }

    /**
     * Close package modal
     */
    static closeModal() {
        const modal = document.getElementById('package-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * Populate destination dropdown in form
     */
    static populateDestinationDropdown() {
        const select = document.getElementById('package-destination');
        if (!select) return;

        const destinations = PackageService.getAllDestinations();
        const defaultDestinations = ['Cebu City', 'Manila', 'Baguio', 'Davao City', 'Puerto Princesa', 'Iloilo', 'Palawan', 'Boracay'];
        const allDestinations = [...new Set([...destinations, ...defaultDestinations])].sort();

        select.innerHTML = `
            <option value="">Select destination</option>
            ${allDestinations.map(d => `<option value="${d}">${d}</option>`).join('')}
        `;
    }

    /**
     * Save package from form
     * @param {Event} event - Form submit event
     */
    static async savePackage(event) {
        event.preventDefault();

        const packageId = document.getElementById('package-id').value;
        
        // Get activities from textarea
        const activitiesTextarea = document.getElementById('package-activities');
        const activities = activitiesTextarea?.value 
            ? activitiesTextarea.value.split('\n').map(a => a.trim()).filter(a => a)
            : [];

        const packageData = {
            name: document.getElementById('package-name').value,
            destination: document.getElementById('package-destination').value,
            description: document.getElementById('package-description').value,
            price: parseFloat(document.getElementById('package-price').value) || 0,
            duration: parseInt(document.getElementById('package-duration').value) || 1,
            type: document.getElementById('package-type').value,
            image: document.getElementById('package-image').value,
            inclusions: document.getElementById('package-inclusions').value,
            exclusions: document.getElementById('package-exclusions').value,
            activities: activities,
            featured: document.getElementById('package-featured').checked,
            status: document.getElementById('package-status').checked ? 'active' : 'inactive'
        };

        try {
            // Try API first if it's a UUID (not a local pkg_ id)
            if (packageId && !packageId.startsWith('pkg_')) {
                try {
                    await window.adminApi.updatePackage(packageId, packageData);
                    this.showNotification('Package updated successfully', 'success');
                    this.closeModal();
                    await this.loadPackages();
                    return;
                } catch (apiError) {
                    console.log('API error, falling back to localStorage:', apiError.message);
                }
            }

            // Fallback to localStorage
            if (packageId) {
                const updated = PackageService.updatePackage(packageId, packageData);
                if (updated) {
                    this.showNotification('Package updated successfully', 'success');
                } else {
                    this.showNotification('Package not found', 'error');
                    return;
                }
            } else {
                PackageService.addPackage(packageData);
                this.showNotification('Package created successfully', 'success');
            }

            this.closeModal();
            await this.loadPackages();
        } catch (error) {
            console.error('Error saving package:', error);
            this.showNotification('Error saving package', 'error');
        }
    }

    /**
     * Show delete confirmation modal
     * @param {string} packageId - Package ID to delete
     */
    static showDeleteModal(packageId) {
        const pkg = PackageService.getPackageById(packageId);
        if (!pkg) {
            this.showNotification('Package not found', 'error');
            return;
        }

        const modal = document.getElementById('delete-package-modal');
        const info = document.getElementById('delete-package-info');
        
        if (!modal || !info) return;

        info.innerHTML = PackagesView.renderDeleteConfirmation(pkg);

        // Set confirm button handler
        const confirmBtn = document.getElementById('confirm-delete-package-btn');
        if (confirmBtn) {
            confirmBtn.onclick = async () => {
                // Try API first if it's a UUID
                if (packageId && !packageId.startsWith('pkg_')) {
                    try {
                        await window.adminApi.deletePackage(packageId);
                        this.closeDeleteModal();
                        await this.loadPackages();
                        this.showNotification('Package deleted successfully', 'success');
                        return;
                    } catch (apiError) {
                        console.log('API delete error, falling back to localStorage:', apiError.message);
                    }
                }

                // Fallback to localStorage
                PackageService.deletePackage(packageId);
                this.closeDeleteModal();
                await this.loadPackages();
                this.showNotification('Package deleted successfully', 'success');
            };
        }

        modal.classList.remove('hidden');
    }

    /**
     * Close delete confirmation modal
     */
    static closeDeleteModal() {
        const modal = document.getElementById('delete-package-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * Search packages (wrapper for filterPackages)
     */
    static searchPackages() {
        this.filterPackages();
    }

    /**
     * Show notification (wrapper for global notification system)
     * @param {string} message - Message to display
     * @param {string} type - Notification type (success, error, info)
     */
    static showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Export for module usage and global access
window.AdminPackageController = PackageController;
