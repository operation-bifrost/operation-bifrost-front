import { GearPair } from "@/components/steins-gate/decor/gear";

/**
 * Clockwork decor for the Donate section — sits between Credits and the Footer.
 * A single meshing pair winds in from the upper-left gutter so the motif keeps
 * flowing down the page without crowding the QR panel or channel rail. Lives at
 * -z-10 behind the content. md+.
 */
export function DonateDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <GearPair
        className="top-24 -left-2 hidden text-[12px] md:block lg:text-[14px]"
        teethLarge={17}
        teethSmall={12}
        angleDeg={-20}
        spinLarge="reverse"
        largeClassName="text-secondary/25"
        smallClassName="text-secondary/35"
      />
    </div>
  );
}
