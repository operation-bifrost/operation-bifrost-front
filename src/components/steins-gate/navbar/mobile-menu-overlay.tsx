import { useEffect, useRef, useState, type AnimationEvent } from "react";
import { Button } from "@/components/steins-gate/ui/button";
import { steinsGateContent } from "@/data/steins-gate";
import { cn } from "@/lib/utils";

interface MobileMenuOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenuOverlay({ open, onClose }: MobileMenuOverlayProps) {
  const { navItems, socials, primaryCta } = steinsGateContent.navbar;
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
    }
  }

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) firstLinkRef.current?.focus();
  }, [open]);

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (
      closing &&
      event.target === event.currentTarget &&
      event.animationName === "bifrost-takeover-out"
    ) {
      setMounted(false);
      setClosing(false);
    }
  };

  if (!mounted) return null;

  return (
    <div
      id="navbar-mobile-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      onAnimationEnd={handleAnimationEnd}
      className={cn(
        "mobile-menu-overlay fixed inset-0 z-40 flex flex-col px-6 pt-28 pb-8 lg:hidden",
        closing && "is-closing",
      )}
    >
      <div className="relative z-10 flex h-full flex-col">
        <header className="mobile-menu-rise-1 text-muted-foreground mb-8 flex items-center justify-between font-mono text-[10px] tracking-[0.22em] uppercase">
          <span>{"// Menu"}</span>
          <span className="text-primary inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="bg-primary size-1.5 rounded-full shadow-[0_0_6px_var(--color-nixie-base)]"
            />
            0.571024
          </span>
        </header>

        <ul className="flex flex-col gap-3">
          {navItems.map((item, index) => (
            <li key={item.label} className={`mobile-menu-rise-${index + 2}`}>
              <a
                ref={index === 0 ? firstLinkRef : undefined}
                href={item.href}
                onClick={onClose}
                className="mobile-menu-link focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
              >
                <span className="idx" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="label">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-5">
          <div className="mobile-menu-rise-5 text-muted-foreground flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] uppercase">
            <span>{"// social"}</span>
            <span
              aria-hidden="true"
              className="from-border h-px flex-1 bg-linear-to-r to-transparent"
            />
          </div>

          <ul className="mobile-menu-rise-6 flex items-center gap-2">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <li key={social.label}>
                  <a
                    href={social.href}
                    aria-label={social.label}
                    data-brand={social.brand}
                    className="social-link text-foreground focus-visible:ring-ring inline-flex size-11 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="mobile-menu-rise-7">
            <Button
              variant="primary"
              href={primaryCta.href}
              onClick={onClose}
              className="w-full font-bold"
            >
              {primaryCta.label}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
