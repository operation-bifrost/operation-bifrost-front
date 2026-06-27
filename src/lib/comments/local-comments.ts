import type { PublicComment } from "@/lib/comments/repository";

/**
 * Client-only persistence for the visitor's *own* freshly-submitted comments.
 *
 * The wall is moderated: a submission is stored server-side as `pending` and only
 * surfaces in the public (approved) list once a moderator approves it. To let the
 * submitter see their comment land on the wall right away, we keep a local copy
 * here — purely client-side, scoped to this browser. Each copy is:
 *   - bounded by a TTL so a never-approved (e.g. rejected) comment doesn't linger
 *     forever, and
 *   - dropped once the server starts returning it as approved (dedupe by id).
 *
 * This is best-effort: any storage error degrades to "no local comments".
 */

const STORAGE_KEY = "sg:wall:mine";
/** Local copies older than this are discarded on read (moderation usually resolves well within a day). */
export const LOCAL_TTL_MS = 24 * 60 * 60 * 1000;
/** Cap stored copies so the wall (and storage) can't be flooded by one visitor. */
export const MAX_LOCAL = 5;

function isStored(v: unknown): v is PublicComment {
  if (typeof v !== "object" || v === null) return false;
  const c = v as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    (c.name === null || typeof c.name === "string") &&
    typeof c.message === "string" &&
    typeof c.createdAt === "number"
  );
}

function hasLocalStorage(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    // Accessing localStorage can throw in sandboxed/SSR contexts.
    return false;
  }
}

/** Keep the first occurrence of each id; preserves order (newest-first by convention). */
export function dedupeById(comments: readonly PublicComment[]): PublicComment[] {
  const seen = new Set<string>();
  const out: PublicComment[] = [];
  for (const c of comments) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    out.push(c);
  }
  return out;
}

/** Drop expired copies and cap the count. Newest-first order is preserved. */
function prune(comments: readonly PublicComment[], now: number): PublicComment[] {
  return comments.filter((c) => now - c.createdAt < LOCAL_TTL_MS).slice(0, MAX_LOCAL);
}

/** Read the visitor's persisted comments (newest-first), TTL- and cap-bounded. */
export function loadMine(now: number = Date.now()): PublicComment[] {
  if (!hasLocalStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return prune(parsed.filter(isStored), now);
  } catch {
    return [];
  }
}

/** Persist the visitor's comments (already newest-first), capped. Best-effort. */
export function saveMine(comments: readonly PublicComment[]): void {
  if (!hasLocalStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments.slice(0, MAX_LOCAL)));
  } catch {
    // Storage full or disabled — non-critical, the wall just won't persist.
  }
}

/** Prepend a new submission (newest-first), de-duped, TTL- and cap-bounded. */
export function addMine(
  mine: readonly PublicComment[],
  comment: PublicComment,
  now: number = Date.now(),
): PublicComment[] {
  const withoutDup = mine.filter((c) => c.id !== comment.id);
  return prune([comment, ...withoutDup], now);
}

/** Remove any local copy whose id is now served as approved (it's "real" now). */
export function pruneApproved(
  mine: readonly PublicComment[],
  approved: readonly PublicComment[],
): PublicComment[] {
  const approvedIds = new Set(approved.map((c) => c.id));
  return mine.filter((c) => !approvedIds.has(c.id));
}
