import { useEffect, useRef, useState } from "react";

interface UseRevealOptions {
  rootMargin?: string;
  threshold?: number;
}

export function useReveal<T extends Element = HTMLDivElement>({
  rootMargin = "0px 0px -15% 0px",
  threshold = 0.1,
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
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return { ref, isVisible };
}
