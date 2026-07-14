import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { VersionBars, toVersionRows } from "@/components/dashboard/version-bars";
import { dashboardContent } from "@/data/dashboard";

describe("toVersionRows", () => {
  it("computes whole-percent of total", () => {
    const rows = toVersionRows(
      [
        { version: "v1.0.0", count: 70 },
        { version: "v1.0.1", count: 30 },
      ],
      100,
    );
    expect(rows).toEqual([
      { version: "v1.0.0", count: 70, pct: 70 },
      { version: "v1.0.1", count: 30, pct: 30 },
    ]);
  });

  it("guards divide-by-zero when total is 0", () => {
    expect(toVersionRows([{ version: "v1.0.0", count: 0 }], 0)).toEqual([
      { version: "v1.0.0", count: 0, pct: 0 },
    ]);
  });
});

describe("VersionBars", () => {
  it("renders the section title", () => {
    render(<VersionBars data={[{ version: "v1.0.0", count: 10 }]} total={10} />);
    expect(screen.getByText(dashboardContent.version.title)).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: dashboardContent.version.title }),
    ).toBeInTheDocument();
  });

  it("shows an empty marker when there is no data", () => {
    render(<VersionBars data={[]} total={0} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
