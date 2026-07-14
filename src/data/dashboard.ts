export const DAY_MS = 86_400_000;

/** Range options for the time-series chart. `days: null` means "all time". */
export const RANGE_OPTIONS = [
  { key: "24h", label: "24h", days: 1 },
  { key: "7d", label: "7d", days: 7 },
  { key: "30d", label: "30d", days: 30 },
  { key: "all", label: "All", days: null },
] as const;

export type RangeKey = (typeof RANGE_OPTIONS)[number]["key"];
export type SeriesMode = "daily" | "cumulative";

export const dashboardContent = {
  meta: {
    title: "Download Telemetry — Operation Bifrost",
    description: "Private download analytics dashboard.",
  },
  console: {
    brand: "Operation Bifrost",
    subtitle: "Download telemetry",
    refreshLabel: "Refresh",
    logoutLabel: "Log out",
    syncedPrefix: "Updated",
  },
  hero: {
    label: "Total downloads",
    emptyCaption: "No downloads yet",
  },
  tiles: {
    last24h: "Last 24h",
    last7d: "Last 7d",
    peakDay: "Peak day",
    avgPerDay: "Avg / day",
  },
  timeseries: { title: "Downloads over time", empty: "No data" },
  version: { title: "By version" },
  country: { title: "By country", topN: 8, othersLabel: "Others", unknownLabel: "Unknown" },
  heatmap: {
    title: "Activity",
    caption: "Asia/Bangkok · hour × weekday",
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },
  provenance:
    "Source: D1 downloads log · counts are click events, not unique users · times in Asia/Bangkok",
  login: {
    title: "Sign in",
    prompt: "Password",
    submitLabel: "Sign in",
    errorInvalid: "Incorrect password",
    errorRateLimited: "Too many attempts — wait 60s",
    errorNetwork: "Network error — try again",
  },
  errors: { snapshotFailed: "Couldn't load the dashboard", retryLabel: "Retry" },
} as const;
