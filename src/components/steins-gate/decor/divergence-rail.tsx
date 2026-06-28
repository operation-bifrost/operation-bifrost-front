import { useDivergenceCycle } from "@/hooks/use-divergence-cycle";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

interface DivergenceRailProps {
  value: string;
  className?: string;
}

export function DivergenceRail({ value, className }: DivergenceRailProps) {
  // once: false → isVisible toggles off when the rail scrolls away, which tears
  // down the divergence cycle's timer instead of letting it replay forever.
  const { ref, isVisible } = useReveal<HTMLSpanElement>({
    rootMargin: "0px 0px -20% 0px",
    threshold: 0.05,
    once: false,
  });
  const display = useDivergenceCycle({
    finalValue: value,
    isActive: isVisible,
  });

  const sharedStyle = {
    fontSize: "clamp(3.5rem, 5vw + 1rem, 7.5rem)",
    letterSpacing: "-0.05em",
    lineHeight: 1,
  } as const;

  return (
    <span
      ref={ref}
      className={cn("relative inline-block whitespace-nowrap tabular-nums", className)}
      aria-label={value}
    >
      <span
        aria-hidden="true"
        className="frame font-bonx-frame absolute inset-0"
        style={sharedStyle}
      >
        {display}
      </span>
      <span
        aria-hidden="true"
        className="sihouette font-bonx-sihouette absolute inset-0"
        style={sharedStyle}
      >
        {display}
      </span>
      <span aria-hidden="true" className="title font-bonx relative" style={sharedStyle}>
        {display}
      </span>
    </span>
  );
}
