import { steinsGateContent } from "@/data/steins-gate";
import { foldUserAgents, type LabelCount, type UserAgentCount } from "@/lib/downloads/user-agent";

export interface DownloadEvent {
  /** Patch version downloaded, e.g. "v1.0.0". */
  version: string;
  /** ISO 3166-1 alpha-2 country from Cloudflare, or null when unavailable (e.g. local dev). */
  country: string | null;
  /** Client IP from Cloudflare's CF-Connecting-IP, or null when unavailable (e.g. local dev). */
  ip: string | null;
  /** Raw User-Agent header, stored unparsed; classified at read time. */
  userAgent: string | null;
  createdAt: number;
}

/** Longest User-Agent stored. Real headers sit well under this; the cap only
 *  guards against a hostile client padding the column. */
const MAX_USER_AGENT_LEN = 512;

function truncate(value: string | null, max: number): string | null {
  if (value === null) return null;
  return value.length > max ? value.slice(0, max) : value;
}

/**
 * Append a download-click event. Best-effort by design: callers should never let
 * a stats-write failure block the actual file download.
 */
export async function recordDownload(db: D1Database, e: DownloadEvent): Promise<void> {
  await db
    .prepare(
      "INSERT INTO downloads (version, country, ip, user_agent, created_at) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(e.version, e.country, e.ip, truncate(e.userAgent, MAX_USER_AGENT_LEN), e.createdAt)
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
export interface HourBucket {
  /** Bangkok clock hour, "YYYY-MM-DDTHH". */
  hour: string;
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
export interface IpCount {
  ip: string;
  count: number;
}
/** One download click, as shown in the detail table. */
export interface DownloadRow {
  id: number;
  version: string;
  country: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: number;
}
export interface ClientStats {
  /** Distinct IPs seen — an approximation of unique downloaders. */
  uniqueIps: number;
  /** Busiest IPs, capped at `TOP_IP_LIMIT`. */
  topIps: IpCount[];
  byBrowser: LabelCount[];
  byOs: LabelCount[];
  byDevice: LabelCount[];
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
  hourly: HourBucket[];
  byVersion: VersionCount[];
  byCountry: CountryCount[];
  heat: HeatCell[];
  clients: ClientStats;
  /** Newest-first download log, capped at `RECENT_LIMIT`. */
  recent: DownloadRow[];
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

// Hourly buckets only feed the 24h view, so bound the scan to the recent past
// (48h of margin) instead of grouping the whole table by hour.
const HOURLY_LOOKBACK_MS = 2 * 86_400_000;

export async function getHourlySeries(db: D1Database, nowMs: number): Promise<HourBucket[]> {
  const { results } = await db
    .prepare(
      `SELECT strftime('%Y-%m-%dT%H', ${BKK}) AS hour, COUNT(*) AS count ` +
        "FROM downloads WHERE created_at >= ? GROUP BY hour ORDER BY hour ASC",
    )
    .bind(nowMs - HOURLY_LOOKBACK_MS)
    .all<HourBucket>();
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

/** How many busiest IPs the dashboard lists. */
export const TOP_IP_LIMIT = 10;
/** How many rows the download-log table receives. */
export const RECENT_LIMIT = 200;

/** Distinct client IPs. Rows with no IP (pre-migration, local dev) are excluded
 *  rather than collapsed into one phantom visitor. */
export async function getUniqueIpCount(db: D1Database): Promise<number> {
  const row = await db
    .prepare("SELECT COUNT(DISTINCT ip) AS uniqueIps FROM downloads WHERE ip IS NOT NULL")
    .first<{ uniqueIps: number }>();
  return row?.uniqueIps ?? 0;
}

export async function getTopIps(db: D1Database, limit = TOP_IP_LIMIT): Promise<IpCount[]> {
  const { results } = await db
    .prepare(
      "SELECT ip, COUNT(*) AS count FROM downloads WHERE ip IS NOT NULL " +
        "GROUP BY ip ORDER BY count DESC, ip ASC LIMIT ?",
    )
    .bind(limit)
    .all<IpCount>();
  return results;
}

/** Raw User-Agent groups. The distinct-UA set is small, so the browser / OS /
 *  device split is folded in JS (see `foldUserAgents`) instead of SQL. */
export async function getUserAgentCounts(db: D1Database): Promise<UserAgentCount[]> {
  const { results } = await db
    .prepare(
      "SELECT user_agent AS userAgent, COUNT(*) AS count FROM downloads " +
        "GROUP BY user_agent ORDER BY count DESC",
    )
    .all<UserAgentCount>();
  return results;
}

export async function getClientStats(db: D1Database): Promise<ClientStats> {
  const [uniqueIps, topIps, agents] = await Promise.all([
    getUniqueIpCount(db),
    getTopIps(db),
    getUserAgentCounts(db),
  ]);
  return { uniqueIps, topIps, ...foldUserAgents(agents) };
}

/** Newest-first download log for the detail table. */
export async function getRecentDownloads(
  db: D1Database,
  limit = RECENT_LIMIT,
): Promise<DownloadRow[]> {
  const { results } = await db
    .prepare(
      "SELECT id, version, country, ip, user_agent AS userAgent, created_at AS createdAt " +
        "FROM downloads ORDER BY created_at DESC, id DESC LIMIT ?",
    )
    .bind(limit)
    .all<DownloadRow>();
  return results;
}

export async function getDashboardSnapshot(
  db: D1Database,
  nowMs: number,
): Promise<DashboardSnapshot> {
  const [totals, daily, hourly, windows, byVersion, byCountry, heat, clients, recent] =
    await Promise.all([
      getTotals(db),
      getDailySeries(db),
      getHourlySeries(db, nowMs),
      getWindowCounts(db, nowMs),
      getByVersion(db),
      getByCountry(db),
      getHeat(db),
      getClientStats(db),
      getRecentDownloads(db),
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
    hourly,
    byVersion,
    byCountry,
    heat,
    clients,
    recent,
  };
}
