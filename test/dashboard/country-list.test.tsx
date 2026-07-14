import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CountryList } from "@/components/dashboard/country-list";

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
    expect(screen.getByText("Thailand")).toBeInTheDocument();
    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "By country" })).toBeInTheDocument();
  });

  it("rolls entries beyond topN into an Others row", () => {
    render(<CountryList data={many} total={78} />);
    expect(screen.getByText("Others")).toBeInTheDocument();
  });
});
