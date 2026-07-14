import { describe, expect, it } from "vitest";
import {
  bangkokDayKey,
  bangkokHourKey,
  enumerateDays,
  enumerateHours,
  formatHourLabel,
  rangeStartDay,
  rangeStartHour,
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

describe("bangkokHourKey", () => {
  it("uses the Bangkok clock hour (UTC+7)", () => {
    // 2026-07-08 18:30 UTC = 2026-07-09 01:xx Bangkok
    expect(bangkokHourKey(Date.UTC(2026, 6, 8, 18, 30))).toBe("2026-07-09T01");
  });
  it("stays on hour H at :59:59.999 and rolls at the next :00", () => {
    expect(bangkokHourKey(Date.UTC(2026, 6, 8, 16, 59, 59, 999))).toBe("2026-07-08T23");
    expect(bangkokHourKey(Date.UTC(2026, 6, 8, 17, 0, 0, 0))).toBe("2026-07-09T00");
  });
});

describe("enumerateHours", () => {
  it("lists inclusive ascending hours across a day boundary", () => {
    expect(enumerateHours("2026-07-13T22", "2026-07-14T01")).toEqual([
      "2026-07-13T22",
      "2026-07-13T23",
      "2026-07-14T00",
      "2026-07-14T01",
    ]);
  });
  it("returns a single hour when start == end", () => {
    expect(enumerateHours("2026-07-14T09", "2026-07-14T09")).toEqual(["2026-07-14T09"]);
  });
});

describe("rangeStartHour", () => {
  it("returns the hour (hours-1) before the end for a 24-hour window", () => {
    expect(rangeStartHour("2026-07-14T07", 24)).toBe("2026-07-13T08");
  });
  it("crosses a day boundary backward", () => {
    expect(rangeStartHour("2026-07-14T01", 3)).toBe("2026-07-13T23");
  });
});

describe("formatHourLabel", () => {
  it("renders an hour key as HH:00", () => {
    expect(formatHourLabel("2026-07-14T09")).toBe("09:00");
    expect(formatHourLabel("2026-07-14T00")).toBe("00:00");
  });
});
