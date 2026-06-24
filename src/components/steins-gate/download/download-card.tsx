import { Button } from "@/components/steins-gate/ui/button";
import { CountdownTimer } from "@/components/steins-gate/download/countdown-timer";
import { useState } from "react";
import { steinsGateContent } from "@/data/steins-gate";
import { FaDownload } from "react-icons/fa6";

export function DownloadCard() {
  const { version, versionDate, downloadState } = steinsGateContent.download;
  const hasTargetDate = !!downloadState.targetDate;

  const [isExpired, setIsExpired] = useState(() => {
    if (!downloadState.targetDate) return true;
    return new Date(downloadState.targetDate).getTime() <= Date.now();
  });

  const showActiveDownload = hasTargetDate && isExpired;
  const showCountdown = hasTargetDate && !isExpired;
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
        <div className="flex w-full flex-col items-center gap-6">
          {/* Download CTA — active, countdown, or disabled depending on derived state */}
          {showActiveDownload ? (
            <Button
              variant="primary"
              href={downloadState.href}
              leadingIcon={FaDownload}
              iconClassName="size-6"
              className="h-auto px-10 py-4 text-lg font-bold md:text-xl"
            >
              {downloadState.label}
            </Button>
          ) : showCountdown ? (
            <>
              <Button
                variant="primary"
                disabled
                leadingIcon={FaDownload}
                iconClassName="size-6"
                className="h-auto min-w-72 px-10 py-4 text-lg font-bold md:text-xl"
              >
                เร็ว ๆ นี้
              </Button>
              <CountdownTimer
                targetDate={downloadState.targetDate!}
                onComplete={() => setIsExpired(true)}
              />
            </>
          ) : (
            <Button
              variant="primary"
              disabled
              leadingIcon={FaDownload}
              iconClassName="size-6"
              className="h-auto min-w-72 px-10 py-4 text-lg font-bold md:text-xl"
            >
              เร็ว ๆ นี้
            </Button>
          )}

          {/* Version + patch notes */}
          {showActiveDownload && (
            <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-2 text-sm">
              <span>
                {version} ({versionDate})
              </span>
            </div>
          )}
        </div>

        {/* Note text — only shown when provided */}
        {downloadState.note && (
          <p className="font-krub max-w-2xl text-sm leading-relaxed font-bold md:text-base">
            {downloadState.note.split("\n").map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}
