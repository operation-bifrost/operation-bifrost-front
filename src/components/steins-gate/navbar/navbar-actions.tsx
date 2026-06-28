import { Button } from "@/components/steins-gate/ui/button";
import { steinsGateContent } from "@/data/steins-gate";

export function NavbarActions() {
  const { socials, primaryCta } = steinsGateContent.navbar;

  return (
    <div className="flex items-center gap-6">
      <ul className="flex items-center gap-4">
        {socials.map((social) => {
          const Icon = social.icon;
          return (
            <li key={social.label}>
              <a
                href={social.href}
                aria-label={social.label}
                data-brand={social.brand}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link text-foreground focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:outline-none"
              >
                <Icon className="size-5" aria-hidden="true" />
              </a>
            </li>
          );
        })}
      </ul>

      <Button variant="primary" className="font-bold" href={primaryCta.href}>
        {primaryCta.label}
      </Button>
    </div>
  );
}
