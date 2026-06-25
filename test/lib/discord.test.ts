// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import {
  buildDecisionMessagePayload,
  buildModMessagePayload,
  parseModerationCustomId,
  postModMessage,
  verifyDiscordRequest,
} from "@/lib/discord";

// Sign helper using the same WebCrypto the verifier uses.
async function makeSignedRequest(body: string, timestamp: string) {
  const keyPair = (await crypto.subtle.generateKey({ name: "Ed25519" }, true, [
    "sign",
    "verify",
  ])) as CryptoKeyPair;
  const sig = await crypto.subtle.sign(
    "Ed25519",
    keyPair.privateKey,
    new TextEncoder().encode(timestamp + body),
  );
  const rawPub = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  const toHex = (buf: ArrayBuffer) =>
    [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return { publicKey: toHex(rawPub), signature: toHex(sig) };
}

describe("parseModerationCustomId", () => {
  it("parses approve", () => {
    expect(parseModerationCustomId("wall_approve:abc-123")).toEqual({
      action: "approve",
      commentId: "abc-123",
    });
  });
  it("parses reject", () => {
    expect(parseModerationCustomId("wall_reject:abc")).toEqual({
      action: "reject",
      commentId: "abc",
    });
  });
  it("returns null for unrelated ids", () => {
    expect(parseModerationCustomId("other:abc")).toBeNull();
    expect(parseModerationCustomId("wall_approve:")).toBeNull();
  });
});

describe("buildModMessagePayload", () => {
  it("includes both buttons with namespaced custom_ids", () => {
    const payload = JSON.stringify(buildModMessagePayload({ id: "x1", name: "K", message: "hi" }));
    expect(payload).toContain("wall_approve:x1");
    expect(payload).toContain("wall_reject:x1");
  });
});

describe("verifyDiscordRequest", () => {
  it("accepts a correctly signed request", async () => {
    const body = '{"type":1}';
    const timestamp = "1700000000";
    const { publicKey, signature } = await makeSignedRequest(body, timestamp);
    expect(await verifyDiscordRequest({ publicKey, signature, timestamp, rawBody: body })).toBe(
      true,
    );
  });
  it("rejects a tampered body", async () => {
    const timestamp = "1700000000";
    const { publicKey, signature } = await makeSignedRequest('{"type":1}', timestamp);
    expect(
      await verifyDiscordRequest({ publicKey, signature, timestamp, rawBody: '{"type":2}' }),
    ).toBe(false);
  });
  it("rejects malformed signature without throwing", async () => {
    expect(
      await verifyDiscordRequest({
        publicKey: "zz",
        signature: "zz",
        timestamp: "1",
        rawBody: "{}",
      }),
    ).toBe(false);
  });
});

describe("postModMessage", () => {
  const validPayload = buildDecisionMessagePayload({
    decision: "approve",
    reviewer: "mod",
    message: "ok",
  });

  it("posts to the channel and returns the message id", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: "msg-9" })));
    const id = await postModMessage(
      { fetch: fetchMock as unknown as typeof fetch, botToken: "t", channelId: "c" },
      validPayload,
    );
    expect(id).toBe("msg-9");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://discord.com/api/v10/channels/c/messages",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bot t" }),
      }),
    );
  });

  it("returns null when the API responds with a non-ok status", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 400 }));
    const id = await postModMessage(
      { fetch: fetchMock as unknown as typeof fetch, botToken: "t", channelId: "c" },
      validPayload,
    );
    expect(id).toBeNull();
  });

  it("returns null when fetch throws", async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error("network error");
    });
    const id = await postModMessage(
      { fetch: fetchMock as unknown as typeof fetch, botToken: "t", channelId: "c" },
      validPayload,
    );
    expect(id).toBeNull();
  });
});

describe("buildDecisionMessagePayload", () => {
  it("approve decision includes reviewer name and empty components", () => {
    const payload = buildDecisionMessagePayload({
      decision: "approve",
      reviewer: "mod",
      message: "hi",
    });
    expect(payload.components).toEqual([]);
    expect(payload.content).toContain("mod");
  });

  it("reject decision produces distinct content from approve", () => {
    const approve = buildDecisionMessagePayload({
      decision: "approve",
      reviewer: "mod",
      message: "hi",
    });
    const reject = buildDecisionMessagePayload({
      decision: "reject",
      reviewer: "mod",
      message: "hi",
    });
    expect(approve.content).not.toBe(reject.content);
  });
});
