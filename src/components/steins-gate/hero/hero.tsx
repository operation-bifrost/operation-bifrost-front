import { HeroBanner } from "@/components/steins-gate/hero/hero-banner";
import { HeroTitleBlock } from "@/components/steins-gate/hero/hero-title-block";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate h-screen overflow-hidden bg-background"
    >
      <HeroBanner />
      <div className="relative mx-auto flex h-full flex-col justify-end px-6 py-24 md:px-20">
        <HeroTitleBlock />
      </div>
    </section>
  );
}
