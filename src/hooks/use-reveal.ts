import { useEffect, useRef, useState } from "react";

interface UseRevealOptions {
  rootMargin?: string;
  threshold?: number;
  /**
   * When true (default), reveal once and stop observing — for reveal-on-scroll
   * content that should stay visible after the first intersection.
   * When false, `isVisible` tracks the element's current intersection state
   * (toggles back to false when it leaves the viewport) — use this to gate
   * ongoing work (timers/animations) so it pauses while offscreen.
   */
  once?: boolean;
}

export function useReveal<T extends Element = HTMLDivElement>({
  rootMargin = "0px 0px -15% 0px",
  threshold = 0.1,
  once = true,
}: UseRevealOptions = {}) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (once) {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observer.unobserve(entry.target);
            }
          } else {
            setIsVisible(entry.isIntersecting);
          }
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [rootMargin, threshold, once]);

  return { ref, isVisible };
}
