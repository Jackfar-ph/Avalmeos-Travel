/**
 * ============================================================================
 * Admin Module - Constants
 * ============================================================================
 * Centralized constants for the admin module
 * Following consistent naming conventions and best practices
 */

// Storage keys for admin localStorage data
const ADMIN_STORAGE_KEYS = {
    AUTH: 'avalmeos_admin',
    BOOKINGS: 'avalmeos_bookings',
    PACKAGES: 'avalmeos_admin_packages',
    DESTINATIONS: 'avalmeos_admin_destinations',
    ACTIVITIES: 'avalmeos_admin_activities',
    NOTIFICATIONS: 'avalmeos_admin_notifications'
};

// Booking status constants
const BOOKING_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected'
};

// Payment status constants
const PAYMENT_STATUS = {
    UNPAID: 'unpaid',
    PAID: 'paid',
    REFUNDED: 'refunded'
};

// Package status constants
const PACKAGE_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
};

// User role constants
const USER_ROLES = {
    ADMIN: 'admin',
    USER: 'user',
    MANAGER: 'manager'
};

// Default pagination settings
const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100
};

// Export all constants as an object for easier importing
const AdminConstants = {
    STORAGE_KEYS: ADMIN_STORAGE_KEYS,
    BOOKING_STATUS,
    PAYMENT_STATUS,
    PACKAGE_STATUS,
    USER_ROLES,
    PAGINATION
};

// Make constants globally available for legacy code compatibility
window.AdminConstants = AdminConstants;
window.ADMIN_KEY = ADMIN_STORAGE_KEYS.AUTH;
window.BOOKINGS_KEY = ADMIN_STORAGE_KEYS.BOOKINGS;
window.ADMIN_PACKAGES_KEY = ADMIN_STORAGE_KEYS.PACKAGES;
