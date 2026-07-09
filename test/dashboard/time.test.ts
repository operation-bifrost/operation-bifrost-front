import { describe, expect, it } from "vitest";
import {
  bangkokDayKey,
  enumerateDays,
  rangeStartDay,
  BANGKOK_OFFSET_MS,
} from "@/lib/dashboard/time";

describe("bangkokDayKey", () => {
  it("uses the Bangkok calendar day (UTC+7)", () => {
    // 2026-07-08 18:30 UTC = 2026-07-09 01:30 Bangkok
    const t = Date.UTC(2026, 6, 8, 18, 30, 0);
    expect(bangkokDayKey(t)).toBe("2026-07-09");
  });
  it("keeps same UTC day when still before the +7 rollover", () => {
    const t = Date.UTC(2026, 6, 8, 10, 0, 0); // 17:00 Bangkok, same date
    expect(bangkokDayKey(t)).toBe("2026-07-08");
  });
  it("exposes a 7-hour offset in ms", () => {
    expect(BANGKOK_OFFSET_MS).toBe(7 * 60 * 60 * 1000);
  });
  it("stays on day D at 16:59:59.999 UTC (23:59:59.999 Bangkok)", () => {
    expect(bangkokDayKey(Date.UTC(2026, 6, 8, 16, 59, 59, 999))).toBe("2026-07-08");
  });
  it("rolls to D+1 exactly at 17:00:00.000 UTC (00:00 Bangkok)", () => {
    expect(bangkokDayKey(Date.UTC(2026, 6, 8, 17, 0, 0, 0))).toBe("2026-07-09");
  });
});

describe("enumerateDays", () => {
  it("lists inclusive ascending days across a month boundary", () => {
    expect(enumerateDays("2026-06-29", "2026-07-02")).toEqual([
      "2026-06-29",
      "2026-06-30",
      "2026-07-01",
      "2026-07-02",
    ]);
  });
  it("returns a single day when start == end", () => {
    expect(enumerateDays("2026-07-09", "2026-07-09")).toEqual(["2026-07-09"]);
  });
  it("crosses a year boundary", () => {
    expect(enumerateDays("2026-12-30", "2027-01-02")).toEqual([
      "2026-12-30",
      "2026-12-31",
      "2027-01-01",
      "2027-01-02",
    ]);
  });
});

describe("rangeStartDay", () => {
  it("returns the day (days-1) before today for a 7-day window", () => {
    expect(rangeStartDay("2026-07-09", 7)).toBe("2026-07-03");
  });
  it("returns today for a 1-day window", () => {
    expect(rangeStartDay("2026-07-09", 1)).toBe("2026-07-09");
  });
  it("crosses a year boundary backward", () => {
    expect(rangeStartDay("2027-01-01", 3)).toBe("2026-12-30");
  });
});
