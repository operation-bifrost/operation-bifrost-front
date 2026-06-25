import type { APIContext } from "astro";
import { env } from "cloudflare:workers";

import { steinsGateContent } from "@/data/steins-gate";
import { attachDiscordMessageId } from "@/lib/comments/repository";
import { handleCreateComment, handleListComments } from "@/lib/comments/handlers";
import { buildModMessagePayload, postModMessage } from "@/lib/discord";
import { verifyTurnstile } from "@/lib/turnstile";

export const prerender = false;

const { display } = steinsGateContent.wall;

export async function GET(): Promise<Response> {
  return handleListComments({ db: env.DB!, limit: display.fetchLimit });
}

export async function POST({ request }: APIContext): Promise<Response> {
  const ip = request.headers.get("CF-Connecting-IP");
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  return handleCreateComment(
    {
      db: env.DB!,
      ratelimiter: env.COMMENT_RATELIMIT!,
      verifyTurnstileToken: (token, clientIp) =>
        verifyTurnstile({ fetch, secret: env.TURNSTILE_SECRET_KEY }, { token, ip: clientIp }),
      postPendingToDiscord: async (comment) => {
        const messageId = await postModMessage(
          { fetch, botToken: env.DISCORD_BOT_TOKEN, channelId: env.DISCORD_CHANNEL_ID },
          buildModMessagePayload(comment),
        );
        if (messageId) await attachDiscordMessageId(env.DB!, comment.id, messageId);
        return messageId;
      },
      now: () => Date.now(),
      newId: () => crypto.randomUUID(),
      ip,
    },
    body,
  );
}
