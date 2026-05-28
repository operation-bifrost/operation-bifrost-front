import { LuArrowDown } from "react-icons/lu";
import { Button } from "@/components/steins-gate/ui/button";
import { steinsGateContent } from "@/data/steins-gate-content";

export function HeroActions() {
  const { detailsCta, downloadCta } = steinsGateContent.hero;

  return (
    <div className="flex gap-3 md:w-full">
      <Button
        variant="outlined"
        href={detailsCta.href}
        trailingIcon={LuArrowDown}
        iconStrokeWidth={2.75}
        className="font-bold"
      >
        {detailsCta.label}
      </Button>
      <Button
        variant="primary"
        href={downloadCta.href}
        className="font-bold"
      >
        {downloadCta.label}
      </Button>
    </div>
  );
}
