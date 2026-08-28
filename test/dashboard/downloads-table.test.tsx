import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DownloadsTable, toLogRows } from "@/components/dashboard/downloads-table";
import { dashboardContent } from "@/data/dashboard";
import { resolveCountryName } from "@/lib/dashboard/format";
import type { DownloadRow } from "@/lib/downloads/repository";

const CHROME_WIN =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const { log } = dashboardContent;

function row(overrides: Partial<DownloadRow> = {}): DownloadRow {
  return {
    id: 1,
    version: "v1.0.0",
    country: "TH",
    ip: "203.0.113.7",
    userAgent: CHROME_WIN,
    // 2026-07-08 20:00 Bangkok
    createdAt: Date.UTC(2026, 6, 8, 13, 0),
    ...overrides,
  };
}

/** `n` rows with distinct ids so pagination has something to page through. */
function rows(n: number): DownloadRow[] {
  return Array.from({ length: n }, (_, i) => row({ id: i + 1, ip: `203.0.113.${i + 1}` }));
}

describe("toLogRows", () => {
  it("renders the timestamp on the Bangkok clock", () => {
    expect(toLogRows([row()])[0].time).toBe("2026-07-08 20:00");
  });

  it("joins browser and OS into the client column", () => {
    expect(toLogRows([row()])[0].client).toBe("Chrome · Windows");
  });

  it("falls back to a placeholder for a missing ip, country, and user agent", () => {
    const [r] = toLogRows([row({ ip: null, country: null, userAgent: null })]);
    expect(r.ip).toBe(log.unknownLabel);
    expect(r.country).toBe(log.unknownLabel);
    expect(r.client).toBe(log.unknownLabel);
  });

  it("keeps the recognized half when only one of browser/OS resolves", () => {
    expect(toLogRows([row({ userAgent: "curl/8.4.0" })])[0].client).toBe("Bot");
  });
});

describe("DownloadsTable", () => {
  it("shows the empty message when there are no downloads", () => {
    render(<DownloadsTable rows={[]} />);
    expect(screen.getByText(log.empty)).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("renders one row per download with ip, country and client detail", () => {
    render(<DownloadsTable rows={[row()]} />);
    expect(screen.getByRole("region", { name: log.title })).toBeInTheDocument();
    expect(screen.getByText("203.0.113.7")).toBeInTheDocument();
    expect(screen.getByText(resolveCountryName("TH"))).toBeInTheDocument();
    expect(screen.getByText("Chrome · Windows")).toBeInTheDocument();
    expect(screen.getByText("2026-07-08 20:00")).toBeInTheDocument();
  });

  it("exposes the raw user agent as the client cell's tooltip", () => {
    render(<DownloadsTable rows={[row()]} />);
    expect(screen.getByText("Chrome · Windows")).toHaveAttribute("title", CHROME_WIN);
  });

  it("pages the log and never renders more than one page at a time", () => {
    render(<DownloadsTable rows={rows(log.pageSize + 5)} />);

    expect(screen.getByText("203.0.113.1")).toBeInTheDocument();
    expect(screen.queryByText(`203.0.113.${log.pageSize + 1}`)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: new RegExp(log.nextLabel) }));

    expect(screen.getByText(`203.0.113.${log.pageSize + 1}`)).toBeInTheDocument();
    expect(screen.queryByText("203.0.113.1")).toBeNull();
  });

  it("disables Previous on the first page and Next on the last", () => {
    render(<DownloadsTable rows={rows(log.pageSize + 1)} />);
    const prev = screen.getByRole("button", { name: new RegExp(log.prevLabel) });
    const next = screen.getByRole("button", { name: new RegExp(log.nextLabel) });

    expect(prev).toBeDisabled();
    expect(next).toBeEnabled();

    fireEvent.click(next);
    expect(prev).toBeEnabled();
    expect(next).toBeDisabled();
  });

  it("reports the visible slice of the total", () => {
    render(<DownloadsTable rows={rows(30)} />);
    expect(screen.getByText(`1–${log.pageSize} จาก 30`)).toBeInTheDocument();
  });

  it("hides pagination controls beyond a single page's worth of rows", () => {
    render(<DownloadsTable rows={rows(3)} />);
    expect(screen.getByRole("button", { name: new RegExp(log.prevLabel) })).toBeDisabled();
    expect(screen.getByRole("button", { name: new RegExp(log.nextLabel) })).toBeDisabled();
  });
});
