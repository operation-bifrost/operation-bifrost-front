import { Button } from "@/components/steins-gate/ui/button";
import { steinsGateContent } from "@/data/steins-gate";
import { FaDownload } from "react-icons/fa6";

export function DownloadCard() {
  const { version, versionDate, downloadCta, warning } = steinsGateContent.download;

  return (
    <div className="download-card border-primary/40 bg-card/80 relative overflow-hidden rounded border backdrop-blur-sm">
      {/* Amber glow behind card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(251, 192, 0, 0.12) 0%, transparent 70%)",
        }}
      />

      {/* Card body */}
      <div className="flex flex-col items-center justify-center gap-6 px-6 py-8 md:flex-row md:gap-6 lg:gap-12 lg:px-48">
        <div className="flex flex-col gap-6">
          {/* Big download CTA */}
          <Button
            variant="primary"
            href={downloadCta.href}
            leadingIcon={FaDownload}
            iconClassName="size-6"
            className="h-auto px-10 py-4 text-lg font-bold md:text-xl"
          >
            {downloadCta.label}
          </Button>

          {/* Version + patch notes */}
          <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-2 text-sm">
            <span>
              {version} ({versionDate})
            </span>
            {/*<span className="text-border">|</span>*/}
            {/*<a
              href={patchNotesHref}
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
            >
              <LuFileText className="h-3.5 w-3.5" />
              {patchNotesLabel}
            </a>*/}
          </div>
        </div>

        {/* Warning text */}
        <p className="font-krub max-w-2xl text-sm leading-relaxed font-bold md:text-base">
          {warning.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              {i < warning.split("\n").length - 1 && <br />}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
