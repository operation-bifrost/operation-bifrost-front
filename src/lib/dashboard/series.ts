import type { DayBucket } from "@/lib/downloads/repository";
import { bangkokDayKey, enumerateDays, rangeStartDay } from "@/lib/dashboard/time";
import { RANGE_OPTIONS, type RangeKey, type SeriesMode, type CustomRange } from "@/data/dashboard";

export interface SeriesPoint {
  day: string;
  value: number;
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
  const cumulativeCounts = dailyCounts.reduce<number[]>((acc, count) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : 0;
    return [...acc, prev + count];
  }, []);

  return days.map((day, i) => ({
    day,
    value: series === "cumulative" ? cumulativeCounts[i] : dailyCounts[i],
  }));
}
