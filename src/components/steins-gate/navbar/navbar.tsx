import { useEffect, useRef, useState } from "react";
import { MobileMenuOverlay } from "@/components/steins-gate/navbar/mobile-menu-overlay";
import { NavbarActions } from "@/components/steins-gate/navbar/navbar-actions";
import { NavbarBrand } from "@/components/steins-gate/navbar/navbar-brand";
import { NavbarMenu } from "@/components/steins-gate/navbar/navbar-menu";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement | null>(null);
  const wasOpenRef = useRef(false);

  // Restore focus to the burger when the overlay closes (Escape key path).
  useEffect(() => {
    if (wasOpenRef.current && !mobileMenuOpen) {
      burgerRef.current?.focus();
    }
    wasOpenRef.current = mobileMenuOpen;
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Outer wrapper is fixed so the nav floats over the hero (bg image
          extends behind it). px-* gives the gutter; the inner nav centers
          itself inside. */}
      <div className="fixed inset-x-0 top-4 z-50 px-4 lg:top-6 lg:px-12">
        <nav
          aria-label="Main navigation"
          className={cn(
            "2xl:max-w-8xl relative mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-md px-4 py-2 backdrop-blur lg:px-8 xl:gap-8",
            mobileMenuOpen
              ? "border border-transparent shadow-none"
              : "border-border shadow-button border",
          )}
          style={{
            background: mobileMenuOpen ? "transparent" : "var(--navbar-gradient)",
          }}
        >
          <NavbarBrand />

          {/* Right side: menu + socials + CTA bundled together with gap 8
              (32px), matching the design's single right-aligned group. */}
          <div className="hidden items-center gap-4 lg:flex xl:gap-8">
            <NavbarMenu />
            <NavbarActions />
          </div>

          <button
            ref={burgerRef}
            type="button"
            aria-label={mobileMenuOpen ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={mobileMenuOpen}
            aria-controls="navbar-mobile-panel"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="mobile-menu-burger text-foreground focus-visible:ring-ring inline-flex size-10 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:outline-none lg:hidden"
          >
            <span className="bar" aria-hidden="true" />
            <span className="bar" aria-hidden="true" />
            <span className="bar" aria-hidden="true" />
          </button>
        </nav>
      </div>

      <MobileMenuOverlay open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
