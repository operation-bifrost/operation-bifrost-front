import { cn } from "@/lib/utils";

interface BifrostWordmarkProps {
  size?: number;
  className?: string;
}

const TEXT = "Operation Bifrost";

export function BifrostWordmark({ size = 32, className }: BifrostWordmarkProps) {
  const sharedTextStyle = {
    fontSize: `${size}px`,
    letterSpacing: `${(size * -0.05).toFixed(2)}px`,
  } as const;

  return (
    <span
      className={cn("relative inline-block leading-none whitespace-nowrap", className)}
      style={{ height: `${size}px` }}
      aria-label={TEXT}
    >
      <span
        aria-hidden="true"
        className="frame font-bonx-frame absolute inset-0"
        style={sharedTextStyle}
      >
        {TEXT}
      </span>
      <span
        aria-hidden="true"
        className="sihouette font-bonx-sihouette absolute inset-0"
        style={sharedTextStyle}
      >
        {TEXT}
      </span>
      <span aria-hidden="true" className="title font-bonx relative" style={sharedTextStyle}>
        {TEXT}
      </span>
    </span>
  );
}
