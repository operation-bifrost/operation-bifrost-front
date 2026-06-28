import { GearPair } from "@/components/steins-gate/decor/gear";

/**
 * Clockwork decor for the FAQ section. A single restrained meshing pair in the
 * left gutter keeps the page's gear motif bleeding through the Download → FAQ
 * seam without competing with the two-column card grid. Lives at -z-10 behind
 * the cards, which carry their own backdrop blur. md+ only to avoid mobile clutter.
 */
export function FaqDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <GearPair
        className="top-24 -left-6 hidden text-[12px] md:block lg:text-[14px]"
        teethLarge={17}
        teethSmall={12}
        angleDeg={32}
        spinLarge="forward"
        largeClassName="text-secondary/25"
        smallClassName="text-secondary/35"
      />
    </div>
  );
}
