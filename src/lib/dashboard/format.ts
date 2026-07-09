const numberFormatter = new Intl.NumberFormat("en-US");

export function formatCount(n: number): string {
  return numberFormatter.format(n);
}

export interface Delta {
  pct: number | null; // rounded whole percent; null when there is no baseline
  direction: "up" | "down" | "flat";
}

export function computeDelta(current: number, previous: number): Delta {
  if (previous === 0) {
    if (current === 0) return { pct: null, direction: "flat" };
    return { pct: null, direction: "up" };
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  const direction = pct > 0 ? "up" : pct < 0 ? "down" : "flat";
  return { pct, direction };
}

const A_CHAR = 65;
const REGIONAL_A = 0x1f1e6;

export function codeToFlagEmoji(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "🌐";
  const upper = code.toUpperCase();
  const first = REGIONAL_A + (upper.charCodeAt(0) - A_CHAR);
  const second = REGIONAL_A + (upper.charCodeAt(1) - A_CHAR);
  return String.fromCodePoint(first, second);
}

let regionNames: Intl.DisplayNames | null = null;
function getRegionNames(): Intl.DisplayNames | null {
  if (regionNames) return regionNames;
  try {
    regionNames = new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    regionNames = null;
  }
  return regionNames;
}

export function resolveCountryName(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "Unknown";
  const upper = code.toUpperCase();
  const names = getRegionNames();
  try {
    return names?.of(upper) ?? upper;
  } catch {
    return upper;
  }
}
