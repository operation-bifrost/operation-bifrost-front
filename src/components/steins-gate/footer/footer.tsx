import { DiscordCard } from "@/components/steins-gate/footer/discord-card";
import { BifrostWordmark } from "@/components/steins-gate/ui/bifrost-wordmark";
import { steinsGateContent } from "@/data/steins-gate";

export function Footer() {
  const { navItems, socials } = steinsGateContent.navbar;
  const { tagline } = steinsGateContent.footer;

  return (
    <footer
      id="site-footer"
      className="border-border from-card/40 to-background relative mt-8 border-t bg-linear-to-b"
    >
      <div className="wide:max-w-8xl mx-auto max-w-7xl px-6 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-12 py-12 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16 lg:py-16">
          {/* Identity column */}
          <div className="flex flex-col items-start gap-6">
            <BifrostWordmark size={28} />
            <p className="text-muted-foreground max-w-md text-sm/relaxed">{tagline}</p>

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

            <nav aria-label="Footer">
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="text-muted-foreground hover:text-primary text-sm transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Community column — live Discord card */}
          <div className="flex flex-col gap-4 lg:items-end">
            <DiscordCard />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-border mx-auto flex max-w-7xl flex-col gap-3 border-t py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Operation Bifrost
          </p>
        </div>
      </div>
    </footer>
  );
}
