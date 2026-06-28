import { describe, expect, it } from "vitest";
import {
  MOBILE_MIN_TOP_GAP_PCT,
  WALL_ANCHORS,
  WALL_ANCHORS_MOBILE,
  promoteSlot,
  relocateSlot,
  seedSlots,
  type Anchor,
  type BubbleSlot,
} from "@/lib/comments/bubble-rotation";
import type { PublicComment } from "@/lib/comments/repository";

const pool = (n: number): PublicComment[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `c${i}`,
    name: null,
    message: `m${i}`,
    createdAt: i,
  }));

// Deterministic RNG so placement/relocation is reproducible under test.
function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const distinct = <T>(xs: T[]) => new Set(xs).size === xs.length;

describe("seedSlots", () => {
  it("fills visibleCount slots when the pool and anchors are large enough", () => {
    const slots = seedSlots(pool(20), 8, WALL_ANCHORS, mulberry32(1));
    expect(slots).toHaveLength(8);
  });

  it("gives every visible slot a distinct anchor and a distinct comment", () => {
    const slots = seedSlots(pool(20), 8, WALL_ANCHORS, mulberry32(7));
    expect(distinct(slots.map((s) => s.anchorIndex))).toBe(true);
    expect(distinct(slots.map((s) => s.comment.id))).toBe(true);
  });

  it("assigns stable, sequential slot ids", () => {
    const slots = seedSlots(pool(20), 5, WALL_ANCHORS, mulberry32(3));
    expect(slots.map((s) => s.id)).toEqual([0, 1, 2, 3, 4]);
  });

  it("caps at the pool size when the pool is small", () => {
    expect(seedSlots(pool(3), 8, WALL_ANCHORS, mulberry32(1))).toHaveLength(3);
  });

  it("caps at the anchor count when more are requested than exist", () => {
    const slots = seedSlots(pool(50), 999, WALL_ANCHORS, mulberry32(2));
    expect(slots).toHaveLength(WALL_ANCHORS.length);
  });

  it("returns empty for an empty pool", () => {
    expect(seedSlots([], 8, WALL_ANCHORS, mulberry32(1))).toEqual([]);
  });

  it("is deterministic for a given seed", () => {
    const a = seedSlots(pool(20), 8, WALL_ANCHORS, mulberry32(42));
    const b = seedSlots(pool(20), 8, WALL_ANCHORS, mulberry32(42));
    expect(a).toEqual(b);
  });
});

describe("relocateSlot", () => {
  const comments = pool(20);
  const seed = () => seedSlots(comments, 8, WALL_ANCHORS, mulberry32(9));

  it("moves the slot to a different anchor", () => {
    const slots = seed();
    const before = slots.find((s) => s.id === 3)!;
    const next = relocateSlot(slots, 3, comments, WALL_ANCHORS, mulberry32(5));
    const after = next.find((s) => s.id === 3)!;
    expect(after.anchorIndex).not.toBe(before.anchorIndex);
  });

  it("never lands on an anchor occupied by another slot (no overlap)", () => {
    const slots = seed();
    const next = relocateSlot(slots, 3, comments, WALL_ANCHORS, mulberry32(5));
    expect(distinct(next.map((s) => s.anchorIndex))).toBe(true);
  });

  it("brings in a comment that isn't currently on screen", () => {
    const slots = seed();
    const visibleBefore = new Set(slots.map((s) => s.comment.id));
    const next = relocateSlot(slots, 3, comments, WALL_ANCHORS, mulberry32(5));
    const moved = next.find((s) => s.id === 3)!;
    expect(visibleBefore.has(moved.comment.id)).toBe(false);
  });

  it("does not mutate the input array or its slots (immutable)", () => {
    const slots = seed();
    const snapshot = structuredClone(slots);
    relocateSlot(slots, 3, comments, WALL_ANCHORS, mulberry32(5));
    expect(slots).toEqual(snapshot);
  });

  it("is a no-op for an unknown slot id", () => {
    const slots = seed();
    expect(relocateSlot(slots, 999, comments, WALL_ANCHORS, mulberry32(5))).toBe(slots);
  });

  it("keeps the same comment when every comment is already visible", () => {
    const small = pool(8); // exactly fills 8 slots → nothing unseen to swap in
    const slots = seedSlots(small, 8, WALL_ANCHORS, mulberry32(4));
    const before = slots.find((s) => s.id === 2)!;
    const next = relocateSlot(slots, 2, small, WALL_ANCHORS, mulberry32(6));
    const after = next.find((s) => s.id === 2)!;
    expect(after.comment.id).toBe(before.comment.id);
  });

  it("keeps the same anchor when every anchor is occupied", () => {
    const full = pool(WALL_ANCHORS.length);
    const slots = seedSlots(full, WALL_ANCHORS.length, WALL_ANCHORS, mulberry32(8));
    const before = slots.find((s) => s.id === 1)!;
    const next = relocateSlot(slots, 1, full, WALL_ANCHORS, mulberry32(2));
    const after = next.find((s) => s.id === 1)!;
    expect(after.anchorIndex).toBe(before.anchorIndex);
  });

  it("preserves the no-overlap invariant across many sequential relocations", () => {
    let slots: BubbleSlot[] = seed();
    const rng = mulberry32(123);
    for (let n = 0; n < 200; n++) {
      const id = Math.floor(rng() * slots.length);
      slots = relocateSlot(slots, id, comments, WALL_ANCHORS, rng);
      expect(distinct(slots.map((s) => s.anchorIndex))).toBe(true);
    }
  });
});

// Smallest topPct distance between any two on-screen quotes. Infinity for <2.
const minPairTopGap = (slots: BubbleSlot[], anchors: readonly Anchor[]): number => {
  const tops = slots.map((s) => anchors[s.anchorIndex].topPct);
  let min = Infinity;
  for (let i = 0; i < tops.length; i++) {
    for (let j = i + 1; j < tops.length; j++) {
      min = Math.min(min, Math.abs(tops[i] - tops[j]));
    }
  }
  return min;
};

describe("spaced placement (mobile, minTopGapPct)", () => {
  const comments = pool(20);
  const VISIBLE = 3;

  it("seeds a full, non-overlapping set across many seeds", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const slots = seedSlots(
        comments,
        VISIBLE,
        WALL_ANCHORS_MOBILE,
        mulberry32(seed),
        MOBILE_MIN_TOP_GAP_PCT,
      );
      // never dead-ends below the requested count...
      expect(slots).toHaveLength(VISIBLE);
      // ...and every pair clears the gap, so no two quotes overlap.
      expect(minPairTopGap(slots, WALL_ANCHORS_MOBILE)).toBeGreaterThanOrEqual(
        MOBILE_MIN_TOP_GAP_PCT,
      );
    }
  });

  it("preserves the gap across 300 sequential relocations", () => {
    let slots = seedSlots(
      comments,
      VISIBLE,
      WALL_ANCHORS_MOBILE,
      mulberry32(11),
      MOBILE_MIN_TOP_GAP_PCT,
    );
    const rng = mulberry32(321);
    for (let n = 0; n < 300; n++) {
      const id = Math.floor(rng() * slots.length);
      slots = relocateSlot(slots, id, comments, WALL_ANCHORS_MOBILE, rng, MOBILE_MIN_TOP_GAP_PCT);
      expect(distinct(slots.map((s) => s.anchorIndex))).toBe(true);
      expect(minPairTopGap(slots, WALL_ANCHORS_MOBILE)).toBeGreaterThanOrEqual(
        MOBILE_MIN_TOP_GAP_PCT,
      );
    }
  });

  it("leaves desktop placement unconstrained when no gap is given", () => {
    // 8 of the 12 desktop anchors include neighbours closer than the mobile gap;
    // without a gap that's allowed (the 2D lanes keep them apart visually).
    const slots = seedSlots(pool(20), 8, WALL_ANCHORS, mulberry32(7));
    expect(slots).toHaveLength(8);
  });
});

describe("promoteSlot", () => {
  const comments = pool(20);
  // A fresh comment that isn't part of the seeded pool.
  const incoming: PublicComment = { id: "new", name: "you", message: "hi", createdAt: 999 };

  it("appends a new slot when the field has room (fade-in path)", () => {
    const slots = seedSlots(comments, 4, WALL_ANCHORS, mulberry32(1)); // 4 of 8 → room
    const res = promoteSlot(slots, incoming, 8, WALL_ANCHORS, mulberry32(2));
    expect(res.added).toBe(true);
    expect(res.alreadyVisible).toBe(false);
    expect(res.slots).toHaveLength(slots.length + 1);
    const placed = res.slots.find((s) => s.id === res.slotId)!;
    expect(placed.comment.id).toBe("new");
  });

  it("assigns the appended slot a fresh, unused id", () => {
    const slots = seedSlots(comments, 4, WALL_ANCHORS, mulberry32(3));
    const res = promoteSlot(slots, incoming, 8, WALL_ANCHORS, mulberry32(4));
    expect(slots.some((s) => s.id === res.slotId)).toBe(false);
  });

  it("keeps anchors distinct when appending (no overlap)", () => {
    const slots = seedSlots(comments, 4, WALL_ANCHORS, mulberry32(5));
    const res = promoteSlot(slots, incoming, 8, WALL_ANCHORS, mulberry32(6));
    expect(distinct(res.slots.map((s) => s.anchorIndex))).toBe(true);
  });

  it("swaps into an existing slot when the field is full (no growth)", () => {
    const slots = seedSlots(comments, 8, WALL_ANCHORS, mulberry32(7)); // full
    const res = promoteSlot(slots, incoming, 8, WALL_ANCHORS, mulberry32(8));
    expect(res.added).toBe(false);
    expect(res.alreadyVisible).toBe(false);
    expect(res.slots).toHaveLength(slots.length);
    const placed = res.slots.find((s) => s.id === res.slotId)!;
    expect(placed.comment.id).toBe("new");
    expect(distinct(res.slots.map((s) => s.anchorIndex))).toBe(true);
  });

  it("is a no-op when the comment is already on screen", () => {
    const slots = seedSlots(comments, 8, WALL_ANCHORS, mulberry32(9));
    const onScreen = slots[2].comment;
    const res = promoteSlot(slots, onScreen, 8, WALL_ANCHORS, mulberry32(10));
    expect(res.alreadyVisible).toBe(true);
    expect(res.slotId).toBe(slots[2].id);
    expect(res.slots).toBe(slots);
  });

  it("returns slotId -1 when there is no capacity (visibleCount 0)", () => {
    const res = promoteSlot([], incoming, 0, WALL_ANCHORS, mulberry32(11));
    expect(res.slotId).toBe(-1);
    expect(res.added).toBe(false);
  });

  it("seeds the first quote onto an empty field", () => {
    const res = promoteSlot([], incoming, 8, WALL_ANCHORS, mulberry32(12));
    expect(res.added).toBe(true);
    expect(res.slots).toHaveLength(1);
    expect(res.slots[0].comment.id).toBe("new");
  });

  it("does not mutate the input slots (immutable)", () => {
    const slots = seedSlots(comments, 8, WALL_ANCHORS, mulberry32(13));
    const snapshot = structuredClone(slots);
    promoteSlot(slots, incoming, 8, WALL_ANCHORS, mulberry32(14));
    expect(slots).toEqual(snapshot);
  });

  it("preserves the mobile gap when promoting", () => {
    const slots = seedSlots(
      comments,
      3,
      WALL_ANCHORS_MOBILE,
      mulberry32(15),
      MOBILE_MIN_TOP_GAP_PCT,
    );
    const res = promoteSlot(
      slots,
      incoming,
      3,
      WALL_ANCHORS_MOBILE,
      mulberry32(16),
      MOBILE_MIN_TOP_GAP_PCT,
    );
    expect(minPairTopGap(res.slots, WALL_ANCHORS_MOBILE)).toBeGreaterThanOrEqual(
      MOBILE_MIN_TOP_GAP_PCT,
    );
  });
});

describe("WALL_ANCHORS", () => {
  it("exposes more anchors than the default visible count, so relocation has room", () => {
    expect(WALL_ANCHORS.length).toBeGreaterThan(8);
  });

  it("keeps every anchor within the field bounds", () => {
    WALL_ANCHORS.forEach((a: Anchor) => {
      expect(a.topPct).toBeGreaterThanOrEqual(0);
      expect(a.topPct).toBeLessThanOrEqual(100);
      expect(a.leftPct).toBeGreaterThanOrEqual(0);
      expect(a.leftPct).toBeLessThanOrEqual(100);
    });
  });
});
