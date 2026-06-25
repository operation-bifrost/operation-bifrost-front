import { steinsGateContent } from "@/data/steins-gate";
import { insertPending, listApproved, type PublicComment } from "@/lib/comments/repository";
import { validateComment } from "@/lib/comments/validate";

const { limits, errors } = steinsGateContent.wall;

function json(body: object, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export interface CreateDeps {
  db: D1Database;
  ratelimiter: { limit(a: { key: string }): Promise<{ success: boolean }> };
  verifyTurnstileToken(token: string, ip: string | null): Promise<boolean>;
  postPendingToDiscord(comment: PublicComment): Promise<string | null>;
  now(): number;
  newId(): string;
  ip: string | null;
}

export interface ListDeps {
  db: D1Database;
  limit: number;
}

export async function handleCreateComment(deps: CreateDeps, body: unknown): Promise<Response> {
  const raw = (body ?? {}) as { name?: unknown; message?: unknown; turnstileToken?: unknown };

  // 1. Validate first (cheap, no external calls).
  const validation = validateComment(raw, limits);
  if (!validation.ok) return json({ error: errors[validation.error] }, 400);

  // 2. Rate limit by IP.
  const key = deps.ip ?? "anonymous";
  const { success } = await deps.ratelimiter.limit({ key });
  if (!success) return json({ error: errors.rateLimited }, 429);

  // 3. Turnstile.
  const token = typeof raw.turnstileToken === "string" ? raw.turnstileToken : "";
  if (!token || !(await deps.verifyTurnstileToken(token, deps.ip))) {
    return json({ error: errors.captcha }, 400);
  }

  // 4. Persist as pending.
  const comment: PublicComment = {
    id: deps.newId(),
    name: validation.value.name,
    message: validation.value.message,
    createdAt: deps.now(),
  };
  await insertPending(deps.db, comment);

  // 5. Notify Discord (best-effort; failure does not fail the submission).
  await deps.postPendingToDiscord(comment);

  return json({ status: "pending" }, 202);
}

export async function handleListComments(deps: ListDeps): Promise<Response> {
  const comments = await listApproved(deps.db, deps.limit);
  return new Response(JSON.stringify({ comments }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30",
    },
  });
}
