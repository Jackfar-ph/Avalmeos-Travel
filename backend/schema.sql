-- =====================================================
-- AVALMEO'S TRAVEL - DATABASE SCHEMA
-- PostgreSQL Schema for Supabase
-- =====================================================

-- Drop existing tables (if any) to avoid conflicts
DROP TABLE IF EXISTS booking_activities CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS destinations CASCADE;
DROP TABLE IF EXISTS personalization_options CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('admin', 'customer');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE inquiry_status AS ENUM ('new', 'in_progress', 'resolved', 'closed');

-- =====================================================
-- USERS TABLE (Supabase Auth Integration)
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role DEFAULT 'customer',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER PROFILES TABLE
-- =====================================================

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PERSONALIZATION OPTIONS TABLE
-- =====================================================

CREATE TABLE personalization_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    option_key TEXT NOT NULL,
    option_value TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DESTINATIONS TABLE
-- =====================================================

CREATE TABLE destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    location TEXT NOT NULL,
    region TEXT NOT NULL,
    country TEXT DEFAULT 'Philippines',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    hero_image TEXT,
    gallery JSONB DEFAULT '[]',
    highlights JSONB DEFAULT '[]',
    best_time_to_visit TEXT,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ACTIVITIES TABLE
-- =====================================================

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    activity_type TEXT NOT NULL,
    duration TEXT,
    difficulty TEXT,
    max_group_size INTEGER,
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2),
    currency TEXT DEFAULT 'PHP',
    hero_image TEXT,
    gallery JSONB DEFAULT '[]',
    inclusions JSONB DEFAULT '[]',
    exclusions JSONB DEFAULT '[]',
    requirements TEXT,
    cancellation_policy TEXT,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BOOKINGS TABLE
-- =====================================================

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'PHP',
    status booking_status DEFAULT 'pending',
    special_requests TEXT,
    admin_notes TEXT,
    confirmed_by UUID REFERENCES users(id),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BOOKING ACTIVITIES TABLE (Many-to-Many)
-- =====================================================

CREATE TABLE booking_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE RESTRICT,
    participants INTEGER NOT NULL DEFAULT 1,
    activity_date DATE NOT NULL,
    activity_time TEXT,
    price_per_person DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INQUIRIES TABLE
-- =====================================================

CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    inquiry_type TEXT DEFAULT 'general',
    status inquiry_status DEFAULT 'new',
    priority TEXT DEFAULT 'normal',
    assigned_to UUID REFERENCES users(id),
    response TEXT,
    responded_by UUID REFERENCES users(id),
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REVIEWS TABLE
-- =====================================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FAVORITES TABLE
-- =====================================================

CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, destination_id, activity_id)
);

-- =====================================================
-- SEARCH HISTORY TABLE
-- =====================================================

CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    filters JSONB DEFAULT '{}',
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS/EVENTS TABLE
-- =====================================================

CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id TEXT,
    page_url TEXT,
    referrer_url TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PACKAGES TABLE
-- =====================================================

CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration INTEGER DEFAULT 1,
    package_type TEXT DEFAULT 'all-inclusive',
    hero_image TEXT,
    gallery JSONB DEFAULT '[]',
    activities JSONB DEFAULT '[]',
    inclusions JSONB DEFAULT '[]',
    exclusions JSONB DEFAULT '[]',
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_packages_destination ON packages(destination_id);
CREATE INDEX idx_packages_active ON packages(is_active, is_featured);
CREATE INDEX idx_packages_price ON packages(price);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Packages - public read, admin write
CREATE POLICY "Public can view packages" ON packages FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage packages" ON packages FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- TRIGGER FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA FOR DESTINATIONS
-- =====================================================

INSERT INTO destinations (name, slug, description, short_description, location, region, country, hero_image, highlights, best_time_to_visit, average_rating, total_reviews, is_featured, is_active) VALUES
('Cebu City', 'cebu-city', 'Cebu City, known as the Queen City of the South, is a vibrant metropolitan destination offering a perfect blend of urban sophistication and natural beauty. Home to historical landmarks, pristine beaches, and world-class resorts.', 'The Queen City of the South with beaches and history', 'Cebu City', 'Visayas', 'Philippines', 'Picture/Cebu City.webp', '["Magellan\'s Cross", "Basilica del Santo Niño", "Fort San Pedro", "Sialdara Hills", "Oslob Whalesharks", "Kawasan Falls"]', 'November to February', 4.5, 1250, true, true),
('Manila', 'manila', 'The capital city of the Philippines, Manila is a bustling metropolis where modern skyscrapers stand alongside historical Spanish-era buildings. Experience the rich cultural heritage of the nation.', 'The capital with rich historical heritage', 'Manila', 'Luzon', 'Philippines', 'Picture/Manila.webp', '["Intramuros", "Rizal Park", "San Agustin Church", "Fort Santiago", "Mall of Asia", "National Museum"]', 'December to February', 4.3, 2100, true, true),
('Baguio', 'baguio', 'Baguio City, the Summer Capital of the Philippines, is a mountain resort city known for its cool climate, pine forests, and vibrant flower gardens. A popular getaway from the tropical heat.', 'Mountain resort city with cool climate', 'Baguio City', 'Cordillera Administrative Region', 'Philippines', 'Picture/Baguio.webp', '["Mines View Park", "Burnham Park", "Wright Park", "The Mansion", "Session Road", "Strawberry Fields"]', 'March to May', 4.6, 1800, true, true),
('Davao City', 'davao-city', 'Davao City is the largest city in the Philippines by land area, offering diverse attractions from exotic wildlife to pristine beaches. Home to the famous Philippine Eagle and delicious durian.', 'Largest city with exotic wildlife and beaches', 'Davao City', 'Mindanao', 'Philippines', 'Picture/Davao.webp', '["Philippine Eagle Center", "Mount Apo", "Eden Nature Park", "Samal Island", "Durian Capital", "Malagos Garden Resort"]', 'December to February', 4.4, 950, true, true),
('Puerto Princesa', 'puerto-princesa', 'Puerto Princesa is the gateway to the world-renowned Underground River and stunning limestone cliffs. This coastal city offers world-class diving, pristine beaches, and incredible biodiversity.', 'Gateway to the Underground River', 'Puerto Princesa', 'Palawan', 'Philippines', 'Picture/Puerto Princesa.webp', '["Underground River", "Honda Bay", "Baker\'s Hill", "Mitra Ranch", "Iwahig Prison", "Nacpan Beach"]', 'November to April', 4.7, 1650, true, true),
('Iloilo', 'iloilo', 'Iloilo Province is a treasure trove of Spanish colonial heritage, pristine islands, and delicious cuisine. Home to the world-famous Dinagyang Festival and the stunning Gigantes Islands.', 'Heritage sites and stunning islands', 'Iloilo City', 'Visayas', 'Philippines', 'Picture/Iloilo.webp', '["Miag-ao Church", "Gigantes Islands", "Bonbon-Bonbon Church", "Culasi Church", "Trekking to Tarugusan", "Heritage Houses"]', 'November to April', 4.5, 780, true, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED DATA FOR SAMPLE PACKAGES
-- =====================================================

INSERT INTO packages (name, slug, description, destination_id, price, duration, package_type, hero_image, activities, inclusions, exclusions, is_featured, is_active) VALUES
('Cebu City Package Tour', 'cebu-city-package', 'Explore the Queen City of the South with our comprehensive 3D2N package', (SELECT id FROM destinations WHERE slug='cebu-city' LIMIT 1), 8500, 3, 'all-inclusive', 'Picture/Cebu City.jpg', '["City Tour", "Food Trip", "Beach Visit", "Simala Church"]', '["Hotel", "Breakfast", "Tour Guide", "Transfers", "Entrance Fees"]', '["Airfare", "Personal expenses", "Tips"]', true, true),
('Old Manila Heritage Tour', 'old-manila-heritage', 'Discover the rich history of Manila through its heritage sites', (SELECT id FROM destinations WHERE slug='manila' LIMIT 1), 2400, 1, 'day-tour', 'Picture/Old Manila.jpg', '["Intramuros Tour", "Fort Santiago", "San Agustin Church", "Casa Real"]', '["Tour Guide", "Transfers", "Entrance Fees"]', '["Meals", "Personal expenses"]', false, true),
('Baguio City Package', 'baguio-city-package', 'Escape to the Summer Capital of the Philippines', (SELECT id FROM destinations WHERE slug='baguio' LIMIT 1), 5900, 3, 'all-inclusive', 'Picture/Baguio.jpg', '["City Tour", "Mines View Park", "Wright Park", "Session Road"]', '["Hotel", "Breakfast", "Tour Guide", "Transfers"]', '["Airfare", "Personal expenses", "Activities not mentioned"]', true, true),
('Davao Highland Tour', 'davao-highland-tour', 'Experience the natural beauty of Davao highlands', (SELECT id FROM destinations WHERE slug='davao-city' LIMIT 1), 4200, 1, 'day-tour', 'Picture/Davao.jpg', '["Malagos Garden Resort", "Eden Nature Park", "Philippine Eagle Center"]', '["Tour Guide", "Transfers", "Entrance Fees", "Lunch"]', '["Personal expenses", "Airfare"]', false, true),
('Puerto Princesa Package', 'puerto-princesa-package', 'Explore the Underground River and more in Palawan', (SELECT id FROM destinations WHERE slug='puerto-princesa' LIMIT 1), 7200, 3, 'all-inclusive', 'Picture/Puerto Princesa.jpg', '["Underground River Tour", "City Tour", "Baker''s Hill", "Iwahig Prison"]', '["Hotel", "Breakfast", "Tour Guide", "Transfers", "Boat Tour"]', '["Airfare", "Personal expenses", "Tips"]', true, true),
('Iloilo City & Gigantes', 'iloilo-city-gigantes', 'Discover Iloilo City and the stunning Gigantes Islands', (SELECT id FROM destinations WHERE slug='iloilo' LIMIT 1), 6500, 4, 'all-inclusive', 'Picture/Iloilo.jpg', '["City Tour", "Gigantes Island Hopping", "Heritage Churches", "Dining at District"]', '["Hotel", "All Meals", "Tour Guide", "Boat Tour", "Transfers"]', '["Airfare", "Personal expenses"]', false, true)
ON CONFLICT DO NOTHING;

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_destinations_region ON destinations(region);
CREATE INDEX idx_destinations_active ON destinations(is_active, is_featured);
CREATE INDEX idx_activities_destination ON activities(destination_id);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_price ON activities(price);
CREATE INDEX idx_activities_active ON activities(is_active, is_featured);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_date ON bookings(created_at);
CREATE INDEX idx_booking_activities_booking ON booking_activities(booking_id);
CREATE INDEX idx_booking_activities_date ON booking_activities(activity_date);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_email ON inquiries(email);
CREATE INDEX idx_reviews_destination ON reviews(destination_id);
CREATE INDEX idx_reviews_activity ON reviews(activity_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX idx_favorites_user ON favorites(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalization_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users table - everyone can sign up, users can view own data
CREATE POLICY "Allow public signup" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- User profiles - users manage own profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own profile" ON user_profiles FOR ALL USING (auth.uid() = user_id);

-- Destinations - public read, admin write
CREATE POLICY "Public can view destinations" ON destinations FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage destinations" ON destinations FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Activities - public read, admin write
CREATE POLICY "Public can view activities" ON activities FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage activities" ON activities FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Bookings - users manage own bookings, admins manage all
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can view all bookings" ON bookings FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Booking activities - same as bookings
CREATE POLICY "Users can view own booking activities" ON booking_activities FOR SELECT USING (
    EXISTS (SELECT 1 FROM bookings WHERE id = booking_id AND auth.uid() = user_id)
);

-- Inquiries - public create, admin manage, owner view
CREATE POLICY "Public can create inquiries" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view own inquiries" ON inquiries FOR SELECT USING (auth.email() = email OR auth.uid() = assigned_to);
CREATE POLICY "Admins can manage inquiries" ON inquiries FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Reviews - authenticated create, public read, owner/admin manage
CREATE POLICY "Authenticated can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Public can view reviews" ON reviews FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can manage own reviews" ON reviews FOR ALL USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Favorites - users manage own
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- Search history - users manage own
CREATE POLICY "Users can manage own search history" ON search_history FOR ALL USING (auth.uid() = user_id);

-- Analytics events - no direct access, handled by server
CREATE POLICY "System can insert analytics" ON analytics_events FOR INSERT WITH CHECK (true);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON destinations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
DECLARE
    prefix TEXT := 'AVL';
    random_suffix TEXT;
BEGIN
    random_suffix := upper(substring(md5(random()::text) from 1 for 6));
    NEW.booking_reference := prefix || '-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || random_suffix;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for booking reference
CREATE TRIGGER set_booking_reference BEFORE INSERT ON bookings FOR EACH ROW EXECUTE FUNCTION generate_booking_reference();

-- =====================================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- =====================================================

-- Get booking statistics
CREATE OR REPLACE FUNCTION get_booking_stats(p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
    total_bookings BIGINT,
    confirmed_bookings BIGINT,
    pending_bookings BIGINT,
    cancelled_bookings BIGINT,
    total_revenue DECIMAL,
    avg_booking_value DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT AS total_bookings,
        COUNT(*) FILTER (WHERE status = 'confirmed')::BIGINT AS confirmed_bookings,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT AS pending_bookings,
        COUNT(*) FILTER (WHERE status = 'cancelled')::BIGINT AS cancelled_bookings,
        COALESCE(SUM(final_amount), 0)::DECIMAL AS total_revenue,
        COALESCE(AVG(final_amount), 0)::DECIMAL AS avg_booking_value
    FROM bookings
    WHERE created_at::DATE >= p_start_date AND created_at::DATE <= p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Get popular destinations
CREATE OR REPLACE FUNCTION get_popular_destinations(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    destination_id UUID,
    destination_name TEXT,
    booking_count BIGINT,
    avg_rating DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id AS destination_id,
        d.name AS destination_name,
        COUNT(ba.id)::BIGINT AS booking_count,
        d.average_rating AS avg_rating
    FROM destinations d
    LEFT JOIN activities a ON a.destination_id = d.id
    LEFT JOIN booking_activities ba ON ba.activity_id = a.id
    LEFT JOIN bookings b ON b.id = ba.booking_id AND b.status IN ('pending', 'confirmed')
    WHERE d.is_active = true
    GROUP BY d.id, d.name, d.average_rating
    ORDER BY booking_count DESC NULLS LAST
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA FOR PERSONALIZATION OPTIONS
-- =====================================================

INSERT INTO personalization_options (category, option_key, option_value, display_order) VALUES
('travel_style', 'adventure', 'Adventure & Thrill', 1),
('travel_style', 'relaxation', 'Relaxation & Wellness', 2),
('travel_style', 'cultural', 'Cultural & Heritage', 3),
('travel_style', 'nature', 'Nature & Eco-Tourism', 4),
('travel_style', 'foodie', 'Food & Culinary', 5),
('travel_style', 'family', 'Family & Kids', 6),
('travel_style', 'romantic', 'Romantic & Couples', 7),
('travel_style', 'budget', 'Budget & Backpacking', 8),
('budget_range', 'budget', 'Budget-Friendly ($)', 1),
('budget_range', 'mid_range', 'Mid-Range ($$)', 2),
('budget_range', 'luxury', 'Luxury ($$$)', 3),
('budget_range', 'premium', 'Premium ($$$$)', 4),
('travel_duration', 'day_trip', 'Day Trip', 1),
('travel_duration', 'weekend', 'Weekend (2-3 days)', 2),
('travel_duration', 'week', 'Week-long (5-7 days)', 3),
('travel_duration', 'extended', 'Extended (2+ weeks)', 4),
('travel_group', 'solo', 'Solo Traveler', 1),
('travel_group', 'couple', 'Couple', 2),
('travel_group', 'family_small', 'Small Family (3-4)', 3),
('travel_group', 'family_large', 'Large Family (5+)', 4),
('travel_group', 'friends', 'Friends Group', 5),
('travel_group', 'corporate', 'Corporate/Team', 6);

-- =====================================================
-- CREATE DEFAULT ADMIN USER
-- Note: Password will be hashed by the application
-- =====================================================

INSERT INTO users (email, password_hash, role, is_active, email_verified)
VALUES ('admin@avalmeo.com', '--HASHED_PASSWORD_PLACEHOLDER--', 'admin', true, true)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE users IS 'User accounts with Supabase Auth integration';
COMMENT ON TABLE destinations IS 'Travel destinations with detailed information';
COMMENT ON TABLE activities IS 'Activities and tours available at destinations';
COMMENT ON TABLE bookings IS 'Customer bookings with reference numbers';
COMMENT ON TABLE inquiries IS 'Customer inquiries and messages';
COMMENT ON TABLE reviews IS 'Customer reviews for destinations and activities';
COMMENT ON TABLE favorites IS 'User favorite destinations and activities';
