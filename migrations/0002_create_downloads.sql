-- One row per download click. The counting route (/api/steins-gate/download)
-- inserts here before 302-redirecting to the file on R2. Append-only event log:
-- total = COUNT(*), and version/country/created_at support per-version,
-- per-country, and per-day breakdowns with plain SQL. Volume is tiny
-- (hundreds at launch), so a row per event is well within D1's free tier.
CREATE TABLE downloads (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  version    TEXT NOT NULL,
  country    TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_downloads_created ON downloads (created_at DESC);
CREATE INDEX idx_downloads_version ON downloads (version);
