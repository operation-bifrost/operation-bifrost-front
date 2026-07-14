import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { dashboardContent } from "@/data/dashboard";

const { heatmap } = dashboardContent;

describe("ActivityHeatmap", () => {
  it("renders the title and a row per weekday", () => {
    render(<ActivityHeatmap heat={[{ weekday: 1, hour: 9, count: 5 }]} />);
    expect(screen.getByText(heatmap.title)).toBeInTheDocument();
    expect(screen.getByText(heatmap.weekdays[0])).toBeInTheDocument();
    expect(screen.getByText(heatmap.weekdays[1])).toBeInTheDocument();
    expect(screen.getByText(heatmap.weekdays[6])).toBeInTheDocument();
    expect(screen.getByRole("region", { name: heatmap.title })).toBeInTheDocument();
  });

  it("shows a chart-style tooltip on hover instead of a native title", () => {
    render(<ActivityHeatmap heat={[{ weekday: 1, hour: 9, count: 5 }]} />);
    const cell = screen.getByLabelText(`${heatmap.weekdays[1]} 09:00 · 5`);
    expect(cell).not.toHaveAttribute("title");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    fireEvent.mouseEnter(cell);

    const tip = screen.getByRole("tooltip");
    expect(tip).toHaveTextContent(`${heatmap.weekdays[1]} 09:00`);
    expect(tip).toHaveTextContent(heatmap.metricLabel);
    expect(tip).toHaveTextContent("5");
  });
});
