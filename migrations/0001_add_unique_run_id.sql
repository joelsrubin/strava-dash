-- Migration: Add UNIQUE constraint on run_id for notes table
-- This enables upsert functionality (INSERT ... ON CONFLICT)

-- SQLite doesn't support adding constraints directly, so we need to:
-- 1. Create a new table with the constraint
-- 2. Copy data
-- 3. Drop old table  
-- 4. Rename new table

-- Create new table with UNIQUE constraint on run_id
CREATE TABLE IF NOT EXISTS notes_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strava_id INTEGER NOT NULL,
  run_id INTEGER NOT NULL UNIQUE,
  content TEXT NOT NULL,
  hashtags TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  activity_date TEXT
);

-- Copy existing data (if there are duplicates, keep the most recent one)
INSERT OR REPLACE INTO notes_new (id, strava_id, run_id, content, hashtags, created_at, updated_at, activity_date)
SELECT id, strava_id, run_id, content, hashtags, created_at, updated_at, activity_date
FROM notes
WHERE id IN (
  SELECT MAX(id) FROM notes GROUP BY run_id
);

-- Drop the old table
DROP TABLE notes;

-- Rename the new table
ALTER TABLE notes_new RENAME TO notes;
