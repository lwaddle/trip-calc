-- Migration to fix shared estimates access for unauthenticated users
-- This adds a policy to allow anyone to view estimates that have been shared

-- Add the missing policy to allow public access to shared estimates
CREATE POLICY "Anyone can view shared estimates"
  ON estimates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM estimate_shares
      WHERE estimate_shares.estimate_id = estimates.id
    )
  );
