import { HeroBanner } from "@/components/steins-gate/hero/hero-banner";
import { HeroTitleBlock } from "@/components/steins-gate/hero/hero-title-block";

export function Hero() {
  return (
    <section id="hero" className="bg-background relative isolate h-screen overflow-hidden">
      <HeroBanner />
      {/* Container mirrors the navbar (outer px-4 lg:px-12 gutter + inner
          mx-auto max-w-7xl px-4 lg:px-8) so the title's start edge tracks the
          navbar content at every width, including ultra-wide viewports where a
          flat padding would drift left of the centered, max-w-7xl nav. */}
      <div className="relative flex h-full flex-col justify-end px-4 py-24 lg:px-12">
        <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
          <HeroTitleBlock />
        </div>
      </div>
    </section>
  );
}
