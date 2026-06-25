export const INTERACTION_TYPE_PING = 1;
export const INTERACTION_TYPE_MESSAGE_COMPONENT = 3;
export const INTERACTION_RESPONSE_PONG = 1;
export const INTERACTION_RESPONSE_UPDATE_MESSAGE = 7;

const CUSTOM_ID_PREFIX = "wall_";
const DISCORD_API = "https://discord.com/api/v10";
const BUTTON_STYLE_SUCCESS = 3;
const BUTTON_STYLE_DANGER = 4;
const COMPONENT_TYPE_ACTION_ROW = 1;
const COMPONENT_TYPE_BUTTON = 2;

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0 || /[^0-9a-fA-F]/.test(hex)) {
    throw new Error("invalid hex");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export async function verifyDiscordRequest(args: {
  publicKey: string;
  signature: string;
  timestamp: string;
  rawBody: string;
}): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      hexToBytes(args.publicKey),
      { name: "Ed25519" },
      false,
      ["verify"],
    );
    const message = new TextEncoder().encode(args.timestamp + args.rawBody);
    return await crypto.subtle.verify("Ed25519", key, hexToBytes(args.signature), message);
  } catch {
    return false;
  }
}

export function parseModerationCustomId(
  customId: string,
): { action: "approve" | "reject"; commentId: string } | null {
  if (!customId.startsWith(CUSTOM_ID_PREFIX)) return null;
  const [head, ...rest] = customId.split(":");
  const commentId = rest.join(":");
  if (!commentId) return null;
  if (head === "wall_approve") return { action: "approve", commentId };
  if (head === "wall_reject") return { action: "reject", commentId };
  return null;
}

export interface DiscordMessagePayload {
  content: string;
  allowed_mentions: { parse: never[] };
  components: unknown[];
}

export function buildModMessagePayload(comment: {
  id: string;
  name: string | null;
  message: string;
}): DiscordMessagePayload {
  const author = comment.name ?? "(ไม่ระบุชื่อ / anonymous)";
  return {
    content: `**ความในใจใหม่รออนุมัติ**\nจาก: ${author}\n\n> ${comment.message}`,
    allowed_mentions: { parse: [] },
    components: [
      {
        type: COMPONENT_TYPE_ACTION_ROW,
        components: [
          {
            type: COMPONENT_TYPE_BUTTON,
            style: BUTTON_STYLE_SUCCESS,
            label: "อนุมัติ",
            custom_id: `wall_approve:${comment.id}`,
          },
          {
            type: COMPONENT_TYPE_BUTTON,
            style: BUTTON_STYLE_DANGER,
            label: "ปฏิเสธ",
            custom_id: `wall_reject:${comment.id}`,
          },
        ],
      },
    ],
  };
}

export function buildDecisionMessagePayload(args: {
  decision: "approve" | "reject";
  reviewer: string;
  message: string;
}): DiscordMessagePayload {
  const verb = args.decision === "approve" ? "✅ อนุมัติแล้ว" : "🚫 ปฏิเสธแล้ว";
  return {
    content: `${verb} โดย ${args.reviewer}\n\n${args.message}`,
    allowed_mentions: { parse: [] },
    components: [],
  };
}

export async function postModMessage(
  deps: { fetch: typeof fetch; botToken: string; channelId: string },
  payload: DiscordMessagePayload,
): Promise<string | null> {
  try {
    const res = await deps.fetch(`${DISCORD_API}/channels/${deps.channelId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${deps.botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { id: string };
    return data.id ?? null;
  } catch {
    return null;
  }
}
