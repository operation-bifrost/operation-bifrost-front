import type { APIContext } from "astro";
import { env } from "cloudflare:workers";

import { steinsGateContent } from "@/data/steins-gate";
import { recordDownload } from "@/lib/downloads/repository";

export const prerender = false;

const { file, version } = steinsGateContent.download;

/**
 * Download counting route, addressed as a same-origin .zip URL
 * (/downloads/<file>) so Plausible's file-downloads script classifies clicks
 * on it as a "File Download" event — the extension check (legacy script) and
 * the extension + same-origin checks (current script) both pass, while the
 * Worker still gets to count the click before any bytes move.
 *
 * Records the click in D1, then hands the 1.24GB transfer off to R2
 * (dl.operationbifrost.com) via a 302 — the Worker only counts, it never
 * streams the bytes, so R2's native Range/resume support and free egress
 * apply. `no-store` keeps the redirect out of any cache so every click is
 * counted.
 */
export async function GET({ params, request }: APIContext): Promise<Response> {
  // Only the current patch archive lives under /downloads/ — anything else is
  // a 404, never a redirect to bytes that don't match the requested name.
  if (params.file !== file.name) {
    return new Response(null, { status: 404 });
  }

  // CF-IPCountry and CF-Connecting-IP are added by Cloudflare at the edge (the
  // same path the comments route uses for the client IP); both are absent in
  // local dev, so they fall back to null. User-Agent comes from the client and
  // may legitimately be missing — it is stored raw and classified at read time.
  const country = request.headers.get("CF-IPCountry");
  const ip = request.headers.get("CF-Connecting-IP");
  const userAgent = request.headers.get("User-Agent");

  // Best-effort: a stats-write failure must never fail the download.
  try {
    await recordDownload(env.DB!, { version, country, ip, userAgent, createdAt: Date.now() });
  } catch (err) {
    console.error("download: failed to record event", err);
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: file.url,
      "Cache-Control": "no-store",
    },
  });
}
