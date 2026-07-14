import { describe, expect, it } from "vitest";

import type { DayBucket, HourBucket } from "@/lib/downloads/repository";
import { buildSeriesPoints, buildHourlyPoints, isCustomRangeActive } from "@/lib/dashboard/series";

// generatedAt = 2026-07-14 00:00 UTC → Bangkok (UTC+7) day "2026-07-14".
const TODAY_MS = Date.UTC(2026, 6, 14);

const daily: DayBucket[] = [
  { day: "2026-07-10", count: 5 },
  { day: "2026-07-12", count: 3 },
  { day: "2026-07-14", count: 7 },
];

describe("isCustomRangeActive", () => {
  it("is false for null, partial, or inverted ranges", () => {
    expect(isCustomRangeActive(null)).toBe(false);
    expect(isCustomRangeActive({ from: "", to: "" })).toBe(false);
    expect(isCustomRangeActive({ from: "2026-07-11", to: "" })).toBe(false);
    expect(isCustomRangeActive({ from: "2026-07-13", to: "2026-07-11" })).toBe(false);
  });

  it("is true when both ends are set and not inverted", () => {
    expect(isCustomRangeActive({ from: "2026-07-11", to: "2026-07-13" })).toBe(true);
    expect(isCustomRangeActive({ from: "2026-07-11", to: "2026-07-11" })).toBe(true);
  });
});

describe("buildSeriesPoints", () => {
  it("covers the last N days up to today for a preset range, filling gaps with 0", () => {
    const points = buildSeriesPoints(daily, TODAY_MS, "7d", "daily", null);
    expect(points).toHaveLength(7);
    expect(points[0].day).toBe("2026-07-08");
    expect(points[points.length - 1].day).toBe("2026-07-14");
    expect(points.find((p) => p.day === "2026-07-10")?.value).toBe(5);
    expect(points.find((p) => p.day === "2026-07-11")?.value).toBe(0);
    expect(points.find((p) => p.day === "2026-07-14")?.value).toBe(7);
  });

  it("restricts to the custom window when a valid custom range is set", () => {
    const points = buildSeriesPoints(daily, TODAY_MS, "30d", "daily", {
      from: "2026-07-11",
      to: "2026-07-13",
    });
    expect(points.map((p) => p.day)).toEqual(["2026-07-11", "2026-07-12", "2026-07-13"]);
    expect(points.map((p) => p.value)).toEqual([0, 3, 0]);
  });

  it("ignores an inverted custom range and falls back to the preset", () => {
    const points = buildSeriesPoints(daily, TODAY_MS, "7d", "daily", {
      from: "2026-07-13",
      to: "2026-07-11",
    });
    expect(points).toHaveLength(7);
    expect(points[0].day).toBe("2026-07-08");
  });

  it("returns a running total within the window in cumulative mode", () => {
    const points = buildSeriesPoints(daily, TODAY_MS, "30d", "cumulative", {
      from: "2026-07-10",
      to: "2026-07-14",
    });
    expect(points.map((p) => p.value)).toEqual([5, 5, 8, 8, 15]);
  });
});

describe("buildHourlyPoints", () => {
  // generatedAt 2026-07-14 00:00 UTC → Bangkok 07:00 → window ends "2026-07-14T07".
  const GEN_MS = Date.UTC(2026, 6, 14, 0);
  const hourly: HourBucket[] = [
    { hour: "2026-07-13T08", count: 5 }, // window start
    { hour: "2026-07-14T00", count: 2 }, // mid-window
    { hour: "2026-07-14T07", count: 4 }, // window end (now)
    { hour: "2026-07-12T23", count: 9 }, // before the 24h window → excluded
  ];

  it("covers the last 24 hours ending at the current Bangkok hour, filling gaps with 0", () => {
    const points = buildHourlyPoints(hourly, GEN_MS, "daily");
    expect(points).toHaveLength(24);
    expect(points[0]).toMatchObject({ day: "2026-07-13T08", label: "08:00", value: 5 });
    expect(points[points.length - 1]).toMatchObject({
      day: "2026-07-14T07",
      label: "07:00",
      value: 4,
    });
    expect(points.find((p) => p.day === "2026-07-14T00")?.value).toBe(2);
    expect(points.find((p) => p.day === "2026-07-13T09")?.value).toBe(0); // gap
    expect(points.some((p) => p.day === "2026-07-12T23")).toBe(false); // outside window
  });

  it("returns a running total within the 24h window in cumulative mode", () => {
    const points = buildHourlyPoints(hourly, GEN_MS, "cumulative");
    expect(points[0].value).toBe(5);
    expect(points[points.length - 1].value).toBe(11); // 5 + 2 + 4, excludes pre-window 9
  });
});
