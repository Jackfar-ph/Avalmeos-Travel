-- =====================================================
-- RESET ADMIN USER PASSWORD
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Option 1: If admin user doesn't exist, create it
INSERT INTO users (id, email, password_hash, role, is_active, email_verified)
SELECT 
    gen_random_uuid(),
    'admin@avalmeo.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash of 'admin123'
    'admin',
    true,
    true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@avalmeo.com');

-- Option 2: Update password if user already exists
UPDATE users 
SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'admin@avalmeo.com';

-- Ensure admin profile exists
INSERT INTO user_profiles (user_id, first_name, last_name)
SELECT id, 'Admin', 'User'
FROM users
WHERE email = 'admin@avalmeo.com'
AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = (SELECT id FROM users WHERE email = 'admin@avalmeo.com'));

-- Verify the user was updated
SELECT id, email, role, is_active FROM users WHERE email = 'admin@avalmeo.com';
