import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CommentBubbles } from "@/components/steins-gate/wall/comment-bubbles";
import { CommentForm } from "@/components/steins-gate/wall/comment-form";
import { SectionHeading } from "@/components/steins-gate/ui/section-heading";
import { steinsGateContent } from "@/data/steins-gate";
import {
  addMine,
  dedupeById,
  loadMine,
  pruneApproved,
  saveMine,
} from "@/lib/comments/local-comments";
import type { PublicComment } from "@/lib/comments/repository";

const { eyebrow, heading, description, sectionId, display } = steinsGateContent.wall;
const SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string;

export function Wall() {
  // The public, moderator-approved comments fetched from the API.
  const [approved, setApproved] = useState<PublicComment[]>([]);
  // The visitor's *own* submissions, kept client-side (persisted) until they're
  // approved (then served via `approved`) or expire. Lets a submission show on the
  // wall immediately even though it's still `pending` server-side.
  const [mine, setMine] = useState<PublicComment[]>([]);
  // The newest submission, handed to the field so it's revealed right away.
  const [justSubmitted, setJustSubmitted] = useState<PublicComment | null>(null);

  // Mirror of `mine` for reads inside async/stable callbacks without re-creating them.
  const mineRef = useRef<PublicComment[]>([]);
  // Single writer for the visitor's comments: state + ref + storage stay in lockstep.
  const writeMine = useCallback((next: PublicComment[]) => {
    mineRef.current = next;
    setMine(next);
    saveMine(next);
  }, []);

  // Restore the visitor's persisted (TTL-bounded) comments on mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    writeMine(loadMine());
  }, [writeMine]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/steins-gate/comments");
      if (!res.ok) return;
      const data = (await res.json()) as { comments: PublicComment[] };
      setApproved(data.comments);
      // Once the server serves one of the visitor's comments as approved, drop the
      // local copy — it now arrives via `approved` (display also de-dupes by id).
      const pruned = pruneApproved(mineRef.current, data.comments);
      if (pruned.length !== mineRef.current.length) writeMine(pruned);
    } catch {
      // Wall is non-critical; leave it as-is on fetch failure.
    }
  }, [writeMine]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const handleSubmitted = useCallback(
    (comment: PublicComment) => {
      writeMine(addMine(mineRef.current, comment));
      setJustSubmitted(comment);
      // Note: no re-fetch here — the comment is still `pending`, so it can't come
      // back from the approved list yet; the local copy is what shows it.
    },
    [writeMine],
  );

  // Visitor's own comments lead (newest first), then approved; de-duped by id so a
  // not-yet-pruned local copy never renders twice alongside its approved twin.
  const pool = useMemo(() => dedupeById([...mine, ...approved]), [mine, approved]);
  // Re-seed the field only when the approved set changes — not when the visitor
  // adds their own comment. Falls back to a stable sentinel while only local
  // comments exist so they still get seeded in.
  const seedKey = useMemo(
    () => (approved.length ? approved.map((c) => c.id).join(",") : mine.length ? "mine-only" : ""),
    [approved, mine],
  );

  return (
    <section id={sectionId} className="relative py-8 md:py-10 lg:py-12">
      <div className="wide:max-w-8xl relative mx-auto max-w-7xl px-6 md:px-12 lg:px-20">
        <SectionHeading heading={heading} eyebrow={eyebrow} className="mb-8 md:mb-10" />
        <p className="text-muted-foreground mb-8 text-sm/relaxed md:mb-10 md:text-base">
          {description}
        </p>

        {/* grid-cols-1 (= minmax(0,1fr)) keeps the single mobile column from
            being blown out by a wide child: an implicit `auto` column floors at
            its content's min-content, which on a ~340px phone stretched the
            shared track wider than the container and pushed the w-full wall
            field's right border off-screen. The lg template already guards this
            with minmax(0,…); this gives mobile the same floor. */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
          {/* Source order is form-first (keeps it first in tab / screen-reader
              flow — it's the actionable element). `order` only swaps the visual
              order: on mobile the bubbles lead, on desktop the form returns to
              the narrow left column and the bubbles take the wide right one. */}
          <div className="bg-border/40 order-2 rounded-lg border p-5 lg:order-1">
            <CommentForm siteKey={SITE_KEY} onSubmitted={handleSubmitted} />
          </div>
          <div className="order-1 lg:order-2">
            <CommentBubbles
              comments={pool}
              visibleCount={display.visibleBubbles}
              seedKey={seedKey}
              promote={justSubmitted}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
