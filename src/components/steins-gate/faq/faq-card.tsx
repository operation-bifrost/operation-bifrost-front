import type { FaqItem } from "@/data/steins-gate";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

interface FaqCardProps {
  item: FaqItem;
  index: number;
}

/**
 * A single FAQ entry styled as a lab terminal panel — a thin chrome bar on top,
 * a stone-gradient glass body, and the question rendered as an amber prompt line
 * (trailing `>`). Mirrors the Terminal/Minimal Glass component in the design.
 */
export function FaqCard({ item, index }: FaqCardProps) {
  const { ref, isVisible } = useReveal<HTMLElement>();

  // Two-column grid: cards in the same row rise together, rows stagger.
  const row = Math.floor(index / 2);

  return (
    <article
      ref={ref}
      className={cn(
        "border-border shadow-button relative flex h-full flex-col overflow-hidden border backdrop-blur-sm",
        "transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0",
      )}
      style={{ transitionDelay: isVisible ? `${row * 90}ms` : "0ms" }}
    >
      {/* Terminal chrome header — thin, empty stone bar */}
      <div className="bg-secondary border-border h-2 border-b" />

      {/* Glass body — stone gradient; question reads as the terminal prompt */}
      <div className="faq-terminal flex flex-1 flex-col gap-6 px-8 py-8 md:gap-7 md:px-10 md:py-9">
        <h3 className="font-krub text-primary text-base leading-relaxed font-bold">
          {item.question}
          <span aria-hidden="true" className="text-primary/70 font-mono">
            {" >"}
          </span>
        </h3>
        <p className="font-krub text-foreground/85 text-base leading-loose">{item.answer}</p>
      </div>
    </article>
  );
}
