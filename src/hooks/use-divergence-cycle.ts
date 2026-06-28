import { useEffect, useState } from "react";

interface UseDivergenceCycleOptions {
  finalValue: string;
  isActive: boolean;
  durationMs?: number;
  cycleIntervalMs?: number;
  replayIntervalMs?: number;
}

function getRandomDigit(): string {
  return Math.floor(Math.random() * 10).toString();
}

function buildDisplay(
  prefix: string,
  finalDigits: string,
  suffix: string,
  revealedCount: number,
): string {
  let result = prefix;
  for (let i = 0; i < finalDigits.length; i++) {
    result += i < revealedCount ? finalDigits[i] : getRandomDigit();
  }
  return result + suffix;
}

export function useDivergenceCycle({
  finalValue,
  isActive,
  durationMs = 4000,
  cycleIntervalMs = 50,
  replayIntervalMs = 30_000,
}: UseDivergenceCycleOptions): string {
  const [display, setDisplay] = useState(finalValue);

  useEffect(() => {
    if (!isActive) return;

    // Respect reduced-motion: show the final value, skip the scramble entirely.
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setDisplay(finalValue);
      return;
    }

    const dotIndex = finalValue.indexOf(".");
    const suffixMatch = finalValue.match(/[^\d]+$/);
    const suffix = suffixMatch ? suffixMatch[0] : "";
    const prefix = dotIndex >= 0 ? finalValue.slice(0, dotIndex + 1) : "";
    const finalDigits = finalValue.slice(prefix.length, finalValue.length - suffix.length);

    if (finalDigits.length === 0) {
      setDisplay(finalValue);
      return;
    }

    const timePerDigit = durationMs / finalDigits.length;
    let cycleInterval: ReturnType<typeof setInterval> | null = null;
    let replayTimeout: ReturnType<typeof setTimeout> | null = null;

    function runCycle() {
      const startTime = Date.now();
      cycleInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const revealed = Math.floor(elapsed / timePerDigit);

        if (revealed >= finalDigits.length) {
          setDisplay(finalValue);
          if (cycleInterval) {
            clearInterval(cycleInterval);
            cycleInterval = null;
          }
          replayTimeout = setTimeout(runCycle, replayIntervalMs);
        } else {
          setDisplay(buildDisplay(prefix, finalDigits, suffix, revealed));
        }
      }, cycleIntervalMs);
    }

    function stop() {
      if (cycleInterval) {
        clearInterval(cycleInterval);
        cycleInterval = null;
      }
      if (replayTimeout) {
        clearTimeout(replayTimeout);
        replayTimeout = null;
      }
    }

    // Only run while the tab is foregrounded — no point scrambling (and burning
    // 20Hz setState re-renders) on a backgrounded tab.
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        if (!cycleInterval && !replayTimeout) runCycle();
      } else {
        stop();
        setDisplay(finalValue);
      }
    }

    if (document.visibilityState === "visible") runCycle();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isActive, finalValue, durationMs, cycleIntervalMs, replayIntervalMs]);

  return display;
}
