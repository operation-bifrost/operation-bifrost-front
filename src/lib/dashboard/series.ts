import type { DayBucket, HourBucket } from "@/lib/downloads/repository";
import {
  bangkokDayKey,
  bangkokHourKey,
  enumerateDays,
  enumerateHours,
  formatHourLabel,
  rangeStartDay,
  rangeStartHour,
} from "@/lib/dashboard/time";
import { RANGE_OPTIONS, type RangeKey, type SeriesMode, type CustomRange } from "@/data/dashboard";

export interface SeriesPoint {
  /** Bucket key: a day key ("YYYY-MM-DD") or hour key ("YYYY-MM-DDTHH"). */
  day: string;
  /** X-axis display string ("YYYY-MM-DD" for days, "HH:00" for hours). */
  label: string;
  value: number;
}

/** Number of hourly buckets in the 24h view. */
const HOURS_IN_WINDOW = 24;

/** Running total, resetting at the window start (matches the daily behaviour). */
function runningTotal(counts: number[]): number[] {
  return counts.reduce<number[]>((acc, count) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : 0;
    return [...acc, prev + count];
  }, []);
}

/**
 * A custom range is only applied when both ends are set and the window is not
 * inverted. Anything else falls back to the preset range. Also acts as a type
 * guard so callers can treat a valid range as fully populated.
 */
export function isCustomRangeActive(range: CustomRange | null): range is CustomRange {
  return range !== null && range.from !== "" && range.to !== "" && range.from <= range.to;
}

/**
 * Resolve the [startDay, endDay] window for the chart. A valid custom range
 * wins; otherwise a preset covers the last N days up to today (`days: null` =
 * all data). Pure — no dependency on `Date.now()` (today comes from
 * `generatedAt`), so it is deterministic in tests.
 */
function resolveWindow(
  daily: DayBucket[],
  todayKey: string,
  range: RangeKey,
  customRange: CustomRange | null,
): { startDay: string; endDay: string } {
  if (isCustomRangeActive(customRange)) {
    return { startDay: customRange.from, endDay: customRange.to };
  }
  const rangeDays = RANGE_OPTIONS.find((o) => o.key === range)?.days ?? null;
  const startDay =
    rangeDays === null ? (daily[0]?.day ?? todayKey) : rangeStartDay(todayKey, rangeDays);
  return { startDay, endDay: todayKey };
}

/**
 * Build the chart series: one point per day across the resolved window, with
 * missing days filled to 0. `cumulative` mode returns the running total within
 * the window (matches the preset behaviour — cumulative resets at the window
 * start, it is not an all-time carry-in).
 */
export function buildSeriesPoints(
  daily: DayBucket[],
  generatedAt: number,
  range: RangeKey,
  series: SeriesMode,
  customRange: CustomRange | null,
): SeriesPoint[] {
  const byDay = new Map(daily.map((d) => [d.day, d.count]));
  const todayKey = bangkokDayKey(generatedAt);
  const { startDay, endDay } = resolveWindow(daily, todayKey, range, customRange);

  const days = enumerateDays(startDay, endDay);
  const dailyCounts = days.map((day) => byDay.get(day) ?? 0);
  const cumulativeCounts = runningTotal(dailyCounts);

  return days.map((day, i) => ({
    day,
    label: day,
    value: series === "cumulative" ? cumulativeCounts[i] : dailyCounts[i],
  }));
}

/**
 * Build the 24h chart series: one point per hour across the last 24 Bangkok
 * clock hours ending at `generatedAt`, missing hours filled to 0. Pure — the
 * window is derived from `generatedAt`, not `Date.now()`.
 */
export function buildHourlyPoints(
  hourly: HourBucket[],
  generatedAt: number,
  series: SeriesMode,
): SeriesPoint[] {
  const byHour = new Map(hourly.map((h) => [h.hour, h.count]));
  const endHour = bangkokHourKey(generatedAt);
  const startHour = rangeStartHour(endHour, HOURS_IN_WINDOW);

  const hours = enumerateHours(startHour, endHour);
  const counts = hours.map((hour) => byHour.get(hour) ?? 0);
  const cumulativeCounts = runningTotal(counts);

  return hours.map((hour, i) => ({
    day: hour,
    label: formatHourLabel(hour),
    value: series === "cumulative" ? cumulativeCounts[i] : counts[i],
  }));
}
