-- Create saved_searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by VARCHAR NOT NULL,
  filters TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on created_by for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_searches_created_by ON saved_searches(created_by);
