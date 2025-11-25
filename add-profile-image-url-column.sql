-- Migration: Add profile_image_url column to user_profiles table
-- Description: Add support for custom profile images

-- Add the profile_image_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='user_profiles'
        AND column_name='profile_image_url'
    ) THEN
        ALTER TABLE user_profiles
        ADD COLUMN profile_image_url TEXT;
    END IF;
END $$;
