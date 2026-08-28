import { describe, expect, it } from "vitest";
import { foldUserAgents, parseUserAgent, UNKNOWN } from "@/lib/downloads/user-agent";

const CHROME_WIN =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const SAFARI_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1";
const EDGE_WIN = `${CHROME_WIN} Edg/120.0.0.0`;
const FIREFOX_LINUX = "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0";
const CHROME_ANDROID_PHONE =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
const CHROME_ANDROID_TABLET =
  "Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const SAFARI_IPAD =
  "Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/604.1";
const GOOGLEBOT =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/120.0.0.0 Safari/537.36";

describe("parseUserAgent", () => {
  it("classifies a desktop Chrome on Windows", () => {
    expect(parseUserAgent(CHROME_WIN)).toEqual({
      browser: "Chrome",
      os: "Windows",
      device: "desktop",
    });
  });

  it("picks Edge over Chrome when both tokens are present", () => {
    expect(parseUserAgent(EDGE_WIN).browser).toBe("Edge");
  });

  it("picks Safari only when the Version token is present, not from the Safari suffix alone", () => {
    expect(parseUserAgent(SAFARI_IPHONE).browser).toBe("Safari");
    // Chrome's UA also ends in "Safari/537.36" — it must not be read as Safari.
    expect(parseUserAgent(CHROME_WIN).browser).toBe("Chrome");
  });

  it("resolves iOS before macOS despite the shared 'Mac OS X' token", () => {
    expect(parseUserAgent(SAFARI_IPHONE).os).toBe("iOS");
    expect(parseUserAgent(SAFARI_IPAD).os).toBe("iOS");
  });

  it("reads Firefox on Linux", () => {
    expect(parseUserAgent(FIREFOX_LINUX)).toEqual({
      browser: "Firefox",
      os: "Linux",
      device: "desktop",
    });
  });

  it("splits Android phone from Android tablet on the Mobile token", () => {
    expect(parseUserAgent(CHROME_ANDROID_PHONE).device).toBe("mobile");
    expect(parseUserAgent(CHROME_ANDROID_TABLET).device).toBe("tablet");
  });

  it("treats an iPad as a tablet", () => {
    expect(parseUserAgent(SAFARI_IPAD).device).toBe("tablet");
  });

  it("flags crawlers as bots even when they embed a browser token", () => {
    expect(parseUserAgent(GOOGLEBOT)).toMatchObject({ browser: "Bot", device: "bot" });
  });

  it("flags command-line download tools as bots", () => {
    expect(parseUserAgent("curl/8.4.0").device).toBe("bot");
    expect(parseUserAgent("Wget/1.21.4").device).toBe("bot");
    expect(parseUserAgent("python-requests/2.31.0").device).toBe("bot");
  });

  it("returns UNKNOWN across the board for a missing or blank header", () => {
    const blank = { browser: UNKNOWN, os: UNKNOWN, device: UNKNOWN };
    expect(parseUserAgent(null)).toEqual(blank);
    expect(parseUserAgent(undefined)).toEqual(blank);
    expect(parseUserAgent("   ")).toEqual(blank);
  });

  it("keeps an unrecognized but present UA as an UNKNOWN desktop rather than dropping it", () => {
    expect(parseUserAgent("SomeFutureClient/1.0")).toEqual({
      browser: UNKNOWN,
      os: UNKNOWN,
      device: "desktop",
    });
  });
});

describe("foldUserAgents", () => {
  it("sums counts per family across distinct UA strings", () => {
    const folded = foldUserAgents([
      { userAgent: CHROME_WIN, count: 5 },
      { userAgent: EDGE_WIN, count: 3 },
      { userAgent: SAFARI_IPHONE, count: 2 },
    ]);

    expect(folded.byBrowser).toEqual([
      { label: "Chrome", count: 5 },
      { label: "Edge", count: 3 },
      { label: "Safari", count: 2 },
    ]);
    // Chrome + Edge are both Windows, so the OS split collapses them.
    expect(folded.byOs).toEqual([
      { label: "Windows", count: 8 },
      { label: "iOS", count: 2 },
    ]);
    expect(folded.byDevice).toEqual([
      { label: "desktop", count: 8 },
      { label: "mobile", count: 2 },
    ]);
  });

  it("folds null user agents into the UNKNOWN bucket instead of dropping them", () => {
    const folded = foldUserAgents([
      { userAgent: CHROME_WIN, count: 1 },
      { userAgent: null, count: 4 },
    ]);
    expect(folded.byBrowser).toEqual([
      { label: UNKNOWN, count: 4 },
      { label: "Chrome", count: 1 },
    ]);
  });

  it("returns empty breakdowns for no rows", () => {
    expect(foldUserAgents([])).toEqual({ byBrowser: [], byOs: [], byDevice: [] });
  });

  it("breaks count ties alphabetically so ordering is stable", () => {
    const folded = foldUserAgents([
      { userAgent: FIREFOX_LINUX, count: 2 },
      { userAgent: CHROME_WIN, count: 2 },
    ]);
    expect(folded.byBrowser.map((b) => b.label)).toEqual(["Chrome", "Firefox"]);
  });
});
