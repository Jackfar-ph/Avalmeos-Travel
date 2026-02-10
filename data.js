const cityData = {
    "Cebu City": [
        { title: "Cebu Ocean Park Ticket", price: 668, originalCurrency: "PHP", rating: "4.8", img: "Picture/Cebu Ocean Park.webp" },
        { title: "Oslob Whaleshark & Canyoneering", price: 3873, originalCurrency: "PHP", rating: "4.6", img: "Picture/Oslob Whaleshark.webp" },
        { title: "Cebu Private Day Tour", price: 1596, originalCurrency: "PHP", rating: "4.6", img: "Picture/Cebu City Private Day Tour.webp" },
        { title: "Plantation Bay Day Use", price: 2540, originalCurrency: "PHP", rating: "4.7", img: "Picture/Plantation Bay Day.webp" }
    ],
    "Manila": [
        { title: "Manila Ocean Park", price: 1059, originalCurrency: "PHP", rating: "4.7", img: "Picture/Manila Ocean Park.png" },
        { title: "Intramuros Bambike Tour", price: 1153, originalCurrency: "PHP", rating: "4.8", img: "Picture/Intramuros.webp" },
        { title: "Fort Santiago Ticket", price: 80, originalCurrency: "PHP", rating: "4.8", img: "Picture/Fort Santiago.jpg" },
        { title: "Okada Manila Tour", price: 1292, originalCurrency: "PHP", rating: "4.8", img: "Picture/Okada Manila.webp" }
    ],
    "Baguio": [
        { title: "Sky Ranch Baguio Pass", price: 876, originalCurrency: "PHP", rating: "4.5", img: "Picture/Sky Ranch Baguio.webp" },
        { title: "Atok Gardens Day Tour", price: 2241, originalCurrency: "PHP", rating: "4.9", img: "Picture/Atok Gardens.webp" },
        { title: "Breathe Baguio Tour", price: 2123, originalCurrency: "PHP", rating: "4.7", img: "Picture/Breathe Baguio.webp" },
        { title: "Mt. Ulap Hiking Tour", price: 1950, originalCurrency: "PHP", rating: "5.0", img: "Picture/Mt. Ulap Hiking Day Tour from Baguio.webp" }
    ],
    "Davao City": [
        { title: "Davao City Tour", price: 1321, originalCurrency: "PHP", rating: "4.7", img: "Picture/Davao City Tour.webp" },
        { title: "Malagos Garden Pass", price: 563, originalCurrency: "PHP", rating: "4.8", img: "Picture/Malagos Garden Resort.webp" },
        { title: "Nature Tour in Davao", price: 2540, originalCurrency: "PHP", rating: "4.8", img: "Picture/Nature Tour in Davao.webp" },
        { title: "Highlands Tour in Davao", price: 2041, originalCurrency: "PHP", rating: "4.8", img: "Picture/Highlands Tour in Davao.webp" }
    ],
    "Puerto Princesa": [
        { title: "Underground River Tour", price: 2192, originalCurrency: "PHP", rating: "4.7", img: "Picture/Puerto Princesa Underground River.webp" },
        { title: "Honda Bay Island Hopping", price: 1779, originalCurrency: "PHP", rating: "4.6", img: "Picture/Honda Bay Palawan Island.webp" },
        { title: "City Heritage Tour", price: 797, originalCurrency: "PHP", rating: "4.4", img: "Picture/Puerto Princesa City Heritage Tour.webp" },
        { title: "Sunset Watching", price: 1882, originalCurrency: "PHP", rating: "5.0", img: "Picture/Sunset Watching.webp" }
    ],
    "Iloilo": [
        { title: "Science XPdition Ticket", price: 596, originalCurrency: "PHP", rating: "4.5", img: "Picture/Science XPdition.webp" },
        { title: "Guimaras Island Tour", price: 3036, originalCurrency: "PHP", rating: "4.8", img: "Picture/Guimaras Island.webp" },
        { title: "Gigantes Island Boat Tour", price: 1492, originalCurrency: "PHP", rating: "4.2", img: "Picture/Gigantes & Sicogon Island.webp" },
        { title: "Iloilo Pilgrimage Tour", price: 1271, originalCurrency: "PHP", rating: "4.8", img: "Picture/Iloilo Pilgrimage.webp" }
    ]
};

const packageData = {
    "Cebu City": { title: "Cebu City Package Tour", price: 8497, originalCurrency: "PHP", details: "3D2N All-In: Hotel, Transfers, Temple of Leah, and Sirao Garden.", img: "Picture/Cebu City.jpg" },
    "Manila": { title: "Old Manila Heritage Tour", price: 2399, originalCurrency: "PHP", details: "Full Day: Intramuros, Luneta, and National Museum with Lunch.", img: "Picture/Old Manila.jpg" },
    "Baguio": { title: "Baguio City Package", price: 5898, originalCurrency: "PHP", details: "3D2N Escape: Camp John Hay, Mines View, and Strawberry Farm.", img: "Picture/Baguio.jpg" },
    "Davao City": { title: "Davao Highland Tour", price: 4198, originalCurrency: "PHP", details: "Nature Adventure: Eden Nature Park and Philippine Eagle Center.", img: "Picture/Davao.jpg" },
    "Puerto Princesa": { title: "Puerto Princesa Package", price: 7198, originalCurrency: "PHP", details: "Nature Escape: Underground River and Honda Bay Island Hopping.", img: "Picture/Puerto Princesa.jpg" },
    "Iloilo": { title: "Iloilo City & Gigantes", price: 6498, originalCurrency: "PHP", details: "Cultural & Island Tour: Molo Church and Islas de Gigantes.", img: "Picture/Iloilo.jpg" }
};

const packageMapping = {
    "Cebu City": "Cebu City Package Tour",
    "Manila": "Old Manila Heritage Tour",
    "Baguio": "Baguio City Package",
    "Davao City": "Davao Highland Tour",
    "Puerto Princesa": "Puerto Princesa Package",
    "Iloilo": "Iloilo City & Gigantes"
};

/**
 * Format activity card with proper price display
 * @param {Object} act - Activity data object
 * @returns {string} HTML string for activity card
 */
const renderActivityCard = (act) => `
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
        <div class="relative overflow-hidden rounded-xl mb-3">
            <img src="${act.img}" class="w-full h-32 object-cover transition-transform duration-500 hover:scale-110">
        </div>
        <h4 class="font-bold text-[#1a4d41] text-sm leading-tight h-10 overflow-hidden">${act.title}</h4>
        <div class="flex items-center justify-between mt-2">
            <span class="text-orange-500 text-xs font-bold">★ ${act.rating}</span>
            <span class="text-[#1a4d41] font-black text-sm">${window.formatPrice ? window.formatPrice(act.price, act.originalCurrency) : '₱' + act.price.toLocaleString()}</span>
        </div>
        <button class="w-full mt-3 py-2 text-[10px] font-bold uppercase tracking-wider border border-gray-200 rounded-lg hover:bg-[#1a4d41] hover:text-white transition">
            Book Now
        </button>
    </div>
`;

const cityPhotos = {
    "Cebu City": [
        "Picture/Cebu Ocean Park.webp",
        "Picture/Oslob Whaleshark.webp",
        "Picture/Cebu City Private Day Tour.webp",
        "Picture/Plantation Bay Day.webp"
    ],
    "Manila": [
        "Picture/Manila Ocean Park.png",
        "Picture/Intramuros.webp",
        "Picture/Fort Santiago.jpg",
        "Picture/Okada Manila.webp"
    ],
    "Baguio": [
        "Picture/Sky Ranch Baguio.webp",
        "Picture/Atok Gardens.webp",
        "Picture/Breathe Baguio.webp",
        "Picture/Mt. Ulap Hiking Day Tour from Baguio.webp"
    ],
    "Davao City": [
        "Picture/Davao City Tour.webp",
        "Picture/Malagos Garden Resort.webp",
        "Picture/Nature Tour in Davao.webp",
        "Picture/Highlands Tour in Davao.webp"
    ],
    "Puerto Princesa": [
        "Picture/Puerto Princesa Underground River.webp",
        "Picture/Honda Bay Palawan Island.webp",
        "Picture/Puerto Princesa City Heritage Tour.webp",
        "Picture/Sunset Watching.webp"
    ],
    "Iloilo": [
        "Picture/Science XPdition.webp",
        "Picture/Guimaras Island.webp",
        "Picture/Gigantes & Sicogon Island.webp",
        "Picture/Iloilo Pilgrimage.webp"
    ]
};