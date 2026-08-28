-- Client attribution for download clicks: the caller's IP (from
-- CF-Connecting-IP) and raw User-Agent string. Both are nullable — rows
-- written before this migration have neither, and local dev has no
-- CF-Connecting-IP header, so the dashboard treats NULL as "unknown"
-- rather than dropping the row.
--
-- The User-Agent is stored RAW, not pre-parsed into browser/OS columns: the
-- distinct-UA set is tiny (dozens), so the dashboard groups by the raw string
-- in SQL and folds it into browser/OS/device in JS. That keeps parser
-- improvements retroactive with no backfill.
ALTER TABLE downloads ADD COLUMN ip TEXT;
ALTER TABLE downloads ADD COLUMN user_agent TEXT;

-- Supports the unique-visitor count and the per-IP grouping on the dashboard.
CREATE INDEX idx_downloads_ip ON downloads (ip);
