CREATE TABLE comments (
  id                 TEXT PRIMARY KEY,
  name               TEXT,
  message            TEXT NOT NULL,
  status             TEXT NOT NULL DEFAULT 'pending',
  created_at         INTEGER NOT NULL,
  reviewed_at        INTEGER,
  reviewed_by        TEXT,
  discord_message_id TEXT
);
CREATE INDEX idx_comments_status_created ON comments (status, created_at DESC);
