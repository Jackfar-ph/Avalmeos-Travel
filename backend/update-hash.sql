-- Update the password hash for admin user using the exact email from the database
-- Run this in Supabase SQL Editor

-- First, let's see what emails exist
SELECT id, email, LEFT(password_hash, 20) as hash_preview FROM users;

-- Then update with the correct hash for "admin123"
-- The hash below is: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
UPDATE users 
SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email LIKE 'admin@avalmeo%';

-- Verify
SELECT id, email, password_hash FROM users WHERE email LIKE 'admin@avalmeo%';
