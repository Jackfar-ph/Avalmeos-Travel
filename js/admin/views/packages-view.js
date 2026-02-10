/**
 * ============================================================================
 * Admin Packages View
 * ============================================================================
 * View layer for packages management UI
 * Single Responsibility: Handle packages table and modal rendering
 */

// Placeholder image data URI for missing images (gray placeholder)
const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='%23cccccc' width='100' height='100'/%3E%3C/svg%3E";

class PackagesView {
    /**
     * Render the packages table
     * @param {Array} packages - Array of package objects
     * @returns {string} HTML string for table body
     */
    static renderPackagesTable(packages) {
        if (!packages || packages.length === 0) {
            return `
                <tr>
                    <td colspan="6" class="px-4 py-8 text-center">
                        ${this.renderEmptyState('No packages found')}
                    </td>
                </tr>
            `;
        }

        return packages.map(pkg => this.renderPackageRow(pkg)).join('');
    }

    /**
     * Render a single package row
     * @param {Object} pkg - Package object
     * @returns {string} HTML string for table row
     */
    static renderPackageRow(pkg) {
        const statusBadge = pkg.status === 'active' 
            ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>'
            : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Inactive</span>';
        
        const featuredBadge = pkg.featured 
            ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700 ml-2">Featured</span>'
            : '';

        return `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-4">
                    <div class="flex items-center gap-3">
                        <img src="${pkg.image || PLACEHOLDER_IMG}" alt="${pkg.name}" 
                             class="w-12 h-12 rounded-lg object-cover"
                             onerror="this.src=PLACEHOLDER_IMG">
                        <div>
                            <div class="font-medium text-[#1a4d41]">${pkg.name}</div>
                            ${featuredBadge}
                        </div>
                    </div>
                </td>
                <td class="px-4 py-4 text-sm">${pkg.destination}</td>
                <td class="px-4 py-4 text-sm font-bold text-orange-500">${formatPrice(pkg.price)}</td>
                <td class="px-4 py-4 text-sm">${pkg.duration} Day${pkg.duration > 1 ? 's' : ''}</td>
                <td class="px-4 py-4">${statusBadge}</td>
                <td class="px-4 py-4">
                    <div class="flex gap-2">
                        <button onclick="AdminPackageController.editPackage('${pkg.id}')" 
                            class="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                            Edit
                        </button>
                        <button onclick="AdminPackageController.showDeleteModal('${pkg.id}')" 
                            class="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Render destination filter dropdown
     * @param {Array} destinations - Array of destination names
     * @param {string} selected - Currently selected destination
     * @returns {string} HTML string for select element
     */
    static renderDestinationFilter(destinations, selected = '') {
        return `
            <select id="package-filter-destination" onchange="AdminPackageController.filterPackages()" class="px-3 py-2 border rounded-lg text-sm">
                <option value="">All Destinations</option>
                ${destinations.map(d => `<option value="${d}" ${d === selected ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
        `;
    }

    /**
     * Render status filter dropdown
     * @param {string} selected - Currently selected status
     * @returns {string} HTML string for select element
     */
    static renderStatusFilter(selected = '') {
        return `
            <select id="package-filter-status" onchange="AdminPackageController.filterPackages()" class="px-3 py-2 border rounded-lg text-sm">
                <option value="">All Status</option>
                <option value="active" ${selected === 'active' ? 'selected' : ''}>Active</option>
                <option value="inactive" ${selected === 'inactive' ? 'selected' : ''}>Inactive</option>
            </select>
        `;
    }

    /**
     * Render search input
     * @param {string} value - Current search value
     * @returns {string} HTML string for search input
     */
    static renderSearchInput(value = '') {
        return `
            <input type="text" id="package-search" onkeyup="AdminPackageController.filterPackages()" 
                placeholder="Search packages..." class="px-3 py-2 border rounded-lg text-sm" value="${value}">
        `;
    }

    /**
     * Render destination dropdown for package form
     * @param {Array} destinations - Array of destination names
     * @param {string} selected - Currently selected destination
     * @returns {string} HTML string for select element
     */
    static renderDestinationDropdown(destinations, selected = '') {
        return `
            <select id="package-destination" required class="w-full px-3 py-2 border rounded-lg">
                <option value="">Select destination</option>
                ${destinations.map(d => `<option value="${d}" ${d === selected ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
        `;
    }

    /**
     * Render empty state message
     * @param {string} message - Message to display
     * @returns {string} HTML string
     */
    static renderEmptyState(message = 'No packages found') {
        return `
            <div class="text-center py-8">
                <svg class="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                <p class="text-gray-500">${message}</p>
                <button onclick="AdminPackageController.showAddModal()" 
                    class="mt-4 px-4 py-2 bg-[#1a4d41] text-white rounded-lg hover:bg-opacity-90">
                    Add Your First Package
                </button>
            </div>
        `;
    }

    /**
     * Render loading state
     * @returns {string} HTML for loading spinner
     */
    static renderLoading() {
        return `
            <tr>
                <td colspan="6" class="px-4 py-8 text-center">
                    <div class="flex items-center justify-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a4d41]"></div>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Render delete confirmation modal content
     * @param {Object} pkg - Package object to delete
     * @returns {string} HTML string for modal content
     */
    static renderDeleteConfirmation(pkg) {
        if (!pkg) return '';
        
        return `
            <div class="flex items-center gap-3">
                <img src="${pkg.image || PLACEHOLDER_IMG}" alt="${pkg.name}" 
                     class="w-16 h-16 rounded-lg object-cover"
                     onerror="this.src=PLACEHOLDER_IMG">
                <div>
                    <div class="font-bold text-[#1a4d41]">${pkg.name}</div>
                    <div class="text-sm text-gray-500">${pkg.destination} • ${pkg.duration} Days</div>
                    <div class="text-sm font-bold text-orange-500">${formatPrice(pkg.price)}</div>
                </div>
            </div>
        `;
    }

    /**
     * Render package form (for add/edit)
     * @param {Object} pkg - Package object (null for add mode)
     * @param {Array} destinations - Array of destination names
     * @returns {string} HTML string for form
     */
    static renderPackageForm(pkg = null, destinations = []) {
        const isEdit = pkg !== null;
        const title = isEdit ? 'Edit Package' : 'Add New Package';
        
        return `
            <form id="package-form" onsubmit="AdminPackageController.savePackage(event)">
                <input type="hidden" id="package-id" value="${pkg?.id || ''}">
                
                <div class="space-y-3">
                    <!-- Package Name -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Package Name <span class="text-red-500">*</span>
                        </label>
                        <input type="text" id="package-name" required 
                            class="w-full px-3 py-2 border rounded-lg"
                            placeholder="e.g., Cebu City Package"
                            value="${pkg?.name || ''}">
                    </div>
                    
                    <!-- Destination -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Destination <span class="text-red-500">*</span>
                        </label>
                        ${this.renderDestinationDropdown(destinations, pkg?.destination || '')}
                    </div>
                    
                    <!-- Description -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea id="package-description" rows="2" class="w-full px-3 py-2 border rounded-lg"
                            placeholder="Brief description...">${pkg?.description || ''}</textarea>
                    </div>
                    
                    <!-- Price and Duration -->
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                Price (PHP) <span class="text-red-500">*</span>
                            </label>
                            <input type="number" id="package-price" required 
                                class="w-full px-3 py-2 border rounded-lg" min="0"
                                placeholder="8500"
                                value="${pkg?.price || ''}">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                Days <span class="text-red-500">*</span>
                            </label>
                            <input type="number" id="package-duration" required 
                                class="w-full px-3 py-2 border rounded-lg" min="1"
                                value="${pkg?.duration || 3}">
                        </div>
                    </div>
                    
                    <!-- Image URL -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                        <input type="text" id="package-image" class="w-full px-3 py-2 border rounded-lg"
                            placeholder="Picture/Cebu City.jpg"
                            value="${pkg?.image || ''}">
                    </div>
                    
                    <!-- Activities -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Activities <small class="text-gray-500">(one per line)</small>
                        </label>
                        <textarea id="package-activities" rows="3" class="w-full px-3 py-2 border rounded-lg"
                            placeholder="City Tour&#10;Food Trip&#10;Beach Visit">${pkg?.activities ? pkg.activities.join('\n') : ''}</textarea>
                    </div>
                    
                    <!-- Inclusions -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Inclusions</label>
                        <input type="text" id="package-inclusions" class="w-full px-3 py-2 border rounded-lg"
                            placeholder="Hotel, Breakfast, Transfers"
                            value="${pkg?.inclusions || ''}">
                    </div>
                    
                    <!-- Exclusions -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Exclusions</label>
                        <input type="text" id="package-exclusions" class="w-full px-3 py-2 border rounded-lg"
                            placeholder="Airfare, Personal expenses"
                            value="${pkg?.exclusions || ''}">
                    </div>
                    
                    <!-- Status and Featured toggles -->
                    <div class="flex items-center gap-4">
                        <label class="flex items-center gap-2">
                            <input type="checkbox" id="package-featured" ${pkg?.featured ? 'checked' : ''}>
                            <span class="text-sm text-gray-700">Featured</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="checkbox" id="package-status" ${pkg?.status !== 'inactive' ? 'checked' : ''}>
                            <span class="text-sm text-gray-700">Active</span>
                        </label>
                    </div>
                    
                    <!-- Form Actions -->
                    <div class="flex gap-2 pt-2">
                        <button type="submit" class="flex-1 px-4 py-2 bg-[#1a4d41] text-white rounded-lg hover:bg-opacity-90">
                            ${isEdit ? 'Update Package' : 'Add Package'}
                        </button>
                        <button type="button" onclick="AdminPackageController.closeModal()" 
                            class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg">
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        `;
    }
}

// Export for module usage
window.AdminPackagesView = PackagesView;
