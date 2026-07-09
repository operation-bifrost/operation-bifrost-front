import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ChartFrameProps {
  title: string;
  a11yLabel: string;
  className?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function ChartFrame({ title, a11yLabel, className, children, actions }: ChartFrameProps) {
  return (
    <section
      aria-label={a11yLabel}
      className={cn(
        "dash-scanline bg-card/90 border-border rounded-md border p-4 backdrop-blur-sm sm:p-6",
        className,
      )}
    >
      <header className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
          {title}
        </h2>
        {actions}
      </header>
      {children}
    </section>
  );
}
