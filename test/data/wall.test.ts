import { describe, expect, it } from "vitest";
import { steinsGateContent } from "@/data/steins-gate";

describe("wall content", () => {
  it("is registered in the aggregate content", () => {
    expect(steinsGateContent.wall).toBeDefined();
  });

  it("declares the agreed limits", () => {
    expect(steinsGateContent.wall.limits).toEqual({ maxName: 40, maxMessage: 280 });
  });

  it("declares display caps", () => {
    expect(steinsGateContent.wall.display).toEqual({ fetchLimit: 60, visibleBubbles: 12 });
  });

  it("uses #-anchor compatible sectionId", () => {
    expect(steinsGateContent.wall.sectionId).toMatch(/^[a-z-]+$/);
  });
});
