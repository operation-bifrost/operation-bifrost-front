import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CountryList } from "@/components/dashboard/country-list";
import { dashboardContent } from "@/data/dashboard";
import { resolveCountryName } from "@/lib/dashboard/format";

// The removed "others" roll-up label — asserted absent so it never regresses.
const OLD_OTHERS_LABEL = "อื่น ๆ";

// 12 real ISO codes with descending counts — more than topN (8), so there is a
// tail. TH..CN are the top 8; VN/IN/ID/PH fall into the hidden tail.
const CODES = ["TH", "US", "JP", "GB", "DE", "FR", "KR", "CN", "VN", "IN", "ID", "PH"];
const twelve = CODES.map((country, i) => ({ country, count: 100 - i }));
const twelveTotal = twelve.reduce((s, c) => s + c.count, 0);

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

  it("collapses to the top slice with no Others aggregate", () => {
    render(<CountryList data={twelve} total={twelveTotal} />);
    expect(screen.getByText(resolveCountryName("TH"))).toBeInTheDocument(); // top
    expect(screen.getByText(resolveCountryName("CN"))).toBeInTheDocument(); // 8th (top slice edge)
    expect(screen.queryByText(resolveCountryName("VN"))).toBeNull(); // 9th (tail, hidden)
    expect(screen.queryByText(OLD_OTHERS_LABEL)).toBeNull(); // never rolled up
  });

  it("renders a real flag graphic (svg) for a known country", () => {
    const { container } = render(<CountryList data={[{ country: "TH", count: 10 }]} total={10} />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("hides the show-all toggle when countries fit within the top slice", () => {
    render(<CountryList data={[{ country: "TH", count: 10 }]} total={10} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("shows the show-all toggle when there are more countries than the top slice", () => {
    render(<CountryList data={twelve} total={twelveTotal} />);
    expect(
      screen.getByRole("button", { name: dashboardContent.country.showAllLabel }),
    ).toBeInTheDocument();
  });

  it("reveals every country when show-all is clicked, never showing an Others aggregate", () => {
    render(<CountryList data={twelve} total={twelveTotal} />);
    // Collapsed: tail hidden, no aggregate.
    expect(screen.queryByText(resolveCountryName("PH"))).toBeNull();
    expect(screen.queryByText(OLD_OTHERS_LABEL)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: dashboardContent.country.showAllLabel }));

    // Expanded: every country listed, still no aggregate.
    expect(screen.getByText(resolveCountryName("PH"))).toBeInTheDocument();
    expect(screen.queryByText(OLD_OTHERS_LABEL)).toBeNull();

    // Toggling back re-hides the tail.
    fireEvent.click(screen.getByRole("button", { name: dashboardContent.country.showLessLabel }));
    expect(screen.queryByText(resolveCountryName("PH"))).toBeNull();
  });
});
