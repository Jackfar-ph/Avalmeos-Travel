# Avalmeo’s Travel | Discover Philippines

A modern, responsive travel landing page designed to showcase the beauty of the Philippines. This project features dynamic content loading, a custom search engine for destinations, currency conversion (PHP/USD), and a high-performance interactive map.

## 🚀 Features

### 1. **Dynamic Architecture**

* **Component-Based Loading:** Uses a custom JavaScript loader to fetch HTML components (`Navbar`, `Hero`, `Destinations`, etc.), making the code modular and easy to maintain.
* **Interactive Mobile Menu:** A custom-built hamburger menu that animates into an "X" and automatically closes upon link selection for a seamless mobile experience.

### 2. **Smart Search & Data**

* **Destination Search:** A real-time suggestion box that filters cities from a centralized `data.js` file.
* **Currency Toggle:** Instantly switch all prices between Philippine Peso (₱) and US Dollars ($) with automatic exchange rate calculation.

### 3. **Immersive UI/UX**

* **Hero Slider:** An auto-rotating hero section with smooth opacity transitions and thumbnail navigation.
* **Entrance Animations:** Scroll-triggered fade-in and slide-up animations using the `IntersectionObserver` API.
* **Card Zoom:** High-quality hover effects on activity cards that zoom images and lift text for better interactivity.

### 4. **Interactive Tools**

* **Leaflet.js Map:** A customized, lightweight interactive map centered on the Philippines with custom markers.
* **Booking Inquiry System:** A functional modal-based inquiry form with validation and success state handling.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) (via CDN)
* **Typography:** Google Fonts (Montserrat & Poppins)
* **Maps:** [Leaflet.js](https://leafletjs.com/)
* **Icons:** Custom SVG and CSS-based animations

---

## 📂 Project Structure

```text
├── index.html              # Main entry point
├── cityDestination.html    # Dynamic page for specific city details
├── style.css               # Global styles and custom animations
├── main.js                 # Site logic (Navigation, Search, Currency, Map)
├── data.js                 # Central database for cities and packages
├── components/             # Reusable HTML snippets
│   ├── Navbar.html
│   ├── Hero.html
│   ├── Destinations.html
│   ├── Packages.html
│   ├── Tips.html
│   └── Footer.html
└── Picture/                # Image assets

```

---

## 🔧 Installation & Setup

1. **Clone the repository:**
```bash
git clone https://github.com/Jackfar-ph/Avalmeos-Travel.git

```


2. **Open the project:**
Since the project uses `fetch()` to load components, it must be run on a local server to avoid CORS policy errors.
* **VS Code:** Use the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.
* **Python:** Run `python -m http.server` in the root directory.



---

## 📝 Usage

### Adding New Destinations

To add a new city, simply update the `cityData` and `packageData` objects in `data.js`:

```javascript
"New City": [
    { 
        title: "Activity Name", 
        price: "US$ 20.00", 
        rating: "4.9", 
        img: "Picture/your-image.jpg" 
    }
]

```

---

## 📱 Mobile Compatibility

The site is fully responsive, utilizing Tailwind’s `md:` and `lg:` breakpoints. The navigation switches from a standard horizontal list to a full-screen mobile drawer on smaller devices.
