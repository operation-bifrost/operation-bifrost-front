export interface CommentInput {
  name: string | null;
  message: string;
}

export type ValidationResult =
  | { ok: true; value: CommentInput }
  | { ok: false; error: "empty" | "tooLong" | "nameTooLong" };

// Strip C0 control characters (including newlines/tabs) and DEL. Trims ends.

const CONTROL_CHARS = /[ -]/g;

export function sanitizeText(raw: string): string {
  return raw.replace(CONTROL_CHARS, "").trim();
}

export function validateComment(
  raw: { name?: unknown; message?: unknown },
  limits: { maxName: number; maxMessage: number },
): ValidationResult {
  const message = typeof raw.message === "string" ? sanitizeText(raw.message) : "";
  if (message.length === 0) return { ok: false, error: "empty" };
  if (message.length > limits.maxMessage) return { ok: false, error: "tooLong" };

  let name: string | null = null;
  if (typeof raw.name === "string") {
    const cleaned = sanitizeText(raw.name);
    if (cleaned.length > limits.maxName) return { ok: false, error: "nameTooLong" };
    name = cleaned.length > 0 ? cleaned : null;
  }

  return { ok: true, value: { name, message } };
}
