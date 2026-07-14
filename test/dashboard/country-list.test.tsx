import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CountryList } from "@/components/dashboard/country-list";
import { dashboardContent } from "@/data/dashboard";
import { resolveCountryName } from "@/lib/dashboard/format";

const many = Array.from({ length: 12 }, (_, i) => ({ country: `C${i}`, count: 12 - i }));

describe("CountryList", () => {
  it("resolves known codes and labels UNKNOWN as Unknown", () => {
    render(
      <CountryList
        data={[
          { country: "TH", count: 84 },
          { country: "UNKNOWN", count: 4 },
        ]}
        total={88}
      />,
    );
    expect(screen.getByText(resolveCountryName("TH"))).toBeInTheDocument();
    expect(screen.getByText(dashboardContent.country.unknownLabel)).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: dashboardContent.country.title }),
    ).toBeInTheDocument();
  });

  it("rolls entries beyond topN into an Others row", () => {
    render(<CountryList data={many} total={78} />);
    expect(screen.getByText(dashboardContent.country.othersLabel)).toBeInTheDocument();
  });

  it("renders a real flag graphic (svg) for a known country", () => {
    const { container } = render(<CountryList data={[{ country: "TH", count: 10 }]} total={10} />);
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
