import type { CommentStatus } from "@/lib/comments/repository";
import {
  buildDecisionMessagePayload,
  type DiscordEmbed,
  INTERACTION_RESPONSE_PONG,
  INTERACTION_RESPONSE_UPDATE_MESSAGE,
  INTERACTION_TYPE_MESSAGE_COMPONENT,
  INTERACTION_TYPE_PING,
  parseModerationCustomId,
} from "@/lib/discord";

export interface InteractionDeps {
  db: D1Database;
  verifySignature(rawBody: string): Promise<boolean>;
  setCommentStatus(args: {
    id: string;
    status: Exclude<CommentStatus, "pending">;
    reviewedBy: string;
    reviewedAt: number;
  }): Promise<boolean>;
  now(): number;
}

interface Interaction {
  type: number;
  data?: { custom_id?: string };
  member?: { user?: { username?: string } };
  user?: { username?: string };
  message?: { content?: string; embeds?: DiscordEmbed[] };
}

function json(body: object, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleInteraction(
  deps: InteractionDeps,
  req: { rawBody: string },
): Promise<Response> {
  if (!(await deps.verifySignature(req.rawBody))) {
    return new Response("invalid request signature", { status: 401 });
  }

  const interaction = JSON.parse(req.rawBody) as Interaction;

  if (interaction.type === INTERACTION_TYPE_PING) {
    return json({ type: INTERACTION_RESPONSE_PONG });
  }

  if (interaction.type !== INTERACTION_TYPE_MESSAGE_COMPONENT) {
    return json({});
  }

  const parsed = parseModerationCustomId(interaction.data?.custom_id ?? "");
  if (!parsed) return json({});

  const reviewer = interaction.member?.user?.username ?? interaction.user?.username ?? "unknown";
  const status = parsed.action === "approve" ? "approved" : "rejected";

  await deps.setCommentStatus({
    id: parsed.commentId,
    status,
    reviewedBy: reviewer,
    reviewedAt: deps.now(),
  });

  const originalEmbed = interaction.message?.embeds?.[0];
  return json({
    type: INTERACTION_RESPONSE_UPDATE_MESSAGE,
    data: buildDecisionMessagePayload({
      decision: parsed.action,
      reviewer,
      originalEmbed,
    }),
  });
}
