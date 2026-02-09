// --- Cart System with Pax Size ---

const CART_KEY = 'avalmeos_cart';
const EXCHANGE_RATE = 59.25; // PHP to USD exchange rate

// Use exchangeRate from window if available (from main.js), otherwise use local constant
const getExchangeRate = () => (typeof window.exchangeRate !== 'undefined' ? window.exchangeRate : EXCHANGE_RATE);

// Personalization options
const personalizationOptions = [
    { id: 'hotel', name: 'Hotel Accommodation', icon: '🏨', priceMultiplier: 1.5 },
    { id: 'transport', name: 'Private Transport', icon: '🚗', priceMultiplier: 1.3 },
    { id: 'guide', name: 'Tour Guide', icon: '👨‍🏫', priceMultiplier: 1.2 },
    { id: 'meals', name: 'All Meals Included', icon: '🍽️', priceMultiplier: 1.4 },
    { id: 'insurance', name: 'Travel Insurance', icon: '🛡️', priceMultiplier: 1.1 },
    { id: 'photography', name: 'Professional Photography', icon: '📸', priceMultiplier: 1.25 },
    { id: 'souvenir', name: 'Souvenir Package', icon: '🎁', priceMultiplier: 1.15 },
    { id: 'wifi', name: 'Portable WiFi', icon: '📶', priceMultiplier: 1.05 }
];

// Get cart from storage
function getCart() {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : { items: [], total: 0 };
}

// Save cart to storage
function saveCart(cart) {
    console.log('saveCart called with:', cart);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    console.log('Cart saved to localStorage');
    
    // Update UI
    console.log('Calling updateCartCount...');
    updateCartCount();
    
    console.log('Calling updateFloatingCart...');
    updateFloatingCart();
    
    console.log('saveCart completed');
}

// Add item to cart
function addToCart(packageData, paxSize, travelDate, personalization = []) {
    console.log('addToCart called:', { 
        price: packageData.price, 
        paxSize, 
        travelDate, 
        personalization,
        originalCurrency: packageData.originalCurrency
    });
    
    const cart = getCart();
    console.log('Current cart before add:', cart);
    
    // Calculate price based on pax and personalization
    let basePrice = parsePrice(packageData.price);
    console.log('Parsed basePrice:', basePrice, 'from price:', packageData.price);
    let totalPrice = basePrice * paxSize;
    console.log('Calculated totalPrice:', totalPrice, '(pax:', paxSize, ')');
    
    // Apply personalization multipliers (additive approach to avoid exponential compounding)
    let multiplier = 1;
    personalization.forEach(persId => {
        const option = personalizationOptions.find(o => o.id === persId);
        if (option) {
            multiplier += (option.priceMultiplier - 1);
        }
    });
    totalPrice = totalPrice * multiplier;
    
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
    
    console.log('Adding item to cart:', cartItem);
    
    cart.items.push(cartItem);
    calculateCartTotal(cart);
    saveCart(cart);
    
    console.log('Cart saved, new cart:', cart);
    
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
    
    if (itemIndex !== -1) {
        const item = cart.items[itemIndex];
        
        if (updates.paxSize) {
            item.paxSize = updates.paxSize;
            // Recalculate price with additive multipliers
            let totalPrice = item.basePrice * item.paxSize;
            let multiplier = 1;
            item.personalization.forEach(persId => {
                const option = personalizationOptions.find(o => o.id === persId);
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
                const option = personalizationOptions.find(o => o.id === persId);
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
    // Update all cart count elements (there may be multiple in navbar and floating cart)
    const countElements = document.querySelectorAll('#cart-count, #cart-count-mobile');
    const count = getCartCount();
    countElements.forEach(el => {
        if (el) {
            el.textContent = count;
            el.classList.toggle('hidden', count === 0);
        }
    });
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
        return `US$ ${price.toFixed(2)}`;
    }
    return `₱${price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// Clear cart
function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartCount();
    updateFloatingCart();
}

// Get personalization options
function getPersonalizationOptions() {
    return personalizationOptions;
}

// Render floating cart
function updateFloatingCart() {
    console.log('updateFloatingCart called');
    
    const floatingCart = document.getElementById('floating-cart');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total');
    
    console.log('DOM elements found:', { floatingCart: !!floatingCart, cartItemsContainer: !!cartItemsContainer, cartTotalElement: !!cartTotalElement });
    
    // If elements not found yet, try again after a short delay
    if (!floatingCart || !cartItemsContainer || !cartTotalElement) {
        console.log('DOM elements not found, retrying in 100ms...');
        setTimeout(() => {
            updateFloatingCart();
        }, 100);
        return;
    }
    
    const cart = getCart();
    console.log('Cart data:', cart);
    
    // Ensure totals are calculated
    if (typeof cart.phpTotal === 'undefined' || typeof cart.total === 'undefined') {
        calculateCartTotal(cart);
        saveCart(cart);
    }
    
    if (cart.items.length === 0) {
        console.log('Cart is empty, hiding floating cart');
        floatingCart.classList.add('hidden');
        // Still update cart count badge
        updateCartCount();
        return;
    }
    
    console.log('Cart has items, showing floating cart');
    floatingCart.classList.remove('hidden');
    
    if (cartItemsContainer) {
        if (cart.items.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-center text-gray-500 py-8">Your cart is empty</p>';
        } else {
            cartItemsContainer.innerHTML = cart.items.map(item => `
                <div class="cart-item bg-white p-3 rounded-lg shadow-sm mb-2" data-item-id="${item.id}">
                    <div class="flex gap-3">
                        <img src="${item.img || 'Picture/default.jpg'}" alt="${item.packageTitle}" class="w-16 h-16 object-cover rounded-lg" onerror="this.src='Picture/default.jpg'">
                        <div class="flex-1">
                            <h4 class="font-bold text-sm text-[#1a4d41]">${item.packageTitle || 'Unknown Package'}</h4>
                            <p class="text-xs text-gray-500">${item.city || 'Unknown'} • ${item.paxSize || 1} pax</p>
                            <p class="text-xs text-gray-500">📅 ${formatDate(item.travelDate)}</p>
                            <p class="text-sm font-bold text-orange-500">${formatPrice(item.totalPrice || 0, item.originalCurrency || 'PHP')}</p>
                            ${item.personalization && item.personalization.length > 0 ? `
                                <div class="flex flex-wrap gap-1 mt-1">
                                    ${item.personalization.map(p => {
                                        const opt = personalizationOptions.find(o => o.id === p);
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
        // Display separate totals per currency
        let totalHTML = '<div class="space-y-2">';
        if ((cart.phpTotal || 0) > 0) {
            totalHTML += `<div class="flex justify-between items-center">
                <span class="font-bold text-[#1a4d41]">Packages:</span>
                <span class="text-lg font-bold text-orange-500">${formatPrice(cart.phpTotal, 'PHP')}</span>
            </div>`;
        }
        if ((cart.usdTotal || 0) > 0) {
            totalHTML += `<div class="flex justify-between items-center">
                <span class="font-bold text-[#1a4d41]">Activities:</span>
                <span class="text-lg font-bold text-orange-500">${formatPrice(cart.usdTotal, 'USD')}</span>
            </div>`;
        }
        totalHTML += `<div class="flex justify-between items-center pt-2 border-t">
            <span class="font-bold text-[#1a4d41]">Total:</span>
            <span class="text-xl font-bold text-orange-500">${formatPrice(cart.total || 0, 'PHP')}</span>
        </div></div>`;
        cartTotalElement.innerHTML = totalHTML;
    }
    
    // Update cart count badge as well
    updateCartCount();
    
    console.log('updateFloatingCart completed');
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
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.getCart = getCart;
window.getCartCount = getCartCount;
window.updateCartCount = updateCartCount;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.toggleFloatingCart = toggleFloatingCart;
window.checkoutFromCart = checkoutFromCart;
window.parsePrice = parsePrice;
window.formatPrice = formatPrice;
window.formatDate = formatDate;
window.getPersonalizationOptions = getPersonalizationOptions;
window.updateFloatingCart = updateFloatingCart;

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
