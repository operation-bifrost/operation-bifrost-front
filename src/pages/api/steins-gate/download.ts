import type { APIContext } from "astro";
import { env } from "cloudflare:workers";

import { steinsGateContent } from "@/data/steins-gate";
import { recordDownload } from "@/lib/downloads/repository";

export const prerender = false;

const { file, version } = steinsGateContent.download;

/**
 * Download counting route. Records the click in D1, then hands the 1.24GB
 * transfer off to R2 (dl.operationbifrost.com) via a 302 — the Worker only counts,
 * it never streams the bytes, so R2's native Range/resume support and free egress
 * apply. `no-store` keeps the redirect out of any cache so every click is counted.
 */
export async function GET({ request }: APIContext): Promise<Response> {
  // CF-IPCountry is added by Cloudflare at the edge (same path as CF-Connecting-IP
  // used by the comments route); absent in local dev, so it falls back to null.
  const country = request.headers.get("CF-IPCountry");

  // Best-effort: a stats-write failure must never fail the download.
  try {
    await recordDownload(env.DB!, { version, country, createdAt: Date.now() });
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
