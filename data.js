const cityData = {
    "Cebu City": [
        { title: "Cebu Ocean Park Ticket", price: "US$ 11.32", rating: "4.8", img: "Picture/Cebu Ocean Park.webp" },
        { title: "Oslob Whaleshark & Canyoneering", price: "US$ 65.65", rating: "4.6", img: "Picture/Oslob Whaleshark.webp" },
        { title: "Cebu Private Day Tour", price: "US$ 27.05", rating: "4.6", img: "Picture/Cebu City Private Day Tour.webp" },
        { title: "Plantation Bay Day Use", price: "US$ 43.05", rating: "4.7", img: "Picture/Plantation Bay Day.webp" }
    ],
    "Manila": [
        { title: "Manila Ocean Park", price: "US$ 17.95", rating: "4.7", img: "Picture/Manila Ocean Park.png" },
        { title: "Intramuros Bambike Tour", price: "US$ 19.55", rating: "4.8", img: "Picture/Intramuros.webp" },
        { title: "Fort Santiago Ticket", price: "US$ 1.35", rating: "4.8", img: "Picture/Fort Santiago.jpg" },
        { title: "Okada Manila Tour", price: "US$ 21.89", rating: "4.8", img: "Picture/Okada Manila.webp" }
    ],
    "Baguio": [
        { title: "Sky Ranch Baguio Pass", price: "US$ 14.85", rating: "4.5", img: "Picture/Sky Ranch Baguio.webp" },
        { title: "Atok Gardens Day Tour", price: "US$ 37.99", rating: "4.9", img: "Picture/Atok Gardens.webp" },
        { title: "Breathe Baguio Tour", price: "US$ 35.99", rating: "4.7", img: "Picture/Breathe Baguio.webp" },
        { title: "Mt. Ulap Hiking Tour", price: "US$ 33.05", rating: "5.0", img: "Picture/Mt. Ulap Hiking Day Tour from Baguio.webp" }
    ],
    "Davao City": [
        { title: "Davao City Tour", price: "US$ 22.39", rating: "4.7", img: "Picture/Davao City Tour.webp" },
        { title: "Malagos Garden Pass", price: "US$ 9.55", rating: "4.8", img: "Picture/Malagos Garden Resort.webp" },
        { title: "Nature Tour in Davao", price: "US$ 43.05", rating: "4.8", img: "Picture/Nature Tour in Davao.webp" },
        { title: "Highlands Tour in Davao", price: "US$ 34.59", rating: "4.8", img: "Picture/Highlands Tour in Davao.webp" }
    ],
    "Puerto Princesa": [
        { title: "Underground River Tour", price: "US$ 37.15", rating: "4.7", img: "Picture/Puerto Princesa Underground River.webp" },
        { title: "Honda Bay Island Hopping", price: "US$ 30.15", rating: "4.6", img: "Picture/Honda Bay Palawan Island.webp" },
        { title: "City Heritage Tour", price: "US$ 13.50", rating: "4.4", img: "Picture/Puerto Princesa City Heritage Tour.webp" },
        { title: "Sunset Watching", price: "US$ 31.89", rating: "5.0", img: "Picture/Sunset Watching.webp" }
    ],
    "Iloilo": [
        { title: "Science XPdition Ticket", price: "US$ 10.10", rating: "4.5", img: "Picture/Science XPdition.webp" },
        { title: "Guimaras Island Tour", price: "US$ 51.45", rating: "4.8", img: "Picture/Guimaras Island.webp" },
        { title: "Gigantes Island Boat Tour", price: "US$ 25.29", rating: "4.2", img: "Picture/Gigantes & Sicogon Island.webp" },
        { title: "Iloilo Pilgrimage Tour", price: "US$ 21.55", rating: "4.8", img: "Picture/Iloilo Pilgrimage.webp" }
    ]
};

const packageData = {
    "Cebu City": { title: "Cebu City Package Tour", price: "₱8,497", details: "3D2N All-In: Hotel, Transfers, Temple of Leah, and Sirao Garden.", img: "Picture/Cebu City.jpg" },
    "Manila": { title: "Old Manila Heritage Tour", price: "₱2,399", details: "Full Day: Intramuros, Luneta, and National Museum with Lunch.", img: "Picture/Old Manila.jpg" },
    "Baguio": { title: "Baguio City Package", price: "₱5,898", details: "3D2N Escape: Camp John Hay, Mines View, and Strawberry Farm.", img: "Picture/Baguio.jpg" },
    "Davao City": { title: "Davao Highland Tour", price: "₱4,198", details: "Nature Adventure: Eden Nature Park and Philippine Eagle Center.", img: "Picture/Davao.jpg" },
    "Puerto Princesa": { title: "Puerto Princesa Package", price: "₱7,198", details: "Nature Escape: Underground River and Honda Bay Island Hopping.", img: "Picture/Puerto Princesa.jpg" },
    "Iloilo": { title: "Iloilo City & Gigantes", price: "₱6,498", details: "Cultural & Island Tour: Molo Church and Islas de Gigantes.", img: "Picture/Iloilo.jpg" }
};

const packageMapping = {
    "Cebu City": "Cebu City Package Tour",
    "Manila": "Old Manila Heritage Tour",
    "Baguio": "Baguio City Package",
    "Davao City": "Davao Highland Tour",
    "Puerto Princesa": "Puerto Princesa Package",
    "Iloilo": "Iloilo City & Gigantes"
};

const renderActivityCard = (act) => `
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
        <div class="relative overflow-hidden rounded-xl mb-3">
            <img src="${act.img}" class="w-full h-32 object-cover transition-transform duration-500 hover:scale-110">
        </div>
        <h4 class="font-bold text-[#1a4d41] text-sm leading-tight h-10 overflow-hidden">${act.title}</h4>
        <div class="flex items-center justify-between mt-2">
            <span class="text-orange-500 text-xs font-bold">★ ${act.rating}</span>
            <span class="text-[#1a4d41] font-black text-sm">${act.price}</span>
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