import type { PublicComment } from "@/lib/comments/repository";

/** A pre-spaced position on the wall field, as percentages of the field box. */
export interface Anchor {
  topPct: number;
  leftPct: number;
}

/**
 * Curated, pre-spaced anchors (percent of the field). There are deliberately more
 * anchors than are ever visible at once, so a relocating quote always has a free,
 * non-overlapping spot to move into. Laid out in four loose vertical bands with
 * offset lanes, spaced so the (box-free) quote text never collides.
 */
export const WALL_ANCHORS: readonly Anchor[] = [
  { topPct: 3, leftPct: 2 },
  { topPct: 5, leftPct: 33 },
  { topPct: 2, leftPct: 60 },
  { topPct: 28, leftPct: 16 },
  { topPct: 26, leftPct: 46 },
  { topPct: 31, leftPct: 64 },
  { topPct: 53, leftPct: 3 },
  { topPct: 51, leftPct: 35 },
  { topPct: 55, leftPct: 62 },
  { topPct: 76, leftPct: 18 },
  { topPct: 74, leftPct: 48 },
  { topPct: 78, leftPct: 66 },
];

export interface BubbleSlot {
  /** Stable identity for the React key and for targeting a relocation. */
  id: number;
  /** Index into the anchors array — the quote's current position. */
  anchorIndex: number;
  comment: PublicComment;
}

type Rng = () => number;

/** Remove and return a random element (mutates `pool`). */
function takeRandom<T>(pool: T[], rng: Rng): T {
  const index = Math.floor(rng() * pool.length);
  return pool.splice(index, 1)[0];
}

function sample<T>(arr: readonly T[], rng: Rng): T {
  return arr[Math.floor(rng() * arr.length)];
}

/**
 * Seed the initial visible quotes: each gets a distinct anchor and a distinct
 * comment. The visible count is capped by the pool size and the anchor count.
 * `rng` is injectable so the placement is deterministic under test.
 */
export function seedSlots(
  comments: PublicComment[],
  visibleCount: number,
  anchors: readonly Anchor[] = WALL_ANCHORS,
  rng: Rng = Math.random,
): BubbleSlot[] {
  const count = Math.min(visibleCount, comments.length, anchors.length);
  const anchorPool = anchors.map((_, i) => i);
  const commentPool = [...comments];
  const slots: BubbleSlot[] = [];
  for (let id = 0; id < count; id++) {
    slots.push({
      id,
      anchorIndex: takeRandom(anchorPool, rng),
      comment: takeRandom(commentPool, rng),
    });
  }
  return slots;
}

/**
 * Move one slot to a *different* free anchor and a comment that isn't currently on
 * screen. Returns a new array (immutable); never lands on an occupied anchor, so
 * quotes can't overlap. Falls back to the current anchor/comment when there is no
 * free anchor or no unseen comment (very small pools).
 */
export function relocateSlot(
  slots: BubbleSlot[],
  slotId: number,
  comments: PublicComment[],
  anchors: readonly Anchor[] = WALL_ANCHORS,
  rng: Rng = Math.random,
): BubbleSlot[] {
  const target = slots.find((s) => s.id === slotId);
  if (!target) return slots;

  const occupied = new Set(slots.map((s) => s.anchorIndex));
  const freeAnchors = anchors
    .map((_, i) => i)
    .filter((i) => i !== target.anchorIndex && !occupied.has(i));
  const anchorIndex = freeAnchors.length ? sample(freeAnchors, rng) : target.anchorIndex;

  const visibleIds = new Set(slots.map((s) => s.comment.id));
  const unseen = comments.filter((c) => !visibleIds.has(c.id));
  const comment = unseen.length ? sample(unseen, rng) : target.comment;

  return slots.map((s) => (s.id === slotId ? { ...s, anchorIndex, comment } : s));
}
