export type CommentStatus = "pending" | "approved" | "rejected";

export interface PublicComment {
  id: string;
  name: string | null;
  message: string;
  createdAt: number;
}

interface ApprovedRow {
  id: string;
  name: string | null;
  message: string;
  created_at: number;
}

export async function insertPending(
  db: D1Database,
  c: { id: string; name: string | null; message: string; createdAt: number },
): Promise<void> {
  await db
    .prepare(
      "INSERT INTO comments (id, name, message, status, created_at) VALUES (?, ?, ?, 'pending', ?)",
    )
    .bind(c.id, c.name, c.message, c.createdAt)
    .run();
}

export async function listApproved(db: D1Database, limit: number): Promise<PublicComment[]> {
  const { results } = await db
    .prepare(
      "SELECT id, name, message, created_at FROM comments WHERE status = 'approved' ORDER BY created_at DESC LIMIT ?",
    )
    .bind(limit)
    .all<ApprovedRow>();
  return results.map((r) => ({
    id: r.id,
    name: r.name,
    message: r.message,
    createdAt: r.created_at,
  }));
}

export async function setStatus(
  db: D1Database,
  args: {
    id: string;
    status: Exclude<CommentStatus, "pending">;
    reviewedBy: string;
    reviewedAt: number;
  },
): Promise<boolean> {
  const res = await db
    .prepare(
      "UPDATE comments SET status = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ? AND status = 'pending'",
    )
    .bind(args.status, args.reviewedBy, args.reviewedAt, args.id)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

export async function attachDiscordMessageId(
  db: D1Database,
  id: string,
  messageId: string,
): Promise<void> {
  await db
    .prepare("UPDATE comments SET discord_message_id = ? WHERE id = ?")
    .bind(messageId, id)
    .run();
}
