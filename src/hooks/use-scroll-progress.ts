import { useEffect, useRef, useState } from "react";

interface UseScrollProgressOptions {
  startTopRatio?: number;
  endTopRatio?: number;
}

export function useScrollProgress<T extends HTMLElement = HTMLDivElement>({
  startTopRatio = 0.92,
  endTopRatio = 0.4,
}: UseScrollProgressOptions = {}) {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      setProgress(1);
      return;
    }

    let rafId: number | null = null;
    let lastValue = -1;

    const update = () => {
      rafId = null;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;
      const startY = vh * startTopRatio;
      const endY = vh * endTopRatio;
      const range = startY - endY;
      if (range <= 0) {
        setProgress(1);
        return;
      }
      const raw = (startY - rect.top) / range;
      const clamped = Math.max(0, Math.min(1, raw));
      if (Math.abs(clamped - lastValue) > 0.001) {
        lastValue = clamped;
        setProgress(clamped);
      }
    };

    const schedule = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [startTopRatio, endTopRatio]);

  return { ref, progress };
}
