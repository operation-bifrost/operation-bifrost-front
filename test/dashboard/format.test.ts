import { describe, expect, it } from "vitest";
import {
  formatCount,
  computeDelta,
  codeToFlagEmoji,
  resolveCountryName,
} from "@/lib/dashboard/format";

describe("formatCount", () => {
  it("groups thousands", () => {
    expect(formatCount(1284)).toBe("1,284");
  });
  it("passes small numbers through", () => {
    expect(formatCount(7)).toBe("7");
  });
});

describe("computeDelta", () => {
  it("computes an upward percentage", () => {
    expect(computeDelta(140, 100)).toEqual({ pct: 40, direction: "up" });
  });
  it("computes a downward percentage", () => {
    expect(computeDelta(80, 100)).toEqual({ pct: -20, direction: "down" });
  });
  it("is flat when equal", () => {
    expect(computeDelta(100, 100)).toEqual({ pct: 0, direction: "flat" });
  });
  it("returns null pct when previous is zero (no baseline)", () => {
    expect(computeDelta(5, 0)).toEqual({ pct: null, direction: "up" });
  });
  it("is flat when both are zero", () => {
    expect(computeDelta(0, 0)).toEqual({ pct: null, direction: "flat" });
  });
});

describe("codeToFlagEmoji", () => {
  it("maps a 2-letter code to regional indicators", () => {
    expect(codeToFlagEmoji("TH")).toBe("🇹🇭");
  });
  it("falls back to a globe for UNKNOWN / bad codes", () => {
    expect(codeToFlagEmoji("UNKNOWN")).toBe("🌐");
    expect(codeToFlagEmoji("T1")).toBe("🌐");
  });
});

describe("resolveCountryName", () => {
  it("resolves a known code to a display name", () => {
    expect(resolveCountryName("TH")).toBe("Thailand");
  });
  it("labels UNKNOWN explicitly", () => {
    expect(resolveCountryName("UNKNOWN")).toBe("Unknown");
  });
});
