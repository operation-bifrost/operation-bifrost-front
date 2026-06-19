import type { CSSProperties } from "react";
import { buildGear } from "@/components/steins-gate/decor/gear/gear-geometry";
import { cn } from "@/lib/utils";

interface GearProps {
  teeth: number;
  spin?: "forward" | "reverse";
  durationSec?: number;
  /** Baked clocking rotation, in degrees. Used by GearPair for meshing. */
  phaseDeg?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * A single parametric gear. Sizing comes from `className` (e.g. `size-44`) for
 * lone ambient gears, or from `style` width/height for precisely-placed pairs.
 * Rotation reuses the shared `.features-gear` spin (about the SVG centre).
 */
export function Gear({
  teeth,
  spin = "forward",
  durationSec = 90,
  phaseDeg = 0,
  className,
  style,
}: GearProps) {
  const gear = buildGear({ teeth, phaseDeg });

  return (
    <svg
      viewBox={gear.viewBox}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("features-gear", className)}
      data-direction={spin}
      style={{ animationDuration: `${durationSec}s`, ...style }}
      aria-hidden="true"
    >
      <path d={gear.path} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}
