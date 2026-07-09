import { dashboardContent } from "@/data/dashboard";
import {
  SESSION_TTL_MS,
  buildClearCookie,
  buildSessionCookie,
  signSession,
  timingSafeEqual,
} from "@/lib/dashboard/auth";
import type { DashboardSnapshot } from "@/lib/downloads/repository";

function json(body: object, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

export interface LoginDeps {
  password: string;
  sessionSecret: string;
  ratelimiter: { limit(a: { key: string }): Promise<{ success: boolean }> };
  ip: string | null;
  now(): number;
  secure: boolean;
}

export async function handleLogin(deps: LoginDeps, body: unknown): Promise<Response> {
  const raw = (body ?? {}) as { password?: unknown };
  const password = typeof raw.password === "string" ? raw.password : "";
  if (password.length === 0) return json({ error: "missing" }, 400);

  const { success } = await deps.ratelimiter.limit({ key: deps.ip ?? "anonymous" });
  if (!success) return json({ error: dashboardContent.login.errorRateLimited }, 429);

  if (!timingSafeEqual(password, deps.password)) {
    return json({ error: dashboardContent.login.errorInvalid }, 401);
  }

  const now = deps.now();
  const token = await signSession(deps.sessionSecret, now + SESSION_TTL_MS);
  return json({ ok: true }, 200, {
    "Set-Cookie": buildSessionCookie(token, {
      secure: deps.secure,
      maxAgeSec: Math.floor(SESSION_TTL_MS / 1000),
    }),
  });
}

export function handleLogout(deps: { secure: boolean }): Response {
  return json({ ok: true }, 200, { "Set-Cookie": buildClearCookie({ secure: deps.secure }) });
}

export interface SnapshotDeps {
  getSnapshot(): Promise<DashboardSnapshot>;
}

export async function handleSnapshot(deps: SnapshotDeps): Promise<Response> {
  try {
    const snapshot = await deps.getSnapshot();
    return json(snapshot, 200, { "Cache-Control": "no-store" });
  } catch (err) {
    console.error("dashboard: snapshot build failed", err);
    return json({ error: dashboardContent.errors.snapshotFailed }, 500);
  }
}
