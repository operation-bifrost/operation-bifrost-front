import { steinsGateContent } from "@/data/steins-gate-content";

export function HeroBanner() {
  const { bgLargeSrc, bgMediumSrc, bgSmallSrc } = steinsGateContent.hero;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <picture className="contents">
        <source media="(max-width: 767px)" srcSet={bgSmallSrc} />
        <source media="(max-width: 1023px)" srcSet={bgMediumSrc} />
        <img
          src={bgLargeSrc}
          alt=""
          width={2335}
          height={1080}
          className="absolute inset-0 size-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
        />
      </picture>

      <div className="absolute inset-0 bg-linear-to-b from-transparent from-40% via-background/40 via-60% to-background" />
    </div>
  );
}
