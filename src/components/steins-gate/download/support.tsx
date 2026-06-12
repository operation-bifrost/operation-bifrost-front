import { Button } from "@/components/steins-gate/ui/button";
import { steinsGateContent } from "@/data/steins-gate-content";

export function Support() {
  const { supportHeading, supportLinks } = steinsGateContent.download;

  return (
    <div className="mt-16 flex flex-col items-center gap-6 text-center md:mt-20">
      <h3 className="text-foreground text-xl font-bold md:text-2xl">{supportHeading}</h3>

      <div className="flex flex-wrap justify-center gap-4">
        {supportLinks.map((link) => (
          <Button
            key={link.label}
            variant="outlined"
            href={link.href}
            leadingIcon={link.icon}
            iconClassName="size-5"
            external
            className="px-8 py-3 font-bold"
          >
            {link.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
