-- Migration: Create user_profiles table and drop user_defaults
-- Description: Replace the defaults feature with a comprehensive profiles system

-- Drop the old user_defaults table (fresh start, no data to migrate)
DROP TABLE IF EXISTS user_defaults CASCADE;

-- Create the new user_profiles table
CREATE TABLE user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    fuel_price DECIMAL(10,2) NOT NULL,
    fuel_density DECIMAL(10,2) NOT NULL,
    pilots_required INTEGER NOT NULL CHECK (pilots_required >= 1),
    pilot_rate DECIMAL(10,2) NOT NULL,
    attendants_required INTEGER NOT NULL CHECK (attendants_required >= 0),
    attendant_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    hotel_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    meals_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    maintenance_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    apu_burn INTEGER NOT NULL DEFAULT 0,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique profile names per user
    CONSTRAINT unique_user_profile_name UNIQUE (user_id, name)
);

-- Create a unique partial index to ensure only one default profile per user
CREATE UNIQUE INDEX idx_user_profiles_unique_default
    ON user_profiles(user_id)
    WHERE is_default = true;

-- Add index for faster queries
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own profiles
CREATE POLICY "Users can view their own profiles"
    ON user_profiles FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can create their own profiles
CREATE POLICY "Users can create their own profiles"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own profiles
CREATE POLICY "Users can update their own profiles"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own profiles
CREATE POLICY "Users can delete their own profiles"
    ON user_profiles FOR DELETE
    USING (auth.uid() = user_id);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
