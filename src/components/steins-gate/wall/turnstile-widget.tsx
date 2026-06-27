import { useEffect, useRef } from "react";

const SCRIPT_BASE = "https://challenges.cloudflare.com/turnstile/v0/api.js";
const SCRIPT_SRC = `${SCRIPT_BASE}?render=explicit`;

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      theme?: string;
    },
  ) => string;
  remove: (id: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

function loadScript(): Promise<void> {
  if (document.querySelector(`script[src^="${SCRIPT_BASE}"]`)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("turnstile script failed"));
    document.head.appendChild(s);
  });
}

interface TurnstileWidgetProps {
  siteKey: string;
  onToken: (token: string | null) => void;
}

export function TurnstileWidget({ siteKey, onToken }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let widgetId: string | null = null;
    let cancelled = false;

    loadScript()
      .then(() => {
        const tick = () => {
          if (cancelled) return;
          if (window.turnstile && containerRef.current) {
            widgetId = window.turnstile.render(containerRef.current, {
              sitekey: siteKey,
              theme: "dark",
              callback: (token) => onToken(token),
              "expired-callback": () => onToken(null),
            });
          } else {
            window.setTimeout(tick, 100);
          }
        };
        tick();
      })
      .catch(() => onToken(null));

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [siteKey, onToken]);

  return <div ref={containerRef} className="min-h-[65px]" />;
}
