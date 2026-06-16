import { DivergenceRail } from "@/components/steins-gate/decor/divergence-rail";
import { GearIcon } from "@/components/steins-gate/decor/gear-icon";

export function GalleryDecor() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-36 left-2 -z-10 hidden md:left-6 lg:left-10 lg:block"
      >
        {/* Smaller gear — upper-left, behind section title */}
        <GearIcon
          className="text-secondary/40 absolute top-0 left-0 size-36 -rotate-[31deg] md:size-44 lg:size-56"
          spin="forward"
          durationSec={60}
        />
        {/* Larger gear — below-right, teeth meshing with the smaller gear */}
        <GearIcon
          className="text-secondary/30 absolute top-24 left-16 size-44 rotate-[11deg] md:top-28 md:left-20 md:size-56 lg:top-36 lg:left-28 lg:size-72"
          spin="reverse"
          durationSec={130}
        />
      </div>

      {/* Bottom decor — not clipped, so the bottom-right gears bleed past the
          section seam into Download. Horizontal scrollbar is held off by the
          page wrapper's overflow-x-clip (see steins-gate/index.astro). */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute bottom-1/4 left-10 origin-center -translate-x-1/4 rotate-90 opacity-40 select-none md:opacity-60">
          <DivergenceRail value="0.571024%" />
        </div>

        {/* Bottom-right gears — matched to en1At in design */}
        <div className="absolute -right-24 -bottom-36 size-[28rem] -rotate-[31deg]">
          <GearIcon
            className="text-secondary/30 absolute top-[9rem] left-[8rem] size-[20rem]"
            spin="reverse"
            durationSec={130}
          />
          <GearIcon
            className="text-secondary/40 absolute -top-6 left-[14rem] size-[12.5rem] -rotate-[22deg]"
            spin="forward"
            durationSec={60}
          />
        </div>
      </div>
    </>
  );
}
