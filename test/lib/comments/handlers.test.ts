import { describe, expect, it, vi } from "vitest";
import { FakeD1 } from "../../helpers/fake-d1";
import { handleCreateComment, handleListComments } from "@/lib/comments/handlers";
import { setStatus } from "@/lib/comments/repository";

function baseDeps(over: Partial<Parameters<typeof handleCreateComment>[0]> = {}) {
  const fake = new FakeD1();
  return {
    fake,
    deps: {
      db: fake as unknown as D1Database,
      ratelimiter: { limit: vi.fn(async () => ({ success: true })) },
      verifyTurnstileToken: vi.fn(async () => true),
      postPendingToDiscord: vi.fn(async () => "msg-1"),
      now: () => 1000,
      newId: () => "id-1",
      ip: "1.2.3.4",
      ...over,
    },
  };
}

describe("handleCreateComment", () => {
  it("stores a pending comment and returns 202", async () => {
    const { fake, deps } = baseDeps();
    const res = await handleCreateComment(deps, {
      name: "Kurisu",
      message: "El Psy Kongroo",
      turnstileToken: "tok",
    });
    expect(res.status).toBe(202);
    expect(fake.rows[0]).toMatchObject({
      id: "id-1",
      status: "pending",
      message: "El Psy Kongroo",
    });
    expect(deps.postPendingToDiscord).toHaveBeenCalledOnce();
  });

  it("returns 400 with the captcha error when Turnstile fails", async () => {
    const { deps } = baseDeps({ verifyTurnstileToken: vi.fn(async () => false) });
    const res = await handleCreateComment(deps, { message: "hi", turnstileToken: "tok" });
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: expect.any(String) });
  });

  it("returns 400 on empty message before doing any work", async () => {
    const { deps } = baseDeps();
    const res = await handleCreateComment(deps, { message: "   ", turnstileToken: "tok" });
    expect(res.status).toBe(400);
    expect(deps.verifyTurnstileToken).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limited and skips Turnstile", async () => {
    const { deps } = baseDeps({ ratelimiter: { limit: vi.fn(async () => ({ success: false })) } });
    const res = await handleCreateComment(deps, { message: "hi", turnstileToken: "tok" });
    expect(res.status).toBe(429);
    expect(deps.verifyTurnstileToken).not.toHaveBeenCalled();
  });

  it("still returns 202 if Discord post fails (row persists)", async () => {
    const { fake, deps } = baseDeps({ postPendingToDiscord: vi.fn(async () => null) });
    const res = await handleCreateComment(deps, { message: "hi", turnstileToken: "tok" });
    expect(res.status).toBe(202);
    expect(fake.rows[0].status).toBe("pending");
  });

  it("still returns 202 and row persists as pending when Discord post throws", async () => {
    const { fake, deps } = baseDeps({
      postPendingToDiscord: vi.fn(async () => {
        throw new Error("network");
      }),
    });
    const res = await handleCreateComment(deps, {
      name: "Okabe",
      message: "Mad scientist",
      turnstileToken: "tok",
    });
    expect(res.status).toBe(202);
    expect(fake.rows[0]).toMatchObject({ status: "pending", message: "Mad scientist" });
  });
});

describe("handleListComments", () => {
  it("returns approved comments as json", async () => {
    const fake = new FakeD1();
    const db = fake as unknown as D1Database;
    await handleCreateComment(
      {
        db,
        ratelimiter: { limit: async () => ({ success: true }) },
        verifyTurnstileToken: async () => true,
        postPendingToDiscord: async () => "m",
        now: () => 1,
        newId: () => "c1",
        ip: null,
      },
      { message: "hi", turnstileToken: "t" },
    );
    await setStatus(db, { id: "c1", status: "approved", reviewedBy: "mod", reviewedAt: 2 });
    const res = await handleListComments({ db, limit: 60 });
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=30");
    const data = (await res.json()) as { comments: { id: string }[] };
    expect(data.comments.map((c) => c.id)).toEqual(["c1"]);
  });
});
