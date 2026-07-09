import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";

import { SESSION_COOKIE, verifySession } from "@/lib/dashboard/auth";
import { isApiPath, isProtectedPath } from "@/lib/dashboard/routes";

/**
 * The dashboard is a SHARED-password surface (see docs/dashboard-deploy.md).
 * Anti-framing + MIME-sniffing + referrer hardening applies to every response
 * on that surface, including the login page/endpoint, the 401, and the redirect.
 */
function applySecurityHeaders(res: Response): Response {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Content-Security-Policy", "frame-ancestors 'none'");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return res;
}

function isDashboardSurface(pathname: string): boolean {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/api/dashboard");
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  if (!isDashboardSurface(pathname)) return next();

  if (!isProtectedPath(pathname)) {
    return applySecurityHeaders(await next());
  }

  const token = context.cookies.get(SESSION_COOKIE)?.value ?? null;
  const authed = token
    ? await verifySession(env.DASHBOARD_SESSION_SECRET, token, Date.now())
    : false;
  if (authed) return applySecurityHeaders(await next());

  if (isApiPath(pathname)) {
    return applySecurityHeaders(
      new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );
  }
  const redirectRes = context.redirect("/dashboard/login");
  return applySecurityHeaders(redirectRes);
});
