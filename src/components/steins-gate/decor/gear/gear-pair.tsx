import { Gear } from "@/components/steins-gate/decor/gear/gear";
import {
  gearExtent,
  meshPhases,
  pitchRadius,
} from "@/components/steins-gate/decor/gear/gear-geometry";
import { cn } from "@/lib/utils";

interface GearPairProps {
  teethLarge: number;
  teethSmall: number;
  /**
   * Direction (deg, screen clockwise from +x) from the large gear's centre to
   * the small gear's centre. Drives both placement and tooth clocking.
   */
  angleDeg: number;
  /** Seconds per tooth. Period ∝ teeth keeps pitch-line speeds equal (ω ∝ 1/r). */
  baseDurationSec?: number;
  spinLarge?: "forward" | "reverse";
  /** Wrapper: absolute placement + a font-size that scales the whole pair (1 module = 1em). */
  className?: string;
  largeClassName?: string;
  smallClassName?: string;
}

/**
 * Two gears that actually mesh. Geometry is laid out in `em` (1 module = 1em),
 * so the wrapper's font-size scales the pair as a unit and the centre offset
 * stays exactly tangent at every breakpoint. The large gear sits at the wrapper
 * origin; the small gear hangs off it along `angleDeg` at the tangent distance,
 * spinning the opposite way at a period proportional to its tooth count.
 */
export function GearPair({
  teethLarge,
  teethSmall,
  angleDeg,
  baseDurationSec = 6.5,
  spinLarge = "forward",
  className,
  largeClassName,
  smallClassName,
}: GearPairProps) {
  // Size each gear by its full viewBox extent so 1 module renders as exactly
  // 1em — otherwise the viewBox padding shrinks the gear and the pair leaves a
  // gap instead of meshing.
  const extentLarge = gearExtent(teethLarge);
  const extentSmall = gearExtent(teethSmall);

  // Pitch circles tangent → centre distance is the sum of pitch radii.
  const distance = pitchRadius(teethLarge) + pitchRadius(teethSmall);
  const radians = (angleDeg * Math.PI) / 180;
  const smallX = distance * Math.cos(radians);
  const smallY = distance * Math.sin(radians);

  const phases = meshPhases(teethLarge, teethSmall, angleDeg);
  const spinSmall = spinLarge === "forward" ? "reverse" : "forward";

  return (
    <div className={cn("pointer-events-none absolute", className)} aria-hidden="true">
      <Gear
        teeth={teethLarge}
        phaseDeg={phases.large}
        spin={spinLarge}
        durationSec={baseDurationSec * teethLarge}
        className={largeClassName}
        style={{
          position: "absolute",
          left: `${-extentLarge}em`,
          top: `${-extentLarge}em`,
          width: `${2 * extentLarge}em`,
          height: `${2 * extentLarge}em`,
        }}
      />
      <Gear
        teeth={teethSmall}
        phaseDeg={phases.small}
        spin={spinSmall}
        durationSec={baseDurationSec * teethSmall}
        className={smallClassName}
        style={{
          position: "absolute",
          left: `${smallX - extentSmall}em`,
          top: `${smallY - extentSmall}em`,
          width: `${2 * extentSmall}em`,
          height: `${2 * extentSmall}em`,
        }}
      />
    </div>
  );
}
