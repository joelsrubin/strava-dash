DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strava_id INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL
);

-- create a notes table
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  run_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Hashtags table (stores unique hashtags)
CREATE TABLE IF NOT EXISTS hashtags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

-- Junction table (links notes to hashtags)
CREATE TABLE IF NOT EXISTS note_hashtags (
  note_id INTEGER NOT NULL,
  hashtag_id INTEGER NOT NULL,
  PRIMARY KEY (note_id, hashtag_id),
  FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE,
  FOREIGN KEY (hashtag_id) REFERENCES hashtags (id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO users (strava_id, name) VALUES
  (2406550, 'Joel Rubin');

-- Insert sample data for notes
INSERT INTO notes (user_id, run_id, title, content, created_at, updated_at) VALUES
  (1, 16794168725, 'Note 1', 'This is a note for run 1', '2024-01-15', '2024-01-15');

