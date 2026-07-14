import type { APIContext } from "astro";
import { env } from "cloudflare:workers";

import { handleLogin } from "@/lib/dashboard/handlers";

export const prerender = false;

export async function POST({ request }: APIContext): Promise<Response> {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  return handleLogin(
    {
      password: env.DASHBOARD_PASSWORD,
      sessionSecret: env.DASHBOARD_SESSION_SECRET,
      ratelimiter: env.DASHBOARD_LOGIN_RATELIMIT!,
      ip: request.headers.get("CF-Connecting-IP"),
      now: () => Date.now(),
      secure: import.meta.env.PROD,
    },
    body,
  );
}
