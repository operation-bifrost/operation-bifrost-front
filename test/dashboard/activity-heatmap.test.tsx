import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";

describe("ActivityHeatmap", () => {
  it("renders the title and a row per weekday", () => {
    render(<ActivityHeatmap heat={[{ weekday: 1, hour: 9, count: 5 }]} />);
    expect(screen.getByText("Activity")).toBeInTheDocument();
    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Sat")).toBeInTheDocument();
  });
});
