import { steinsGateContent } from "@/data/steins-gate";

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

export interface DayBucket {
  day: string;
  count: number;
}
export interface VersionCount {
  version: string;
  count: number;
}
export interface CountryCount {
  country: string;
  count: number;
}
export interface HeatCell {
  weekday: number;
  hour: number;
  count: number;
}
export interface WindowCounts {
  last24h: number;
  prev24h: number;
  last7d: number;
  prev7d: number;
}

export interface DashboardSnapshot {
  generatedAt: number;
  total: number;
  firstAt: number | null;
  lastAt: number | null;
  currentVersion: string;
  windows: WindowCounts;
  peakDay: DayBucket | null;
  daily: DayBucket[];
  byVersion: VersionCount[];
  byCountry: CountryCount[];
  heat: HeatCell[];
}

// created_at is epoch MS. Divide to seconds, shift +25200s for Bangkok (UTC+7),
// then interpret as 'unixepoch'. Used for day / hour / weekday bucketing.
const BKK = "(created_at/1000)+25200, 'unixepoch'";

export async function getTotals(
  db: D1Database,
): Promise<{ total: number; firstAt: number | null; lastAt: number | null }> {
  const row = await db
    .prepare(
      "SELECT COUNT(*) AS total, MIN(created_at) AS firstAt, MAX(created_at) AS lastAt FROM downloads",
    )
    .first<{ total: number; firstAt: number | null; lastAt: number | null }>();
  return { total: row?.total ?? 0, firstAt: row?.firstAt ?? null, lastAt: row?.lastAt ?? null };
}

export async function getDailySeries(db: D1Database): Promise<DayBucket[]> {
  const { results } = await db
    .prepare(
      `SELECT strftime('%Y-%m-%d', ${BKK}) AS day, COUNT(*) AS count ` +
        "FROM downloads GROUP BY day ORDER BY day ASC",
    )
    .all<DayBucket>();
  return results;
}

export async function getWindowCounts(db: D1Database, nowMs: number): Promise<WindowCounts> {
  const d = 86_400_000;
  const row = await db
    .prepare(
      "SELECT " +
        "COALESCE(SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END), 0) AS last24h, " +
        "COALESCE(SUM(CASE WHEN created_at >= ? AND created_at < ? THEN 1 ELSE 0 END), 0) AS prev24h, " +
        "COALESCE(SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END), 0) AS last7d, " +
        "COALESCE(SUM(CASE WHEN created_at >= ? AND created_at < ? THEN 1 ELSE 0 END), 0) AS prev7d " +
        "FROM downloads",
    )
    .bind(nowMs - d, nowMs - 2 * d, nowMs - d, nowMs - 7 * d, nowMs - 14 * d, nowMs - 7 * d)
    .first<WindowCounts>();
  return row ?? { last24h: 0, prev24h: 0, last7d: 0, prev7d: 0 };
}

export async function getByVersion(db: D1Database): Promise<VersionCount[]> {
  const { results } = await db
    .prepare(
      "SELECT version, COUNT(*) AS count FROM downloads GROUP BY version ORDER BY count DESC",
    )
    .all<VersionCount>();
  return results;
}

export async function getByCountry(db: D1Database): Promise<CountryCount[]> {
  const { results } = await db
    .prepare(
      "SELECT COALESCE(country, 'UNKNOWN') AS country, COUNT(*) AS count " +
        "FROM downloads GROUP BY COALESCE(country, 'UNKNOWN') ORDER BY count DESC",
    )
    .all<CountryCount>();
  return results;
}

export async function getHeat(db: D1Database): Promise<HeatCell[]> {
  const { results } = await db
    .prepare(
      `SELECT CAST(strftime('%w', ${BKK}) AS INTEGER) AS weekday, ` +
        `CAST(strftime('%H', ${BKK}) AS INTEGER) AS hour, COUNT(*) AS count ` +
        "FROM downloads GROUP BY weekday, hour",
    )
    .all<HeatCell>();
  return results;
}

export async function getDashboardSnapshot(
  db: D1Database,
  nowMs: number,
): Promise<DashboardSnapshot> {
  const [totals, daily, windows, byVersion, byCountry, heat] = await Promise.all([
    getTotals(db),
    getDailySeries(db),
    getWindowCounts(db, nowMs),
    getByVersion(db),
    getByCountry(db),
    getHeat(db),
  ]);

  const peakDay = daily.reduce<DayBucket | null>(
    (max, d) => (!max || d.count > max.count ? d : max),
    null,
  );

  return {
    generatedAt: nowMs,
    total: totals.total,
    firstAt: totals.firstAt,
    lastAt: totals.lastAt,
    currentVersion: steinsGateContent.download.version,
    windows,
    peakDay,
    daily,
    byVersion,
    byCountry,
    heat,
  };
}
