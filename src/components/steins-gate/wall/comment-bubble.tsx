import { motion } from "motion/react";

import type { PublicComment } from "@/lib/comments/repository";

interface CommentBubbleProps {
  comment: PublicComment;
  /** Absolute position as percentages of the field. */
  position: { topPct: number; leftPct: number };
  reducedMotion: boolean;
}

export function CommentBubble({ comment, position, reducedMotion }: CommentBubbleProps) {
  const author = comment.name ?? "ไม่ระบุชื่อ";
  return (
    <motion.figure
      className="border-border bg-card/80 absolute max-w-[16rem] border px-4 py-3 shadow-[0_0_12px_-2px_var(--color-nixie-base)] backdrop-blur-sm"
      style={{ top: `${position.topPct}%`, left: `${position.leftPct}%` }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={reducedMotion ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, -8, 0] }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={
        reducedMotion
          ? { duration: 0.2 }
          : {
              opacity: { duration: 0.6 },
              scale: { duration: 0.6 },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            }
      }
    >
      <blockquote className="text-foreground text-sm/relaxed wrap-break-word">
        {comment.message}
      </blockquote>
      <figcaption className="text-muted-foreground mt-2 font-mono text-xs">— {author}</figcaption>
    </motion.figure>
  );
}
