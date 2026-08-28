import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  BrowserBreakdown,
  DeviceBreakdown,
  OsBreakdown,
} from "@/components/dashboard/client-breakdown";
import { TopIps } from "@/components/dashboard/top-ips";
import { dashboardContent } from "@/data/dashboard";

const { clients } = dashboardContent;

describe("BrowserBreakdown", () => {
  it("lists browser families under the browser heading", () => {
    render(
      <BrowserBreakdown
        data={[
          { label: "Chrome", count: 8 },
          { label: "Safari", count: 2 },
        ]}
        total={10}
      />,
    );
    expect(screen.getByRole("region", { name: clients.browser })).toBeInTheDocument();
    expect(screen.getByText("Chrome")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  it("localizes the UNKNOWN sentinel instead of printing it raw", () => {
    render(<BrowserBreakdown data={[{ label: "UNKNOWN", count: 3 }]} total={3} />);
    expect(screen.getByText(clients.unknownLabel)).toBeInTheDocument();
    expect(screen.queryByText("UNKNOWN")).toBeNull();
  });
});

describe("OsBreakdown", () => {
  it("lists OS families under the OS heading", () => {
    render(<OsBreakdown data={[{ label: "Windows", count: 5 }]} total={5} />);
    expect(screen.getByRole("region", { name: clients.os })).toBeInTheDocument();
    expect(screen.getByText("Windows")).toBeInTheDocument();
  });
});

describe("DeviceBreakdown", () => {
  it("translates every device kind", () => {
    render(
      <DeviceBreakdown
        data={[
          { label: "desktop", count: 6 },
          { label: "mobile", count: 3 },
          { label: "tablet", count: 2 },
          { label: "bot", count: 1 },
        ]}
        total={12}
      />,
    );
    expect(screen.getByText(clients.deviceLabels.desktop)).toBeInTheDocument();
    expect(screen.getByText(clients.deviceLabels.mobile)).toBeInTheDocument();
    expect(screen.getByText(clients.deviceLabels.tablet)).toBeInTheDocument();
    expect(screen.getByText(clients.deviceLabels.bot)).toBeInTheDocument();
  });

  it("falls back to the unknown label for an unrecognized device kind", () => {
    render(<DeviceBreakdown data={[{ label: "UNKNOWN", count: 4 }]} total={4} />);
    expect(screen.getByText(clients.deviceLabels.UNKNOWN)).toBeInTheDocument();
  });
});

describe("TopIps", () => {
  const many = Array.from({ length: clients.topN + 3 }, (_, i) => ({
    ip: `203.0.113.${i + 1}`,
    count: 100 - i,
  }));

  it("lists addresses with their share of the total", () => {
    render(<TopIps data={[{ ip: "203.0.113.7", count: 5 }]} total={10} />);
    expect(screen.getByRole("region", { name: clients.topIps })).toBeInTheDocument();
    expect(screen.getByText("203.0.113.7")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("collapses the tail behind a show-all toggle", () => {
    render(<TopIps data={many} total={1000} />);
    expect(screen.queryByText(`203.0.113.${clients.topN + 1}`)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: clients.showAllLabel }));
    expect(screen.getByText(`203.0.113.${clients.topN + 1}`)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: clients.showLessLabel }));
    expect(screen.queryByText(`203.0.113.${clients.topN + 1}`)).toBeNull();
  });

  it("renders an empty placeholder when no IP was ever recorded", () => {
    render(<TopIps data={[]} total={0} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
