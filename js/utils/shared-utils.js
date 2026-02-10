/**
 * ============================================================================
 * Shared Utilities Module
 * ============================================================================
 * Centralized utility functions to eliminate code duplication
 * All frontend and admin modules should import/use these utilities
 * 
 * DUPLICATE CODE RESOLUTION:
 * - formatPrice: Was duplicated in main.js, cart.js, admin.js
 * - parsePrice: Was duplicated in main.js, cart.js
 * - formatDate: Was duplicated in cart.js
 * - escapeHtml: Was duplicated in chat.js
 * - getPersonalizationOptions: Was duplicated in cart.js and main.js
 */

// ============================================================================
// CURRENCY UTILITIES
// ============================================================================

/**
 * Parse price string to number
 * Removes currency symbols and returns numeric value
 * @param {string|number} priceStr - Price string or number
 * @returns {number} Parsed price as number
 */
function parsePrice(priceStr) {
    if (!priceStr && priceStr !== 0) return 0;
    
    // If already a number, return it
    if (typeof priceStr === 'number') return priceStr;
    
    // Remove currency symbols and non-numeric characters except decimal
    const cleaned = priceStr.toString().replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
}

/**
 * Format number to currency string
 * @param {number} price - Price number
 * @param {string} currency - Currency code ('PHP' or 'USD')
 * @returns {string} Formatted price string
 */
function formatPrice(price, currency = 'PHP') {
    if (currency === 'USD') {
        return `${price.toFixed(2)}`;
    }
    // PHP formatting with peso sign and commas
    return `₱${price.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })}`;
}

/**
 * Get exchange rate for currency conversion
 * @returns {number} PHP to USD exchange rate
 */
function getExchangeRate() {
    return 59.25; // PHP to USD exchange rate
}

/**
 * Convert price between currencies
 * @param {number} price - Price in source currency
 * @param {string} fromCurrency - Source currency ('PHP' or 'USD')
 * @param {string} toCurrency - Target currency
 * @returns {number} Converted price
 */
function convertCurrency(price, fromCurrency, toCurrency) {
    const rate = getExchangeRate();
    
    if (fromCurrency === toCurrency) return price;
    
    if (fromCurrency === 'USD' && toCurrency === 'PHP') {
        return price * rate;
    }
    
    if (fromCurrency === 'PHP' && toCurrency === 'USD') {
        return price / rate;
    }
    
    return price;
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Format date string for display
 * @param {string|Date} dateStr - Date string or Date object
 * @param {string} locale - Locale for formatting (default: 'en-PH')
 * @returns {string} Formatted date string
 */
function formatDate(dateStr, locale = 'en-PH') {
    if (!dateStr) return 'No date selected';
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString(locale, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format time for chat messages
 * @param {string|Date} timestamp - Date string or Date object
 * @returns {string} Formatted time string (HH:mm)
 */
function formatChatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-PH', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {string|Date} dateStr - Date string or Date object
 * @returns {string} Relative time string
 */
function getRelativeTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    
    return formatDate(dateStr);
}

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} True if valid date format
 */
function isValidDateFormat(dateStr) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateStr);
}

/**
 * Get minimum selectable date (today)
 * @returns {string} Today's date in YYYY-MM-DD format
 */
function getMinDate() {
    return new Date().toISOString().split('T')[0];
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML string
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Truncate string to specified length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to append (default: '...')
 * @returns {string} Truncated string
 */
function truncateString(str, maxLength = 50, suffix = '...') {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + suffix;
}

/**
 * Generate a slug from string
 * @param {string} str - String to convert to slug
 * @returns {string} URL-friendly slug
 */
function generateSlug(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
function validateEmail(email) {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate Philippine phone number format
 * Supports: +639XXXXXXXXX, 09XXXXXXXXX, 639XXXXXXXXX
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid Philippine phone format
 */
function validatePhone(phone) {
    if (!phone) return false;
    // Remove spaces and validate
    const cleaned = phone.replace(/\s/g, '');
    const phoneRegex = /^(\+?63|0)9\d{9}$/;
    return phoneRegex.test(cleaned);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result {valid: boolean, message: string}
 */
function validatePassword(password) {
    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true, message: 'Password is strong' };
}

// ============================================================================
// PERSONALIZATION UTILITIES
// ============================================================================

/**
 * Get all available personalization options
 * @returns {Array} Array of personalization option objects
 */
function getPersonalizationOptions() {
    return [
        { id: 'hotel', name: 'Hotel Accommodation', icon: '🏨', priceMultiplier: 1.5 },
        { id: 'transport', name: 'Private Transport', icon: '🚗', priceMultiplier: 1.3 },
        { id: 'guide', name: 'Tour Guide', icon: '👨‍🏫', priceMultiplier: 1.2 },
        { id: 'meals', name: 'All Meals Included', icon: '🍽️', priceMultiplier: 1.4 },
        { id: 'insurance', name: 'Travel Insurance', icon: '🛡️', priceMultiplier: 1.1 },
        { id: 'photography', name: 'Professional Photography', icon: '📸', priceMultiplier: 1.25 },
        { id: 'souvenir', name: 'Souvenir Package', icon: '🎁', priceMultiplier: 1.15 },
        { id: 'wifi', name: 'Portable WiFi', icon: '📶', priceMultiplier: 1.05 }
    ];
}

// Alias for cart.js to avoid circular reference
window.getSharedPersonalizationOptions = getPersonalizationOptions;

/**
 * Calculate price with personalization multipliers
 * Uses additive approach to avoid exponential compounding
 * @param {number} basePrice - Base package price
 * @param {number} paxSize - Number of passengers
 * @param {Array} selectedOptions - Array of selected option IDs
 * @returns {number} Final calculated price
 */
function calculatePriceWithPersonalization(basePrice, paxSize, selectedOptions) {
    let totalPrice = basePrice * paxSize;
    
    // Apply additive multipliers
    let multiplier = 1;
    selectedOptions.forEach(optionId => {
        const option = getPersonalizationOptions().find(o => o.id === optionId);
        if (option) {
            multiplier += (option.priceMultiplier - 1);
        }
    });
    
    return totalPrice * multiplier;
}

// ============================================================================
// ID GENERATION UTILITIES
// ============================================================================

/**
 * Generate unique ID with prefix
 * @param {string} prefix - ID prefix (default: 'id')
 * @returns {string} Unique ID string
 */
function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate short ID (8 characters)
 * @param {string} prefix - ID prefix (default: '')
 * @returns {string} Short unique ID
 */
function generateShortId(prefix = '') {
    const id = Math.random().toString(36).substr(2, 8);
    return prefix ? `${prefix}_${id}` : id;
}

// ============================================================================
// EXPORT TO GLOBAL SCOPE
// ============================================================================
// Make all utilities globally available for backward compatibility
window.parsePrice = parsePrice;
window.formatPrice = formatPrice;
window.getExchangeRate = getExchangeRate;
window.convertCurrency = convertCurrency;
window.formatDate = formatDate;
window.formatChatTime = formatChatTime;
window.getRelativeTime = getRelativeTime;
window.isValidDateFormat = isValidDateFormat;
window.getMinDate = getMinDate;
window.escapeHtml = escapeHtml;
window.truncateString = truncateString;
window.generateSlug = generateSlug;
window.capitalizeFirst = capitalizeFirst;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
window.validatePassword = validatePassword;
window.getPersonalizationOptions = getPersonalizationOptions;
window.calculatePriceWithPersonalization = calculatePriceWithPersonalization;
window.generateId = generateId;
window.generateShortId = generateShortId;

// ============================================================================
// EXPORT AS MODULE (ES6)
// ============================================================================
// If using ES6 modules, uncomment the following:
/*
export {
    parsePrice,
    formatPrice,
    getExchangeRate,
    convertCurrency,
    formatDate,
    formatChatTime,
    getRelativeTime,
    isValidDateFormat,
    getMinDate,
    escapeHtml,
    truncateString,
    generateSlug,
    capitalizeFirst,
    validateEmail,
    validatePhone,
    validatePassword,
    getPersonalizationOptions,
    calculatePriceWithPersonalization,
    generateId,
    generateShortId
};
*/
