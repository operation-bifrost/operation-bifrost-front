import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { CommentBubble } from "@/components/steins-gate/wall/comment-bubble";
import {
  MOBILE_MIN_TOP_GAP_PCT,
  WALL_ANCHORS,
  WALL_ANCHORS_MOBILE,
  type Anchor,
} from "@/lib/comments/bubble-rotation";
import { useFloatingWall } from "@/hooks/use-floating-wall";
import type { PublicComment } from "@/lib/comments/repository";

// Reduced-motion small screens get a calm static stack instead of motion.
const MOBILE_VISIBLE = 4;
// Phones float fewer quotes than desktop. Kept at 3/6 of WALL_ANCHORS_MOBILE
// (50%) so three bands stay empty: on the h-128 field the bands are only ~70px
// apart while a quote is ~75-120px tall, so 4-up forced adjacent quotes to
// overlap. At 3-up the placement can stay non-adjacent and the wall reads sparse.
const MOBILE_VISIBLE_FLOATING = 3;
const DESKTOP_QUERY = "(min-width: 1024px)";

interface CommentBubblesProps {
  /** Full pool to display (the visitor's own pending comments first, then approved). */
  comments: PublicComment[];
  visibleCount: number;
  /** Re-seed trigger derived from the approved set (see useFloatingWall). */
  seedKey: string;
  /** Newest submission to reveal immediately; null when there's nothing to promote. */
  promote: PublicComment | null;
}

export function CommentBubbles({ comments, visibleCount, seedKey, promote }: CommentBubblesProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const isDesktop = useIsDesktop();

  // Only reduced-motion falls back to a static stack now — no absolute
  // positioning, no relocation churn. Phones get the floating field too, just
  // with a mobile-tuned anchor set (single column, taller field). The pool is
  // ordered visitor's-own-first, so a fresh submission shows at the top here too.
  if (reducedMotion) {
    const count = isDesktop ? Math.min(visibleCount, WALL_ANCHORS.length) : MOBILE_VISIBLE;
    return <StaticWall comments={comments} count={count} />;
  }

  const anchors = isDesktop ? WALL_ANCHORS : WALL_ANCHORS_MOBILE;
  const count = isDesktop ? visibleCount : MOBILE_VISIBLE_FLOATING;
  // Desktop scatters freely in 2D; the mobile column enforces a vertical gap so
  // its closely-stacked bands never let two quotes overlap.
  const minTopGapPct = isDesktop ? undefined : MOBILE_MIN_TOP_GAP_PCT;
  return (
    <FloatingWall
      comments={comments}
      visibleCount={count}
      anchors={anchors}
      minTopGapPct={minTopGapPct}
      seedKey={seedKey}
      promote={promote}
    />
  );
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
  anchors,
  minTopGapPct,
  seedKey,
  promote,
}: {
  comments: PublicComment[];
  visibleCount: number;
  anchors: readonly Anchor[];
  minTopGapPct?: number;
  seedKey: string;
  promote: PublicComment | null;
}) {
  const { slots, hiddenIds } = useFloatingWall({
    comments,
    seedKey,
    promote,
    visibleCount,
    anchors,
    minTopGapPct,
  });

  return (
    // Taller on phones (single-column field needs the vertical room); the lg
    // height + breakpoint line up with the desktop anchor set (min-width 1024px).
    <div
      className="wall-field relative h-128 w-full overflow-hidden rounded-lg border lg:h-112"
      aria-live="off"
    >
      {slots.map((s) => (
        <CommentBubble
          key={s.id}
          comment={s.comment}
          anchor={anchors[s.anchorIndex]}
          hidden={hiddenIds.has(s.id)}
          bob
          bobDelayMs={(s.id % 5) * 1300}
        />
      ))}
    </div>
  );
}
