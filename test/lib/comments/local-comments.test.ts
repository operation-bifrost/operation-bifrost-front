import { beforeEach, describe, expect, it } from "vitest";

import {
  LOCAL_TTL_MS,
  MAX_LOCAL,
  addMine,
  dedupeById,
  loadMine,
  pruneApproved,
  saveMine,
} from "@/lib/comments/local-comments";
import type { PublicComment } from "@/lib/comments/repository";

const comment = (id: string, createdAt = 1000): PublicComment => ({
  id,
  name: null,
  message: `m-${id}`,
  createdAt,
});

beforeEach(() => {
  localStorage.clear();
});

describe("dedupeById", () => {
  it("keeps the first occurrence of each id and preserves order", () => {
    const out = dedupeById([comment("a"), comment("b"), comment("a"), comment("c")]);
    expect(out.map((c) => c.id)).toEqual(["a", "b", "c"]);
  });

  it("returns an empty array for empty input", () => {
    expect(dedupeById([])).toEqual([]);
  });
});

describe("addMine", () => {
  it("prepends the new comment (newest first)", () => {
    const out = addMine([comment("a")], comment("b"), 1000);
    expect(out.map((c) => c.id)).toEqual(["b", "a"]);
  });

  it("de-duplicates if the same id is added again", () => {
    const out = addMine([comment("a")], comment("a"), 1000);
    expect(out.map((c) => c.id)).toEqual(["a"]);
  });

  it("caps the stored set at MAX_LOCAL, dropping the oldest", () => {
    let mine: PublicComment[] = [];
    for (let i = 0; i < MAX_LOCAL + 3; i++) mine = addMine(mine, comment(`c${i}`), 1000);
    expect(mine).toHaveLength(MAX_LOCAL);
    expect(mine[0].id).toBe(`c${MAX_LOCAL + 2}`); // newest is first
  });

  it("drops entries older than the TTL", () => {
    const now = LOCAL_TTL_MS + 5000;
    const stale = comment("old", 1000); // far older than the TTL window
    const out = addMine([stale], comment("fresh", now), now);
    expect(out.map((c) => c.id)).toEqual(["fresh"]);
  });
});

describe("pruneApproved", () => {
  it("removes local copies whose id now appears in the approved list", () => {
    const mine = [comment("a"), comment("b"), comment("c")];
    const approved = [comment("b")];
    expect(pruneApproved(mine, approved).map((c) => c.id)).toEqual(["a", "c"]);
  });

  it("returns the same set when nothing has been approved", () => {
    const mine = [comment("a")];
    expect(pruneApproved(mine, []).map((c) => c.id)).toEqual(["a"]);
  });
});

describe("saveMine / loadMine round-trip", () => {
  it("persists and restores comments", () => {
    saveMine([comment("a"), comment("b")]);
    expect(loadMine(1000).map((c) => c.id)).toEqual(["a", "b"]);
  });

  it("returns an empty array when nothing is stored", () => {
    expect(loadMine(1000)).toEqual([]);
  });

  it("filters out TTL-expired entries on read", () => {
    saveMine([comment("old", 1000), comment("new", LOCAL_TTL_MS)]);
    const now = LOCAL_TTL_MS + 2000; // "old" is now beyond the window, "new" still inside
    expect(loadMine(now).map((c) => c.id)).toEqual(["new"]);
  });

  it("ignores malformed stored data", () => {
    localStorage.setItem("sg:wall:mine", "not json");
    expect(loadMine(1000)).toEqual([]);
  });

  it("drops entries with the wrong shape", () => {
    localStorage.setItem("sg:wall:mine", JSON.stringify([{ id: 1, message: "x" }, comment("ok")]));
    expect(loadMine(1000).map((c) => c.id)).toEqual(["ok"]);
  });

  it("caps restored comments at MAX_LOCAL", () => {
    const many = Array.from({ length: MAX_LOCAL + 4 }, (_, i) => comment(`c${i}`));
    saveMine(many);
    expect(loadMine(1000)).toHaveLength(MAX_LOCAL);
  });
});
