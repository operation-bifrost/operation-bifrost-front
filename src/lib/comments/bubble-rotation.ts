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

/**
 * Mobile anchors (percent of the field). A phone-width field is too narrow for
 * the desktop's three lanes, so this is a single gently-jittered column. Tuned
 * to read as sparse like desktop even though a 1D column can't borrow the
 * empty-lane negative space the 3-lane desktop layout gets:
 *   - Six bands ~15% apart, spanning the field top to bottom.
 *   - Showing 3 (see MOBILE_VISIBLE_FLOATING) keeps occupancy at 3/6 = 50%, so
 *     half the bands stay empty as negative space and as relocation targets.
 *     The bands are close (~70px on the h-128 field) relative to quote height,
 *     so keeping the count low is what avoids adjacent quotes overlapping.
 * `leftPct` alternates low/high (≤26) instead of hugging the left, so quotes use
 * the full width of the box rather than stacking down one side. The values are
 * arranged so every reachable on-screen triple — the non-adjacent index sets
 * {0,2,4} {0,2,5} {0,3,5} {1,3,5} — contains both a left- and a right-biased
 * quote. A ~197px quote at leftPct 26 still clears a ~320px phone (≈278px inner:
 * 26% → ~72px + 197 = 269 < 278).
 */
export const WALL_ANCHORS_MOBILE: readonly Anchor[] = [
  { topPct: 3, leftPct: 4 },
  { topPct: 18, leftPct: 24 },
  { topPct: 34, leftPct: 26 },
  { topPct: 50, leftPct: 6 },
  { topPct: 65, leftPct: 14 },
  { topPct: 80, leftPct: 20 },
];

/**
 * Minimum vertical gap (in field-height %) the mobile placement keeps between
 * any two on-screen quotes, passed to seedSlots/relocateSlot as `minTopGapPct`.
 * The bands above sit ~15% apart, so 26 forbids immediate neighbours (which
 * would overlap) while still allowing every-other band — the realised spacing
 * works out to ≥30% (~135px on the h-128 field), clearing the tallest ~120px
 * (3-line, 50-char) quote. Desktop passes no gap, keeping its free 2D scatter.
 */
export const MOBILE_MIN_TOP_GAP_PCT = 26;

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

/** Fisher–Yates shuffle into a new array (does not mutate the input). */
function shuffle<T>(arr: readonly T[], rng: Rng): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * True when anchor `idx` is at least `minTopGapPct` away (in topPct) from every
 * already-chosen anchor — i.e. placing a quote there won't crowd the others.
 * With no gap (desktop) every position is allowed, so this is a no-op.
 */
function farEnough(
  anchors: readonly Anchor[],
  idx: number,
  chosen: readonly number[],
  minTopGapPct?: number,
): boolean {
  if (minTopGapPct == null) return true;
  return chosen.every((j) => Math.abs(anchors[idx].topPct - anchors[j].topPct) >= minTopGapPct);
}

/**
 * Pick up to `count` anchor indices. Without a gap it's just `count` distinct
 * random anchors (desktop's free scatter). With a gap, the chosen anchors are
 * kept pairwise ≥ minTopGapPct apart so quotes never overlap; because a single
 * greedy pass can dead-end early (e.g. picking two bands that together block
 * every remaining one), it retries with reshuffled orders and keeps the largest
 * spaced set it finds — for the tuned mobile set a full set is found at once.
 */
function pickSpacedAnchors(
  anchors: readonly Anchor[],
  count: number,
  rng: Rng,
  minTopGapPct?: number,
): number[] {
  if (count <= 0) return [];
  const indices = anchors.map((_, i) => i);
  const attempts = minTopGapPct == null ? 1 : 32;
  let best: number[] = [];
  for (let attempt = 0; attempt < attempts && best.length < count; attempt++) {
    const chosen: number[] = [];
    for (const i of shuffle(indices, rng)) {
      if (chosen.length >= count) break;
      if (farEnough(anchors, i, chosen, minTopGapPct)) chosen.push(i);
    }
    if (chosen.length > best.length) best = chosen;
  }
  return best;
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
  minTopGapPct?: number,
): BubbleSlot[] {
  const count = Math.min(visibleCount, comments.length, anchors.length);
  const anchorIndices = pickSpacedAnchors(anchors, count, rng, minTopGapPct);
  const commentPool = [...comments];
  return anchorIndices.map((anchorIndex, id) => ({
    id,
    anchorIndex,
    comment: takeRandom(commentPool, rng),
  }));
}

/**
 * Move one slot to a *different* free anchor and a comment that isn't currently on
 * screen. Returns a new array (immutable); never lands on an occupied anchor, so
 * quotes can't overlap. When `minTopGapPct` is set the new anchor must also stay
 * that far (in topPct) from every other on-screen quote, which keeps the spaced
 * mobile layout overlap-free across relocations. Falls back to the current
 * anchor/comment when no anchor qualifies or no unseen comment exists (very small
 * pools, or — under a gap — when the only spaced option is the current band).
 */
export function relocateSlot(
  slots: BubbleSlot[],
  slotId: number,
  comments: PublicComment[],
  anchors: readonly Anchor[] = WALL_ANCHORS,
  rng: Rng = Math.random,
  minTopGapPct?: number,
): BubbleSlot[] {
  const target = slots.find((s) => s.id === slotId);
  if (!target) return slots;

  const occupied = new Set(slots.map((s) => s.anchorIndex));
  const otherAnchors = slots.filter((s) => s.id !== slotId).map((s) => s.anchorIndex);
  const freeAnchors = anchors
    .map((_, i) => i)
    .filter(
      (i) =>
        i !== target.anchorIndex &&
        !occupied.has(i) &&
        farEnough(anchors, i, otherAnchors, minTopGapPct),
    );
  const anchorIndex = freeAnchors.length ? sample(freeAnchors, rng) : target.anchorIndex;

  const visibleIds = new Set(slots.map((s) => s.comment.id));
  const unseen = comments.filter((c) => !visibleIds.has(c.id));
  const comment = unseen.length ? sample(unseen, rng) : target.comment;

  return slots.map((s) => (s.id === slotId ? { ...s, anchorIndex, comment } : s));
}

export interface PromoteResult {
  /** New slots array (immutable). */
  slots: BubbleSlot[];
  /** The slot now carrying the promoted comment; -1 when nothing could be done. */
  slotId: number;
  /** A brand-new slot was appended (fade it in). */
  added: boolean;
  /** The comment was already on screen (no transition needed). */
  alreadyVisible: boolean;
}

/**
 * Force a *specific* comment onto the field — used to show a visitor their own
 * just-submitted comment immediately, without re-seeding the whole wall.
 *
 *   - already on screen → no-op (alreadyVisible).
 *   - room for one more  → append a fresh slot at a free, spaced anchor (added →
 *     caller fades it in).
 *   - field full         → reuse a random slot at a free anchor (caller fades it
 *     out, swaps, fades back in).
 *
 * `rng` is injectable for deterministic tests. Mirrors `relocateSlot`'s no-overlap
 * and gap guarantees so the promoted quote never collides with the others.
 */
export function promoteSlot(
  slots: BubbleSlot[],
  comment: PublicComment,
  visibleCount: number,
  anchors: readonly Anchor[] = WALL_ANCHORS,
  rng: Rng = Math.random,
  minTopGapPct?: number,
): PromoteResult {
  if (visibleCount <= 0) {
    return { slots, slotId: -1, added: false, alreadyVisible: false };
  }

  const existing = slots.find((s) => s.comment.id === comment.id);
  if (existing) {
    return { slots, slotId: existing.id, added: false, alreadyVisible: true };
  }

  const occupied = new Set(slots.map((s) => s.anchorIndex));
  const allAnchors = slots.map((s) => s.anchorIndex);
  const capacity = Math.min(visibleCount, anchors.length);

  // Room for one more quote → append a slot at a free, spaced anchor.
  if (slots.length < capacity) {
    const free = anchors
      .map((_, i) => i)
      .filter((i) => !occupied.has(i) && farEnough(anchors, i, allAnchors, minTopGapPct));
    if (free.length) {
      const anchorIndex = sample(free, rng);
      const slotId = slots.reduce((max, s) => Math.max(max, s.id), -1) + 1;
      return {
        slots: [...slots, { id: slotId, anchorIndex, comment }],
        slotId,
        added: true,
        alreadyVisible: false,
      };
    }
  }

  // Field is full (or no spaced anchor free) → reuse a random slot.
  const victim = sample(slots, rng);
  const others = slots.filter((s) => s.id !== victim.id).map((s) => s.anchorIndex);
  const free = anchors
    .map((_, i) => i)
    .filter(
      (i) =>
        i !== victim.anchorIndex && !occupied.has(i) && farEnough(anchors, i, others, minTopGapPct),
    );
  const anchorIndex = free.length ? sample(free, rng) : victim.anchorIndex;
  return {
    slots: slots.map((s) => (s.id === victim.id ? { ...s, anchorIndex, comment } : s)),
    slotId: victim.id,
    added: false,
    alreadyVisible: false,
  };
}
