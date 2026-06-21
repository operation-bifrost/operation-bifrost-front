import { GearPair } from "@/components/steins-gate/decor/gear";

/**
 * Clockwork decor for the Credits section — the page's outro. A single small
 * meshing pair winds off the lower-right edge so the gear motif carries to the
 * very bottom of the page. Lives at -z-10 behind the roster. md+ only.
 */
export function CreditsDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <GearPair
        className="-right-4 bottom-10 hidden text-[12px] md:block lg:text-[14px]"
        teethLarge={17}
        teethSmall={12}
        angleDeg={210}
        spinLarge="reverse"
        largeClassName="text-secondary/25"
        smallClassName="text-secondary/35"
      />
    </div>
  );
}
