-- Add description column to saved_searches table
ALTER TABLE saved_searches ADD COLUMN IF NOT EXISTS description TEXT;
