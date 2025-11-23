-- Add creator_email column to estimates table
-- This stores the email of the person who created the estimate
-- Run this in your Supabase SQL Editor

ALTER TABLE estimates
ADD COLUMN IF NOT EXISTS creator_email TEXT;

-- Update existing estimates with their creator's email
-- This uses a subquery to fetch the email from auth.users
UPDATE estimates
SET creator_email = (
    SELECT email
    FROM auth.users
    WHERE auth.users.id = estimates.user_id
)
WHERE creator_email IS NULL;

-- Note: New estimates will need to have creator_email set when they're created
-- The saveEstimate function in database.js will need to be updated
