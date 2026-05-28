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
      className={cn("relative inline-block whitespace-nowrap leading-none", className)}
      style={{ height: `${size}px` }}
      aria-label={TEXT}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 frame font-bonx-frame"
        style={sharedTextStyle}
      >
        {TEXT}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 sihouette font-bonx-sihouette"
        style={sharedTextStyle}
      >
        {TEXT}
      </span>
      <span
        aria-hidden="true"
        className="relative title font-bonx"
        style={sharedTextStyle}
      >
        {TEXT}
      </span>
    </span>
  );
}
