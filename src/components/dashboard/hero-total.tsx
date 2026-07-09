import Counter from "@/components/ui/counter";
import { dashboardContent } from "@/data/dashboard";

interface HeroTotalProps {
  total: number;
  version: string;
  hasData: boolean;
}

export function HeroTotal({ total, version, hasData }: HeroTotalProps) {
  const { hero } = dashboardContent;
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <span className="dash-glow-number font-mono" aria-label={`${hero.label}: ${total}`}>
        <Counter value={total} fontSize={72} gap={4} textColor="inherit" fontWeight={700} />
      </span>
      <p className="text-muted-foreground mt-4 font-mono text-xs tracking-widest uppercase">
        {hero.label} · {version}
      </p>
      {!hasData && (
        <p className="text-primary mt-1 font-mono text-[0.7rem] tracking-[0.3em] uppercase opacity-80">
          {hero.emptyCaption}
        </p>
      )}
    </div>
  );
}
