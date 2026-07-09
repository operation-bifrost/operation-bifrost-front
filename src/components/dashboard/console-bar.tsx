import { useState } from "react";
import { LogOut, RefreshCw } from "lucide-react";

import { dashboardContent } from "@/data/dashboard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConsoleBarProps {
  syncedAt: number;
  onRefresh: () => void;
  refreshing: boolean;
}

function formatClock(ms: number): string {
  return new Date(ms).toLocaleTimeString("en-GB", { hour12: false, timeZone: "Asia/Bangkok" });
}

export function ConsoleBar({ syncedAt, onRefresh, refreshing }: ConsoleBarProps) {
  const c = dashboardContent.console;
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/dashboard/logout", { method: "POST" });
    } catch {
      // best-effort: redirect to login regardless of network failure
    } finally {
      window.location.href = "/dashboard/login";
    }
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-col">
        <span className="text-foreground text-base font-semibold tracking-tight">{c.brand}</span>
        <span className="text-muted-foreground text-xs">{c.subtitle}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground hidden text-xs sm:inline">
          {c.syncedPrefix} {formatClock(syncedAt)}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} aria-hidden="true" />
          {c.refreshLabel}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={logout} disabled={loggingOut}>
          <LogOut className="size-3.5" aria-hidden="true" />
          {c.logoutLabel}
        </Button>
      </div>
    </header>
  );
}
