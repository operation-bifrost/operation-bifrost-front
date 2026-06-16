import { SectionHeading } from "@/components/steins-gate/ui/section-heading";
import { steinsGateContent } from "@/data/steins-gate-content";
import { DownloadCard } from "@/components/steins-gate/download/download-card";
import { InstallationSteps } from "@/components/steins-gate/download/installation-steps";
import { Support } from "@/components/steins-gate/download/support";

export function Download() {
  const { eyebrow, heading } = steinsGateContent.download;

  return (
    <section
      id="download"
      className="bg-background relative isolate overflow-hidden py-8 md:py-10 lg:py-12"
    >
      <div className="relative mx-auto max-w-7xl px-6 md:px-12 lg:px-20">
        {/* Section heading — full width, left-aligned */}
        <SectionHeading heading={heading} eyebrow={eyebrow} className="mb-10 md:mb-14" />

        <DownloadCard />
        <InstallationSteps />
        <Support />
      </div>
    </section>
  );
}
