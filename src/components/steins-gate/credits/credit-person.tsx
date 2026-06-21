import type { CreditPerson as CreditPersonData } from "@/data/steins-gate-content";

interface CreditPersonProps {
  person: CreditPersonData;
}

/**
 * A single credited person — name with inline social-icon links and an optional
 * role beneath. Used for both lab members and partners. Social links reuse the
 * `.social-link` theme class so each brand ignites in its own colour on hover.
 */
export function CreditPerson({ person }: CreditPersonProps) {
  return (
    <div className="flex flex-col items-start gap-1 text-left">
      {/* Name + socials flow as one inline run so the icons stay on the name's
          line (following the last word when a long name wraps) rather than
          floating beside a multi-line name. */}
      <p className="text-foreground font-bold whitespace-nowrap">
        {person.name}

        {person.socials && person.socials.length > 0 && (
          <span className="ml-2 inline-flex items-center gap-2 align-middle">
            {person.socials.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${person.name} — ${social.label}`}
                  className="text-muted-foreground inline-flex transition-transform duration-300 ease-out hover:-translate-y-1 focus-visible:-translate-y-1"
                >
                  <Icon className="size-4" aria-hidden="true" />
                </a>
              );
            })}
          </span>
        )}
      </p>

      {person.role && <span className="text-muted-foreground text-sm">{person.role}</span>}
    </div>
  );
}
