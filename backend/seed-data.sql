-- =====================================================
-- AVALMEO'S TRAVEL - SEED DATA
-- Run this file to populate the database with initial data
-- =====================================================

-- Insert destinations if they don't exist
INSERT INTO destinations (name, slug, description, short_description, location, region, country, hero_image, highlights, best_time_to_visit, average_rating, total_reviews, is_featured, is_active) VALUES
('Cebu City', 'cebu-city', 'Cebu City, known as the Queen City of the South, is a vibrant metropolitan destination offering a perfect blend of urban sophistication and natural beauty. Home to historical landmarks, pristine beaches, and world-class resorts.', 'The Queen City of the South with beaches and history', 'Cebu City', 'Visayas', 'Philippines', 'Picture/Cebu City.webp', '["Magellan''s Cross", "Basilica del Santo Niño", "Fort San Pedro", "Sialdara Hills", "Oslob Whalesharks", "Kawasan Falls"]'::jsonb, 'November to February', 4.5, 1250, true, true),
('Manila', 'manila', 'The capital city of the Philippines, Manila is a bustling metropolis where modern skyscrapers stand alongside historical Spanish-era buildings. Experience the rich cultural heritage of the nation.', 'The capital with rich historical heritage', 'Manila', 'Luzon', 'Philippines', 'Picture/Manila.webp', '["Intramuros", "Rizal Park", "San Agustin Church", "Fort Santiago", "Mall of Asia", "National Museum"]'::jsonb, 'December to February', 4.3, 2100, true, true),
('Baguio', 'baguio', 'Baguio City, the Summer Capital of the Philippines, is a mountain resort city known for its cool climate, pine forests, and vibrant flower gardens. A popular getaway from the tropical heat.', 'Mountain resort city with cool climate', 'Baguio City', 'Cordillera Administrative Region', 'Philippines', 'Picture/Baguio.webp', '["Mines View Park", "Burnham Park", "Wright Park", "The Mansion", "Session Road", "Strawberry Fields"]'::jsonb, 'March to May', 4.6, 1800, true, true),
('Davao City', 'davao-city', 'Davao City is the largest city in the Philippines by land area, offering diverse attractions from exotic wildlife to pristine beaches. Home to the famous Philippine Eagle and delicious durian.', 'Largest city with exotic wildlife and beaches', 'Davao City', 'Mindanao', 'Philippines', 'Picture/Davao.webp', '["Philippine Eagle Center", "Mount Apo", "Eden Nature Park", "Samal Island", "Durian Capital", "Malagos Garden Resort"]'::jsonb, 'December to February', 4.4, 950, true, true),
('Puerto Princesa', 'puerto-princesa', 'Puerto Princesa is the gateway to the world-renowned Underground River and stunning limestone cliffs. This coastal city offers world-class diving, pristine beaches, and incredible biodiversity.', 'Gateway to the Underground River', 'Puerto Princesa', 'Palawan', 'Philippines', 'Picture/Puerto Princesa.webp', '["Underground River", "Honda Bay", "Baker''s Hill", "Mitra Ranch", "Iwahig Prison", "Nacpan Beach"]'::jsonb, 'November to April', 4.7, 1650, true, true),
('Iloilo', 'iloilo', 'Iloilo Province is a treasure trove of Spanish colonial heritage, pristine islands, and delicious cuisine. Home to the world-famous Dinagyang Festival and the stunning Gigantes Islands.', 'Heritage sites and stunning islands', 'Iloilo City', 'Visayas', 'Philippines', 'Picture/Iloilo.webp', '["Miag-ao Church", "Gigantes Islands", "Bonbon-Bonbon Church", "Culasi Church", "Trekking to Tarugusan", "Heritage Houses"]'::jsonb, 'November to April', 4.5, 780, true, true)
ON CONFLICT DO NOTHING;

-- Insert packages for each destination
INSERT INTO packages (name, slug, description, destination_id, price, duration, package_type, hero_image, activities, inclusions, exclusions, is_featured, is_active) VALUES
('Cebu City Package Tour', 'cebu-city-package', 'Explore the Queen City of the South with our comprehensive 3D2N package', (SELECT id FROM destinations WHERE slug='cebu-city' LIMIT 1), 8500, 3, 'all-inclusive', 'Picture/Cebu City.jpg', '["City Tour", "Food Trip", "Beach Visit", "Simala Church"]'::jsonb, '["Hotel", "Breakfast", "Tour Guide", "Transfers", "Entrance Fees"]'::jsonb, '["Airfare", "Personal expenses", "Tips"]'::jsonb, true, true),
('Old Manila Heritage Tour', 'old-manila-heritage', 'Discover the rich history of Manila through its heritage sites', (SELECT id FROM destinations WHERE slug='manila' LIMIT 1), 2400, 1, 'day-tour', 'Picture/Old Manila.jpg', '["Intramuros Tour", "Fort Santiago", "San Agustin Church", "Casa Real"]'::jsonb, '["Tour Guide", "Transfers", "Entrance Fees"]'::jsonb, '["Meals", "Personal expenses"]'::jsonb, false, true),
('Baguio City Package', 'baguio-city-package', 'Escape to the Summer Capital of the Philippines', (SELECT id FROM destinations WHERE slug='baguio' LIMIT 1), 5900, 3, 'all-inclusive', 'Picture/Baguio.jpg', '["City Tour", "Mines View Park", "Wright Park", "Session Road"]'::jsonb, '["Hotel", "Breakfast", "Tour Guide", "Transfers"]'::jsonb, '["Airfare", "Personal expenses", "Activities not mentioned"]'::jsonb, true, true),
('Davao Highland Tour', 'davao-highland-tour', 'Experience the natural beauty of Davao highlands', (SELECT id FROM destinations WHERE slug='davao-city' LIMIT 1), 4200, 1, 'day-tour', 'Picture/Davao.jpg', '["Malagos Garden Resort", "Eden Nature Park", "Philippine Eagle Center"]'::jsonb, '["Tour Guide", "Transfers", "Entrance Fees", "Lunch"]'::jsonb, '["Personal expenses", "Airfare"]'::jsonb, false, true),
('Puerto Princesa Package', 'puerto-princesa-package', 'Explore the Underground River and more in Palawan', (SELECT id FROM destinations WHERE slug='puerto-princesa' LIMIT 1), 7200, 3, 'all-inclusive', 'Picture/Puerto Princesa.jpg', '["Underground River Tour", "City Tour", "Baker''s Hill", "Iwahig Prison"]'::jsonb, '["Hotel", "Breakfast", "Tour Guide", "Transfers", "Boat Tour"]'::jsonb, '["Airfare", "Personal expenses", "Tips"]'::jsonb, true, true),
('Iloilo City & Gigantes', 'iloilo-city-gigantes', 'Discover Iloilo City and the stunning Gigantes Islands', (SELECT id FROM destinations WHERE slug='iloilo' LIMIT 1), 6500, 4, 'all-inclusive', 'Picture/Iloilo.jpg', '["City Tour", "Gigantes Island Hopping", "Heritage Churches", "Dining at District"]'::jsonb, '["Hotel", "All Meals", "Tour Guide", "Boat Tour", "Transfers"]'::jsonb, '["Airfare", "Personal expenses"]'::jsonb, false, true)
ON CONFLICT DO NOTHING;

-- Insert activities one by one to avoid type issues
INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Cebu Ocean Park Ticket', 'cebu-ocean-park-ticket', 'Visit the amazing underwater world at Cebu Ocean Park.', 'Underwater marine park experience', 'attraction', '3 hours', 'easy', 50, 668, NULL::numeric, 'PHP', 'Picture/Cebu Ocean Park.webp', '["Park entrance", "All exhibits"]'::jsonb, '["Food and drinks"]'::jsonb, 4.8::numeric, 450, true, true FROM destinations d WHERE d.name = 'Cebu City'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Oslob Whaleshark & Canyoneering', 'oslob-whaleshark-canyoneering', 'Swim with whale sharks and experience canyoneering.', 'Whale shark swimming and canyoneering', 'adventure', '8 hours', 'moderate', 20, 3873, NULL::numeric, 'PHP', 'Picture/Oslob Whaleshark.webp', '["Transportation", "Guide", "Equipment", "Lunch"]'::jsonb, '["Personal expenses"]'::jsonb, 4.6::numeric, 320, true, true FROM destinations d WHERE d.name = 'Cebu City'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Cebu Private Day Tour', 'cebu-private-day-tour', 'Private customized tour of Cebu''s top attractions.', 'Private city tour', 'tour', '6 hours', 'easy', 10, 1596, NULL::numeric, 'PHP', 'Picture/Cebu City Private Day Tour.webp', '["Private vehicle", "Guide", "Water"]'::jsonb, '["Meals", "Entrance fees"]'::jsonb, 4.6::numeric, 280, false, true FROM destinations d WHERE d.name = 'Cebu City'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Plantation Bay Day Use', 'plantation-bay-day-use', 'Enjoy a full day at Plantation Bay Resort.', 'Resort day use', 'relaxation', '8 hours', 'easy', 30, 2540, NULL::numeric, 'PHP', 'Picture/Plantation Bay Day.webp', '["Day pass", "Pool access", "Lunch buffet"]'::jsonb, '["Spa treatments", "Water sports"]'::jsonb, 4.7::numeric, 200, true, true FROM destinations d WHERE d.name = 'Cebu City'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Manila Ocean Park', 'manila-ocean-park', 'Explore Manila Ocean Park with marine life exhibits.', 'Ocean park experience', 'attraction', '4 hours', 'easy', 100, 1059, NULL::numeric, 'PHP', 'Picture/Manila Ocean Park.png', '["Park entrance", "All exhibits"]'::jsonb, '["Food and souvenirs"]'::jsonb, 4.7::numeric, 520, true, true FROM destinations d WHERE d.name = 'Manila'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Intramuros Bambike Tour', 'intramuros-bambike-tour', 'Explore Intramuros on eco-friendly bamboo bikes.', 'Historic bamboo bike tour', 'tour', '2 hours', 'easy', 15, 1153, NULL::numeric, 'PHP', 'Picture/Intramuros.webp', '["Bambike", "Guide", "Entrance fees"]'::jsonb, '["Water", "Tips"]'::jsonb, 4.8::numeric, 680, true, true FROM destinations d WHERE d.name = 'Manila'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Fort Santiago Ticket', 'fort-santiago-ticket', 'Visit the historic Fort Santiago.', 'Historic fort visit', 'attraction', '2 hours', 'easy', 50, 80, NULL::numeric, 'PHP', 'Picture/Fort Santiago.jpg', '["Fort entrance", "Museum access"]'::jsonb, '["Guide", "Souvenirs"]'::jsonb, 4.8::numeric, 890, false, true FROM destinations d WHERE d.name = 'Manila'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Okada Manila Tour', 'okada-manila-tour', 'Experience luxury at Okada Manila.', 'Luxury resort tour', 'entertainment', '3 hours', 'easy', 20, 1292, NULL::numeric, 'PHP', 'Picture/Okada Manila.webp', '["Transportation", "Guide"]'::jsonb, '["Food", "Gaming"]'::jsonb, 4.8::numeric, 340, true, true FROM destinations d WHERE d.name = 'Manila'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Sky Ranch Baguio Pass', 'sky-ranch-baguio-pass', 'Enjoy rides at Sky Ranch with city views.', 'Amusement park', 'attraction', '4 hours', 'easy', 50, 876, NULL::numeric, 'PHP', 'Picture/Sky Ranch Baguio.webp', '["Park pass", "All rides"]'::jsonb, '["Food"]'::jsonb, 4.5::numeric, 620, true, true FROM destinations d WHERE d.name = 'Baguio'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Atok Gardens Day Tour', 'atok-gardens-day-tour', 'Visit beautiful Atok Gardens.', 'Flower garden tour', 'nature', '3 hours', 'easy', 30, 2241, NULL::numeric, 'PHP', 'Picture/Atok Gardens.webp', '["Transportation", "Guide", "Entrance"]'::jsonb, '["Meals"]'::jsonb, 4.9::numeric, 180, true, true FROM destinations d WHERE d.name = 'Baguio'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Breathe Baguio Tour', 'breathe-baguio-tour', 'Experience Breathe Baguio attractions.', 'Mountain city tour', 'tour', '5 hours', 'easy', 25, 2123, NULL::numeric, 'PHP', 'Picture/Breathe Baguio.webp', '["Transportation", "Guide"]'::jsonb, '["Meals"]'::jsonb, 4.7::numeric, 220, false, true FROM destinations d WHERE d.name = 'Baguio'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Mt. Ulap Hiking Tour', 'mt-ulap-hiking-tour', 'Trek scenic Mt. Ulap trails.', 'Mountain hiking', 'hiking', '6 hours', 'moderate', 15, 1950, NULL::numeric, 'PHP', 'Picture/Mt. Ulap Hiking Day Tour from Baguio.webp', '["Transportation", "Guide", "Lunch"]'::jsonb, '["Insurance"]'::jsonb, 5.0::numeric, 450, true, true FROM destinations d WHERE d.name = 'Baguio'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Davao City Tour', 'davao-city-tour', 'Explore Davao City''s top attractions.', 'City tour', 'tour', '6 hours', 'easy', 20, 1321, NULL::numeric, 'PHP', 'Picture/Davao City Tour.webp', '["Transportation", "Guide", "Water"]'::jsonb, '["Meals"]'::jsonb, 4.7::numeric, 380, true, true FROM destinations d WHERE d.name = 'Davao City'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Malagos Garden Pass', 'malagos-garden-pass', 'Visit Malagos Garden and zoo.', 'Garden experience', 'nature', '4 hours', 'easy', 40, 563, NULL::numeric, 'PHP', 'Picture/Malagos Garden Resort.webp', '["Garden entrance", "Zoo access"]'::jsonb, '["Food"]'::jsonb, 4.8::numeric, 520, true, true FROM destinations d WHERE d.name = 'Davao City'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Nature Tour in Davao', 'nature-tour-davao', 'Discover Davao''s natural wonders.', 'Nature tour', 'nature', '8 hours', 'easy', 20, 2540, NULL::numeric, 'PHP', 'Picture/Nature Tour in Davao.webp', '["Transportation", "Guide", "Lunch"]'::jsonb, '["Personal expenses"]'::jsonb, 4.8::numeric, 290, true, true FROM destinations d WHERE d.name = 'Davao City'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Highlands Tour in Davao', 'highlands-tour-davao', 'Explore Davao highlands.', 'Highland tour', 'nature', '6 hours', 'easy', 20, 2041, NULL::numeric, 'PHP', 'Picture/Highlands Tour in Davao.webp', '["Transportation", "Guide"]'::jsonb, '["Meals"]'::jsonb, 4.8::numeric, 310, false, true FROM destinations d WHERE d.name = 'Davao City'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Underground River Tour', 'underground-river-tour', 'Visit the famous Underground River.', 'River tour', 'adventure', '8 hours', 'moderate', 15, 2192, NULL::numeric, 'PHP', 'Picture/Puerto Princesa Underground River.webp', '["Transportation", "Boat tour", "Guide", "Lunch"]'::jsonb, '["Tips"]'::jsonb, 4.7::numeric, 980, true, true FROM destinations d WHERE d.name = 'Puerto Princesa'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Honda Bay Island Hopping', 'honda-bay-island-hopping', 'Island hop through Honda Bay.', 'Island hopping', 'adventure', '6 hours', 'easy', 25, 1779, NULL::numeric, 'PHP', 'Picture/Honda Bay Palawan Island.webp', '["Boat", "Guide", "Lunch"]'::jsonb, '["Snorkeling gear"]'::jsonb, 4.6::numeric, 720, true, true FROM destinations d WHERE d.name = 'Puerto Princesa'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'City Heritage Tour', 'city-heritage-tour', 'Explore Puerto Princesa heritage.', 'Cultural tour', 'tour', '4 hours', 'easy', 20, 797, NULL::numeric, 'PHP', 'Picture/Puerto Princesa City Heritage Tour.webp', '["Transportation", "Guide"]'::jsonb, '["Meals"]'::jsonb, 4.4::numeric, 380, false, true FROM destinations d WHERE d.name = 'Puerto Princesa'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Sunset Watching', 'sunset-watching-palawan', 'Experience Palawan sunsets.', 'Sunset experience', 'relaxation', '3 hours', 'easy', 30, 1882, NULL::numeric, 'PHP', 'Picture/Sunset Watching.webp', '["Transportation", "Snacks"]'::jsonb, '["Dinner"]'::jsonb, 5.0::numeric, 520, true, true FROM destinations d WHERE d.name = 'Puerto Princesa'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Science XPdition Ticket', 'science-xpdition-ticket', 'Interactive science museum experience.', 'Science museum', 'attraction', '3 hours', 'easy', 50, 596, NULL::numeric, 'PHP', 'Picture/Science XPdition.webp', '["Museum entrance", "All exhibits"]'::jsonb, '["Food"]'::jsonb, 4.5::numeric, 280, true, true FROM destinations d WHERE d.name = 'Iloilo'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Guimaras Island Tour', 'guimaras-island-tour', 'Day trip to Guimaras Island.', 'Island tour', 'adventure', '8 hours', 'easy', 25, 3036, NULL::numeric, 'PHP', 'Picture/Guimaras Island.webp', '["Transportation", "Boat", "Guide", "Lunch"]'::jsonb, '["Personal expenses"]'::jsonb, 4.8::numeric, 420, true, true FROM destinations d WHERE d.name = 'Iloilo'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Gigantes Island Boat Tour', 'gigantes-island-boat-tour', 'Explore Gigantes Islands.', 'Island hopping', 'adventure', '8 hours', 'moderate', 20, 1492, NULL::numeric, 'PHP', 'Picture/Gigantes & Sicogon Island.webp', '["Boat", "Guide", "Lunch"]'::jsonb, '["Snorkeling gear"]'::jsonb, 4.2::numeric, 350, true, true FROM destinations d WHERE d.name = 'Iloilo'
ON CONFLICT DO NOTHING;

INSERT INTO activities (destination_id, name, slug, description, short_description, activity_type, duration, difficulty, max_group_size, price, discount_price, currency, hero_image, inclusions, exclusions, average_rating, total_reviews, is_featured, is_active)
SELECT d.id, 'Iloilo Pilgrimage Tour', 'iloilo-pilgrimage-tour', 'Visit heritage churches in Iloilo.', 'Pilgrimage tour', 'tour', '6 hours', 'easy', 20, 1271, NULL::numeric, 'PHP', 'Picture/Iloilo Pilgrimage.webp', '["Transportation", "Guide"]'::jsonb, '["Meals"]'::jsonb, 4.8::numeric, 290, false, true FROM destinations d WHERE d.name = 'Iloilo'
ON CONFLICT DO NOTHING;

-- Verify data insertion
SELECT 'Destinations: ' || COUNT(*)::text AS count FROM destinations;
SELECT 'Packages: ' || COUNT(*)::text AS count FROM packages;
SELECT 'Activities: ' || COUNT(*)::text AS count FROM activities;
