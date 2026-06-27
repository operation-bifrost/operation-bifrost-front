import { useEffect, useRef, useState } from "react";

import {
  promoteSlot,
  relocateSlot,
  seedSlots,
  type Anchor,
  type BubbleSlot,
} from "@/lib/comments/bubble-rotation";
import type { PublicComment } from "@/lib/comments/repository";

// Each quote rests this long (randomized) before relocating. Long dwell so a given
// comment stays readable and the wall feels calm rather than busy.
const DWELL_MIN_MS = 12_000;
const DWELL_MAX_MS = 26_000;
// Fade-out before a quote jumps to its new anchor — must match the `.wall-quote`
// opacity transition duration in steins-gate.css.
const FADE_MS = 700;
// When a quote wants to move but another is mid-fade, it waits a *random* beat and
// retries. No queue, no fixed cadence — relocations stay sporadic and unordered.
const RETRY_MIN_MS = 800;
const RETRY_MAX_MS = 2_400;
// Reopen the no-overlap guard shortly after a quote lands.
const SETTLE_RELEASE_MS = 300;
// Let the hidden state paint for one beat before fading a freshly-added quote in,
// so the opacity transition actually runs instead of snapping to visible.
const ENTER_PAINT_MS = 40;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export interface FloatingWallState {
  slots: BubbleSlot[];
  hiddenIds: ReadonlySet<number>;
}

interface UseFloatingWallArgs {
  /** Full rotation pool the field samples from (the visitor's own + approved). */
  comments: PublicComment[];
  /**
   * Re-seed trigger. Derived from the *approved* set only, so a visitor adding
   * their own comment grows the pool (via `comments`) without reshuffling the
   * field — only a real change to the approved list re-seeds.
   */
  seedKey: string;
  /** When set (newest submission), force this comment into view immediately. */
  promote: PublicComment | null;
  visibleCount: number;
  anchors: readonly Anchor[];
  minTopGapPct?: number;
}

/**
 * The floating-wall motion engine: seeds a set of quotes onto spaced anchors and
 * drifts them — each quote fades out, relocates to a free anchor with a fresh
 * comment, and fades back in on its own randomized cadence.
 *
 * Pool growth (a new local comment) is decoupled from seeding: `comments` flows
 * into a ref the rotation samples from, while re-seeding is gated on `seedKey`.
 * `promote` injects a one-slot reveal using the same fade machinery, so a
 * submission lands instantly and then rotates like any other quote.
 */
export function useFloatingWall({
  comments,
  seedKey,
  promote,
  visibleCount,
  anchors,
  minTopGapPct,
}: UseFloatingWallArgs): FloatingWallState {
  const [slots, setSlots] = useState<BubbleSlot[]>([]);
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<number>>(() => new Set());

  const slotsRef = useRef<BubbleSlot[]>([]);
  const poolRef = useRef<PublicComment[]>(comments);
  const fadingRef = useRef(0);
  // Set by the seed effect so the promote effect always calls the current engine
  // (with up-to-date anchors / gap), and cleared on teardown.
  const promoteRef = useRef<((comment: PublicComment) => void) | null>(null);

  // Keep the rotation pool current WITHOUT re-seeding: new local comments just
  // become eligible to drift in. Declared before the seed effect so the pool is
  // already up to date when a re-seed runs.
  useEffect(() => {
    poolRef.current = comments;
  }, [comments]);

  useEffect(() => {
    const seeded = seedSlots(poolRef.current, visibleCount, anchors, Math.random, minTopGapPct);
    slotsRef.current = seeded;
    setSlots(seeded);
    setHiddenIds(new Set());

    const timers = new Set<number>();
    const after = (fn: () => void, delay: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, delay);
      timers.add(id);
    };

    const commit = (next: BubbleSlot[]) => {
      slotsRef.current = next;
      setSlots(next);
    };
    const hide = (slotId: number) => setHiddenIds((prev) => new Set(prev).add(slotId));
    const reveal = (slotId: number) =>
      setHiddenIds((prev) => {
        const out = new Set(prev);
        out.delete(slotId);
        return out;
      });
    const releaseFadeLater = () =>
      after(() => {
        fadingRef.current = Math.max(0, fadingRef.current - 1);
      }, SETTLE_RELEASE_MS);

    function scheduleDwell(slotId: number) {
      after(() => tryMove(slotId), rand(DWELL_MIN_MS, DWELL_MAX_MS));
    }

    function tryMove(slotId: number) {
      // Nothing to rotate between yet (e.g. only the visitor's own comment so
      // far) — idle and check again after another dwell.
      if (poolRef.current.length <= 1) {
        scheduleDwell(slotId);
        return;
      }
      if (fadingRef.current > 0) {
        // someone is mid-move — wait a random beat and retry (no queue, no order)
        after(() => tryMove(slotId), rand(RETRY_MIN_MS, RETRY_MAX_MS));
        return;
      }
      fadingRef.current += 1;
      hide(slotId); // fade + lift away
      after(
        () => {
          const next = relocateSlot(
            slotsRef.current,
            slotId,
            poolRef.current,
            anchors,
            Math.random,
            minTopGapPct,
          );
          commit(next); // new anchor + fresh comment, applied while invisible
          reveal(slotId); // settle in at the new spot
          scheduleDwell(slotId); // this quote picks its own next moment
          releaseFadeLater();
        },
        FADE_MS + rand(40, 220),
      );
    }

    function promoteNow(comment: PublicComment) {
      // Serialize against an in-flight relocation so two quotes never fade at once.
      if (fadingRef.current > 0) {
        after(() => promoteNow(comment), rand(RETRY_MIN_MS, RETRY_MAX_MS));
        return;
      }
      const result = promoteSlot(
        slotsRef.current,
        comment,
        visibleCount,
        anchors,
        Math.random,
        minTopGapPct,
      );
      if (result.slotId < 0) return; // no capacity to place it
      if (result.alreadyVisible) {
        reveal(result.slotId); // already on screen — just make sure it isn't mid-hide
        return;
      }
      fadingRef.current += 1;
      if (result.added) {
        // Mount the new quote hidden (same tick → single render), then fade in.
        commit(result.slots);
        hide(result.slotId);
        after(() => {
          reveal(result.slotId);
          scheduleDwell(result.slotId);
          releaseFadeLater();
        }, ENTER_PAINT_MS);
      } else {
        // Field is full: fade a quote out, swap the submission in, fade back in.
        hide(result.slotId);
        after(
          () => {
            commit(result.slots);
            reveal(result.slotId);
            scheduleDwell(result.slotId);
            releaseFadeLater();
          },
          FADE_MS + rand(40, 220),
        );
      }
    }

    promoteRef.current = promoteNow;

    // Kick each quote off on its own offset so the loops start out of phase.
    seeded.forEach((slot, i) => after(() => scheduleDwell(slot.id), rand(300, 1600) + i * 200));

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
      fadingRef.current = 0;
      promoteRef.current = null;
    };
  }, [seedKey, visibleCount, anchors, minTopGapPct]);

  // Reveal a new submission (keyed on its id, so each distinct submit fires once).
  useEffect(() => {
    if (!promote) return;
    promoteRef.current?.(promote);
  }, [promote]);

  return { slots, hiddenIds };
}
