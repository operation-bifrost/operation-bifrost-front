import { useEffect, useState } from "react";
import { SiDiscord } from "react-icons/si";

import { Button } from "@/components/steins-gate/ui/button";
import { steinsGateContent } from "@/data/steins-gate";

interface WidgetMember {
  id: string;
  username: string;
  avatar_url: string;
  status: string;
}

interface WidgetData {
  name: string;
  presence_count: number;
  members: ReadonlyArray<WidgetMember>;
}

const MAX_AVATARS = 6;

/**
 * Live community card built from Discord's public widget JSON (CORS-enabled), so
 * it stays fully fluid instead of the rigid 350×500 official iframe. The initial
 * (SSR / pre-fetch) render is already a complete card — server crest, name, blurb
 * and Join button — and the live online count + member avatars layer in once the
 * fetch resolves. If the fetch fails the static card simply stays.
 */
export function DiscordCard() {
  const { discord } = steinsGateContent.footer;
  const [data, setData] = useState<WidgetData | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(discord.widgetJson, { signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<WidgetData>) : Promise.reject(res.status)))
      .then(setData)
      .catch(() => {
        /* keep the static fallback card */
      });

    return () => controller.abort();
  }, [discord.widgetJson]);

  const invite = discord.inviteHref;
  const avatars = data?.members.slice(0, MAX_AVATARS) ?? [];
  const overflow = data ? Math.max(0, data.presence_count - avatars.length) : 0;

  return (
    <div className="border-border bg-card/80 shadow-button relative w-full overflow-hidden rounded border backdrop-blur-sm">
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-3">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-xl text-white"
            style={{ background: "var(--color-brand-discord)" }}
          >
            <SiDiscord className="size-6" aria-hidden="true" />
          </span>
          <span>
            <span className="text-foreground block leading-tight font-bold">
              {data?.name ?? discord.name}
            </span>
            <span className="text-muted-foreground block text-sm">{discord.subtitle}</span>
          </span>
        </div>

        {avatars.length > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              {avatars.map((member) => (
                <img
                  key={member.id}
                  src={member.avatar_url}
                  alt=""
                  width={32}
                  height={32}
                  loading="lazy"
                  className="border-card -ml-2 size-8 rounded-full border-2 first:ml-0"
                />
              ))}
              {overflow > 0 && (
                <span className="border-card bg-secondary text-foreground -ml-2 grid size-8 place-items-center rounded-full border-2 font-mono text-[0.625rem] font-bold">
                  +{overflow}
                </span>
              )}
            </div>
            <span className="text-muted-foreground text-sm">
              สมาชิก <span className="font-bold">{data?.presence_count}</span> คนกำลังออนไลน์
            </span>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm/relaxed">{discord.blurb}</p>
        )}

        <Button variant="primary" href={invite} external className="font-bold">
          {discord.ctaLabel}
        </Button>
      </div>
    </div>
  );
}
