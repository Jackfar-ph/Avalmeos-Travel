/**
 * Image Placeholder Utilities
 * Provides data URI placeholders for missing images
 */

// SVG placeholder as data URI - a simple gray gradient with icon
const DEFAULT_PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23e0e0e0;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23bdbdbd;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23grad)'/%3E%3Ctext x='200' y='150' font-family='Arial, sans-serif' font-size='18' fill='%23757575' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E`;

// Small thumbnail placeholder
const THUMBNAIL_PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23e0e0e0;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23bdbdbd;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grad)'/%3E%3Ctext x='50' y='50' font-family='Arial, sans-serif' font-size='12' fill='%23757575' text-anchor='middle' dominant-baseline='middle'%3E%3C/text%3E%3C/svg%3E`;

/**
 * Get the default placeholder image data URI
 * @param {boolean} isThumbnail - Whether to use thumbnail size
 * @returns {string} Data URI for placeholder image
 */
function getDefaultPlaceholder(isThumbnail = false) {
    return isThumbnail ? THUMBNAIL_PLACEHOLDER_SVG : DEFAULT_PLACEHOLDER_SVG;
}

/**
 * Safely get image URL with fallback to placeholder
 * @param {string|null|undefined} imageUrl - The image URL to check
 * @param {boolean} isThumbnail - Use thumbnail size placeholder
 * @returns {string} The image URL or placeholder if invalid
 */
function getImageWithFallback(imageUrl, isThumbnail = false) {
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
        return imageUrl;
    }
    return getDefaultPlaceholder(isThumbnail);
}

/**
 * Create an image element with placeholder fallback
 * @param {string} src - Image source
 * @param {string} alt - Alt text
 * @param {object} options - Additional options
 * @returns {HTMLImageElement} Image element with error handler
 */
function createImageWithFallback(src, alt, options = {}) {
    const img = document.createElement('img');
    img.src = getImageWithFallback(src, options.thumbnail);
    img.alt = alt || 'Image';
    
    if (options.className) img.className = options.className;
    if (options.width) img.width = options.width;
    if (options.height) img.height = options.height;
    
    img.onerror = function() {
        this.src = getDefaultPlaceholder(options.thumbnail);
    };
    
    return img;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getDefaultPlaceholder,
        getImageWithFallback,
        createImageWithFallback,
        DEFAULT_PLACEHOLDER_SVG,
        THUMBNAIL_PLACEHOLDER_SVG
    };
}
