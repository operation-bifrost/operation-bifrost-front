export interface DownloadEvent {
  /** Patch version downloaded, e.g. "v1.0.0". */
  version: string;
  /** ISO 3166-1 alpha-2 country from Cloudflare, or null when unavailable (e.g. local dev). */
  country: string | null;
  createdAt: number;
}

/**
 * Append a download-click event. Best-effort by design: callers should never let
 * a stats-write failure block the actual file download.
 */
export async function recordDownload(db: D1Database, e: DownloadEvent): Promise<void> {
  await db
    .prepare("INSERT INTO downloads (version, country, created_at) VALUES (?, ?, ?)")
    .bind(e.version, e.country, e.createdAt)
    .run();
}

/** Total downloads across all versions — the headline stat. */
export async function countDownloads(db: D1Database): Promise<number> {
  const row = await db
    .prepare("SELECT COUNT(*) AS total FROM downloads")
    .first<{ total: number }>();
  return row?.total ?? 0;
}
