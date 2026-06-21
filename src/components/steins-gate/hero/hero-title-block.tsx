import { HeroActions } from "@/components/steins-gate/hero/hero-actions";
import { steinsGateContent } from "@/data/steins-gate";

export function HeroTitleBlock() {
  const { h1, tagline } = steinsGateContent.hero;

  return (
    <div className="relative z-10 flex flex-col items-start gap-2 lg:gap-5">
      <h1
        className="bifrost-fade-up-1 text-foreground max-w-3xl text-3xl leading-tight font-bold whitespace-pre-line md:text-4xl xl:text-5xl"
        style={{ textShadow: "var(--hero-text-shadow)" }}
      >
        {h1}
      </h1>

      <p
        className="bifrost-fade-up-2 text-primary text-base font-bold xl:text-xl"
        style={{ textShadow: "var(--hero-text-shadow)" }}
      >
        {tagline}
      </p>

      <div className="bifrost-fade-up-3 pt-3">
        <HeroActions />
      </div>
    </div>
  );
}
