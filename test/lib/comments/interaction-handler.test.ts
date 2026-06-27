import { describe, expect, it, vi } from "vitest";
import { handleInteraction } from "@/lib/comments/interaction-handler";

function deps(over: Partial<Parameters<typeof handleInteraction>[0]> = {}) {
  return {
    db: {} as unknown as D1Database,
    verifySignature: vi.fn(async () => true),
    setCommentStatus: vi.fn(async () => true),
    now: () => 1000,
    ...over,
  };
}

describe("handleInteraction", () => {
  it("rejects bad signatures with 401", async () => {
    const d = deps({ verifySignature: vi.fn(async () => false) });
    const res = await handleInteraction(d, { rawBody: "{}" });
    expect(res.status).toBe(401);
    expect(d.setCommentStatus).not.toHaveBeenCalled();
  });

  it("responds to PING with type 1", async () => {
    const res = await handleInteraction(deps(), { rawBody: JSON.stringify({ type: 1 }) });
    expect(await res.json()).toEqual({ type: 1 });
  });

  it("approves a comment, preserving the original embed and adding the reviewer", async () => {
    const d = deps();
    const interaction = {
      type: 3,
      data: { custom_id: "wall_approve:c1" },
      member: { user: { username: "moderator" } },
      message: {
        embeds: [
          {
            title: "คอมเมนต์ใหม่รออนุมัติ",
            description: "hi",
            color: 0xffc700,
            fields: [{ name: "จาก", value: "Kurisu", inline: true }],
          },
        ],
      },
    };
    const res = await handleInteraction(d, { rawBody: JSON.stringify(interaction) });
    const json = (await res.json()) as {
      type: number;
      data: { components: unknown[]; embeds: { description?: string; fields?: unknown[] }[] };
    };
    expect(json.type).toBe(7);
    expect(json.data.components).toEqual([]);
    expect(json.data.embeds[0].description).toBe("hi");
    expect(json.data.embeds[0].fields).toContainEqual({
      name: "จาก",
      value: "Kurisu",
      inline: true,
    });
    expect(json.data.embeds[0].fields).toContainEqual({
      name: "ตรวจสอบโดย",
      value: "moderator",
      inline: true,
    });
    expect(d.setCommentStatus).toHaveBeenCalledWith({
      id: "c1",
      status: "approved",
      reviewedBy: "moderator",
      reviewedAt: 1000,
    });
  });

  it("rejects a comment and responds with UPDATE_MESSAGE (type 7)", async () => {
    const d = deps();
    const interaction = {
      type: 3,
      data: { custom_id: "wall_reject:c2" },
      member: { user: { username: "moderator" } },
      message: {
        embeds: [{ title: "คอมเมนต์ใหม่รออนุมัติ", description: "spam", color: 0xffc700 }],
      },
    };
    const res = await handleInteraction(d, { rawBody: JSON.stringify(interaction) });
    const json = (await res.json()) as { type: number; data: { embeds: { title?: string }[] } };
    expect(json.type).toBe(7);
    expect(json.data.embeds[0].title).toBe("🚫 ปฏิเสธแล้ว");
    expect(d.setCommentStatus).toHaveBeenCalledWith({
      id: "c2",
      status: "rejected",
      reviewedBy: "moderator",
      reviewedAt: 1000,
    });
  });

  it("ignores unrelated custom_ids gracefully", async () => {
    const d = deps();
    const res = await handleInteraction(d, {
      rawBody: JSON.stringify({ type: 3, data: { custom_id: "other:1" } }),
    });
    expect(res.status).toBe(200);
    expect(d.setCommentStatus).not.toHaveBeenCalled();
  });
});
