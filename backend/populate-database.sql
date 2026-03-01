-- =====================================================================================
-- POPULATE DATABASE WITH HARDCODED DATA
-- Run this SQL to populate the database with the same data that's in data.js
-- =====================================================================================

-- First, update destinations with hero images
UPDATE destinations SET hero_image = 'Picture/Cebu City.jpg' WHERE name ILIKE 'Cebu City';
UPDATE destinations SET hero_image = 'Picture/Manila.jpg' WHERE name ILIKE 'Manila';
UPDATE destinations SET hero_image = 'Picture/Baguio.jpg' WHERE name ILIKE 'Baguio';
UPDATE destinations SET hero_image = 'Picture/Davao.jpg' WHERE name ILIKE 'Davao City';
UPDATE destinations SET hero_image = 'Picture/Puerto Princesa.jpg' WHERE name ILIKE 'Puerto Princesa';
UPDATE destinations SET hero_image = 'Picture/Iloilo.jpg' WHERE name ILIKE 'Iloilo';

-- =====================================================================================
-- CEBU CITY PACKAGES AND ACTIVITIES
-- =====================================================================================

-- Insert Cebu City Package
INSERT INTO packages (name, slug, description, destination_id, price, duration, package_type, hero_image, activities, inclusions, exclusions, is_featured, is_active)
SELECT 
    'Cebu City Package Tour', 
    'cebu-city-package', 
    '3D2N All-In: Hotel, Transfers, Temple of Leah, and Sirao Garden.',
    id, 8497, 3, 'all-inclusive', 'Picture/Cebu City.jpg',
    '["City Tour", "Food Trip", "Beach Visit", "Simala Church"]'::jsonb,
    '["Hotel", "Breakfast", "Tour Guide", "Transfers", "Entrance Fees"]'::jsonb,
    '["Airfare", "Personal expenses", "Tips"]'::jsonb,
    true, true
FROM destinations WHERE name ILIKE 'Cebu City'
ON CONFLICT DO NOTHING;

-- Insert Cebu City Activities
INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Cebu Ocean Park Ticket', 'cebu-ocean-park-ticket', 'Visit the amazing underwater world at Cebu Ocean Park.', 'Underwater marine park experience', 'attraction', '3 hours', 'easy', 50, 668, NULL::numeric, 'PHP', 'Picture/Cebu Ocean Park.webp', '["Park entrance", "All exhibits"]'::jsonb, '["Food and drinks"]'::jsonb, 4.8::numeric, 450, true, true
FROM destinations d WHERE d.name ILIKE 'Cebu City'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Oslob Whaleshark and Canyoneering', 'oslob-whaleshark-canyoneering', 'Swim with whale sharks and experience canyoneering.', 'Whale shark swimming and canyoneering', 'adventure', '8 hours', 'moderate', 20, 3873, NULL::numeric, 'PHP', 'Picture/Oslob Whaleshark.webp', '["Transportation", "Guide", "Equipment", "Lunch"]'::jsonb, '["Personal expenses"]'::jsonb, 4.6::numeric, 320, true, true
FROM destinations d WHERE d.name ILIKE 'Cebu City'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Cebu Private Day Tour', 'cebu-private-day-tour', 'Private customized tour of Cebu top attractions.', 'Private city tour', 'tour', '6 hours', 'easy', 10, 1596, NULL::numeric, 'PHP', 'Picture/Cebu City Private Day Tour.webp', '["Private vehicle", "Guide", "Water"]'::jsonb, '["Meals", "Entrance fees"]'::jsonb, 4.6::numeric, 280, false, true
FROM destinations d WHERE d.name ILIKE 'Cebu City'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Plantation Bay Day Use', 'plantation-bay-day-use', 'Enjoy a full day at Plantation Bay Resort.', 'Resort day use', 'relaxation', '8 hours', 'easy', 30, 2540, NULL::numeric, 'PHP', 'Picture/Plantation Bay Day.webp', '["Day pass", "Pool access", "Lunch buffet"]'::jsonb, '["Spa treatments", "Water sports"]'::jsonb, 4.7::numeric, 200, true, true
FROM destinations d WHERE d.name ILIKE 'Cebu City'
ON CONFLICT DO NOTHING;

-- =====================================================================================
-- MANILA PACKAGES AND ACTIVITIES
-- =====================================================================================

-- Insert Manila Package
INSERT INTO packages (name, slug, description, destination_id, price, duration, package_type, hero_image, activities, inclusions, exclusions, is_featured, is_active)
SELECT 
    'Old Manila Heritage Tour', 
    'old-manila-heritage', 
    'Full Day: Intramuros, Luneta, and National Museum with Lunch.',
    id, 2399, 1, 'day-tour', 'Picture/Old Manila.jpg',
    '["Intramuros Tour", "Fort Santiago", "San Agustin Church", "Casa Real"]'::jsonb,
    '["Tour Guide", "Transfers", "Entrance Fees"]'::jsonb,
    '["Meals", "Personal expenses"]'::jsonb,
    false, true
FROM destinations WHERE name ILIKE 'Manila'
ON CONFLICT DO NOTHING;

-- Insert Manila Activities
INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Manila Ocean Park', 'manila-ocean-park', 'Explore Manila Ocean Park with marine life exhibits.', 'Ocean park experience', 'attraction', '4 hours', 'easy', 100, 1059, NULL::numeric, 'PHP', 'Picture/Manila Ocean Park.png', '["Park entrance", "All exhibits"]'::jsonb, '["Food and souvenirs"]'::jsonb, 4.7::numeric, 520, true, true
FROM destinations d WHERE d.name ILIKE 'Manila'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Intramuros Bambike Tour', 'intramuros-bambike-tour', 'Explore Intramuros on eco-friendly bamboo bikes.', 'Historic bamboo bike tour', 'tour', '2 hours', 'easy', 15, 1153, NULL::numeric, 'PHP', 'Picture/Intramuros.webp', '["Bambike", "Guide", "Entrance fees"]'::jsonb, '["Water", "Tips"]'::jsonb, 4.8::numeric, 680, true, true
FROM destinations d WHERE d.name ILIKE 'Manila'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Fort Santiago Ticket', 'fort-santiago-ticket', 'Visit the historic Fort Santiago in Manila.', 'Historic fort visit', 'attraction', '2 hours', 'easy', 50, 80, NULL::numeric, 'PHP', 'Picture/Fort Santiago.jpg', '["Entrance fee"]'::jsonb, '["Guide", "Personal expenses"]'::jsonb, 4.8::numeric, 420, true, true
FROM destinations d WHERE d.name ILIKE 'Manila'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Okada Manila Tour', 'okada-manila-tour', 'Experience luxury at Okada Manila.', 'Luxury resort tour', 'tour', '3 hours', 'easy', 20, 1292, NULL::numeric, 'PHP', 'Picture/Okada Manila.webp', '["Facility tour", "Transfers"]'::jsonb, '["Meals", "Personal expenses"]'::jsonb, 4.8::numeric, 350, true, true
FROM destinations d WHERE d.name ILIKE 'Manila'
ON CONFLICT DO NOTHING;

-- =====================================================================================
-- BAGUIO PACKAGES AND ACTIVITIES
-- =====================================================================================

-- Insert Baguio Package
INSERT INTO packages (name, slug, description, destination_id, price, duration, package_type, hero_image, activities, inclusions, exclusions, is_featured, is_active)
SELECT 
    'Baguio City Package', 
    'baguio-city-package', 
    '3D2N Escape: Camp John Hay, Mines View, and Strawberry Farm.',
    id, 5898, 3, 'all-inclusive', 'Picture/Baguio.jpg',
    '["City Tour", "Mines View Park", "Wright Park", "Session Road"]'::jsonb,
    '["Hotel", "Breakfast", "Tour Guide", "Transfers"]'::jsonb,
    '["Airfare", "Personal expenses", "Activities not mentioned"]'::jsonb,
    true, true
FROM destinations WHERE name ILIKE 'Baguio'
ON CONFLICT DO NOTHING;

-- Insert Baguio Activities
INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Sky Ranch Baguio Pass', 'sky-ranch-baguio-pass', 'Enjoy rides and attractions at Sky Ranch Baguio.', 'Amusement park experience', 'attraction', '3 hours', 'easy', 50, 876, NULL::numeric, 'PHP', 'Picture/Sky Ranch Baguio.webp', '["Park entrance", "All rides"]'::jsonb, '["Food", "Personal expenses"]'::jsonb, 4.5::numeric, 380, true, true
FROM destinations d WHERE d.name ILIKE 'Baguio'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Atok Gardens Day Tour', 'atok-gardens-day-tour', 'Visit the beautiful Atok Gardens in Baguio.', 'Garden tour', 'tour', '2 hours', 'easy', 30, 2241, NULL::numeric, 'PHP', 'Picture/Atok Gardens.webp', '["Garden entrance", "Guide"]'::jsonb, '["Personal expenses"]'::jsonb, 4.9::numeric, 290, true, true
FROM destinations d WHERE d.name ILIKE 'Baguio'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Breathe Baguio Tour', 'breathe-baguio-tour', 'Experience the best of Baguio with Breathe Tours.', 'Comprehensive city tour', 'tour', '6 hours', 'easy', 15, 2123, NULL::numeric, 'PHP', 'Picture/Breathe Baguio.webp', '["Tour guide", "Transfers", "Lunch"]'::jsonb, '["Personal expenses"]'::jsonb, 4.7::numeric, 220, true, true
FROM destinations d WHERE d.name ILIKE 'Baguio'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Mt. Ulap Hiking Tour', 'mt-ulap-hiking-tour', 'Hike Mt. Ulap for stunning views of Baguio.', 'Mountain hiking', 'adventure', '6 hours', 'moderate', 12, 1950, NULL::numeric, 'PHP', 'Picture/Mt. Ulap Hiking Day Tour from Baguio.webp', '["Guide", "Transfers", "Snacks"]'::jsonb, '["Personal expenses", "Tips"]'::jsonb, 5.0::numeric, 180, true, true
FROM destinations d WHERE d.name ILIKE 'Baguio'
ON CONFLICT DO NOTHING;

-- =====================================================================================
-- DAVAO CITY PACKAGES AND ACTIVITIES
-- =====================================================================================

-- Insert Davao Package
INSERT INTO packages (name, slug, description, destination_id, price, duration, package_type, hero_image, activities, inclusions, exclusions, is_featured, is_active)
SELECT 
    'Davao Highland Tour', 
    'davao-highland-tour', 
    'Nature Adventure: Eden Nature Park and Philippine Eagle Center.',
    id, 4198, 1, 'day-tour', 'Picture/Davao.jpg',
    '["Malagos Garden Resort", "Eden Nature Park", "Philippine Eagle Center"]'::jsonb,
    '["Tour Guide", "Transfers", "Entrance Fees", "Lunch"]'::jsonb,
    '["Personal expenses", "Airfare"]'::jsonb,
    false, true
FROM destinations WHERE name ILIKE 'Davao City'
ON CONFLICT DO NOTHING;

-- Insert Davao Activities
INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Davao City Tour', 'davao-city-tour', 'Explore the best of Davao City.', 'City tour', 'tour', '6 hours', 'easy', 20, 1321, NULL::numeric, 'PHP', 'Picture/Davao City Tour.webp', '["Guide", "Transfers"]'::jsonb, '["Meals", "Personal expenses"]'::jsonb, 4.7::numeric, 280, true, true
FROM destinations d WHERE d.name ILIKE 'Davao City'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Malagos Garden Pass', 'malagos-garden-pass', 'Visit Malagos Garden Resort in Davao.', 'Garden and nature resort', 'attraction', '4 hours', 'easy', 30, 563, NULL::numeric, 'PHP', 'Picture/Malagos Garden Resort.webp', '["Garden entrance", "Pool access"]'::jsonb, '["Food", "Spa"]'::jsonb, 4.8::numeric, 320, true, true
FROM destinations d WHERE d.name ILIKE 'Davao City'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Nature Tour in Davao', 'nature-tour-in-davao', 'Experience Davao natural wonders.', 'Nature exploration', 'tour', '6 hours', 'easy', 15, 2540, NULL::numeric, 'PHP', 'Picture/Nature Tour in Davao.webp', '["Guide", "Transfers", "Lunch"]'::jsonb, '["Personal expenses"]'::jsonb, 4.8::numeric, 190, true, true
FROM destinations d WHERE d.name ILIKE 'Davao City'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Highlands Tour in Davao', 'highlands-tour-in-davao', 'Explore the highlands of Davao.', 'Highland adventure', 'tour', '5 hours', 'moderate', 12, 2041, NULL::numeric, 'PHP', 'Picture/Highlands Tour in Davao.webp', '["Guide", "Transfers"]'::jsonb, '["Personal expenses"]'::jsonb, 4.8::numeric, 150, true, true
FROM destinations d WHERE d.name ILIKE 'Davao City'
ON CONFLICT DO NOTHING;

-- =====================================================================================
-- PUERTO PRINCESA PACKAGES AND ACTIVITIES
-- =====================================================================================

-- Insert Puerto Princesa Package
INSERT INTO packages (name, slug, description, destination_id, price, duration, package_type, hero_image, activities, inclusions, exclusions, is_featured, is_active)
SELECT 
    'Puerto Princesa Package', 
    'puerto-princesa-package', 
    'Nature Escape: Underground River and Honda Bay Island Hopping.',
    id, 7198, 3, 'all-inclusive', 'Picture/Puerto Princesa.jpg',
    '["Underground River Tour", "City Tour", "Baker Hill", "Iwahig Prison"]'::jsonb,
    '["Hotel", "Breakfast", "Tour Guide", "Transfers", "Boat Tour"]'::jsonb,
    '["Airfare", "Personal expenses", "Tips"]'::jsonb,
    true, true
FROM destinations WHERE name ILIKE 'Puerto Princesa'
ON CONFLICT DO NOTHING;

-- Insert Puerto Princesa Activities
INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Underground River Tour', 'underground-river-tour', 'Visit the world-famous Puerto Princesa Underground River.', 'UNESCO World Heritage tour', 'adventure', '8 hours', 'moderate', 20, 2192, NULL::numeric, 'PHP', 'Picture/Puerto Princesa Underground River.webp', '["Boat tour", "Guide", "Entrance fees"]'::jsonb, '["Lunch", "Personal expenses"]'::jsonb, 4.7::numeric, 520, true, true
FROM destinations d WHERE d.name ILIKE 'Puerto Princesa'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Honda Bay Island Hopping', 'honda-bay-island-hopping', 'Island hopping tour in Honda Bay Palawan.', 'Island hopping adventure', 'adventure', '6 hours', 'easy', 25, 1779, NULL::numeric, 'PHP', 'Picture/Honda Bay Palawan Island.webp', '["Boat rental", "Snorkeling gear", "Lunch"]'::jsonb, '["Personal expenses"]'::jsonb, 4.6::numeric, 380, true, true
FROM destinations d WHERE d.name ILIKE 'Puerto Princesa'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'City Heritage Tour', 'city-heritage-tour', 'Explore the heritage sites of Puerto Princesa City.', 'Cultural city tour', 'tour', '4 hours', 'easy', 20, 797, NULL::numeric, 'PHP', 'Picture/Puerto Princesa City Heritage Tour.webp', '["Guide", "Transfers"]'::jsonb, '["Meals"]'::jsonb, 4.4::numeric, 180, false, true
FROM destinations d WHERE d.name ILIKE 'Puerto Princesa'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Sunset Watching', 'sunset-watching', 'Enjoy beautiful sunset views in Puerto Princesa.', 'Leisure sunset experience', 'relaxation', '2 hours', 'easy', 30, 1882, NULL::numeric, 'PHP', 'Picture/Sunset Watching.webp', '["Transfers", "Snacks"]'::jsonb, '["Personal expenses"]'::jsonb, 5.0::numeric, 220, true, true
FROM destinations d WHERE d.name ILIKE 'Puerto Princesa'
ON CONFLICT DO NOTHING;

-- =====================================================================================
-- ILOILO PACKAGES AND ACTIVITIES
-- =====================================================================================

-- Insert Iloilo Package
INSERT INTO packages (name, slug, description, destination_id, price, duration, package_type, hero_image, activities, inclusions, exclusions, is_featured, is_active)
SELECT 
    'Iloilo City and Gigantes', 
    'iloilo-city-gigantes', 
    'Cultural and Island Tour: Molo Church and Islas de Gigantes.',
    id, 6498, 4, 'all-inclusive', 'Picture/Iloilo.jpg',
    '["City Tour", "Gigantes Island Hopping", "Heritage Churches", "Dining at District"]'::jsonb,
    '["Hotel", "All Meals", "Tour Guide", "Boat Tour", "Transfers"]'::jsonb,
    '["Airfare", "Personal expenses"]'::jsonb,
    false, true
FROM destinations WHERE name ILIKE 'Iloilo'
ON CONFLICT DO NOTHING;

-- Insert Iloilo Activities
INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Science XPdition Ticket', 'science-xpdition-ticket', 'Experience interactive science exhibits at Science XPdition.', 'Science museum visit', 'attraction', '3 hours', 'easy', 40, 596, NULL::numeric, 'PHP', 'Picture/Science XPdition.webp', '["Museum entrance", "All exhibits"]'::jsonb, '["Food", "Souvenirs"]'::jsonb, 4.5::numeric, 180, true, true
FROM destinations d WHERE d.name ILIKE 'Iloilo'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Guimaras Island Tour', 'guimaras-island-tour', 'Tour the beautiful Guimaras Island from Iloilo.', 'Island tour', 'tour', '8 hours', 'easy', 20, 3036, NULL::numeric, 'PHP', 'Picture/Guimaras Island.webp', '["Boat tour", "Guide", "Lunch"]'::jsonb, '["Personal expenses"]'::jsonb, 4.8::numeric, 250, true, true
FROM destinations d WHERE d.name ILIKE 'Iloilo'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Gigantes Island Boat Tour', 'gigantes-island-boat-tour', 'Explore the stunning Gigantes Islands.', 'Island hopping', 'adventure', '6 hours', 'moderate', 15, 1492, NULL::numeric, 'PHP', 'Picture/Gigantes and Sicogon Island.webp', '["Boat rental", "Snorkeling", "Lunch"]'::jsonb, '["Personal expenses"]'::jsonb, 4.2::numeric, 120, true, true
FROM destinations d WHERE d.name ILIKE 'Iloilo'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Iloilo Pilgrimage Tour', 'iloilo-pilgrimage-tour', 'Visit the historic churches of Iloilo.', 'Religious heritage tour', 'tour', '4 hours', 'easy', 25, 1271, NULL::numeric, 'PHP', 'Picture/Iloilo Pilgrimage.webp', '["Guide", "Transfers"]'::jsonb, '["Meals"]'::jsonb, 4.8::numeric, 200, true, true
FROM destinations d WHERE d.name ILIKE 'Iloilo'
ON CONFLICT DO NOTHING;

-- =====================================================================================
-- DONE!
-- =====================================================================================
