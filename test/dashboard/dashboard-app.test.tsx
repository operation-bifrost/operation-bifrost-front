import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DashboardApp } from "@/components/dashboard/dashboard-app";
import { dashboardContent } from "@/data/dashboard";
import type { DashboardSnapshot } from "@/lib/downloads/repository";

function snap(total: number): DashboardSnapshot {
  return {
    generatedAt: 1_000,
    total,
    firstAt: 1,
    lastAt: 2,
    currentVersion: "v1.0.0",
    windows: { last24h: total, prev24h: 0, last7d: total, prev7d: 0 },
    peakDay: total > 0 ? { day: "2026-07-08", count: total } : null,
    daily: total > 0 ? [{ day: "2026-07-08", count: total }] : [],
    hourly: total > 0 ? [{ hour: "2026-07-08T13", count: total }] : [],
    byVersion: total > 0 ? [{ version: "v1.0.0", count: total }] : [],
    byCountry: total > 0 ? [{ country: "TH", count: total }] : [],
    heat: [],
    clients: {
      uniqueIps: total > 0 ? 1 : 0,
      topIps: total > 0 ? [{ ip: "203.0.113.7", count: total }] : [],
      byBrowser: total > 0 ? [{ label: "Chrome", count: total }] : [],
      byOs: total > 0 ? [{ label: "Windows", count: total }] : [],
      byDevice: total > 0 ? [{ label: "desktop", count: total }] : [],
    },
    recent:
      total > 0
        ? [
            {
              id: 1,
              version: "v1.0.0",
              country: "TH",
              ip: "203.0.113.7",
              userAgent:
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
              createdAt: 1_000,
            },
          ]
        : [],
  };
}

describe("DashboardApp", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the initial total from props", () => {
    render(<DashboardApp snapshot={snap(42)} />);
    expect(screen.getByText(dashboardContent.hero.label)).toBeInTheDocument();
  });

  it("refetches and updates the total when Refresh is clicked", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(snap(99)), { status: 200 }),
    );
    render(<DashboardApp snapshot={snap(42)} />);
    fireEvent.click(screen.getByRole("button", { name: dashboardContent.console.refreshLabel }));
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledWith("/api/dashboard/snapshot"));
    await waitFor(() => expect(screen.getByRole("img", { name: /99/ })).toBeInTheDocument());
  });
});
