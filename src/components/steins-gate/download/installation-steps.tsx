import { steinsGateContent } from "@/data/steins-gate";

export function InstallationSteps() {
  const { installSteps } = steinsGateContent.download;

  return (
    <>
      <h3 className="text-foreground mt-16 text-2xl font-bold md:mt-20 md:text-3xl">วิธีติดตั้ง</h3>

      <div className="mt-6 grid gap-6 md:grid-cols-2 md:gap-8">
        {installSteps.map((step) => (
          <div
            key={step.number}
            className="bg-secondary/50 overflow-hidden rounded backdrop-blur-sm"
          >
            {/* Step header */}
            <div className="flex items-baseline gap-3 px-5 py-3">
              <span className="bg-primary text-primary-foreground rounded px-2.5 py-0.5 font-mono text-sm font-bold">
                {step.number}
              </span>
              <p className="text-foreground text-sm/snug md:text-base">{step.title}</p>
            </div>

            {/* Step subtitle */}
            {step.subtitle && (
              <p className="text-muted-foreground px-5 pb-3 text-xs">{step.subtitle}</p>
            )}

            {/* Step screenshot */}
            <div className="bg-background/60 relative aspect-16/10 w-full">
              <img
                src={step.imageSrc}
                alt={step.imageAlt}
                className="size-full object-contain p-4"
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
