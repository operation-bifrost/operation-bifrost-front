import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { CommentBubble } from "@/components/steins-gate/wall/comment-bubble";
import {
  WALL_ANCHORS,
  relocateSlot,
  seedSlots,
  type BubbleSlot,
} from "@/components/steins-gate/wall/bubble-rotation";
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
// Small screens get a calm static stack instead of the absolute floating field.
const MOBILE_VISIBLE = 4;
const DESKTOP_QUERY = "(min-width: 1024px)";

const rand = (min: number, max: number) => min + Math.random() * (max - min);

interface CommentBubblesProps {
  comments: PublicComment[];
  visibleCount: number;
}

export function CommentBubbles({ comments, visibleCount }: CommentBubblesProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const isDesktop = useIsDesktop();

  // On small screens or with reduced motion, fall back to a static stack: no
  // absolute positioning (avoids overflow) and no relocation churn.
  if (!isDesktop || reducedMotion) {
    const count = isDesktop ? Math.min(visibleCount, WALL_ANCHORS.length) : MOBILE_VISIBLE;
    return <StaticWall comments={comments} count={count} />;
  }
  return <FloatingWall comments={comments} visibleCount={visibleCount} />;
}

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

function StaticWall({ comments, count }: { comments: PublicComment[]; count: number }) {
  const items = comments.slice(0, Math.max(0, Math.min(count, comments.length)));
  return (
    <div className="flex flex-col gap-7" aria-live="off">
      {items.map((c) => (
        <CommentBubble key={c.id} comment={c} />
      ))}
    </div>
  );
}

function FloatingWall({
  comments,
  visibleCount,
}: {
  comments: PublicComment[];
  visibleCount: number;
}) {
  const [slots, setSlots] = useState<BubbleSlot[]>([]);
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<number>>(() => new Set());

  const slotsRef = useRef<BubbleSlot[]>([]);
  const commentsRef = useRef(comments);
  const fadingRef = useRef(0);

  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  useEffect(() => {
    const seeded = seedSlots(comments, visibleCount);
    slotsRef.current = seeded;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlots(seeded);
    setHiddenIds(new Set());

    const cap = Math.min(visibleCount, comments.length, WALL_ANCHORS.length);
    // With one comment or fewer there is nothing to rotate between.
    if (cap === 0 || comments.length <= 1) return;

    const timers = new Set<number>();
    const after = (fn: () => void, delay: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, delay);
      timers.add(id);
    };

    function scheduleDwell(slotId: number) {
      after(() => tryMove(slotId), rand(DWELL_MIN_MS, DWELL_MAX_MS));
    }

    function tryMove(slotId: number) {
      if (fadingRef.current > 0) {
        // someone is mid-move — wait a random beat and retry (no queue, no order)
        after(() => tryMove(slotId), rand(RETRY_MIN_MS, RETRY_MAX_MS));
        return;
      }
      fadingRef.current += 1;
      setHiddenIds((prev) => new Set(prev).add(slotId)); // fade + lift away
      after(
        () => {
          const next = relocateSlot(slotsRef.current, slotId, commentsRef.current);
          slotsRef.current = next;
          setSlots(next); // new anchor + fresh comment, applied while invisible
          setHiddenIds((prev) => {
            const out = new Set(prev);
            out.delete(slotId);
            return out;
          }); // settle in at the new spot
          scheduleDwell(slotId); // this quote picks its own next moment
          after(() => {
            fadingRef.current = Math.max(0, fadingRef.current - 1);
          }, SETTLE_RELEASE_MS);
        },
        FADE_MS + rand(40, 220),
      );
    }

    // Kick each quote off on its own offset so the loops start out of phase.
    seeded.forEach((slot, i) => after(() => scheduleDwell(slot.id), rand(300, 1600) + i * 200));

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
      fadingRef.current = 0;
    };
  }, [comments, visibleCount]);

  return (
    <div className="relative h-112 w-full overflow-hidden" aria-live="off">
      {slots.map((s) => (
        <CommentBubble
          key={s.id}
          comment={s.comment}
          anchor={WALL_ANCHORS[s.anchorIndex]}
          hidden={hiddenIds.has(s.id)}
          bob
          bobDelayMs={(s.id % 5) * 1300}
        />
      ))}
    </div>
  );
}
