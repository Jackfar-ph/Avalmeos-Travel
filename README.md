# Avalmeo's Travel | Discover Philippines

A modern, responsive travel booking platform for the Philippines. Now a **full-stack application** with PostgreSQL database and RESTful API.

## 🚀 Full-Stack Features

### Frontend
- **Dynamic Component Loading:** Modular HTML components (Navbar, Hero, Destinations, etc.)
- **Real-time Search:** Filter destinations with live suggestions
- **Currency Toggle:** Switch between PHP and USD pricing
- **Interactive Map:** Leaflet.js-powered Philippines map
- **Booking System:** Inquiry forms with validation
- **Responsive Design:** Mobile-first with Tailwind CSS

### Backend (NEW)
- **RESTful API:** Express.js server with JWT authentication
- **PostgreSQL Database:** Persistent data storage
- **User Authentication:** Secure login/registration with JWT tokens
- **Booking Management:** Create, view, and manage reservations
- **Admin Dashboard:** Statistics and booking management

---

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- [Tailwind CSS](https://tailwindcss.com/) (via CDN)
- Google Fonts (Montserrat & Poppins)
- [Leaflet.js](https://leafletjs.com/) for maps

### Backend
- Node.js + Express.js
- PostgreSQL (database)
- JWT (authentication)
- bcryptjs (password hashing)

---

## 📂 Project Structure

```
Avalmeos-Travel/
├── index.html                    # Main entry point
├── cityDestination.html          # Dynamic city page
├── admin.html                    # Admin dashboard
├── style.css                     # Global styles
├── main.js                       # Core site logic
├── js/
│   ├── api.js                    # API client service ⭐ NEW
│   ├── auth.js                   # Authentication
│   ├── auth-handlers.js          # Auth UI handlers
│   ├── cart.js                   # Booking cart
│   ├── admin.js                  # Admin functionality
│   └── ...
├── data.js                       # Static data (fallback)
├── Picture/                      # Image assets
├── components/                   # HTML components
│   ├── Navbar.html
│   ├── Hero.html
│   ├── Destinations.html
│   └── ...
└── backend/                      # ⭐ NEW Backend
    ├── server.js                 # Express API server
    ├── package.json              # Node dependencies
    ├── .env.example              # Environment template
    ├── schema.sql                # Database schema
    ├── config/
    │   └── database.js          # PostgreSQL connection
    ├── middleware/
    │   └── auth.js              # JWT auth middleware
    └── scripts/
        ├── setup-db.js           # Database setup
        └── seed.js              # Sample data seeding
```

---

## 🔧 Backend Setup (PostgreSQL)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Setup PostgreSQL Database

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE avalmeos_travel;"

# Run the schema
psql -U postgres -d avalmeos_travel -f backend/schema.sql
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

Example `.env`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=avalmeos_travel
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5500
```

### 3. Seed Sample Data

```bash
cd backend
npm install
npm run db:seed
```

### 4. Start the API Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The API will run at `http://localhost:3000/api`

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |

### Destinations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/destinations` | Get all destinations |
| GET | `/api/destinations/:slug` | Get destination by slug |

### Activities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activities` | Get all activities |
| GET | `/api/activities/:slug` | Get activity by slug |
| GET | `/api/personalizations` | Get add-on options |

### Packages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/packages` | Get all packages |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create new booking |
| GET | `/api/bookings/my` | Get user's bookings |
| POST | `/api/bookings/:id/cancel` | Cancel booking |

### Inquiries
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/inquiries` | Submit inquiry |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/bookings` | All bookings |
| PUT | `/api/admin/bookings/:id/status` | Update booking status |
| GET | `/api/admin/inquiries` | All inquiries |

---

## 🎯 Frontend Setup

### Running with Backend

```bash
# Terminal 1: Start the backend
cd backend
npm run dev

# Terminal 2: Start the frontend (Live Server)
# Open index.html with Live Server extension
```

### Frontend API Integration

The new `js/api.js` file provides a clean API client:

```javascript
// Authentication
const user = await api.login(email, password);
const user = await api.register({ email, name, password });

// Get data from database
const destinations = await api.getDestinations();
const activities = await api.getActivities({ destination: 'cebu-city' });

// Bookings
await api.createBooking({
  activity_id: 1,
  guest_name: 'John Doe',
  guest_email: 'john@example.com',
  travel_date: '2024-03-15',
  number_of_people: 2,
  total_price: 150.00
});

const myBookings = await api.getMyBookings();
```

---

## 📱 Mobile Compatibility

Fully responsive design using Tailwind's `md:` and `lg:` breakpoints. Mobile navigation switches to a full-screen drawer.

---

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- CORS configuration
- Input validation

---

## 🚀 Deployment

### Backend (Railway/Render/Heroku)
1. Set environment variables in dashboard
2. Connect to PostgreSQL provider (Supabase/Neon)
3. Deploy `backend/` folder

### Frontend (Vercel/Netlify)
1. Set `API_URL` environment variable
2. Deploy static files
3. Configure CORS on backend

---

## 📝 License

MIT License - Feel free to use for your projects!
