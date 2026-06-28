export interface FakeRow {
  id: string;
  name: string | null;
  message: string;
  status: string;
  created_at: number;
  reviewed_at: number | null;
  reviewed_by: string | null;
  discord_message_id: string | null;
}

// Implements just the subset of the D1 API the repository uses.
export class FakeD1 {
  rows: FakeRow[] = [];

  prepare(sql: string) {
    const normalized = sql.replace(/\s+/g, " ").trim();
    const rows = this.rows;
    return {
      _args: [] as unknown[],
      bind(...args: unknown[]) {
        this._args = args;
        return this;
      },
      async run() {
        if (normalized.startsWith("INSERT INTO comments")) {
          const [id, name, message, created_at] = this._args as [
            string,
            string | null,
            string,
            number,
          ];
          rows.push({
            id,
            name,
            message,
            status: "pending",
            created_at,
            reviewed_at: null,
            reviewed_by: null,
            discord_message_id: null,
          });
          return { success: true, meta: { changes: 1 } };
        }
        if (normalized.startsWith("UPDATE comments SET status")) {
          const [status, reviewed_by, reviewed_at, id] = this._args as [
            string,
            string,
            number,
            string,
          ];
          const row = rows.find((r) => r.id === id && r.status === "pending");
          if (!row) return { success: true, meta: { changes: 0 } };
          row.status = status;
          row.reviewed_by = reviewed_by;
          row.reviewed_at = reviewed_at;
          return { success: true, meta: { changes: 1 } };
        }
        if (normalized.startsWith("UPDATE comments SET discord_message_id")) {
          const [messageId, id] = this._args as [string, string];
          const row = rows.find((r) => r.id === id);
          if (row) row.discord_message_id = messageId;
          return { success: true, meta: { changes: row ? 1 : 0 } };
        }
        throw new Error(`FakeD1: unhandled run() for: ${normalized}`);
      },
      async all() {
        if (normalized.startsWith("SELECT id, name, message, created_at FROM comments")) {
          const [limit] = this._args as [number];
          const results = rows
            .filter((r) => r.status === "approved")
            .sort((a, b) => b.created_at - a.created_at)
            .slice(0, limit)
            .map((r) => ({
              id: r.id,
              name: r.name,
              message: r.message,
              created_at: r.created_at,
            }));
          return { results, success: true, meta: {} };
        }
        throw new Error(`FakeD1: unhandled all() for: ${normalized}`);
      },
    };
  }
}
