import { steinsGateContent } from "@/data/steins-gate";
import { cn } from "@/lib/utils";

interface BifrostLockupProps {
  /** Sizing / positioning classes. Set a height (e.g. `h-12`); width tracks via `w-auto`. */
  className?: string;
  /** Accessible name. Leave empty when a labeled ancestor already names it — the image renders decorative. */
  alt?: string;
  loading?: "eager" | "lazy";
}

// Intrinsic size of the exported color lockup
// (public/images/steins-gate/bifrost-typo-logo-color.webp) — kept for CLS-free layout.
const WIDTH = 1080;
const HEIGHT = 360;

/** The full "Operation Bifrost" color lockup (typographic logo + gear/rainbow mark). */
export function BifrostLockup({ className, alt = "", loading = "eager" }: BifrostLockupProps) {
  const { wordmarkSrc } = steinsGateContent.navbar.brand;

  return (
    <img
      src={wordmarkSrc}
      alt={alt}
      aria-hidden={alt === "" || undefined}
      width={WIDTH}
      height={HEIGHT}
      className={cn("w-auto", className)}
      loading={loading}
    />
  );
}
