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
        <p className="text-muted-foreground mb-8 max-w-2xl text-sm/relaxed md:mb-10 md:text-base">
          {description}
        </p>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
          <div>
            <CommentForm siteKey={SITE_KEY} onSubmitted={() => void load()} />
          </div>
          <CommentBubbles comments={comments} visibleCount={display.visibleBubbles} />
        </div>
      </div>
    </section>
  );
}
