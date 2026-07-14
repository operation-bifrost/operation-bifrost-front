import { describe, expect, it } from "vitest";
import { isProtectedPath, isApiPath } from "@/lib/dashboard/routes";

describe("isProtectedPath", () => {
  it("protects the dashboard page and its api", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/dashboard/")).toBe(true);
    expect(isProtectedPath("/api/dashboard/snapshot")).toBe(true);
  });
  it("never protects the login page/endpoint or logout", () => {
    expect(isProtectedPath("/dashboard/login")).toBe(false);
    expect(isProtectedPath("/api/dashboard/login")).toBe(false);
    expect(isProtectedPath("/api/dashboard/logout")).toBe(false);
  });
  it("ignores unrelated routes", () => {
    expect(isProtectedPath("/steins-gate/")).toBe(false);
    expect(isProtectedPath("/")).toBe(false);
  });
});

describe("isApiPath", () => {
  it("detects api routes", () => {
    expect(isApiPath("/api/dashboard/snapshot")).toBe(true);
    expect(isApiPath("/dashboard")).toBe(false);
  });
});
