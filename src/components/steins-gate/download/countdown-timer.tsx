import Counter from "@/components/ui/counter";
import { useCountdown } from "@/hooks/use-countdown";

interface CountdownTimerProps {
  /** ISO-8601 date string the timer counts down to. */
  targetDate: string;
}

/**
 * Nixie-tube countdown timer displaying dd:hh:mm:ss with animated rolling digits.
 * Uses the React Bits Counter component for smooth digit transitions and the
 * project's existing Nixie glow aesthetic.
 */
export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);

  if (isExpired) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Timer digits — four dd : hh : mm : ss groups */}
      <div className="flex items-center gap-1 md:gap-2" aria-label="Countdown timer">
        <TimeSegment value={days} label="วัน" />
        <Separator />
        <TimeSegment value={hours} label="ชั่วโมง" />
        <Separator />
        <TimeSegment value={minutes} label="นาที" />
        <Separator />
        <TimeSegment value={seconds} label="วินาที" />
      </div>
    </div>
  );
}

/* ── Internal pieces ─────────────────────────────────────────────────── */

/** Two-digit animated segment with a label underneath. Supports scaling beyond 2 digits. */
function TimeSegment({
  value,
  label,
  minDigits = 2,
}: {
  value: number;
  label: string;
  minDigits?: number;
}) {
  const numDigits = Math.max(minDigits, Math.floor(Math.log10(Math.max(1, value))) + 1);
  const places = Array.from({ length: numDigits }, (_, i) => 10 ** (numDigits - i - 1));

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="bg-background/60 border-primary/30 flex rounded border px-1.5 py-1 backdrop-blur-sm md:px-2 md:py-1.5">
        <Counter
          value={value}
          places={places}
          fontSize={24}
          padding={4}
          gap={1}
          borderRadius={0}
          horizontalPadding={2}
          textColor="var(--color-nixie-base)"
          fontWeight={700}
          topGradientStyle={{ display: "none" }}
          bottomGradientStyle={{ display: "none" }}
          digitStyle={{ fontVariantNumeric: "tabular-nums" }}
          counterStyle={{ fontFamily: "var(--font-mono)" }}
        />
      </div>
      <span className="text-muted-foreground text-[10px] tracking-wider uppercase md:text-xs">
        {label}
      </span>
    </div>
  );
}

/** Nixie-colored colon separator between time segments. */
function Separator() {
  return (
    <span
      className="mb-5 text-xl font-bold md:mb-6 md:text-2xl"
      style={{ color: "var(--color-nixie-base)" }}
      aria-hidden
    >
      :
    </span>
  );
}
