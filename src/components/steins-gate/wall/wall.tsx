import { useCallback, useEffect, useState } from "react";

import { CommentBubbles } from "@/components/steins-gate/wall/comment-bubbles";
import { CommentForm } from "@/components/steins-gate/wall/comment-form";
import { SectionHeading } from "@/components/steins-gate/ui/section-heading";
import { steinsGateContent } from "@/data/steins-gate";
import type { PublicComment } from "@/lib/comments/repository";

const { eyebrow, heading, description, sectionId, display } = steinsGateContent.wall;
const SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string;

export function Wall() {
  const [comments, setComments] = useState<PublicComment[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/steins-gate/comments");
      if (!res.ok) return;
      const data = (await res.json()) as { comments: PublicComment[] };
      setComments(data.comments);
    } catch {
      // Wall is non-critical; leave it empty on fetch failure.
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  return (
    <section id={sectionId} className="relative py-8 md:py-10 lg:py-12">
      <div className="wide:max-w-8xl relative mx-auto max-w-7xl px-6 md:px-12 lg:px-20">
        <SectionHeading heading={heading} eyebrow={eyebrow} className="mb-8 md:mb-10" />
        <p className="text-muted-foreground mb-8 text-sm/relaxed md:mb-10 md:text-base">
          {description}
        </p>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
          {/* Source order is form-first (keeps it first in tab / screen-reader
              flow — it's the actionable element). `order` only swaps the visual
              order: on mobile the bubbles lead, on desktop the form returns to
              the narrow left column and the bubbles take the wide right one. */}
          <div className="bg-border/40 order-2 rounded-lg border p-5 lg:order-1">
            <CommentForm siteKey={SITE_KEY} onSubmitted={() => void load()} />
          </div>
          <div className="order-1 lg:order-2">
            <CommentBubbles comments={comments} visibleCount={display.visibleBubbles} />
          </div>
        </div>
      </div>
    </section>
  );
}
