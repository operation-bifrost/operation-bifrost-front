import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroTotal } from "@/components/dashboard/hero-total";

describe("HeroTotal", () => {
  it("exposes the total to assistive tech via role=img and shows the label", () => {
    render(<HeroTotal total={1234} version="v1.0.0" hasData />);
    expect(screen.getByRole("img", { name: /1234/ })).toBeInTheDocument();
    expect(screen.getByText(/Total downloads/i)).toBeInTheDocument();
    expect(screen.getByText(/v1\.0\.0/)).toBeInTheDocument();
  });

  it("shows the empty caption when there is no data", () => {
    render(<HeroTotal total={0} version="v1.0.0" hasData={false} />);
    expect(screen.getByText(/No downloads yet/i)).toBeInTheDocument();
  });
});
