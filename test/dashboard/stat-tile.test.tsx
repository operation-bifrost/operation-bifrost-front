import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatTile } from "@/components/dashboard/stat-tile";

describe("StatTile", () => {
  it("formats the value and labels an up delta for assistive tech", () => {
    render(<StatTile label="Last 24h" value={1284} delta={{ pct: 40, direction: "up" }} />);
    expect(screen.getByText("1,284")).toBeInTheDocument();
    const delta = screen.getByLabelText(/up 40%/i);
    expect(delta.className).toContain("text-primary");
    expect(delta).toHaveTextContent("40%");
  });

  it("hides the delta when pct is null (no baseline)", () => {
    render(<StatTile label="Last 7d" value={5} delta={{ pct: null, direction: "up" }} />);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it("renders a subLabel when provided", () => {
    render(<StatTile label="Peak day" value={212} subLabel="2026-07-08" />);
    expect(screen.getByText("2026-07-08")).toBeInTheDocument();
  });

  it("shows a down delta in the destructive color", () => {
    render(<StatTile label="Last 24h" value={80} delta={{ pct: -20, direction: "down" }} />);
    const delta = screen.getByLabelText(/down 20%/i);
    expect(delta.className).toContain("text-destructive");
    expect(delta).toHaveTextContent("20%");
  });

  it("shows a flat delta in muted color", () => {
    render(<StatTile label="Last 24h" value={100} delta={{ pct: 0, direction: "flat" }} />);
    const delta = screen.getByLabelText(/flat 0%/i);
    expect(delta.className).toContain("text-muted-foreground");
  });
});
