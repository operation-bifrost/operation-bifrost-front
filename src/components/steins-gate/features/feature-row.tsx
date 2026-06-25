import { useState, useEffect } from "react";
import { LuCheck } from "react-icons/lu";
import { FeatureTerminal } from "@/components/steins-gate/features/feature-terminal";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { useReveal } from "@/hooks/use-reveal";
import { useComposedRefs } from "@/lib/compose-refs";
import type { FeatureItem } from "@/data/steins-gate";
import { cn } from "@/lib/utils";

interface FeatureRowProps {
  item: FeatureItem;
  index: number;
}

const CASCADE = [
  {
    rowMargin: "",
    terminalAnchor: "lg:-right-[0%]",
    zIndex: 10,
  },
  {
    rowMargin: "mt-8 md:mt-12 lg:-mt-36",
    terminalAnchor: "lg:right-[10%]",
    zIndex: 20,
  },
  {
    rowMargin: "mt-8 md:mt-12 lg:-mt-36",
    terminalAnchor: "lg:-right-[5%]",
    zIndex: 30,
  },
] as const;

const TEXT_PROGRESS_RANGE = [0, 0.55] as const;
const TERMINAL_PROGRESS_RANGE = [0.25, 0.95] as const;

function slice(progress: number, [start, end]: readonly [number, number]) {
  if (end <= start) return progress >= end ? 1 : 0;
  return Math.max(0, Math.min(1, (progress - start) / (end - start)));
}

export function FeatureRow({ item, index }: FeatureRowProps) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handler);

    const timeoutId = setTimeout(() => {
      setIsMobile(mediaQuery.matches);
    }, 0);

    return () => {
      mediaQuery.removeEventListener("change", handler);
      clearTimeout(timeoutId);
    };
  }, []);

  const { ref: scrollRef, progress } = useScrollProgress<HTMLDivElement>({
    startTopRatio: 0.95,
    endTopRatio: 0.25,
    disabled: isMobile,
  });

  const { ref: revealRef, isVisible } = useReveal<HTMLDivElement>({
    rootMargin: "0px 0px -10% 0px",
    threshold: 0.05,
  });

  const composedRef = useComposedRefs(scrollRef, revealRef);
  const cascade = CASCADE[index] ?? CASCADE[0];

  const textT = slice(progress, TEXT_PROGRESS_RANGE);
  const terminalT = slice(progress, TERMINAL_PROGRESS_RANGE);
  return (
    <div
      ref={composedRef}
      className={cn("relative", cascade.rowMargin)}
      style={{ zIndex: cascade.zIndex }}
    >
      <div className="lg:relative lg:flex lg:min-h-[440px] lg:items-center">
        <div
          className={cn(
            "relative z-20 flex flex-col gap-5 lg:w-[42%] lg:will-change-[opacity,transform]",
            isMobile && "features-reveal",
            isMobile && isVisible && "is-visible",
          )}
          style={
            isMobile
              ? undefined
              : {
                  opacity: textT,
                  transform: `translateY(${(1 - textT) * 28}px)`,
                }
          }
        >
          <span className="border-primary/45 bg-primary/5 text-primary inline-flex items-center gap-1.5 self-start border px-2.5 py-1 font-mono text-[11px] tracking-[0.22em] uppercase">
            <span aria-hidden="true" className="text-primary/70 font-medium">
              [
            </span>
            {item.tag}
            <span aria-hidden="true" className="text-primary/70 font-medium">
              ]
            </span>
          </span>

          <h3 className="text-foreground text-2xl/tight font-bold md:text-3xl lg:text-[2rem]">
            {item.title}
          </h3>

          <p className="text-foreground/85 text-base/relaxed whitespace-pre-line md:text-lg">
            {item.description}
          </p>

          {item.bullets && (
            <ul className="mt-2 flex flex-col gap-1">
              {item.bullets.map((bullet) => (
                <li key={bullet} className="text-foreground/90 flex items-center gap-3">
                  <span className="border-primary/60 bg-primary/10 text-primary grid size-5 place-items-center border">
                    <LuCheck className="size-3" aria-hidden="true" />
                  </span>
                  <span className="text-base">{bullet}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          className={cn(
            "relative z-10 mt-10 lg:absolute lg:top-1/2 lg:mt-0 lg:w-[56%] lg:-translate-y-1/2 xl:w-[58%]",
            cascade.terminalAnchor,
          )}
        >
          <div
            className={cn(
              "lg:will-change-[opacity,transform]",
              isMobile && "features-reveal",
              isMobile && isVisible && "is-visible",
            )}
            style={
              isMobile
                ? undefined
                : {
                    opacity: terminalT,
                    transform: `translateY(${(1 - terminalT) * 56}px)`,
                  }
            }
          >
            <FeatureTerminal label={item.terminalLabel} comparison={item.comparison} />
          </div>
        </div>
      </div>
    </div>
  );
}
