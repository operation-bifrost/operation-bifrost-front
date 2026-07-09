import { DAY_MS } from "@/data/dashboard";

export const SESSION_COOKIE = "bifrost_dash";
export const SESSION_TTL_MS = 7 * DAY_MS;

/** Length-safe, content-constant-time string comparison. */
export function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  // Compare against a same-length buffer to avoid early-exit timing on length.
  const target = ab.length === bb.length ? bb : ab;
  let mismatch = ab.length === bb.length ? 0 : 1;
  for (let i = 0; i < ab.length; i++) {
    mismatch |= ab[i] ^ target[i];
  }
  return mismatch === 0;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  const padded = text
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(text.length / 4) * 4, "=");
  const binary = atob(padded);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Token = base64url(JSON payload) + "." + base64url(HMAC-SHA256(payload)). */
export async function signSession(secret: string, expMs: number): Promise<string> {
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify({ exp: expMs })));
  const key = await hmacKey(secret);
  const sig = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)),
  );
  return `${payload}.${toBase64Url(sig)}`;
}

export async function verifySession(
  secret: string,
  token: string,
  nowMs: number,
): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const key = await hmacKey(secret);
  let valid: boolean;
  try {
    valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(sig),
      new TextEncoder().encode(payload),
    );
  } catch {
    return false;
  }
  if (!valid) return false;
  try {
    const decoded = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as {
      exp?: unknown;
    };
    return typeof decoded.exp === "number" && decoded.exp > nowMs;
  } catch {
    return false;
  }
}

export function buildSessionCookie(
  token: string,
  opts: { secure: boolean; maxAgeSec: number },
): string {
  const attrs = [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${opts.maxAgeSec}`,
  ];
  if (opts.secure) attrs.push("Secure");
  return attrs.join("; ");
}

export function buildClearCookie(opts: { secure: boolean }): string {
  const attrs = [`${SESSION_COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (opts.secure) attrs.push("Secure");
  return attrs.join("; ");
}
