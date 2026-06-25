import type { PublicComment } from "@/lib/comments/repository";

export interface BubbleSlot {
  slot: number;
  comment: PublicComment;
}

export interface RotationState {
  slots: BubbleSlot[];
  nextPoolIndex: number;
}

export function initBubbles(comments: PublicComment[], visibleCount: number): BubbleSlot[] {
  const count = Math.min(visibleCount, comments.length);
  return Array.from({ length: count }, (_, i) => ({ slot: i, comment: comments[i] }));
}

export function rotateBubble(
  state: RotationState,
  comments: PublicComment[],
  slotToReplace: number,
): RotationState {
  if (comments.length === 0) return state;

  const visibleIds = new Set(state.slots.map((s) => s.comment.id));
  // If every comment is already on screen, there is nothing fresh to rotate in.
  if (visibleIds.size >= comments.length) return state;

  // Find the next comment (round-robin from nextPoolIndex) that is not visible.
  let index = state.nextPoolIndex % comments.length;
  for (let tries = 0; tries < comments.length; tries++) {
    const candidate = comments[index];
    if (!visibleIds.has(candidate.id)) {
      const slots = state.slots.map((s) =>
        s.slot === slotToReplace ? { slot: s.slot, comment: candidate } : s,
      );
      return { slots, nextPoolIndex: (index + 1) % comments.length };
    }
    index = (index + 1) % comments.length;
  }
  return state;
}
