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
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {hero.label}
      </span>
      <span role="img" aria-label={`${hero.label}: ${total}`} className="text-foreground">
        <span aria-hidden="true">
          <Counter value={total} fontSize={56} gap={2} fontWeight={700} gradientHeight={0} />
        </span>
      </span>
      <span className="text-muted-foreground text-sm">
        {version}
        {!hasData && ` · ${hero.emptyCaption}`}
      </span>
    </div>
  );
}
