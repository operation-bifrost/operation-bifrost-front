import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";

import { SESSION_COOKIE, verifySession } from "@/lib/dashboard/auth";
import { isApiPath, isProtectedPath } from "@/lib/dashboard/routes";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  if (!isProtectedPath(pathname)) return next();

  const token = context.cookies.get(SESSION_COOKIE)?.value ?? null;
  const authed = token
    ? await verifySession(env.DASHBOARD_SESSION_SECRET, token, Date.now())
    : false;
  if (authed) return next();

  if (isApiPath(pathname)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return context.redirect("/dashboard/login");
});
