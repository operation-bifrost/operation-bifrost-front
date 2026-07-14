import { describe, expect, it } from "vitest";
import {
  timingSafeEqual,
  signSession,
  verifySession,
  buildSessionCookie,
  buildClearCookie,
  SESSION_COOKIE,
} from "@/lib/dashboard/auth";

describe("timingSafeEqual", () => {
  it("is true for equal strings", () => {
    expect(timingSafeEqual("hunter2", "hunter2")).toBe(true);
  });
  it("is false for different strings", () => {
    expect(timingSafeEqual("hunter2", "hunter3")).toBe(false);
  });
  it("is false for different lengths", () => {
    expect(timingSafeEqual("a", "abc")).toBe(false);
  });
});

describe("session round-trip", () => {
  const secret = "test-secret-please-ignore-0123456789";
  it("verifies a freshly signed, unexpired token", async () => {
    const token = await signSession(secret, 5_000);
    expect(await verifySession(secret, token, 1_000)).toBe(true);
  });
  it("rejects an expired token", async () => {
    const token = await signSession(secret, 1_000);
    expect(await verifySession(secret, token, 2_000)).toBe(false);
  });
  it("rejects a token signed with a different secret", async () => {
    const token = await signSession(secret, 5_000);
    expect(await verifySession("other-secret", token, 1_000)).toBe(false);
  });
  it("rejects a tampered token", async () => {
    const token = await signSession(secret, 5_000);
    expect(await verifySession(secret, token + "x", 1_000)).toBe(false);
    expect(await verifySession(secret, "garbage", 1_000)).toBe(false);
  });
});

describe("cookies", () => {
  it("builds an HttpOnly session cookie with Secure gated by opts", () => {
    const c = buildSessionCookie("abc.def", { secure: true, maxAgeSec: 100 });
    expect(c).toContain(`${SESSION_COOKIE}=abc.def`);
    expect(c).toContain("HttpOnly");
    expect(c).toContain("Secure");
    expect(c).toContain("SameSite=Lax");
    expect(c).toContain("Path=/");
    expect(c).toContain("Max-Age=100");
  });
  it("omits Secure when not requested (local http dev)", () => {
    expect(buildSessionCookie("abc.def", { secure: false, maxAgeSec: 100 })).not.toContain(
      "Secure",
    );
  });
  it("clears the cookie with Max-Age=0", () => {
    expect(buildClearCookie({ secure: true })).toContain("Max-Age=0");
  });
});
