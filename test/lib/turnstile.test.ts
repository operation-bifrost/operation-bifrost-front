import { describe, expect, it, vi } from "vitest";
import { TURNSTILE_VERIFY_URL, verifyTurnstile } from "@/lib/turnstile";

describe("verifyTurnstile", () => {
  it("returns true when siteverify reports success", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ success: true })));
    const ok = await verifyTurnstile(
      { fetch: fetchMock as unknown as typeof fetch, secret: "s" },
      { token: "tok", ip: "1.2.3.4" },
    );
    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      TURNSTILE_VERIFY_URL,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("returns false when siteverify reports failure", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ success: false })));
    expect(
      await verifyTurnstile(
        { fetch: fetchMock as unknown as typeof fetch, secret: "s" },
        { token: "tok", ip: null },
      ),
    ).toBe(false);
  });

  it("fails closed on network error", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("network");
    });
    expect(
      await verifyTurnstile(
        { fetch: fetchMock as unknown as typeof fetch, secret: "s" },
        { token: "tok", ip: null },
      ),
    ).toBe(false);
  });
});
