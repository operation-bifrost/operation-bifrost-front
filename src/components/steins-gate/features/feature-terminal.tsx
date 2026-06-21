import {
  CompareSlider,
  CompareSliderAfter,
  CompareSliderBefore,
  CompareSliderHandle,
} from "@/components/ui/compare-slider";
import type { FeatureItem } from "@/data/steins-gate";
import { cn } from "@/lib/utils";

interface FeatureTerminalProps {
  label?: string;
  comparison: FeatureItem["comparison"];
  className?: string;
}

export function FeatureTerminal({ label, comparison, className }: FeatureTerminalProps) {
  return (
    <div className={cn("group relative", className)}>
      <div className="border-border bg-card/60 shadow-button relative overflow-hidden border backdrop-blur-sm">
        <div className="border-border bg-secondary flex items-center justify-between border-b px-4 py-2">
          <span className="text-primary/90 flex items-center gap-2 font-mono text-xs md:text-sm">
            <span aria-hidden="true" className="bg-primary size-1.5" />
            {label && (
              <>
                {label}
                <span
                  aria-hidden="true"
                  className="bg-primary/80 typing ml-0.5 inline-block h-3 w-2"
                />
              </>
            )}
          </span>
        </div>

        <div className="relative aspect-video">
          <CompareSlider defaultValue={50} className="absolute inset-0 size-full bg-black">
            <CompareSliderBefore>
              <img
                src={comparison.beforeSrc}
                alt={comparison.beforeAlt}
                className="size-full object-cover"
                draggable={false}
              />
            </CompareSliderBefore>
            <CompareSliderAfter>
              <img
                src={comparison.afterSrc}
                alt={comparison.afterAlt}
                className="size-full object-cover"
                draggable={false}
              />
            </CompareSliderAfter>

            <span className="border-border bg-background/80 pointer-events-none absolute top-2 left-2 z-40 rounded-md border px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
              ต้นฉบับ
            </span>
            <span className="border-border bg-background/80 pointer-events-none absolute top-2 right-2 z-40 rounded-md border px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
              แปลไทย
            </span>
            <CompareSliderHandle className="[&_[data-slot=compare-slider-handle]>div]:bg-primary/90">
              <div className="bg-primary/90 absolute top-0 left-1/2 h-full w-px -translate-x-1/2 shadow-[0_0_12px_var(--color-primary)]" />
              <div className="border-primary/80 bg-background/90 text-primary relative z-10 grid size-9 place-items-center rounded-full border shadow-[0_0_18px_color-mix(in_oklch,var(--color-primary)_55%,transparent)]">
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-4">
                  <path
                    d="M7 5 3 10l4 5M13 5l4 5-4 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                  />
                </svg>
              </div>
            </CompareSliderHandle>
          </CompareSlider>
        </div>
      </div>
    </div>
  );
}
