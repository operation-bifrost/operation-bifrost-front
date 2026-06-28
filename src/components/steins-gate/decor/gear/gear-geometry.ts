/**
 * Gear geometry rebuilt from the original hand-drawn gear's own tooth.
 *
 * The original SVG (19 teeth) was sampled into a radial-deviation profile — for
 * one pitch, how far the outline sits above/below the pitch circle, in module
 * units — then averaged across all 19 teeth. Re-tiling this exact profile at any
 * tooth count reproduces the original's short, fat, slightly organic tooth shape
 * while every gear keeps a shared module of 1 unit, so different-sized gears
 * still mesh (see `meshPhases` / `GearPair`).
 *
 * Angles: radians, clockwise from +x (screen space, y-down), matching CSS
 * `rotate()` so a baked `phaseDeg` and the CSS spin share one frame.
 */

const TAU = Math.PI * 2;

/**
 * One tooth of the original gear: radial deviation from the pitch circle, in
 * modules, sampled at 64 even steps across one pitch. Index 0 is the gap centre;
 * the tip sits near the middle. Note the near-symmetric ~0.81-module addendum /
 * dedendum and the faint concavity across the tip — that organic dip is the
 * "character" a clean geometric tooth was missing.
 */
const TOOTH_PROFILE = [
  -0.8057, -0.8055, -0.805, -0.8042, -0.8033, -0.802, -0.8005, -0.7988, -0.7932, -0.7375, -0.6392,
  -0.4934, -0.3218, -0.1433, 0.0423, 0.2348, 0.4358, 0.5951, 0.7067, 0.7811, 0.7937, 0.7919, 0.7901,
  0.7887, 0.7877, 0.7869, 0.7865, 0.7864, 0.7866, 0.7871, 0.7879, 0.7889, 0.7903, 0.7918, 0.7937,
  0.7957, 0.798, 0.8004, 0.8032, 0.8057, 0.7828, 0.708, 0.5959, 0.433, 0.2326, 0.0404, -0.1449,
  -0.3191, -0.4763, -0.5926, -0.6892, -0.7508, -0.7838, -0.7914, -0.7939, -0.7961, -0.7981, -0.7999,
  -0.8015, -0.8028, -0.8039, -0.8047, -0.8053, -0.8056,
];
const PROFILE_N = TOOTH_PROFILE.length;

/** Tooth tip centre, as a fraction of one pitch from the gap centre (index 0). */
const TOOTH_CENTER_FRACTION = 0.461;

/**
 * The original gear's interior, lifted verbatim: one rounded-sector gap (the
 * dark wedge between two spokes), as [x, y] points normalised to the root radius
 * and centred on angle 0. Replicated `INNER_GAP_COUNT` times and cut — together
 * with the bore — from the teeth disk by evenodd, this reproduces the original's
 * thick rim, thin straight spokes, hub and centre bore at any gear size.
 */
const INNER_GAP: ReadonlyArray<readonly [number, number]> = [
  [0.6087, -0.3097],
  [0.6238, -0.2787],
  [0.6371, -0.2476],
  [0.6487, -0.2165],
  [0.6586, -0.1853],
  [0.6668, -0.154],
  [0.6734, -0.1226],
  [0.6783, -0.091],
  [0.6817, -0.0592],
  [0.6834, -0.0272],
  [0.6836, 0.0051],
  [0.6822, 0.0377],
  [0.6792, 0.0706],
  [0.6748, 0.1038],
  [0.6688, 0.1374],
  [0.6614, 0.1715],
  [0.6525, 0.206],
  [0.6352, 0.1975],
  [0.6179, 0.1891],
  [0.6006, 0.1807],
  [0.5833, 0.1724],
  [0.5661, 0.1641],
  [0.549, 0.1559],
  [0.5319, 0.1478],
  [0.5148, 0.1397],
  [0.4978, 0.1317],
  [0.4809, 0.1237],
  [0.4641, 0.1157],
  [0.4474, 0.1079],
  [0.4308, 0.1],
  [0.4143, 0.0922],
  [0.3979, 0.0845],
  [0.3816, 0.0768],
  [0.3804, 0.0632],
  [0.3792, 0.0497],
  [0.378, 0.0363],
  [0.3768, 0.0229],
  [0.3756, 0.0095],
  [0.3744, -0.0038],
  [0.3732, -0.0171],
  [0.372, -0.0304],
  [0.3708, -0.0438],
  [0.3696, -0.0572],
  [0.3683, -0.0707],
  [0.3671, -0.0843],
  [0.3659, -0.098],
  [0.3647, -0.1117],
  [0.3634, -0.1256],
  [0.3622, -0.1397],
];
const INNER_GAP_COUNT = 6;
const INNER_BORE_RATIO = 0.198; // bore radius as a fraction of the root radius

/** Tooth proportions in modules, derived from the sampled profile. */
export const ADDENDUM = Math.max(...TOOTH_PROFILE); // tooth height above the pitch circle (~0.81)
const DEDENDUM = -Math.min(...TOOTH_PROFILE); // tooth depth below the pitch circle (~0.81)

/** Breathing room added around the tip circle in the viewBox, in modules. */
export const VIEWBOX_PAD = 0.5;

/** Half the viewBox extent for a gear, in modules (tip radius + pad). */
export function gearExtent(teeth: number): number {
  return teeth / 2 + ADDENDUM + VIEWBOX_PAD;
}

/** Pitch radius — the meshing radius — for a gear, in modules. */
export function pitchRadius(teeth: number): number {
  return teeth / 2;
}

const round = (n: number): number => Math.round(n * 1000) / 1000;

function point(radius: number, angle: number): string {
  return `${round(radius * Math.cos(angle))} ${round(radius * Math.sin(angle))}`;
}

function xy(x: number, y: number): string {
  return `${round(x)} ${round(y)}`;
}

/** Full circle centred on the origin, as an SVG subpath. */
function circle(radius: number): string {
  const r = round(radius);
  return `M ${r} 0 A ${r} ${r} 0 1 1 ${-r} 0 A ${r} ${r} 0 1 1 ${r} 0 Z`;
}

export interface GearSpec {
  teeth: number;
  /** Clocking rotation baked into the geometry, in degrees. */
  phaseDeg?: number;
}

export interface GearGeometry {
  viewBox: string;
  /** Tip (outer) radius, in modules. */
  tipRadius: number;
  /** Pitch radius (= teeth / 2), in modules. The meshing radius. */
  pitchRadius: number;
  /** Whole gear — teeth disk with the rim/spoke gaps and bore cut out (evenodd). */
  path: string;
}

export function buildGear(spec: GearSpec): GearGeometry {
  const teeth = Math.max(6, Math.round(spec.teeth));
  const phase = ((spec.phaseDeg ?? 0) * Math.PI) / 180;

  const pitch = teeth / 2;
  const tipRadius = pitch + ADDENDUM;
  const rootRadius = Math.max(0.4, pitch - DEDENDUM);
  const pitchAngle = TAU / teeth;

  // Teeth disk: the sampled tooth profile re-tiled once per tooth.
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    for (let j = 0; j < PROFILE_N; j++) {
      const a = phase + (i + j / PROFILE_N) * pitchAngle;
      pts.push(point(pitch + TOOTH_PROFILE[j], a));
    }
  }
  let path = `M ${pts[0]} L ${pts.slice(1).join(" L ")} Z`;

  // Interior: the original sector gap, scaled to this gear's root radius and
  // stamped at each spoke position, plus the centre bore. Cut from the disk
  // by evenodd, the solid remainder is the rim, spokes and hub.
  for (let k = 0; k < INNER_GAP_COUNT; k++) {
    const rot = phase + (k * TAU) / INNER_GAP_COUNT;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    const gap = INNER_GAP.map(([gx, gy]) => {
      const x = gx * rootRadius;
      const y = gy * rootRadius;
      return xy(x * cos - y * sin, x * sin + y * cos);
    });
    path += ` M ${gap[0]} L ${gap.slice(1).join(" L ")} Z`;
  }
  path += ` ${circle(INNER_BORE_RATIO * rootRadius)}`;

  const half = round(tipRadius + VIEWBOX_PAD);
  return {
    viewBox: `${-half} ${-half} ${2 * half} ${2 * half}`,
    tipRadius,
    pitchRadius: pitch,
    path,
  };
}

export interface MeshPhases {
  /** Phase (deg) for the gear at the origin — a tooth aimed at its partner. */
  large: number;
  /** Phase (deg) for the partner gear — a gap aimed back at the origin. */
  small: number;
}

/**
 * Clocking offsets that drop one gear's teeth into the other's gaps along the
 * line of centres. `angleDeg` is the direction (screen clockwise from +x) from
 * the large gear's centre toward the small gear's centre. The profile is
 * gap-centred (index 0 = gap), so the tooth sits `TOOTH_CENTER_FRACTION` of a
 * pitch along — offset the large gear by that to aim a tooth, not a gap.
 */
export function meshPhases(teethLarge: number, teethSmall: number, angleDeg: number): MeshPhases {
  const pitchLarge = 360 / teethLarge;
  const pitchSmall = 360 / teethSmall;
  const mod = (x: number, m: number): number => ((x % m) + m) % m;
  return {
    large: mod(angleDeg - TOOTH_CENTER_FRACTION * pitchLarge, pitchLarge), // tooth toward partner
    small: mod(angleDeg + 180, pitchSmall), // gap centred back toward partner
  };
}
