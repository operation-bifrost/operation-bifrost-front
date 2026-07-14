import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Sparkline } from "@/components/dashboard/ui/sparkline";

describe("Sparkline", () => {
  it("renders nothing chart-like for fewer than two points", () => {
    const { container } = render(<Sparkline data={[5]} />);
    expect(container.querySelector(".recharts-wrapper")).toBeNull();
  });

  it("renders a Recharts line for two or more points", () => {
    const { container } = render(<Sparkline data={[1, 3, 2, 5]} />);
    expect(container.querySelector(".recharts-wrapper")).not.toBeNull();
  });
});
