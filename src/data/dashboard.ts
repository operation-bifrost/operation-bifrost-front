export const DAY_MS = 86_400_000;

/** Range options for the time-series chart. `days: null` means "all time". */
export const RANGE_OPTIONS = [
  { key: "24h", label: "24H", days: 1 },
  { key: "7d", label: "7D", days: 7 },
  { key: "30d", label: "30D", days: 30 },
  { key: "all", label: "ALL", days: null },
] as const;

export type RangeKey = (typeof RANGE_OPTIONS)[number]["key"];
export type SeriesMode = "daily" | "cumulative";

export const dashboardContent = {
  meta: {
    title: "Download Telemetry — Operation Bifrost",
    description: "Private download analytics dashboard.",
  },
  console: {
    brand: "OPERATION BIFROST",
    subtitle: "// DOWNLOAD TELEMETRY",
    sessionLabel: "SESSION ACTIVE",
    refreshLabel: "SYNC",
    logoutLabel: "LOGOUT",
    syncedPrefix: "last sync",
  },
  hero: {
    label: "TOTAL DOWNLOADS",
    emptyCaption: "AWAITING FIRST SIGNAL",
  },
  tiles: {
    last24h: "LAST 24H",
    last7d: "LAST 7D",
    peakDay: "PEAK DAY",
    avgPerDay: "AVG / DAY",
  },
  timeseries: { title: "DOWNLOADS OVER TIME", empty: "NO DATA" },
  version: { title: "BY VERSION" },
  country: { title: "BY COUNTRY", topN: 8, othersLabel: "Others", unknownLabel: "Unknown" },
  heatmap: {
    title: "ACTIVITY",
    caption: "Asia/Bangkok · hour × weekday",
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },
  provenance:
    "Source: D1 downloads log · counts are click events, not unique users · times in Asia/Bangkok",
  login: {
    title: "RESTRICTED",
    prompt: "ENTER ACCESS KEY",
    submitLabel: "AUTHENTICATE",
    errorInvalid: "ACCESS DENIED",
    errorRateLimited: "TOO MANY ATTEMPTS — WAIT 60s",
    errorNetwork: "SIGNAL LOST — RETRY",
  },
  errors: { snapshotFailed: "SIGNAL LOST", retryLabel: "RETRY" },
} as const;
