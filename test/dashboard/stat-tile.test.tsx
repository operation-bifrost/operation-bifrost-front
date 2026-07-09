import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatTile } from "@/components/dashboard/stat-tile";

describe("StatTile", () => {
  it("formats the value and shows an up delta with a ▲ marker", () => {
    render(<StatTile label="LAST 24H" value={1284} delta={{ pct: 40, direction: "up" }} />);
    expect(screen.getByText("1,284")).toBeInTheDocument();
    expect(screen.getByText(/▲/)).toBeInTheDocument();
    expect(screen.getByText(/40%/)).toBeInTheDocument();
  });

  it("hides the delta when pct is null (no baseline)", () => {
    render(<StatTile label="LAST 7D" value={5} delta={{ pct: null, direction: "up" }} />);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it("renders a subLabel when provided", () => {
    render(<StatTile label="PEAK DAY" value={212} subLabel="2026-07-08" />);
    expect(screen.getByText("2026-07-08")).toBeInTheDocument();
  });

  it("shows a down delta with a ▼ marker in the destructive color", () => {
    render(<StatTile label="LAST 24H" value={80} delta={{ pct: -20, direction: "down" }} />);
    const marker = screen.getByText(/▼/);
    expect(marker).toBeInTheDocument();
    expect(marker.className).toContain("text-destructive");
    expect(screen.getByText(/20%/)).toBeInTheDocument();
  });

  it("shows a flat delta with a → marker", () => {
    render(<StatTile label="LAST 24H" value={100} delta={{ pct: 0, direction: "flat" }} />);
    expect(screen.getByText(/→/)).toBeInTheDocument();
  });
});
