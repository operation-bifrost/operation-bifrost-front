import { DivergenceRail } from "@/components/steins-gate/decor/divergence-rail";
import { GearPair } from "@/components/steins-gate/decor/gear";

export function GalleryDecor() {
  return (
    <>
      {/* Top-left meshing pair — large gear bleeds off the top-left into Features,
          small gear sits down-right of it so the mesh contact is on-screen.
          Scaled via font-size (1 module = 1em). lg only. */}
      <GearPair
        className="-top-16 left-6 -z-10 hidden text-[14px] lg:block"
        teethLarge={18}
        teethSmall={14}
        angleDeg={35}
        spinLarge="reverse"
        largeClassName="text-secondary/30"
        smallClassName="text-secondary/40"
      />

      {/* Bottom decor — not clipped, so the bottom-right pair bleeds past the
          section seam into Download. Horizontal scrollbar is held off by the
          page wrapper's overflow-x-clip (see steins-gate/index.astro). */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute bottom-1/4 left-10 origin-center -translate-x-1/4 rotate-90 opacity-40 select-none md:opacity-60">
          <DivergenceRail value="0.571024%" />
        </div>

        {/* Bottom-right meshing pair — large gear bleeds down past the seam into
            Download, small gear sits up-left so the mesh contact stays on-screen. */}
        <GearPair
          className="right-8 -bottom-16 text-[12px] md:text-[14px]"
          teethLarge={20}
          teethSmall={13}
          angleDeg={208}
          spinLarge="reverse"
          largeClassName="text-secondary/30"
          smallClassName="text-secondary/40"
        />
      </div>
    </>
  );
}
