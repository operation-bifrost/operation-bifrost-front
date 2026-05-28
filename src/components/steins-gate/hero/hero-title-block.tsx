import { HeroActions } from "@/components/steins-gate/hero/hero-actions";
import { steinsGateContent } from "@/data/steins-gate-content";

export function HeroTitleBlock() {
  const { h1, tagline } = steinsGateContent.hero;

  return (
    <div className="relative z-10 flex flex-col items-start gap-2 lg:gap-5">
      <h1
        className="bifrost-fade-up-1 max-w-3xl whitespace-pre-line text-3xl font-bold leading-tight text-foreground md:text-4xl xl:text-5xl"
        style={{ textShadow: "var(--hero-text-shadow)" }}
      >
        {h1}
      </h1>

      <p
        className="bifrost-fade-up-2 text-base font-bold text-primary xl:text-xl"
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
