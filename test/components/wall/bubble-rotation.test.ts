import { describe, expect, it } from "vitest";
import { initBubbles, rotateBubble } from "@/components/steins-gate/wall/bubble-rotation";
import type { PublicComment } from "@/lib/comments/repository";

const pool = (n: number): PublicComment[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `c${i}`,
    name: null,
    message: `m${i}`,
    createdAt: i,
  }));

describe("initBubbles", () => {
  it("fills visibleCount slots when the pool is large enough", () => {
    const slots = initBubbles(pool(20), 12);
    expect(slots).toHaveLength(12);
    expect(slots[0]).toEqual({ slot: 0, comment: pool(20)[0] });
  });
  it("caps at pool size when the pool is small", () => {
    expect(initBubbles(pool(3), 12)).toHaveLength(3);
  });
  it("returns empty for an empty pool", () => {
    expect(initBubbles([], 12)).toEqual([]);
  });
});

describe("rotateBubble", () => {
  it("replaces the given slot with the next unseen pool comment", () => {
    const comments = pool(20);
    const slots = initBubbles(comments, 12);
    const next = rotateBubble({ slots, nextPoolIndex: 12 }, comments, 0);
    expect(next.slots[0].comment.id).toBe("c12");
    expect(next.nextPoolIndex).toBe(13);
    // immutability: original slots untouched
    expect(slots[0].comment.id).toBe("c0");
  });
  it("wraps the pool index round-robin", () => {
    const comments = pool(13);
    const slots = initBubbles(comments, 12);
    const next = rotateBubble({ slots, nextPoolIndex: 12 }, comments, 0);
    expect(next.slots[0].comment.id).toBe("c12");
    expect(next.nextPoolIndex).toBeGreaterThanOrEqual(0);
  });
  it("is a no-op when every comment is already visible", () => {
    const comments = pool(5);
    const slots = initBubbles(comments, 12); // 5 slots, all 5 comments visible
    const next = rotateBubble({ slots, nextPoolIndex: 5 }, comments, 0);
    expect(next.slots[0].comment.id).toBe("c0");
  });
});
