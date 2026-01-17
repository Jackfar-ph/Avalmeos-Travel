// --- 1. COMPONENT LOADER ---
async function loadComponent(elementId, filePath) {
    const container = document.getElementById(elementId);
    if (!container) return;
    try {
        const response = await fetch(filePath);
        container.innerHTML = await response.text();
    } catch (err) { console.error(`Error loading ${filePath}:`, err); }
}

// --- 2. INITIALIZATION ---
async function initSite() {
    await Promise.all([
        loadComponent('navbar-placeholder', 'components/Navbar.html'),
        loadComponent('hero-placeholder', 'components/Hero.html'),
        loadComponent('destinations-placeholder', 'components/Destinations.html'),
        loadComponent('packages-placeholder', 'components/Packages.html'),
        loadComponent('tips-placeholder', 'components/Tips.html'),
        loadComponent('footer-placeholder', 'components/Footer.html')
    ]);

    setupNavigation();
    setupHeroSlider();
    setupSearch();
    setupCurrency();
    setupFormLogic();
    if (typeof initMap === "function") initMap();

    setTimeout(setupAnimations, 100); 
}

window.addEventListener('DOMContentLoaded', initSite);

// --- 3. FORM LOGIC ---
function setupFormLogic() {
    const form = document.getElementById('inquiry-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        document.getElementById('modal-form-content').classList.add('hidden');
        document.getElementById('modal-success-content').classList.remove('hidden');
    });
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

    targets.forEach(t => observer.observe(t));
}
// --- 5. CURRENCY TOGGLE ---
let currentCurrency = 'PHP'; 
const exchangeRate = 59.25;

function setupCurrency() {
    const btn = document.getElementById('currency-toggle');
    if(!btn) return;
    
    btn.addEventListener('click', () => {
        // 1. Toggle the state
        currentCurrency = currentCurrency === 'PHP' ? 'USD' : 'PHP';
        btn.innerText = currentCurrency === 'PHP' ? 'PHP ₱' : 'USD $';
        
        // 2. Update existing static prices
        document.querySelectorAll('.price-value').forEach(el => {
            const usd = parseFloat(el.getAttribute('data-usd'));
            el.innerText = currentCurrency === 'PHP' 
                ? `₱${(usd * exchangeRate).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}` 
                : `$${usd}`;
        });

        // 3. Re-render the Activity Grid if it is currently open
        const activeCityTitle = document.getElementById('selected-city-name').innerText;
        if (activeCityTitle && activeCityTitle.includes("Activities in")) {
            const cityName = activeCityTitle.replace('Activities in ', '');
            window.showActivities(cityName);
        }
    });
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

        // Filter cities from cityData
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

    // Close suggestion box when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionBox.contains(e.target)) {
            suggestionBox.classList.add('hidden');
        }
    });
}

window.selectSearch = function(city) {
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

    // Auto-rotate every 5 seconds
    setInterval(() => {
        let nextIndex = (currentIndex + 1) % thumbnails.length;
        changeHeroImage(nextIndex);
    }, 5000);
}

// --- 8. NAVIGATION ---
function setupNavigation() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll("nav ul li a");
    const sections = document.querySelectorAll("section[id]");

    // Select the three lines inside the button for animation
    const lines = menuBtn ? menuBtn.querySelectorAll('span') : [];

    // Function to close the menu and reset the icon
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
                // Open menu and turn hamburger into X
                mobileMenu.classList.remove('translate-x-full');
                if (lines.length >= 3) {
                    lines[0].classList.add('rotate-45', 'translate-y-2');
                    lines[1].classList.add('opacity-0');
                    lines[2].classList.add('-rotate-45', '-translate-y-2.5');
                }
            }
        };
    }

    // Auto-close menu when any link is clicked
    const links = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
    links.forEach(link => {
        link.onclick = () => closeMenu();
    });

    // Navbar Background Change on Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('bg-white', 'shadow-md', 'py-3');
            nav.classList.remove('bg-white/95');
        } else {
            nav.classList.remove('bg-white', 'shadow-md');
            nav.classList.add('bg-white/95');
        }
    });
}

// --- 9. ACTIVITY DISPLAY ---
function formatPrice(priceStr) {
    if (!priceStr) return "";
    let numericValue = parseFloat(priceStr.toString().replace(/[^\d.]/g, ''));

    // Handle conversion logic
    if (currentCurrency === 'PHP') {
        if (priceStr.toString().includes('₱')) return priceStr;
        let converted = Math.round(numericValue * exchangeRate);
        return `₱${converted.toLocaleString()}`;
    } else {
        if (priceStr.toString().includes('US$')) return priceStr;
        let converted = (numericValue / exchangeRate).toFixed(2);
        return `US$ ${converted}`;
    }
}

window.showActivities = function(cityName) {
    const display = document.getElementById('activities-display');
    const grid = document.getElementById('activities-grid');
    const title = document.getElementById('selected-city-name');

    if (!cityData[cityName]) return;
    
    title.innerText = `Activities in ${cityName}`;
    grid.innerHTML = ""; 

    // 1. Render Activity Cards
    cityData[cityName].forEach(act => {
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
                    <div class="mt-2 text-xl font-bold text-orange-600">From ${formatPrice(act.price)}</div>
                </div>
            </div>
        `;
    });

    // 2. Render the Green "Best Value" Package Card
    const pkg = packageData[cityName];
    if (pkg) {
        grid.innerHTML += `
            <div class="bg-[#1a4d41] text-white p-6 rounded-xl flex flex-col justify-between shadow-lg border-2 border-orange-500">
                <div>
                    <span class="bg-orange-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Best Value</span>
                    <h3 class="font-bold text-xl mt-3">${pkg.title}</h3>
                    <p class="text-xs opacity-80 mt-2 leading-relaxed">${pkg.details}</p>
                </div>
                <div class="mt-6">
                    <div class="text-2xl font-black text-orange-400">${formatPrice(pkg.price)}</div>
                    <button onclick="openModal()" class="w-full mt-3 bg-white text-[#1a4d41] font-bold py-3 rounded-lg hover:bg-orange-500 hover:text-white transition transform active:scale-95">
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
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Leaflet Map
    const map = L.map('map', {
        scrollWheelZoom: false 
    }).setView([12.8797, 121.7740], 6);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Marker for the Philippines
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
    const modal = document.getElementById('booking-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto'; 
    }
};