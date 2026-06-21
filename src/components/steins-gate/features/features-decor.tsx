import { DivergenceRail } from "@/components/steins-gate/decor/divergence-rail";
import { Gear } from "@/components/steins-gate/decor/gear";
import { steinsGateContent } from "@/data/steins-gate";

export function FeaturesDecor() {
  const { divergence } = steinsGateContent.features;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {/* Lone ambient gears — scattered, not meshing pairs. */}
      <Gear
        teeth={22}
        className="text-secondary/40 absolute top-[2%] right-[6%] size-44 md:size-64 lg:size-[22rem]"
        spin="forward"
        durationSec={150}
      />
      <Gear
        teeth={16}
        className="text-secondary/35 absolute top-[42%] left-[4%] size-36 md:size-52 lg:size-[18rem]"
        spin="reverse"
        durationSec={104}
      />
      <Gear
        teeth={26}
        className="text-secondary/45 absolute bottom-[6%] left-[36%] size-48 md:size-72 lg:size-[24rem]"
        spin="forward"
        durationSec={170}
      />

      <div className="absolute top-1/2 right-0 origin-center translate-y-[-80%] rotate-90 opacity-60 select-none md:opacity-80">
        <DivergenceRail value={divergence} />
      </div>
    </div>
  );
}
