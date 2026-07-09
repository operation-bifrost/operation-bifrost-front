import { describe, expect, it } from "vitest";
import { getDashboardSnapshot } from "@/lib/downloads/repository";

type Row = Record<string, unknown>;

/** Minimal D1Database fake: matches a canned result by a substring of the SQL. */
function fakeDb(cannedBySqlFragment: Record<string, Row[]>): D1Database {
  function resultsFor(sql: string): Row[] {
    const key = Object.keys(cannedBySqlFragment).find((frag) => sql.includes(frag));
    return key ? cannedBySqlFragment[key] : [];
  }
  const stmt = (sql: string) => ({
    bind() {
      return stmt(sql);
    },
    async first<T>() {
      return (resultsFor(sql)[0] ?? null) as T | null;
    },
    async all<T>() {
      return { results: resultsFor(sql) as T[] };
    },
    async run() {
      return { meta: { changes: 0 } };
    },
  });
  return { prepare: (sql: string) => stmt(sql) } as unknown as D1Database;
}

describe("getDashboardSnapshot", () => {
  it("assembles totals, daily series, windows, breakdowns, and derives peak day", async () => {
    const db = fakeDb({
      "COUNT(*) AS total": [{ total: 6, firstAt: 1000, lastAt: 9000 }],
      "AS day": [
        { day: "2026-07-07", count: 2 },
        { day: "2026-07-08", count: 4 },
      ],
      "AS last24h": [{ last24h: 4, prev24h: 2, last7d: 6, prev7d: 0 }],
      "version, COUNT(*)": [{ version: "v1.0.0", count: 6 }],
      "AS country": [
        { country: "TH", count: 5 },
        { country: "UNKNOWN", count: 1 },
      ],
      "AS weekday": [{ weekday: 2, hour: 13, count: 3 }],
    });

    const snap = await getDashboardSnapshot(db, 1_700_000_000_000);

    expect(snap.total).toBe(6);
    expect(snap.daily).toHaveLength(2);
    expect(snap.peakDay).toEqual({ day: "2026-07-08", count: 4 });
    expect(snap.windows.last24h).toBe(4);
    expect(snap.byCountry[0]).toEqual({ country: "TH", count: 5 });
    expect(snap.heat[0]).toEqual({ weekday: 2, hour: 13, count: 3 });
    expect(snap.currentVersion).toBe("v1.0.0");
    expect(snap.generatedAt).toBe(1_700_000_000_000);
  });

  it("produces a safe empty snapshot when the table is empty", async () => {
    const db = fakeDb({ "COUNT(*) AS total": [{ total: 0, firstAt: null, lastAt: null }] });
    const snap = await getDashboardSnapshot(db, 42);
    expect(snap.total).toBe(0);
    expect(snap.peakDay).toBeNull();
    expect(snap.daily).toEqual([]);
    expect(snap.windows).toEqual({ last24h: 0, prev24h: 0, last7d: 0, prev7d: 0 });
  });
});
