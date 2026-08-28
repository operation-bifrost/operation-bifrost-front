export const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Format a `Date`'s UTC calendar fields as "YYYY-MM-DD". */
function formatUtcDayKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "YYYY-MM-DD" for the Bangkok (UTC+7) calendar day containing `epochMs`. */
export function bangkokDayKey(epochMs: number): string {
  return formatUtcDayKey(new Date(epochMs + BANGKOK_OFFSET_MS));
}

/** Parse a "YYYY-MM-DD" key into a UTC-midnight epoch ms (timezone-neutral cursor). */
function dayKeyToUtcMs(dayKey: string): number {
  const [y, m, d] = dayKey.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Inclusive ascending list of "YYYY-MM-DD" from startDay to endDay. */
export function enumerateDays(startDay: string, endDay: string): string[] {
  const out: string[] = [];
  let cursor = dayKeyToUtcMs(startDay);
  const end = dayKeyToUtcMs(endDay);
  while (cursor <= end) {
    out.push(formatUtcDayKey(new Date(cursor)));
    cursor += 24 * 60 * 60 * 1000;
  }
  return out;
}

/** Day key `days-1` before `todayKey` (so a `days`-length window ends today). */
export function rangeStartDay(todayKey: string, days: number): string {
  const start = dayKeyToUtcMs(todayKey) - (days - 1) * 24 * 60 * 60 * 1000;
  return formatUtcDayKey(new Date(start));
}

const HOUR_MS = 60 * 60 * 1000;

/** Format a `Date`'s UTC calendar fields as "YYYY-MM-DDTHH" (hour key). */
function formatUtcHourKey(date: Date): string {
  return `${formatUtcDayKey(date)}T${String(date.getUTCHours()).padStart(2, "0")}`;
}

/** "YYYY-MM-DDTHH" for the Bangkok (UTC+7) clock hour containing `epochMs`. */
export function bangkokHourKey(epochMs: number): string {
  return formatUtcHourKey(new Date(epochMs + BANGKOK_OFFSET_MS));
}

/** Parse a "YYYY-MM-DDTHH" key into a UTC epoch ms (timezone-neutral cursor). */
function hourKeyToUtcMs(hourKey: string): number {
  const [day, hh] = hourKey.split("T");
  const [y, m, d] = day.split("-").map(Number);
  return Date.UTC(y, m - 1, d, Number(hh));
}

/** Inclusive ascending list of "YYYY-MM-DDTHH" from startHour to endHour. */
export function enumerateHours(startHour: string, endHour: string): string[] {
  const out: string[] = [];
  let cursor = hourKeyToUtcMs(startHour);
  const end = hourKeyToUtcMs(endHour);
  while (cursor <= end) {
    out.push(formatUtcHourKey(new Date(cursor)));
    cursor += HOUR_MS;
  }
  return out;
}

/** Hour key `hours-1` before `endHour` (so an `hours`-length window ends there). */
export function rangeStartHour(endHour: string, hours: number): string {
  const start = hourKeyToUtcMs(endHour) - (hours - 1) * HOUR_MS;
  return formatUtcHourKey(new Date(start));
}

/** "YYYY-MM-DDTHH" → "HH:00" for hourly axis labels. */
export function formatHourLabel(hourKey: string): string {
  return `${hourKey.slice(11, 13)}:00`;
}

/** Epoch ms → "YYYY-MM-DD HH:MM" on the Bangkok clock, for the download log. */
export function formatBangkokDateTime(epochMs: number): string {
  const shifted = new Date(epochMs + BANGKOK_OFFSET_MS);
  const hh = String(shifted.getUTCHours()).padStart(2, "0");
  const mm = String(shifted.getUTCMinutes()).padStart(2, "0");
  return `${formatUtcDayKey(shifted)} ${hh}:${mm}`;
}
