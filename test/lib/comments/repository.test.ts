import { beforeEach, describe, expect, it } from "vitest";
import { FakeD1 } from "../../helpers/fake-d1";
import {
  attachDiscordMessageId,
  insertPending,
  listApproved,
  setStatus,
} from "@/lib/comments/repository";

describe("comment repository", () => {
  let database: D1Database;
  let fake: FakeD1;

  beforeEach(() => {
    fake = new FakeD1();
    database = fake as unknown as D1Database;
  });

  it("inserts a pending comment", async () => {
    await insertPending(database, { id: "a", name: "Kurisu", message: "hi", createdAt: 100 });
    expect(fake.rows[0]).toMatchObject({ id: "a", status: "pending", name: "Kurisu" });
  });

  it("lists only approved comments, newest first, capped by limit", async () => {
    await insertPending(database, { id: "a", name: null, message: "old", createdAt: 100 });
    await insertPending(database, { id: "b", name: null, message: "new", createdAt: 200 });
    await setStatus(database, { id: "a", status: "approved", reviewedBy: "mod", reviewedAt: 1 });
    await setStatus(database, { id: "b", status: "approved", reviewedBy: "mod", reviewedAt: 2 });
    const list = await listApproved(database, 10);
    expect(list.map((c) => c.id)).toEqual(["b", "a"]);
    expect(list[0]).toEqual({ id: "b", name: null, message: "new", createdAt: 200 });
  });

  it("does not list pending comments", async () => {
    await insertPending(database, { id: "a", name: null, message: "hi", createdAt: 100 });
    expect(await listApproved(database, 10)).toEqual([]);
  });

  it("setStatus returns true on a pending row and false on re-decision", async () => {
    await insertPending(database, { id: "a", name: null, message: "hi", createdAt: 100 });
    expect(
      await setStatus(database, { id: "a", status: "approved", reviewedBy: "m", reviewedAt: 1 }),
    ).toBe(true);
    expect(
      await setStatus(database, { id: "a", status: "rejected", reviewedBy: "m", reviewedAt: 2 }),
    ).toBe(false);
  });

  it("attaches a discord message id", async () => {
    await insertPending(database, { id: "a", name: null, message: "hi", createdAt: 100 });
    await attachDiscordMessageId(database, "a", "msg-1");
    expect(fake.rows[0].discord_message_id).toBe("msg-1");
  });
});
