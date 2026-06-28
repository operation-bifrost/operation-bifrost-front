export const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface SiteverifyResponse {
  success: boolean;
}

export async function verifyTurnstile(
  deps: { fetch: typeof fetch; secret: string },
  args: { token: string; ip: string | null },
): Promise<boolean> {
  const body = new FormData();
  body.append("secret", deps.secret);
  body.append("response", args.token);
  if (args.ip) body.append("remoteip", args.ip);

  try {
    const res = await deps.fetch(TURNSTILE_VERIFY_URL, { method: "POST", body });
    if (!res.ok) return false;
    const data = (await res.json()) as SiteverifyResponse;
    return data.success === true;
  } catch {
    return false;
  }
}
