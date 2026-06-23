import { FeatureRow } from "@/components/steins-gate/features/feature-row";
import { FeaturesDecor } from "@/components/steins-gate/features/features-decor";
import { steinsGateContent } from "@/data/steins-gate";

export function Features() {
  const { items } = steinsGateContent.features;

  return (
    <section id="features" className="relative py-8 md:py-10 lg:py-12">
      <FeaturesDecor />

      {/* isolate keeps the feature-row z-cascade (10/20/30) contained here
          and above the -z-10 decor, now that the section is no longer isolated. */}
      <div className="2xl:max-w-8xl relative isolate mx-auto max-w-7xl px-6 md:px-12 lg:px-20">
        <div className="flex flex-col lg:gap-4">
          {items.map((item, index) => (
            <FeatureRow key={item.terminalSlug} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
