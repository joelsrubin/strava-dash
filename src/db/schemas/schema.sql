-- create a notes table
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strava_id INTEGER NOT NULL,
  run_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  hashtags TEXT DEFAULT '[]',  -- JSON array
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  activity_date TEXT
);



