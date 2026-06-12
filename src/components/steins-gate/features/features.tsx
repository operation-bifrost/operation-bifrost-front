import { FeatureRow } from "@/components/steins-gate/features/feature-row";
import { FeaturesDecor } from "@/components/steins-gate/features/features-decor";
import { steinsGateContent } from "@/data/steins-gate-content";

export function Features() {
  const { items } = steinsGateContent.features;

  return (
    <section
      id="features"
      className="bg-background relative isolate overflow-hidden py-8 md:py-10 lg:py-12"
    >
      <FeaturesDecor />

      <div className="relative mx-auto max-w-7xl px-6 md:px-12 lg:px-20">
        <div className="flex flex-col lg:gap-4">
          {items.map((item, index) => (
            <FeatureRow key={item.terminalSlug} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
