/**
 * User-Agent classification for the download dashboard.
 *
 * Deliberately small and rule-driven rather than a UA-parsing dependency: the
 * dashboard only needs a coarse browser / OS / device split, and the raw string
 * is kept in D1 so the classification can be improved later without a backfill.
 *
 * `UNKNOWN` is the same sentinel the country breakdown uses — the UI maps it to
 * the localized "unknown" label, so this module stays free of display copy.
 */

export const UNKNOWN = "UNKNOWN";

export type DeviceKind = "desktop" | "mobile" | "tablet" | "bot" | typeof UNKNOWN;

export interface ParsedUserAgent {
  /** Browser family, e.g. "Chrome", "Safari", or `UNKNOWN`. */
  browser: string;
  /** OS family, e.g. "Windows", "Android", or `UNKNOWN`. */
  os: string;
  device: DeviceKind;
}

interface Rule {
  test: RegExp;
  name: string;
}

// Automated clients are checked before every browser rule: crawlers and
// download managers routinely embed "Chrome" or "Safari" in their UA, so
// matching them first keeps bot traffic out of the human browser split.
const BOT = /bot\b|bots\b|crawl|spider|slurp|headlesschrome|preview|scanner|monitor/i;
const BOT_TOOL =
  /^(curl|wget|python-requests|python-urllib|okhttp|axios|libwww-perl|aria2|go-http-client|java|node-fetch|postmanruntime|httpie|powershell|winhttp)\b/i;

// Order matters: every Chromium fork ships "Chrome" in its UA and Safari's
// token appears in nearly all of them, so the most specific rule wins first.
const BROWSER_RULES: Rule[] = [
  { test: /Edg(?:iOS|A|)\//, name: "Edge" },
  { test: /OPR\/|Opera[ /]/, name: "Opera" },
  { test: /SamsungBrowser\//, name: "Samsung Internet" },
  { test: /Vivaldi\//, name: "Vivaldi" },
  { test: /Brave\//, name: "Brave" },
  { test: /YaBrowser\//, name: "Yandex" },
  { test: /UCBrowser\//, name: "UC Browser" },
  { test: /Firefox\/|FxiOS\//, name: "Firefox" },
  { test: /Chrome\/|CriOS\//, name: "Chrome" },
  { test: /Version\/[\d.]+.*Safari\//, name: "Safari" },
  { test: /MSIE |Trident\//, name: "Internet Explorer" },
];

const OS_RULES: Rule[] = [
  { test: /Windows NT|Windows Phone|Win64|WOW64/, name: "Windows" },
  { test: /Android/, name: "Android" },
  { test: /iPhone|iPad|iPod|iOS/, name: "iOS" },
  { test: /CrOS/, name: "ChromeOS" },
  // Checked after iOS: iPadOS/iPhone UAs also carry "Mac OS X".
  { test: /Mac OS X|Macintosh/, name: "macOS" },
  { test: /Linux|X11|Ubuntu/, name: "Linux" },
];

function matchRules(ua: string, rules: Rule[]): string {
  return rules.find((r) => r.test.test(ua))?.name ?? UNKNOWN;
}

function classifyDevice(ua: string): DeviceKind {
  // Android tablets are Android UAs *without* the "Mobile" token — the same
  // signal Google documents for the phone/tablet split.
  if (/iPad|Tablet|PlayBook|Silk\//.test(ua)) return "tablet";
  if (/Android/.test(ua) && !/Mobile/.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod|Windows Phone|IEMobile/.test(ua)) return "mobile";
  return "desktop";
}

/**
 * Classify a raw User-Agent header. A missing or blank header (local dev, a
 * client that strips it) yields `UNKNOWN` across the board rather than being
 * guessed at.
 */
export function parseUserAgent(ua: string | null | undefined): ParsedUserAgent {
  const raw = ua?.trim() ?? "";
  if (raw === "") return { browser: UNKNOWN, os: UNKNOWN, device: UNKNOWN };

  if (BOT.test(raw) || BOT_TOOL.test(raw)) {
    return { browser: "Bot", os: matchRules(raw, OS_RULES), device: "bot" };
  }

  return {
    browser: matchRules(raw, BROWSER_RULES),
    os: matchRules(raw, OS_RULES),
    device: classifyDevice(raw),
  };
}

export interface UserAgentCount {
  userAgent: string | null;
  count: number;
}

export interface LabelCount {
  /** Family name, or the `UNKNOWN` sentinel. */
  label: string;
  count: number;
}

export interface UserAgentBreakdown {
  byBrowser: LabelCount[];
  byOs: LabelCount[];
  byDevice: LabelCount[];
}

/** Descending by count, with a stable alphabetical tiebreak. */
function toSortedCounts(tally: Map<string, number>): LabelCount[] {
  return [...tally]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/**
 * Fold `(user_agent, count)` groups from SQL into browser / OS / device
 * breakdowns. Pure, so improving `parseUserAgent` re-classifies historical rows
 * on the next snapshot with no migration.
 */
export function foldUserAgents(rows: UserAgentCount[]): UserAgentBreakdown {
  const browsers = new Map<string, number>();
  const systems = new Map<string, number>();
  const devices = new Map<string, number>();

  const add = (tally: Map<string, number>, key: string, count: number) =>
    tally.set(key, (tally.get(key) ?? 0) + count);

  for (const row of rows) {
    const { browser, os, device } = parseUserAgent(row.userAgent);
    add(browsers, browser, row.count);
    add(systems, os, row.count);
    add(devices, device, row.count);
  }

  return {
    byBrowser: toSortedCounts(browsers),
    byOs: toSortedCounts(systems),
    byDevice: toSortedCounts(devices),
  };
}
