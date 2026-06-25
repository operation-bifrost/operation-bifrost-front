import { AnimatePresence, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { CommentBubble } from "@/components/steins-gate/wall/comment-bubble";
import {
  initBubbles,
  rotateBubble,
  type RotationState,
} from "@/components/steins-gate/wall/bubble-rotation";
import type { PublicComment } from "@/lib/comments/repository";

const ROTATE_INTERVAL_MS = 4000;

interface CommentBubblesProps {
  comments: PublicComment[];
  visibleCount: number;
}

// Deterministic scatter from a slot index, so positions are stable per slot and
// do not require Math.random.
function positionForSlot(slot: number, total: number): { topPct: number; leftPct: number } {
  const cols = Math.ceil(Math.sqrt(total || 1));
  const row = Math.floor(slot / cols);
  const col = slot % cols;
  const jitter = ((slot * 37) % 11) - 5;
  return {
    topPct: 8 + row * 26 + jitter,
    leftPct: 4 + col * (90 / cols) + jitter,
  };
}

export function CommentBubbles({ comments, visibleCount }: CommentBubblesProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [state, setState] = useState<RotationState>(() => ({
    slots: initBubbles(comments, visibleCount),
    nextPoolIndex: Math.min(visibleCount, comments.length),
  }));
  const slotCursor = useRef(0);

  // Re-seed if the comment pool changes (e.g. after the fetch resolves).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({
      slots: initBubbles(comments, visibleCount),
      nextPoolIndex: Math.min(visibleCount, comments.length),
    });
  }, [comments, visibleCount]);

  useEffect(() => {
    if (reducedMotion || comments.length <= visibleCount) return;
    const id = window.setInterval(() => {
      setState((prev) => {
        if (prev.slots.length === 0) return prev;
        const target = prev.slots[slotCursor.current % prev.slots.length].slot;
        slotCursor.current += 1;
        return rotateBubble(prev, comments, target);
      });
    }, ROTATE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [comments, visibleCount, reducedMotion]);

  const total = state.slots.length;
  const positioned = useMemo(
    () => state.slots.map((s) => ({ ...s, position: positionForSlot(s.slot, total) })),
    [state.slots, total],
  );

  return (
    <div className="relative h-112 w-full overflow-hidden" aria-live="off">
      <AnimatePresence>
        {positioned.map((s) => (
          <CommentBubble
            key={`${s.slot}-${s.comment.id}`}
            comment={s.comment}
            position={s.position}
            reducedMotion={reducedMotion}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
