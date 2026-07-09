import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimeseriesChart } from "@/components/dashboard/timeseries-chart";

const noop = () => {};

describe("TimeseriesChart", () => {
  it("renders the title and reports a range change from the toggle", () => {
    const onRange = vi.fn();
    render(
      <TimeseriesChart
        daily={[]}
        generatedAt={0}
        range="30d"
        series="daily"
        onRangeChange={onRange}
        onSeriesChange={noop}
      />,
    );
    expect(screen.getByText("Downloads over time")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "7d" }));
    expect(onRange).toHaveBeenCalledWith("7d");
  });

  it("shows the empty state when there is no data", () => {
    render(
      <TimeseriesChart
        daily={[]}
        generatedAt={0}
        range="30d"
        series="daily"
        onRangeChange={noop}
        onSeriesChange={noop}
      />,
    );
    expect(screen.getByText("No data")).toBeInTheDocument();
  });
});
