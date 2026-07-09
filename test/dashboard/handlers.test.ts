import { describe, expect, it } from "vitest";
import { handleLogin, handleLogout, handleSnapshot } from "@/lib/dashboard/handlers";
import { verifySession, SESSION_COOKIE } from "@/lib/dashboard/auth";
import type { DashboardSnapshot } from "@/lib/downloads/repository";
import { dashboardContent } from "@/data/dashboard";

const okRatelimiter = {
  async limit() {
    return { success: true };
  },
};
const blockedRatelimiter = {
  async limit() {
    return { success: false };
  },
};
const secret = "unit-test-secret-000000000000000000";

function baseLoginDeps(overrides = {}) {
  return {
    password: "letmein",
    sessionSecret: secret,
    ratelimiter: okRatelimiter,
    ip: "1.2.3.4",
    now: () => 1_000,
    secure: true,
    ...overrides,
  };
}

describe("handleLogin", () => {
  it("400s when password is missing", async () => {
    const res = await handleLogin(baseLoginDeps(), {});
    expect(res.status).toBe(400);
  });
  it("429s when rate limited", async () => {
    const res = await handleLogin(baseLoginDeps({ ratelimiter: blockedRatelimiter }), {
      password: "letmein",
    });
    expect(res.status).toBe(429);
  });
  it("401s on a wrong password", async () => {
    const res = await handleLogin(baseLoginDeps(), { password: "nope" });
    expect(res.status).toBe(401);
  });
  it("200s and sets a valid signed session cookie on success", async () => {
    const res = await handleLogin(baseLoginDeps(), { password: "letmein" });
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("Set-Cookie") ?? "";
    expect(setCookie).toContain(`${SESSION_COOKIE}=`);
    expect(setCookie).toContain("Secure");
    const token = setCookie.split(`${SESSION_COOKIE}=`)[1].split(";")[0];
    expect(await verifySession(secret, token, 1_000)).toBe(true);
  });
});

describe("handleLogout", () => {
  it("clears the cookie", () => {
    const res = handleLogout({ secure: true });
    expect(res.status).toBe(200);
    expect(res.headers.get("Set-Cookie")).toContain("Max-Age=0");
  });
});

describe("handleSnapshot", () => {
  const snapshot = { total: 3, generatedAt: 5 } as unknown as DashboardSnapshot;
  it("returns the snapshot JSON with no-store", async () => {
    const res = await handleSnapshot({ getSnapshot: async () => snapshot });
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("no-store");
    expect(await res.json()).toEqual(snapshot);
  });
  it("500s (SIGNAL LOST) when the snapshot build throws", async () => {
    const res = await handleSnapshot({
      getSnapshot: async () => {
        throw new Error("db down");
      },
    });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: dashboardContent.errors.snapshotFailed });
  });
});
