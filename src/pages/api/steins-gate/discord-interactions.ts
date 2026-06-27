import type { APIContext } from "astro";
import { env } from "cloudflare:workers";

import { setStatus } from "@/lib/comments/repository";
import { handleInteraction } from "@/lib/comments/interaction-handler";
import { verifyDiscordRequest } from "@/lib/discord";

export const prerender = false;

export async function POST({ request }: APIContext): Promise<Response> {
  const signature = request.headers.get("X-Signature-Ed25519") ?? "";
  const timestamp = request.headers.get("X-Signature-Timestamp") ?? "";
  const rawBody = await request.text();

  return handleInteraction(
    {
      db: env.DB!,
      verifySignature: (body) =>
        verifyDiscordRequest({
          publicKey: env.DISCORD_PUBLIC_KEY,
          signature,
          timestamp,
          rawBody: body,
        }),
      setCommentStatus: (args) => setStatus(env.DB!, args),
      now: () => Date.now(),
    },
    { rawBody },
  );
}
