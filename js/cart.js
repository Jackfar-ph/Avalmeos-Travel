// --- Cart System with Pax Size ---
// Uses centralized utilities from js/utils/shared-utils.js
// Fallback definitions are provided if utilities are not loaded

(function() {
    'use strict';
    
    console.log('cart.js: Starting initialization...');
    
    const CART_KEY = 'avalmeos_cart';
    const EXCHANGE_RATE = 59.25; // PHP to USD exchange rate
    
    try {

// Placeholder image data URI for missing images (gray placeholder)
const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='%23cccccc' width='100' height='100'/%3E%3C/svg%3E";

// Use getExchangeRate from shared-utils.js if available, otherwise use local constant
// Note: We use a function expression to avoid redeclaration issues
const getExchangeRateFn = typeof window.getExchangeRate === 'function' ? window.getExchangeRate : () => EXCHANGE_RATE;
const getExchangeRate = getExchangeRateFn;

console.log('cart.js: getExchangeRate available:', typeof getExchangeRate);

// Personalization options - now provided by shared-utils.js
// FIX: Check for getSharedPersonalizationOptions to avoid circular reference
const getPersonalizationOptionsFromUtils = () => {
    // Check for the shared-utils function using a different name to avoid circular reference
    if (typeof window.getSharedPersonalizationOptions === 'function') {
        return window.getSharedPersonalizationOptions();
    }
    console.warn('cart.js: getSharedPersonalizationOptions not available, using fallback');
    // Fallback if utilities not loaded
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
};

// Get cart from storage
function getCart() {
    const cartStr = localStorage.getItem(CART_KEY);
    console.log('getCart: localStorage.getItem(CART_KEY):', cartStr);
    if (cartStr) {
        const cart = JSON.parse(cartStr);
        console.log('getCart: parsed cart:', cart);
        return cart;
    }
    console.log('getCart: no cart found, returning empty cart');
    return { items: [], total: 0 };
}

// Save cart to storage
function saveCart(cart) {
    console.log('saveCart: saving cart:', cart);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    console.log('saveCart: cart saved to localStorage');
    
    // Update UI
    console.log('saveCart: calling updateCartCount()');
    updateCartCount();
    console.log('saveCart: calling updateFloatingCart()');
    updateFloatingCart();
}

// Add item to cart
function addToCart(packageData, paxSize, travelDate, personalization = []) {
    console.log('=== addToCart called ===');
    console.log('packageData:', packageData);
    console.log('paxSize:', paxSize);
    console.log('travelDate:', travelDate);
    console.log('personalization:', personalization);
    
    const cart = getCart();
    console.log('Current cart before add:', cart);
    
    // Calculate price based on pax and personalization
    let basePrice = typeof window.parsePrice === 'function' 
        ? window.parsePrice(packageData.price) 
        : parsePrice(packageData.price);
    console.log('basePrice:', basePrice);
    
    let totalPrice = basePrice * paxSize;
    
    // Apply personalization multipliers (additive approach to avoid exponential compounding)
    let multiplier = 1;
    const options = getPersonalizationOptionsFromUtils();
    console.log('Personalization options:', options);
    personalization.forEach(persId => {
        const option = options.find(o => o.id === persId);
        if (option) {
            multiplier += (option.priceMultiplier - 1);
        }
    });
    console.log('Applied multiplier:', multiplier);
    totalPrice = totalPrice * multiplier;
    console.log('Final totalPrice:', totalPrice);
    
    const cartItem = {
        id: 'item_' + Date.now() + Math.random().toString(36).substr(2, 9),
        packageId: packageData.id || packageData.title,
        packageTitle: packageData.title,
        city: packageData.city || 'Unknown',
        img: packageData.img || '',
        basePrice: basePrice,
        paxSize: paxSize,
        travelDate: travelDate,
        personalization: personalization,
        totalPrice: totalPrice,
        originalCurrency: packageData.originalCurrency || 'PHP',
        addedAt: new Date().toISOString()
    };
    console.log('Created cartItem:', cartItem);
    
    cart.items.push(cartItem);
    console.log('Cart items after push:', cart.items);
    
    calculateCartTotal(cart);
    console.log('Cart total after calculate:', cart.total);
    
    saveCart(cart);
    console.log('Cart saved to localStorage');
    console.log('=== addToCart complete ===\n');
    
    return cartItem;
}

// Remove item from cart
function removeFromCart(itemId) {
    const cart = getCart();
    cart.items = cart.items.filter(item => item.id !== itemId);
    calculateCartTotal(cart);
    saveCart(cart);
}

// Update item in cart
function updateCartItem(itemId, updates) {
    const cart = getCart();
    const itemIndex = cart.items.findIndex(item => item.id === itemId);
    const options = getPersonalizationOptionsFromUtils();
    
    if (itemIndex !== -1) {
        const item = cart.items[itemIndex];
        
        if (updates.paxSize) {
            item.paxSize = updates.paxSize;
            // Recalculate price with additive multipliers
            let totalPrice = item.basePrice * item.paxSize;
            let multiplier = 1;
            item.personalization.forEach(persId => {
                const option = options.find(o => o.id === persId);
                if (option) {
                    multiplier += (option.priceMultiplier - 1);
                }
            });
            item.totalPrice = totalPrice * multiplier;
        }
        
        if (updates.travelDate) {
            item.travelDate = updates.travelDate;
        }
        
        if (updates.personalization) {
            item.personalization = updates.personalization;
            // Recalculate price with additive multipliers
            let totalPrice = item.basePrice * item.paxSize;
            let multiplier = 1;
            updates.personalization.forEach(persId => {
                const option = options.find(o => o.id === persId);
                if (option) {
                    multiplier += (option.priceMultiplier - 1);
                }
            });
            item.totalPrice = totalPrice * multiplier;
        }
        
        cart.items[itemIndex] = item;
        calculateCartTotal(cart);
        saveCart(cart);
    }
}

// Calculate cart total (handles mixed currencies)
function calculateCartTotal(cart) {
    // Calculate separate totals per currency
    let phpTotal = 0;
    let usdTotal = 0;
    
    cart.items.forEach(item => {
        if (item.originalCurrency === 'USD') {
            // Add to USD total (will be converted later)
            usdTotal += item.totalPrice;
        } else {
            phpTotal += item.totalPrice;
        }
    });
    
    // Store both totals
    cart.phpTotal = phpTotal;
    cart.usdTotal = usdTotal;
    
    // Convert USD to PHP for overall total
    cart.total = phpTotal + (usdTotal * getExchangeRate());
    
    return cart.total;
}

// Get cart count
function getCartCount() {
    const cart = getCart();
    return cart.items.length;
}

// Update cart count in UI
function updateCartCount() {
    console.log('=== updateCartCount called ===');
    const count = getCartCount();
    console.log('updateCartCount: count =', count);
    
    // Update all cart count elements (there may be multiple in navbar and floating cart)
    const countElements = document.querySelectorAll('#cart-count, #cart-count-mobile, #cart-count-floating');
    console.log('updateCartCount: found elements:', countElements.length);
    
    countElements.forEach(el => {
        if (el) {
            el.textContent = count;
            el.classList.toggle('hidden', count === 0);
            console.log('updateCartCount: updated element:', el);
        }
    });
    console.log('=== updateCartCount complete ===\n');
}

// Parse price string to number
function parsePrice(priceStr) {
    if (!priceStr) return 0;
    const cleaned = priceStr.toString().replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
}

// Format price to currency
function formatPrice(price, currency = 'PHP') {
    if (currency === 'USD') {
        return `${price.toFixed(2)}`;
    }
    return `₱${price.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })}`;
}

// Clear cart
function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartCount();
    updateFloatingCart();
}

// Get personalization options
// NOTE: We use getPersonalizationOptionsFromUtils() directly instead of wrapping it
// to avoid infinite recursion. shared-utils.js already exposes getPersonalizationOptions
// to window, so we don't need to reassign it here.
function getPersonalizationOptions() {
    // Directly return the options array to avoid circular reference
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

// Render floating cart
function updateFloatingCart() {
    console.log('=== updateFloatingCart called ===');
    const floatingCart = document.getElementById('floating-cart');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total');
    
    console.log('updateFloatingCart: floatingCart found:', !!floatingCart);
    console.log('updateFloatingCart: cartItemsContainer found:', !!cartItemsContainer);
    console.log('updateFloatingCart: cartTotalElement found:', !!cartTotalElement);
    
    // If elements not found yet, try again after a short delay
    if (!floatingCart || !cartItemsContainer || !cartTotalElement) {
        console.log('updateFloatingCart: elements not found, scheduling retry');
        setTimeout(() => {
            updateFloatingCart();
        }, 100);
        return;
    }
    
    const cart = getCart();
    console.log('updateFloatingCart: cart from storage:', cart);
    console.log('updateFloatingCart: cart.items.length:', cart.items.length);
    
    // Ensure totals are calculated
    if (typeof cart.phpTotal === 'undefined' || typeof cart.total === 'undefined') {
        calculateCartTotal(cart);
        saveCart(cart);
    }
    
    if (cart.items.length === 0) {
        console.log('updateFloatingCart: cart is empty');
        floatingCart.classList.add('hidden');
        // Still update cart count badge
        updateCartCount();
        console.log('=== updateFloatingCart complete (empty) ===\n');
        return;
    }
    
    console.log('updateFloatingCart: showing cart with', cart.items.length, 'items');
    floatingCart.classList.remove('hidden');
    
    if (cartItemsContainer) {
        if (cart.items.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-center text-gray-500 py-8">Your cart is empty</p>';
        } else {
            cartItemsContainer.innerHTML = cart.items.map(item => `
                <div class="cart-item bg-white p-3 rounded-lg shadow-sm mb-2" data-item-id="${item.id}">
                    <div class="flex gap-3">
                        <img src="${item.img || PLACEHOLDER_IMG}" alt="${item.packageTitle}" class="w-16 h-16 object-cover rounded-lg" onerror="this.src=PLACEHOLDER_IMG">
                        <div class="flex-1">
                            <h4 class="font-bold text-sm text-[#1a4d41]">${item.packageTitle || 'Unknown Package'}</h4>
                            <p class="text-xs text-gray-500">${item.city || 'Unknown'} • ${item.paxSize || 1} pax</p>
                            <p class="text-xs text-gray-500">📅 ${formatDate(item.travelDate)}</p>
                            <p class="text-sm font-bold text-orange-500">${formatPrice(item.totalPrice || 0, item.originalCurrency || 'PHP')}</p>
                            ${item.personalization && item.personalization.length > 0 ? `
                                <div class="flex flex-wrap gap-1 mt-1">
                                    ${item.personalization.map(p => {
                                        const opt = getPersonalizationOptionsFromUtils().find(o => o.id === p);
                                        return opt ? `<span class="text-xs bg-gray-100 px-1 rounded">${opt.icon}</span>` : '';
                                    }).join('')}
                                </div>
                            ` : ''}
                        </div>
                        <button onclick="window.removeFromCart('${item.id}')" class="text-red-500 hover:text-red-700 flex-shrink-0">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    if (cartTotalElement) {
        // Display single total based on current currency preference
        const displayCurrency = window.currentCurrency || 'PHP';
        let displayTotal = cart.total || 0;
        
        // Convert total to display currency if needed
        if (displayCurrency === 'USD' && cart.phpTotal > 0) {
            displayTotal = cart.phpTotal / getExchangeRate();
        }
        
        let totalHTML = `<div class="space-y-2">
            <div class="flex justify-between items-center pt-2 border-t">
                <span class="font-bold text-[#1a4d41]">Total:</span>
                <span class="text-xl font-bold text-orange-500">${formatPrice(displayTotal, displayCurrency)}</span>
            </div>
        </div>`;
        cartTotalElement.innerHTML = totalHTML;
    }
    
    // Update cart count badge as well
    updateCartCount();
}

// Toggle floating cart
function toggleFloatingCart() {
    const floatingCart = document.getElementById('floating-cart');
    if (floatingCart) {
        floatingCart.classList.toggle('hidden');
    }
}

// Format date for display
function formatDate(dateStr) {
    if (!dateStr) return 'No date selected';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

// Checkout
function checkout() {
    const user = getCurrentUser();
    if (!user) {
        showNotification('Please log in to proceed with checkout', 'error');
        return;
    }
    
    const cart = getCart();
    if (cart.items.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    // Save booking
    const bookings = getBookings();
    const booking = {
        id: 'booking_' + Date.now(),
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        items: cart.items,
        total: cart.total,
        status: 'pending',
        createdAt: new Date().toISOString(),
        paymentStatus: 'unpaid'
    };
    
    bookings.push(booking);
    saveBookings(bookings);
    
    // Clear cart
    clearCart();
    
    // Send confirmation
    sendEmailNotification(user.email, 'booking_confirmation', booking);
    
    showNotification('Booking submitted successfully! We\'ll contact you soon.', 'success');
    
    return booking;
}

// Checkout from floating cart
function checkoutFromCart() {
    const floatingCart = document.getElementById('floating-cart');
    if (floatingCart) {
        floatingCart.classList.add('hidden');
    }
    checkout();
}

// Make functions globally available
console.log('cart.js: Exporting functions to window...');
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.getCart = getCart;
window.getCartCount = getCartCount;
window.updateCartCount = updateCartCount;
window.clearCart = clearCart;
window.toggleFloatingCart = toggleFloatingCart;
window.checkoutFromCart = checkoutFromCart;
window.parsePrice = typeof window.parsePrice === 'function' ? window.parsePrice : parsePrice;
window.formatPrice = typeof window.formatPrice === 'function' ? window.formatPrice : formatPrice;
window.formatDate = typeof window.formatDate === 'function' ? window.formatDate : formatDate;
window.getPersonalizationOptions = getPersonalizationOptions;
window.updateFloatingCart = updateFloatingCart;

console.log('cart.js: window.addToCart type:', typeof window.addToCart);
console.log('cart.js: window.updateCartCount type:', typeof window.updateCartCount);
console.log('cart.js: Export complete');

// Sync cart across browser tabs using storage event
window.addEventListener('storage', function(e) {
    if (e.key === CART_KEY) {
        // Cart was modified in another tab, update UI
        updateCartCount();
        updateFloatingCart();
    }
});

// Get all bookings (for admin)
function getBookings() {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
}

// Save bookings
function saveBookings(bookings) {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

// Get user bookings
function getUserBookings() {
    const user = getCurrentUser();
    if (!user) return [];
    
    const bookings = getBookings();
    return bookings.filter(b => b.userId === user.id);
}

// Initialize cart - should be called after components are loaded
window.initCartSystem = function() {
    updateCartCount();
    updateFloatingCart();
}

// For backward compatibility - remove DOMContentLoaded handler
// The initialization is now handled by main.js after components load

    } catch (error) {
        console.error('ERROR in cart.js:', error);
    }
})();
