// --- 1. SHARED UTILITIES ---
// Load centralized utilities to eliminate code duplication
// Shared utilities are loaded via script tag in index.html before main.js

// Fallback functions are now provided by js/utils/shared-utils.js

// --- 2. COMPONENT LOADER ---

// Component loading promise tracker
const componentLoadState = {
    navbar: false,
    hero: false,
    destinations: false,
    packages: false,
    tips: false,
    footer: false,
    modals: false
};

// Callback registry for component-dependent code
const componentReadyCallbacks = [];

// Register a callback to run when components are ready
window.registerComponentReady = function(callback) {
    if (typeof callback === 'function') {
        // Check if all components are already loaded
        if (Object.values(componentLoadState).every(Boolean)) {
            // Components already loaded, run callback immediately
            setTimeout(callback, 0);
        } else {
            componentReadyCallbacks.push(callback);
        }
    }
};

// Check if all components are ready
function checkComponentsReady() {
    if (Object.values(componentLoadState).every(Boolean)) {
        // All components loaded - dispatch event and run callbacks
        document.dispatchEvent(new CustomEvent('componentsLoaded'));
        
        // Run registered callbacks
        componentReadyCallbacks.forEach(callback => {
            try {
                callback();
            } catch (e) {
                console.error('Error in component ready callback:', e);
            }
        });
    }
}

// Modified component loader that tracks loading state
async function loadComponent(elementId, filePath) {
    console.log('[ComponentLoader] Loading:', elementId, 'from', filePath);
    const container = document.getElementById(elementId);
    if (!container) {
        console.warn('[ComponentLoader] Container not found:', elementId);
        return;
    }
    try {
        const response = await fetch(filePath);
        console.log('[ComponentLoader] Response status:', response.status, 'for', filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        container.innerHTML = await response.text();
        console.log('[ComponentLoader] Loaded:', elementId);
        
        // Trigger animations for newly loaded content
        const targets = container.querySelectorAll('section[id], .animate-on-scroll');
        targets.forEach(t => {
            // Add visible class immediately for sections in view
            const rect = t.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                t.classList.add('visible');
            }
        });
        
        // Mark component as loaded
        const componentName = elementId.replace('-placeholder', '');
        if (componentLoadState.hasOwnProperty(componentName)) {
            componentLoadState[componentName] = true;
            checkComponentsReady();
        }
    } catch (err) { 
        console.error(`Error loading ${filePath}:`, err);
        // Fallback: Try to load modals inline if fetch fails
        if (elementId === 'modals-placeholder') {
            loadModalsFallback(container);
        }
    }
}

// Fallback for modals if fetch fails
function loadModalsFallback(container) {
    container.innerHTML = `<!-- Booking Modal -->
<div id="booking-modal" class="fixed inset-0 z-50 hidden">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onclick="closeModal()"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <button onclick="closeModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">✕</button>
        <div id="modal-form-content">
            <div class="bg-[#1a4d41] px-6 py-6">
                <h2 class="text-xl font-bold text-white">Book Your Package</h2>
                <p class="text-white/80 text-sm mt-1" id="booking-city-name"></p>
            </div>
            <form id="booking-form" class="p-6 space-y-4">
                <div class="bg-gray-50 p-4 rounded-xl">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="font-bold text-[#1a4d41]" id="booking-package-name"></h3>
                            <p class="text-sm text-gray-500">Best Value Package</p>
                        </div>
                        <div class="text-2xl font-bold text-orange-500" id="booking-package-price"></div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Travel Date</label>
                        <input type="date" id="booking-date" required class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Number of Pax</label>
                        <input type="number" id="booking-pax" value="1" min="1" max="20" required class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                        <p class="text-xs text-gray-500 mt-1" id="pax-display">1 Person</p>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Personalize Your Trip (Optional)</label>
                    <div id="personalization-options" class="space-y-2 bg-gray-50 p-4 rounded-xl"></div>
                </div>
                <div class="bg-orange-50 p-4 rounded-xl">
                    <div class="flex justify-between items-center">
                        <span class="font-medium text-gray-700">Estimated Total:</span>
                        <span class="text-2xl font-bold text-orange-500" id="booking-price-display"></span>
                    </div>
                </div>
                <button type="submit" class="w-full bg-[#1a4d41] text-white font-bold py-4 rounded-lg text-lg">Add to Cart 🛒</button>
            </form>
        </div>
    </div>
</div>

<!-- Auth Modal -->
<div id="auth-modal" class="fixed inset-0 z-50 hidden">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onclick="closeAuthModal()"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <button onclick="closeAuthModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">✕</button>
        <div class="bg-[#1a4d41] px-6 py-8 text-center">
            <h2 class="text-2xl font-bold text-white">✈️ Avalmeo's Travel</h2>
            <p class="text-white/80 text-sm mt-1">Sign in to your account</p>
        </div>
        <div class="flex border-b">
            <button id="login-tab" onclick="showAuthTab('login')" class="flex-1 px-6 py-3 text-sm font-medium bg-[#1a4d41] text-white">Log In</button>
            <button id="signup-tab" onclick="showAuthTab('signup')" class="flex-1 px-6 py-3 text-sm font-medium bg-gray-100 text-gray-600">Sign Up</button>
        </div>
        <form id="login-form" class="p-6 space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="login-email" required class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="your@email.com">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" id="login-password" required class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="••••••••">
            </div>
            <button type="submit" onclick="handleLogin(event)" class="w-full bg-[#1a4d41] text-white font-bold py-3 rounded-lg">Log In</button>
        </form>
        <form id="signup-form" class="p-6 space-y-4 hidden">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" id="signup-name" required class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="John Doe">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="signup-email" required class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="your@email.com">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone (Philippines)</label>
                <input type="tel" id="signup-phone" required class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="09123456789">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" id="signup-password" required class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Min 6 chars">
            </div>
            <button type="submit" onclick="handleSignup(event)" class="w-full bg-[#1a4d41] text-white font-bold py-3 rounded-lg">Create Account</button>
        </form>
    </div>
</div>`;
    console.log('Loaded modals fallback');
    componentLoadState.modals = true;
    checkComponentsReady();
}

// Initialize site
async function initSite() {
    await Promise.all([
        loadComponent('navbar-placeholder', 'components/Navbar.html'),
        loadComponent('hero-placeholder', 'components/Hero.html'),
        loadComponent('destinations-placeholder', 'components/Destinations.html'),
        loadComponent('packages-placeholder', 'components/Packages.html'),
        loadComponent('tips-placeholder', 'components/Tips.html'),
        loadComponent('footer-placeholder', 'components/Footer.html'),
        loadComponent('modals-placeholder', 'components/Modals.html')
    ]);
    
    // Components are now loaded via checkComponentsReady()
}

// Listen for componentsLoaded event
document.addEventListener('componentsLoaded', function() {
    console.log('[Main] componentsLoaded event fired');
    
    // Run all initialization that depends on components
    setupNavigation();
    setupHeroSlider();
    setupSearch();
    setupCurrency();
    setupFormLogic();
    setupDateRestrictions();
    
    // Initialize destinations section (moved from inline script in Destinations.html)
    initDestinationsSection();
    
    // Initialize systems that depend on DOM elements
    if (typeof AuthUIManager !== 'undefined') {
        AuthUIManager.init();
    }
    
    if (typeof updateAuthUI === 'function') {
        updateAuthUI();
    }
    
    if (typeof initChatSystem === 'function') {
        initChatSystem();
    } else if (typeof initChatWidget === 'function') {
        initChatWidget();
    }
    
    if (typeof initCartSystem === 'function') {
        initCartSystem();
    }
    
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
    
    if (typeof updateFloatingCart === 'function') {
        updateFloatingCart();
    }
    
    if (typeof initMap === 'function') {
        try {
            // Small delay to ensure container is visible
            setTimeout(() => {
                console.log('Calling initMap with delay');
                initMap();
            }, 100);
        } catch (e) {
            console.error('Error initializing map:', e);
        }
    }
    
    // Initialize animation observer for scroll animations
    setTimeout(() => {
        setupAnimations();
        // Also trigger visible class for any sections already in view
        document.querySelectorAll('section[id], .animate-on-scroll').forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                section.classList.add('visible');
            }
        });
    }, 100);
});

window.addEventListener('DOMContentLoaded', initSite);

// --- 3. FORM LOGIC ---
function setupFormLogic() {
    document.addEventListener('submit', function(e) {
        if (e.target && e.target.id === 'inquiry-form') {
            e.preventDefault();
            handleInquirySubmit(e.target);
        }
        // Note: booking-form is handled by individual page scripts
    });
}

// Handle inquiry form submission
async function handleInquirySubmit(form) {
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };
    
    console.log('[Inquiry] Submitting:', data);
    
    try {
        const response = await fetch('/api/inquiries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        console.log('[Inquiry] Response:', result);
        
        if (response.ok) {
            // Show success message
            const formContainer = document.getElementById('contact-form-container');
            const successMsg = document.getElementById('contact-success-content');
            if (formContainer) formContainer.classList.add('hidden');
            if (successMsg) successMsg.classList.remove('hidden');
            
            // Reset form
            form.reset();
        } else {
            alert('Failed to send message: ' + (result.message || 'Please try again'));
        }
    } catch (error) {
        console.error('[Inquiry] Error:', error);
        alert('Failed to send message. Please check your connection and try again.');
    }
}

// --- 4. ANIMATIONS ---
function setupAnimations() {
    const targets = document.querySelectorAll('section[id], .animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            entry.target.classList.toggle('visible', entry.isIntersecting);
        });
    }, { 
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px" 
    });

    targets.forEach(t => {
        // Immediately add visible class if already in viewport
        const rect = t.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            t.classList.add('visible');
        } else {
            observer.observe(t);
        }
    });
}

// --- DESTINATIONS SECTION ---
function initDestinationsSection() {
    console.log('[Destinations] initDestinationsSection called');
    
    const container = document.getElementById('destinations-container');
    if (!container) {
        console.warn('[Destinations] Container not found');
        return;
    }
    
    console.log('[Destinations] Container found, checking homePageDataService...');
    console.log('[Destinations] homePageDataService exists:', typeof window.homePageDataService !== 'undefined');
    
    // Check if service is available and has data
    if (typeof window.homePageDataService !== 'undefined' && 
        window.homePageDataService.dataSources && 
        window.homePageDataService.dataSources.destinations && 
        window.homePageDataService.dataSources.destinations.length > 0) {
        console.log('[Destinations] Using service data - rendering now');
        window.homePageDataService.renderDestinations();
        return;
    }
    
    // If service exists but has no data, try to load via service
    if (typeof window.homePageDataService !== 'undefined') {
        console.log('[Destinations] Service exists but no data, loading via service...');
        window.homePageDataService.loadDestinations().then(() => {
            window.homePageDataService.renderDestinations();
        }).catch(e => {
            console.warn('[Destinations] Service load failed, using direct API:', e);
            loadDestinationsViaAPI();
        });
        return;
    }
    
    // Direct API fallback
    console.log('[Destinations] No service, using direct API');
    loadDestinationsViaAPI();
}

function loadDestinationsViaAPI() {
    console.log('[Destinations] Loading via direct API...');
    const container = document.getElementById('destinations-container');
    if (!container) return;
    
    fetch('/api/destinations?is_active=true')
        .then(response => {
            console.log('[Destinations] API response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('[Destinations] API response:', data);
            if (data.success && data.data) {
                renderDestinationsStatic(data.data);
                console.log(`[Destinations] Loaded ${data.data.length} destinations via direct API`);
            } else if (data.data && data.data.length === 0) {
                console.log('[Destinations] No destinations found in database');
                container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">No destinations found. <a href="admin.html" class="text-[#1a4d41] underline">Add destinations in admin panel</a> or run seed data.</div>';
            }
        })
        .catch(error => {
            console.error('[Destinations] Error loading destinations:', error);
            container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">Unable to load destinations: ' + error.message + '</div>';
        });
}

function renderDestinationsStatic(destinations) {
    const container = document.getElementById('destinations-container');
    if (!container) return;
    
    if (!destinations || destinations.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">No destinations found. Add destinations in the admin panel.</div>';
        return;
    }
    
    container.innerHTML = destinations.map(dest => `
        <div onclick="navigateToCity('${encodeURIComponent(dest.name)}')" class="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer shadow-lg hover:shadow-xl transition-all">
            <img src="${dest.hero_image || 'Picture/placeholder.jpg'}" 
                 class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                 onerror="this.src='Picture/placeholder.jpg'"
                 alt="${dest.name}">
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div class="absolute bottom-5 left-5 text-white">
                <p class="text-xs uppercase tracking-widest opacity-80">${dest.region || 'Philippines'}</p>
                <h3 class="font-bold text-lg">${dest.name}</h3>
            </div>
        </div>
    `).join('');
}

// --- 5. CURRENCY TOGGLE ---
// Global currency state
window.currentCurrency = 'PHP'; // Default to PHP
const exchangeRate = 59.25;

function setupCurrency() {
    const btn = document.getElementById('currency-toggle');
    if(!btn) return;
    
    // Initialize button text based on current state
    btn.innerText = window.currentCurrency === 'PHP' ? 'PHP ₱' : 'USD $';
    
    btn.addEventListener('click', () => {
        window.currentCurrency = window.currentCurrency === 'PHP' ? 'USD' : 'PHP';
        btn.innerText = window.currentCurrency === 'PHP' ? 'PHP ₱' : 'USD $';
        
        // Update all price displays
        document.querySelectorAll('.price-value').forEach(el => {
            const phpValue = parseFloat(el.getAttribute('data-php'));
            if (!isNaN(phpValue)) {
                if (window.currentCurrency === 'PHP') {
                    el.innerText = '₱' + phpValue.toLocaleString();
                } else {
                    const usdValue = phpValue / exchangeRate;
                    el.innerText = '$' + usdValue.toFixed(2);
                }
            }
        });
        
        // Update floating cart if open
        if (typeof window.updateFloatingCart === 'function') {
            window.updateFloatingCart();
        }
        
        // Refresh activities display if on city page
        const activeCityTitle = document.getElementById('selected-city-name');
        if (activeCityTitle && activeCityTitle.innerText.includes("Activities in")) {
            const cityName = activeCityTitle.innerText.replace('Activities in ', '');
            if (typeof window.showActivities === "function") {
                window.showActivities(cityName);
            }
        }
        
        // Save preference to localStorage
        localStorage.setItem('preferredCurrency', window.currentCurrency);
    });
    
    // Load saved preference
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency && (savedCurrency === 'PHP' || savedCurrency === 'USD')) {
        window.currentCurrency = savedCurrency;
        btn.innerText = window.currentCurrency === 'PHP' ? 'PHP ₱' : 'USD $';
    }
}

// --- 6. SEARCH LOGIC ---
function setupSearch() {
    const searchInput = document.getElementById('destination-search');
    const suggestionBox = document.getElementById('suggestion-box');
    
    if (!searchInput || !suggestionBox) return;

    searchInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        if (val.length < 1) {
            suggestionBox.classList.add('hidden');
            return;
        }

        const matches = Object.keys(cityData).filter(city => 
            city.toLowerCase().includes(val)
        );

        if (matches.length > 0) {
            suggestionBox.innerHTML = matches.map(city => `
                <div class="px-6 py-3 hover:bg-gray-100 cursor-pointer text-[#1a4d41] font-medium border-b border-gray-50 last:border-0"
                     onclick="selectSearch('${city}')">
                    ${city}
                </div>
            `).join('');
            suggestionBox.classList.remove('hidden');
        } else {
            suggestionBox.classList.add('hidden');
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionBox.contains(e.target)) {
            suggestionBox.classList.add('hidden');
        }
    });
}

window.selectSearch = function(city) {
    window.location.href = `cityDestination.html?city=${encodeURIComponent(city)}`;
};

// Navigate to city (preserves user session)
window.navigateToCity = function(city) {
    window.location.href = `cityDestination.html?city=${encodeURIComponent(city)}`;
};

// --- 7. HERO SLIDER ---
function setupHeroSlider() {
    const heroImg = document.getElementById('hero-main');
    const thumbnails = document.querySelectorAll('.nav-thumb');
    let currentIndex = 0;

    if (!heroImg || thumbnails.length === 0) return;

    function updateThumbnailBorders(index) {
        thumbnails.forEach((thumb, i) => {
            if (i === index) {
                thumb.classList.add('opacity-100', 'border-white');
                thumb.classList.remove('opacity-60', 'border-transparent');
            } else {
                thumb.classList.add('opacity-60', 'border-transparent');
                thumb.classList.remove('opacity-100', 'border-white');
            }
        });
    }

    function changeHeroImage(index) {
        const newSrc = thumbnails[index].getAttribute('data-src');
        heroImg.style.opacity = '0.8'; 
        heroImg.src = newSrc;
        setTimeout(() => { heroImg.style.opacity = '1'; }, 100);
        
        currentIndex = index;
        updateThumbnailBorders(index);
    }

    thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            changeHeroImage(index);
        });
    });

    setInterval(() => {
        let nextIndex = (currentIndex + 1) % thumbnails.length;
        changeHeroImage(nextIndex);
    }, 5000);
}

// --- 8. NAVIGATION ---
function setupNavigation() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll("nav ul li a");
    const sections = document.querySelectorAll("section[id]");

    const lines = menuBtn ? menuBtn.querySelectorAll('span') : [];

    const closeMenu = () => {
        if (mobileMenu) mobileMenu.classList.add('translate-x-full');
        if (lines.length >= 3) {
            lines[0].classList.remove('rotate-45', 'translate-y-2');
            lines[1].classList.remove('opacity-0');
            lines[2].classList.remove('-rotate-45', '-translate-y-2.5');
        }
    };

    if (menuBtn && mobileMenu) {
        menuBtn.onclick = () => {
            const isOpened = !mobileMenu.classList.contains('translate-x-full');
            
            if (isOpened) {
                closeMenu();
            } else {
                mobileMenu.classList.remove('translate-x-full');
                if (lines.length >= 3) {
                    lines[0].classList.add('rotate-45', 'translate-y-2');
                    lines[1].classList.add('opacity-0');
                    lines[2].classList.add('-rotate-45', '-translate-y-2.5');
                }
            }
        };
    }

    const links = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
    links.forEach(link => {
        link.onclick = () => closeMenu();
    });

    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('nav');
        if (!navbar) return;

        if (window.scrollY > 50) {
            navbar.classList.add('bg-white', 'shadow-md', 'py-3');
            navbar.classList.remove('bg-white/95');
        } else {
            navbar.classList.remove('bg-white', 'shadow-md');
            navbar.classList.add('bg-white/95');
        }

        let current = "";
        const isAtBottom = (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 10;
        if (isAtBottom) {
            current = sections[sections.length - 1].getAttribute("id");
        } else {
            sections.forEach((section) => {
                const sectionTop = section.offsetTop;
                if (pageYOffset >= sectionTop - 150) {
                    current = section.getAttribute("id");
                }
            });
        }

        navLinks.forEach((link) => {
            link.classList.remove('text-orange-500', 'font-bold', 'border-b-2', 'border-orange-500');
            const href = link.getAttribute("href");
            if (href && href.includes(current) && current !== "") {
                link.classList.add('text-orange-500', 'font-bold', 'border-b-2', 'border-orange-500');
            }
        });
    });
}

// --- 9. ACTIVITY DISPLAY ---
window.showActivities = function(cityName) {
    const display = document.getElementById('activities-display');
    const grid = document.getElementById('activities-grid');
    const title = document.getElementById('selected-city-name');

    if (!cityData[cityName]) return;
    
    title.innerText = `Activities in ${cityName}`;
    grid.innerHTML = ""; 

    cityData[cityName].forEach(act => {
        const displayPrice = window.currentCurrency === 'USD' 
            ? '$' + (act.price / exchangeRate).toFixed(2)
            : '₱' + act.price.toLocaleString();
        
        grid.innerHTML += `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div class="relative overflow-hidden rounded-xl aspect-video bg-gray-200">
                    <img src="${act.img}" class="w-full h-full object-cover">
                </div>
                <div class="mt-4">
                    <h3 class="font-bold text-lg leading-tight text-[#1a4d41]">${act.title}</h3>
                    <div class="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <span class="text-orange-500">★ ${act.rating}</span> • 100K+ booked
                    </div>
                    <div class="mt-2 text-xl font-bold text-orange-600">From ${displayPrice}</div>
                </div>
            </div>
        `;
    });

    const pkg = packageData[cityName];
    if (pkg) {
        const pkgDisplayPrice = window.currentCurrency === 'USD'
            ? '$' + (pkg.price / exchangeRate).toFixed(2)
            : '₱' + pkg.price.toLocaleString();
            
        grid.innerHTML += `
            <div class="bg-[#1a4d41] text-white p-6 rounded-xl flex flex-col justify-between shadow-lg border-2 border-orange-500">
                <div>
                    <span class="bg-orange-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Best Value</span>
                    <h3 class="font-bold text-xl mt-3">${pkg.title}</h3>
                    <p class="text-xs opacity-80 mt-2 leading-relaxed">${pkg.details}</p>
                </div>
                <div class="mt-6">
                    <div class="text-2xl font-black text-orange-400">${pkgDisplayPrice}</div>
                    <button onclick="openBookingModal('${cityName}')" class="w-full mt-3 bg-white text-[#1a4d41] font-bold py-3 rounded-lg hover:bg-orange-500 hover:text-white transition transform active:scale-95">
                        Book Full Package
                    </button>
                </div>
            </div>`;
    }

    display.classList.remove('hidden');
    display.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

window.closeActivities = function() {
    document.getElementById('activities-display').classList.add('hidden');
};

// --- 10. MAP INITIALIZATION ---
function initMap() {
    console.log('initMap called');
    const mapContainer = document.getElementById('map');
    console.log('Map container:', mapContainer);
    if (!mapContainer) {
        console.warn('Map container not found');
        return;
    }
    
    console.log('Initializing Leaflet map');
    const map = L.map('map', {
        scrollWheelZoom: false 
    }).setView([12.8797, 121.7740], 6);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker([12.8797, 121.7740]).addTo(map)
        .bindPopup("Welcome to the Philippines!")
        .openPopup();
}

// --- 11. MODAL CONTROLS ---
window.openModal = function() {
    const modal = document.getElementById('booking-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; 
    }
};

window.closeModal = function() {
    console.log('closeModal called');
    const modal = document.getElementById('booking-modal');
    if (modal) {
        console.log('Found modal, removing hidden class');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto'; 

        setTimeout(() => {
            const formContent = document.getElementById('modal-form-content');
            const successContent = document.getElementById('modal-success-content');
            const bookingForm = document.getElementById('booking-form');

            if (formContent) formContent.classList.remove('hidden');
            if (successContent) successContent.classList.add('hidden');
            if (bookingForm) bookingForm.reset(); 
        }, 300);
    }
};

// --- 12. DATE RESTRICTION (ENHANCED) ---
function setupDateRestrictions() {
    const dateInputs = document.querySelectorAll('input[type="date"], .date-picker');
    
    dateInputs.forEach(dateInput => {
        if (!dateInput) return;
        
        const today = new Date();
        const minDate = today.toISOString().split('T')[0];
        
        // Block past dates
        dateInput.setAttribute('min', minDate);
        
        // Set max date (2 years from now)
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 2);
        dateInput.setAttribute('max', maxDate.toISOString().split('T')[0]);
        
        // Add validation on change
        dateInput.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            
            if (selectedDate < todayDate) {
                showNotification('Please select a valid future date', 'error');
                this.value = '';
                return false;
            }
            
            // Check if date is more than 2 years in advance
            const maxFutureDate = new Date();
            maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 2);
            if (selectedDate > maxFutureDate) {
                showNotification('Please select a date within 2 years', 'error');
                this.value = '';
                return false;
            }
            
            return true;
        });
    });
}

// --- 13. AUTH UI FUNCTIONS ---
function initAuthUI() {
    // Auth UI is now managed by AuthUIManager in auth-handlers.js
    // This function is kept for compatibility
}

function updateAuthUI() {
    // Delegated to AuthUIManager
    if (typeof AuthUIManager !== 'undefined') {
        AuthUIManager.updateAuthUI();
    }
}

// --- 14. AUTH MODAL FUNCTIONS ---
window.openLoginModal = function() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('hidden');
        showAuthTab('login');
    }
};

window.openSignupModal = function() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('hidden');
        showAuthTab('signup');
    }
};

window.closeAuthModal = function() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
};

window.showAuthTab = function(tab) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    
    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        loginTab.classList.add('bg-[#1a4d41]', 'text-white');
        loginTab.classList.remove('bg-gray-100', 'text-gray-600');
        signupTab.classList.add('bg-gray-100', 'text-gray-600');
        signupTab.classList.remove('bg-[#1a4d41]', 'text-white');
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        signupTab.classList.add('bg-[#1a4d41]', 'text-white');
        signupTab.classList.remove('bg-gray-100', 'text-gray-600');
        loginTab.classList.add('bg-gray-100', 'text-gray-600');
        loginTab.classList.remove('bg-[#1a4d41]', 'text-white');
    }
};

// --- 15. BOOKING MODAL WITH PAX & PERSONALIZATION ---
window.openBookingModal = function(cityName) {
    const modal = document.getElementById('booking-modal');
    const pkg = packageData[cityName];
    
    if (modal && pkg) {
        document.getElementById('booking-city-name').textContent = cityName;
        document.getElementById('booking-package-name').textContent = pkg.title;
        document.getElementById('booking-package-price').textContent = pkg.price;
        
        // Reset form
        const form = document.getElementById('booking-form');
        if (form) form.reset();
        
        // Setup date validation
        setupDateValidation();
        
        // Setup pax change listener
        setupPaxListener();
        
        // Setup personalization
        setupPersonalization();
        
        // Calculate initial total price
        if (typeof window.calculateBookingTotal === 'function') {
            const priceDisplay = document.getElementById('booking-price-display');
            if (priceDisplay && pkg) {
                const basePrice = parsePrice(pkg.price);
                const initialPrice = basePrice * 1;
                priceDisplay.textContent = formatPrice(initialPrice);
            }
        }
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
};

// Date validation - prevent past dates
function setupDateValidation() {
    const dateInput = document.getElementById('booking-date');
    if (!dateInput) return;
    
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const minDate = `${year}-${month}-${day}`;
    
    dateInput.setAttribute('min', minDate);
    
    if (dateInput.value && dateInput.value < minDate) {
        dateInput.value = '';
    }
    
    dateInput.addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        
        if (selectedDate < todayDate) {
            showNotification('Please select a valid future date', 'error');
            this.value = '';
        }
    });
}

function setupPaxListener() {
    const paxInput = document.getElementById('booking-pax');
    const paxDisplay = document.getElementById('pax-display');
    const priceDisplay = document.getElementById('booking-price-display');
    
    function calculateTotalPrice() {
        const pax = parseInt(paxInput?.value) || 1;
        const basePrice = parsePrice(document.getElementById('booking-package-price')?.textContent);
        
        const selectedOptions = document.querySelectorAll('input[name="personalization"]:checked');
        const selectedIds = Array.from(selectedOptions).map(cb => cb.value);
        
        let multiplier = 1;
        selectedIds.forEach(id => {
            const option = getPersonalizationOptions().find(o => o.id === id);
            if (option) {
                multiplier += (option.priceMultiplier - 1);
            }
        });
        
        return basePrice * pax * multiplier;
    }
    
    if (paxInput && paxDisplay) {
        paxInput.addEventListener('input', () => {
            const pax = parseInt(paxInput.value) || 1;
            paxDisplay.textContent = `${pax} ${pax === 1 ? 'Person' : 'Persons'}`;
            
            if (priceDisplay) {
                priceDisplay.textContent = formatPrice(calculateTotalPrice());
            }
        });
    }
    
    window.calculateBookingTotal = calculateTotalPrice;
}

function setupPersonalization() {
    const container = document.getElementById('personalization-options');
    if (!container) return;
    
    const options = getPersonalizationOptions();
    container.innerHTML = options.map(opt => `
        <label class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
            <input type="checkbox" name="personalization" value="${opt.id}" 
                class="w-4 h-4 text-[#1a4d41] rounded focus:ring-[#1a4d41]" onchange="recalculatePrice()">
            <span class="text-lg">${opt.icon}</span>
            <span class="text-sm text-gray-700">${opt.name}</span>
            <span class="text-xs text-orange-500 ml-auto">+${((opt.priceMultiplier - 1) * 100).toFixed(0)}%</span>
        </label>
    `).join('');
}

window.recalculatePrice = function() {
    const total = window.calculateBookingTotal();
    if (total !== null) {
        const priceDisplay = document.getElementById('booking-price-display');
        if (priceDisplay) {
            priceDisplay.textContent = formatPrice(total);
        }
    }
};

// Handle booking form submission
document.addEventListener('submit', function(e) {
    if (e.target && e.target.id === 'booking-form') {
        if (window.location.pathname.includes('cityDestination')) {
            return;
        }
        
        e.preventDefault();
        
        const cityName = document.getElementById('booking-city-name').textContent;
        const pkg = packageData[cityName];
        const pax = parseInt(document.getElementById('booking-pax').value) || 1;
        const date = document.getElementById('booking-date').value;
        
        const personalization = Array.from(document.querySelectorAll('input[name="personalization"]:checked'))
            .map(cb => cb.value);
        
        if (!date) {
            showNotification('Please select a travel date', 'error');
            return;
        }
        
        const cartItem = window.addToCart(
            { ...pkg, city: cityName, id: cityName, originalCurrency: 'PHP' },
            pax,
            date,
            personalization
        );
        
        showNotification('Added to cart successfully!', 'success');
        closeModal();
        
        setTimeout(() => {
            toggleFloatingCart();
        }, 500);
    }
});

// --- 16. FLOATING CART ---
function initFloatingCart() {
    updateFloatingCart();
}

window.toggleFloatingCart = function() {
    const floatingCart = document.getElementById('floating-cart');
    if (floatingCart) {
        floatingCart.classList.toggle('hidden');
    }
};

window.checkoutFromCart = function() {
    checkout();
};

window.removeFromCartItem = function(itemId) {
    removeFromCart(itemId);
    showNotification('Item removed from cart', 'success');
};

// --- 17. CHAT WIDGET ---
function initChatWidget() {
    renderQuickReplies();
}

window.toggleChat = function() {
    const chatWidget = document.getElementById('chat-widget');
    const chatBtn = document.getElementById('chat-toggle-btn');
    
    if (chatWidget) {
        chatWidget.classList.toggle('hidden');
        if (!chatWidget.classList.contains('hidden')) {
            loadChatMessages();
            const chatInput = document.getElementById('chat-input');
            if (chatInput) chatInput.focus();
        }
    }
    
    if (chatBtn) {
        chatBtn.classList.toggle('hidden');
    }
};

// --- 18. HELPER FUNCTIONS ---
// Use shared-utils.js versions when available
window.packageData = window.packageData || {};

window.formatPrice = function(price, currency = 'PHP') {
    if (currency === 'USD') {
        return `${price.toFixed(2)}`;
    }
    return `₱${price.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })}`;
};

// --- 19. ACTIVITIES MODAL (from Packages.html) ---
// Store package data for booking
window.currentPackageData = {
    city: '',
    title: '',
    price: 0,
    img: ''
};

// Open activities modal for a city
window.openActivitiesModal = function(cityName, packageTitle, price, image) {
    const modal = document.getElementById('activities-modal');
    const title = document.getElementById('activities-modal-title');
    const grid = document.getElementById('activities-modal-grid');
    
    if (!modal || !title || !grid) {
        console.warn('Activities modal elements not found');
        return;
    }
    
    // Store package data for booking
    window.currentPackageData = {
        city: cityName,
        title: packageTitle,
        price: price,
        img: image
    };
    
    title.textContent = cityName + ' Activities';
    
    // Check if cityData exists
    if (typeof cityData === 'undefined') {
        console.warn('cityData not loaded');
        grid.innerHTML = '<p class="text-center text-gray-500 py-8">Loading activities...</p>';
    } else {
        const activities = cityData[cityName];
        if (!activities || activities.length === 0) {
            grid.innerHTML = '<p class="text-center text-gray-500 py-8">No activities available for ' + cityName + '</p>';
        } else {
            // Clear existing content and build safely using DOM to prevent XSS
            grid.innerHTML = '';
            
            activities.forEach(activity => {
                const activityCard = document.createElement('div');
                activityCard.className = 'bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all';
                
                const img = document.createElement('img');
                img.src = activity.img;
                img.alt = activity.title;
                img.className = 'w-full h-48 object-cover';
                
                const content = document.createElement('div');
                content.className = 'p-5';
                
                const h3 = document.createElement('h3');
                h3.className = 'font-bold text-lg text-[#1a4d41] mb-2';
                h3.textContent = activity.title;
                
                const p = document.createElement('p');
                p.className = 'text-gray-600 text-sm mb-4';
                p.textContent = activity.rating ? `★ ${activity.rating} rating` : '';
                
                const bottom = document.createElement('div');
                bottom.className = 'flex justify-between items-center';
                
                const price = document.createElement('span');
                price.className = 'font-bold text-orange-500 text-lg';
                price.textContent = '₱' + activity.price.toLocaleString();
                
                // Remove individual Book Now button - only "Book Full Package" button remains
                bottom.appendChild(price);
                
                content.appendChild(h3);
                content.appendChild(p);
                content.appendChild(bottom);
                
                activityCard.appendChild(img);
                activityCard.appendChild(content);
                
                grid.appendChild(activityCard);
            });
        }
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

// Close activities modal
window.closeActivitiesModal = function() {
    const modal = document.getElementById('activities-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
};

// Open booking modal
window.openBookingModal = function(cityName, packageTitle, price, image) {
    const modal = document.getElementById('booking-modal');
    const cityNameEl = document.getElementById('booking-city-name');
    const pkgNameEl = document.getElementById('booking-package-name');
    const pkgPriceEl = document.getElementById('booking-package-price');
    
    if (!modal || !cityNameEl || !pkgNameEl || !pkgPriceEl) {
        console.warn('Booking modal elements not found');
        return;
    }
    
    // Store data
    window.packageData[cityName] = {
        name: packageTitle,
        originalPrice: price,
        price: price,
        description: '',
        duration: '',
        included: [],
        excluded: [],
        image: image
    };
    
    cityNameEl.textContent = cityName;
    pkgNameEl.textContent = packageTitle;
    pkgPriceEl.textContent = '₱' + price.toLocaleString();
    
    // Reset form
    document.getElementById('booking-date').value = '';
    document.getElementById('booking-pax').value = '1';
    
    // Setup personalization
    if (typeof setupPersonalization === 'function') {
        setupPersonalization();
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

// --- 20. ADMIN DASHBOARD NAVIGATION ---
// Open admin dashboard
window.openAdminDashboard = function() {
    window.location.href = 'admin.html';
};

