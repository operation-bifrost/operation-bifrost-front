import { useState } from "react";
import { LuRefreshCw, LuLogOut } from "react-icons/lu";

import { dashboardContent } from "@/data/dashboard";
import { cn } from "@/lib/utils";

interface ConsoleBarProps {
  syncedAt: number;
  onRefresh: () => void;
  refreshing: boolean;
}

function formatClock(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString("en-GB", { hour12: false, timeZone: "Asia/Bangkok" });
}

export function ConsoleBar({ syncedAt, onRefresh, refreshing }: ConsoleBarProps) {
  const { console: c } = dashboardContent;
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/dashboard/logout", { method: "POST" });
    } catch {
      // Best-effort: redirect to login regardless of network failure.
    } finally {
      window.location.href = "/dashboard/login";
    }
  }

  return (
    <header className="border-border flex flex-wrap items-center justify-between gap-3 border-b pb-4">
      <div className="flex items-baseline gap-2 font-mono">
        <span className="text-primary text-sm font-bold tracking-widest">{c.brand}</span>
        <span className="text-muted-foreground text-xs tracking-widest">{c.subtitle}</span>
      </div>
      <div className="flex items-center gap-4 font-mono text-xs">
        <span className="text-primary hidden items-center gap-2 sm:flex">
          <span
            className="bg-primary inline-block size-2 animate-pulse rounded-full"
            aria-hidden="true"
          />
          {c.sessionLabel}
        </span>
        <span className="text-muted-foreground hidden md:inline">
          {c.syncedPrefix} {formatClock(syncedAt)}
        </span>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="text-foreground hover:text-primary flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <LuRefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
          {c.refreshLabel}
        </button>
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className="text-muted-foreground hover:text-destructive flex items-center gap-1.5 transition-colors"
        >
          <LuLogOut className="size-3.5" />
          {c.logoutLabel}
        </button>
      </div>
    </header>
  );
}
