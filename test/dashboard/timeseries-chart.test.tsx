import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimeseriesChart } from "@/components/dashboard/timeseries-chart";
import { dashboardContent, RANGE_OPTIONS } from "@/data/dashboard";

const noop = () => {};
const { timeseries } = dashboardContent;
const label7d = RANGE_OPTIONS.find((o) => o.key === "7d")?.label ?? "7 วัน";

const baseProps = {
  daily: [],
  generatedAt: 0,
  range: "30d" as const,
  series: "daily" as const,
  customRange: null,
  onRangeChange: noop,
  onSeriesChange: noop,
  onCustomRangeChange: noop,
};

describe("TimeseriesChart", () => {
  it("renders the title, the custom-range trigger, and reports a range change from the toggle", () => {
    const onRange = vi.fn();
    render(<TimeseriesChart {...baseProps} onRangeChange={onRange} />);
    expect(screen.getByText(timeseries.title)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: timeseries.title })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: timeseries.customRangeAria })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: label7d }));
    expect(onRange).toHaveBeenCalledWith("7d");
  });

  it("labels the trigger with the active custom range", () => {
    render(
      <TimeseriesChart {...baseProps} customRange={{ from: "2026-07-01", to: "2026-07-10" }} />,
    );
    const trigger = screen.getByRole("button", { name: timeseries.customRangeAria });
    expect(trigger).toHaveTextContent("2026-07-01");
    expect(trigger).toHaveTextContent("2026-07-10");
  });

  it("shows the empty state when there is no data", () => {
    render(<TimeseriesChart {...baseProps} />);
    expect(screen.getByText(timeseries.empty)).toBeInTheDocument();
  });
});
