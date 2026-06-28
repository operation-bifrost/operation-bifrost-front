import type { Anchor } from "@/lib/comments/bubble-rotation";
import type { PublicComment } from "@/lib/comments/repository";

interface CommentBubbleProps {
  comment: PublicComment;
  /** When set, the quote is absolutely positioned on the floating field. */
  anchor?: Anchor;
  /** Fade + lift the quote out (used while it relocates). */
  hidden?: boolean;
  /** Run the idle bob (off for the static / reduced-motion layout). */
  bob?: boolean;
  /** Stagger the idle bob so quotes don't pulse in unison. */
  bobDelayMs?: number;
}

/**
 * "Quote drift" treatment — a ghosted quotation mark, the message, and a mono
 * author. No surface, no border, no glow: the wall reads as floating epigraphs,
 * not UI cards. Color comes entirely from theme tokens. The fade/lift transition
 * and the bob live in `.wall-quote` / `.wall-quote-bob` (steins-gate.css).
 */
export function CommentBubble({
  comment,
  anchor,
  hidden = false,
  bob = false,
  bobDelayMs = 0,
}: CommentBubbleProps) {
  const author = comment.name ?? "ไม่ระบุชื่อ";
  const floating = anchor !== undefined;

  return (
    <figure
      data-hidden={hidden}
      className={
        floating ? "wall-quote absolute max-w-56 pl-2" : "wall-quote relative max-w-sm pl-2"
      }
      style={floating ? { top: `${anchor.topPct}%`, left: `${anchor.leftPct}%` } : undefined}
    >
      <span
        className={bob ? "wall-quote-bob block" : "block"}
        style={bob ? { animationDelay: `${bobDelayMs}ms` } : undefined}
      >
        <span
          aria-hidden="true"
          className="text-primary/15 mb-4 -ml-1 block h-4 font-serif text-5xl leading-none select-none"
        >
          &ldquo;
        </span>
        <blockquote className="text-foreground font-krub text-sm/relaxed wrap-break-word">
          {comment.message}
        </blockquote>
        <figcaption className="text-muted-foreground font-krub mt-2 text-xs">- {author}</figcaption>
      </span>
    </figure>
  );
}
