-- Trip Calculator - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create all necessary tables

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USER DEFAULTS TABLE
-- Stores per-user default values for calculator inputs
-- ============================================================================
CREATE TABLE user_defaults (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Fuel settings
  fuel_price NUMERIC(10, 2) DEFAULT 5.93,
  fuel_density NUMERIC(10, 2) DEFAULT 6.7,

  -- Crew rates
  pilot_rate NUMERIC(10, 2) DEFAULT 1500,
  attendant_rate NUMERIC(10, 2) DEFAULT 800,

  -- Expenses
  hotel_rate NUMERIC(10, 2) DEFAULT 200,
  meals_rate NUMERIC(10, 2) DEFAULT 100,

  -- Maintenance
  maintenance_rate NUMERIC(10, 2) DEFAULT 1048.42,
  apu_burn NUMERIC(10, 2) DEFAULT 100,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one defaults record per user
  UNIQUE(user_id)
);

-- ============================================================================
-- ESTIMATES TABLE
-- Stores saved trip estimates with complete state
-- ============================================================================
CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Estimate metadata
  name TEXT NOT NULL,

  -- Complete estimate data (legs, crew, form values)
  estimate_data JSONB NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_estimates_user_id ON estimates(user_id);
CREATE INDEX idx_estimates_created_at ON estimates(created_at DESC);

-- ============================================================================
-- ESTIMATE SHARES TABLE
-- Enables sharing estimates via unique links
-- ============================================================================
CREATE TABLE estimate_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimate_id UUID REFERENCES estimates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Unique share token for URLs
  share_token UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,

  -- Optional: Track share metadata
  share_name TEXT, -- Cached estimate name for quick display

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Optional expiration (NULL = never expires)

  -- Ensure one share per estimate
  UNIQUE(estimate_id)
);

CREATE INDEX idx_estimate_shares_token ON estimate_shares(share_token);
CREATE INDEX idx_estimate_shares_estimate_id ON estimate_shares(estimate_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_shares ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER DEFAULTS POLICIES
-- ============================================================================

-- Users can view their own defaults
CREATE POLICY "Users can view own defaults"
  ON user_defaults
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own defaults
CREATE POLICY "Users can insert own defaults"
  ON user_defaults
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own defaults
CREATE POLICY "Users can update own defaults"
  ON user_defaults
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own defaults
CREATE POLICY "Users can delete own defaults"
  ON user_defaults
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- ESTIMATES POLICIES
-- ============================================================================

-- Users can view their own estimates
CREATE POLICY "Users can view own estimates"
  ON estimates
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own estimates
CREATE POLICY "Users can insert own estimates"
  ON estimates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own estimates
CREATE POLICY "Users can update own estimates"
  ON estimates
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own estimates
CREATE POLICY "Users can delete own estimates"
  ON estimates
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- ESTIMATE SHARES POLICIES
-- ============================================================================

-- Users can view their own shares
CREATE POLICY "Users can view own shares"
  ON estimate_shares
  FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can view shared estimates (for public sharing)
-- This allows unauthenticated users to view via share token
CREATE POLICY "Anyone can view by share token"
  ON estimate_shares
  FOR SELECT
  USING (true);

-- Users can create shares for their own estimates
CREATE POLICY "Users can create shares for own estimates"
  ON estimate_shares
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM estimates
      WHERE estimates.id = estimate_shares.estimate_id
      AND estimates.user_id = auth.uid()
    )
  );

-- Users can delete their own shares
CREATE POLICY "Users can delete own shares"
  ON estimate_shares
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_user_defaults_updated_at
  BEFORE UPDATE ON user_defaults
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estimates_updated_at
  BEFORE UPDATE ON estimates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPFUL QUERIES (for testing/debugging)
-- ============================================================================

-- View all estimates for a user
-- SELECT * FROM estimates WHERE user_id = 'user-uuid-here' ORDER BY created_at DESC;

-- View shared estimates
-- SELECT es.share_token, es.share_name, e.name, e.created_at
-- FROM estimate_shares es
-- JOIN estimates e ON es.estimate_id = e.id
-- WHERE es.user_id = 'user-uuid-here';

-- Get estimate by share token (for public viewing)
-- SELECT e.* FROM estimates e
-- JOIN estimate_shares es ON es.estimate_id = e.id
-- WHERE es.share_token = 'token-uuid-here';
