import { useState, useEffect } from "react";

/** Decomposed time remaining for a countdown timer. */
export interface CountdownTime {
  /** Total seconds remaining (floored). 0 when expired. */
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once the target date has been reached. */
  isExpired: boolean;
}

/**
 * Counts down to `targetDate` (ISO string or Date), ticking every second.
 * Returns zeroed-out values when the target is in the past or undefined.
 */
export function useCountdown(targetDate: string | Date | null | undefined): CountdownTime {
  function calcRemaining(): CountdownTime {
    if (!targetDate) {
      return { totalSeconds: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }
    const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
    const diff = Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000));

    if (diff <= 0) {
      return { totalSeconds: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    return {
      totalSeconds: diff,
      days,
      hours,
      minutes,
      seconds,
      isExpired: false,
    };
  }

  const [time, setTime] = useState<CountdownTime>(calcRemaining);

  useEffect(() => {
    // Don't start an interval if already expired
    const initial = calcRemaining();
    setTime(initial);
    if (initial.isExpired) return;

    const id = setInterval(() => {
      const next = calcRemaining();
      setTime(next);
      if (next.isExpired) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  }, [targetDate]);

  return time;
}
