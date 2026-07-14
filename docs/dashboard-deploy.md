# Dashboard deploy runbook

## Secrets (once per environment)

    wrangler secret put DASHBOARD_PASSWORD              # prod
    wrangler secret put DASHBOARD_SESSION_SECRET        # prod (use a long random string)
    wrangler secret put DASHBOARD_PASSWORD --name operationbifrost-dev
    wrangler secret put DASHBOARD_SESSION_SECRET --name operationbifrost-dev

## Binding

`DASHBOARD_LOGIN_RATELIMIT` is declared in `wrangler.jsonc` (prod + `env.dev`). No manual step.

## Rotating the password

Re-run `wrangler secret put DASHBOARD_PASSWORD` and share the new value with the team.
Rotating `DASHBOARD_SESSION_SECRET` additionally invalidates all active sessions.

## Notes

- `/dashboard` is `noindex` and excluded from analytics by design.
- The session cookie is `Secure` only in production builds (localhost dev uses http).

## Security notes

- **Logout is client-side only.** The session token is a stateless HMAC-signed value
  (`src/lib/dashboard/auth.ts`) with a 7-day TTL (`SESSION_TTL_MS`). Logging out clears the
  browser cookie, but it does not — and cannot — revoke the token server-side: there is no
  session store. If a session cookie leaks, it stays valid until it expires, regardless of
  logout. Rotating `DASHBOARD_SESSION_SECRET` invalidates ALL active sessions immediately
  (everyone is forced to log in again), so that is the lever to pull if a leak is suspected.
  To shorten the exposure window for future leaks, reduce `SESSION_TTL_MS` in
  `src/lib/dashboard/auth.ts`.
- **Anti-framing headers.** `src/middleware.ts` sets `X-Frame-Options: DENY`,
  `Content-Security-Policy: frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, and
  `Referrer-Policy: strict-origin-when-cross-origin` on every response for the dashboard
  surface (`/dashboard*` and `/api/dashboard*`), including the login page, the authenticated
  pages, the 401 response, and the login redirect. This is a targeted `frame-ancestors` rule,
  not a full `default-src` CSP, so it does not affect the React island.
- **No PII in the download log.** The download telemetry stores aggregate counts and a
  country code only — no IP addresses or other personally identifying data are persisted.
