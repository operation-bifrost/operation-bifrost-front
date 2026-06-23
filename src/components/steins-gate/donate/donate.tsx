import { useState } from "react";
import { LuArrowUpRight, LuCheck, LuCopy } from "react-icons/lu";

import { DonateDecor } from "@/components/steins-gate/donate/donate-decor";
import { SectionHeading } from "@/components/steins-gate/ui/section-heading";
import type { DonateChannel, DonateCryptoChannel, DonateViewChannel } from "@/data/steins-gate";
import { steinsGateContent } from "@/data/steins-gate";
import { cn } from "@/lib/utils";

/** How long the "copied" confirmation stays before reverting. */
const COPY_RESET_MS = 2000;

/** Shared layout for every channel tab in the right rail. */
const CHANNEL_TAB_BASE =
  "border-border/60 flex items-center gap-3 border-t border-l-2 px-4 py-3.5 transition-colors outline-none cursor-pointer";

/**
 * Hover / focus treatment for interactive (link + unselected in-place) tabs. A
 * translucent `foreground` lift is used deliberately: the `secondary` token
 * equals `card` in this theme, so `bg-secondary` is invisible against the
 * `bg-card/80` rail. This stays distinct from the amber `bg-primary/10` that
 * marks the active in-place tab.
 */
const CHANNEL_TAB_INTERACTIVE =
  "border-l-transparent hover:bg-foreground/10 focus-visible:bg-foreground/10";

/**
 * Left console panel — the active "view" channel's content. PromptPay ships a
 * full Thai QR Payment slip (header, QR, account name), so it's framed by the
 * amber border with the Nixie glow halo bleeding around its white edges.
 */
function ChannelView({ view }: { view: DonateViewChannel }) {
  const { name, qrSrc, fallbackLabel, account } = view;

  return (
    <div className="flex h-full flex-col justify-center gap-5 p-6 md:p-8">
      <div className="flex flex-col items-center gap-7 sm:flex-row sm:gap-9">
        <div className="relative shrink-0">
          {/* Nixie-amber glow halo bleeding around the white slip */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-4"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, rgba(251, 192, 0, 0.16) 0%, transparent 70%)",
            }}
          />
          <div className="border-primary/30 relative overflow-hidden">
            <img
              src={qrSrc}
              alt={`QR ${name} สำหรับสนับสนุนโปรเจกต์ Operation Bifrost`}
              width={573}
              height={751}
              loading="lazy"
              className="block w-72 max-w-full"
            />
          </div>
        </div>

        {/* Manual-transfer fallback for people who can't scan the QR */}
        <div className="flex w-full flex-col gap-3 sm:w-auto">
          <span className="text-muted-foreground text-sm tracking-wider">{fallbackLabel}</span>
          <dl className="font-krub grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-2.5">
            <dt className="text-muted-foreground">ชื่อบัญชี</dt>
            <dd className="text-foreground m-0 font-semibold">{account.holder}</dd>
            <dt className="text-muted-foreground">ธนาคาร</dt>
            <dd className="text-foreground m-0 font-semibold">{account.bank}</dd>
            <dt className="text-muted-foreground">เลขที่บัญชี</dt>
            <dd className="text-foreground m-0 font-mono font-semibold tracking-wider">
              {account.number}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

/**
 * Left console panel for a crypto channel — a per-network switcher plus the
 * active network's full receiving address with copy-to-clipboard. Crypto
 * addresses are public and the dominant UX is copy-paste, so the address + copy
 * button is the primary action; the asset note guards against unrecoverable
 * wrong-chain transfers.
 */
function CryptoView({ channel }: { channel: DonateCryptoChannel }) {
  const { networks } = channel;
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const active = networks[activeIndex] ?? networks[0];

  const selectNetwork = (index: number) => {
    setActiveIndex(index);
    setCopied(false);
  };

  const copyAddress = async () => {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(active.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPY_RESET_MS);
    } catch {
      // Clipboard API unavailable (insecure context / permission denied) — the
      // full address stays visible for manual selection, so fail quietly.
    }
  };

  if (!active) return null;

  return (
    <div className="flex h-full flex-col justify-center gap-5 p-6 md:p-8">
      {/* Network switcher — shown only when more than one network is offered */}
      {networks.length > 1 ? (
        <div
          role="tablist"
          aria-label="เลือกเครือข่ายคริปโต"
          className="border-border inline-flex w-fit gap-1 self-start border p-1"
        >
          {networks.map((network, index) => {
            const NetworkIcon = network.icon;
            const isActive = index === activeIndex;
            return (
              <button
                key={network.label}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => selectNetwork(index)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm font-semibold transition-colors outline-none",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <NetworkIcon className="size-4" aria-hidden="true" />
                {network.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <span className="text-muted-foreground font-krub text-sm">{active.assets}</span>

        <div className="border-border bg-background/60 flex items-center gap-3 border p-3">
          <code className="text-foreground min-w-0 flex-1 font-mono text-sm break-all">
            {active.address}
          </code>
          <button
            type="button"
            onClick={copyAddress}
            aria-label={copied ? "คัดลอกที่อยู่แล้ว" : "คัดลอกที่อยู่กระเป๋า"}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 border px-3 py-1.5 text-sm font-semibold transition-colors outline-none",
              copied
                ? "border-primary text-primary"
                : "border-border text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
            )}
          >
            {copied ? (
              <LuCheck className="size-4" aria-hidden="true" />
            ) : (
              <LuCopy className="size-4" aria-hidden="true" />
            )}
            {copied ? "คัดลอกแล้ว" : "คัดลอก"}
          </button>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed">
          อย่าลืมเช็ค address ให้ชัวร์ก่อนโอนนะ ถ้าโอนผิดเชนหรือผิดเหรียญจะดึงกลับไม่ได้
        </p>
      </div>
    </div>
  );
}

/**
 * Donate section — "split support console". The right rail lists every channel
 * as a tab. In-place tabs (`view` → PromptPay slip, `crypto` → wallet panel)
 * swap the left panel to their content without leaving the page; `link` tabs
 * (Ko-fi / PayPal) open an external URL. Active in-place tabs are highlighted
 * with an amber spine + status dot; link tabs carry an outward arrow to signal
 * they leave the page. Stacks on mobile with the selector on top.
 */
export function Donate() {
  const { eyebrow, heading, description, channels } = steinsGateContent.donate;

  // "In-place" channels (view + crypto) render in the left panel when selected;
  // link channels navigate out instead. Filter against the declared union (which
  // `channels` satisfies) so the type guard narrows cleanly — the `as const`
  // literal element type is too narrow for the guard's asserted type.
  const inPlaceChannels = (channels as ReadonlyArray<DonateChannel>).filter(
    (channel): channel is DonateViewChannel | DonateCryptoChannel => channel.kind !== "link",
  );
  const [activeId, setActiveId] = useState(inPlaceChannels[0]?.id ?? "");
  const activeChannel =
    inPlaceChannels.find((channel) => channel.id === activeId) ?? inPlaceChannels[0];

  return (
    <section id="donate" className="relative py-8 md:py-10 lg:py-12">
      <DonateDecor />

      <div className="2xl:max-w-8xl relative mx-auto max-w-7xl px-6 md:px-12 lg:px-20">
        <SectionHeading heading={heading} eyebrow={eyebrow} className="mb-8 md:mb-10" />

        <p className="text-muted-foreground mx-auto mb-8 max-w-5xl text-sm leading-relaxed md:mb-10 md:text-base">
          {description}
        </p>

        <div className="border-border bg-card/80 shadow-button mx-auto flex max-w-5xl flex-col overflow-hidden border backdrop-blur-sm lg:grid lg:grid-cols-[1fr_auto]">
          {/* Left — active in-place channel content */}
          <div className="order-2 lg:order-1">
            {activeChannel?.kind === "crypto" ? (
              <CryptoView channel={activeChannel} />
            ) : activeChannel ? (
              <ChannelView view={activeChannel} />
            ) : null}
          </div>

          {/* Right — channel selector */}
          <div className="border-border order-1 flex flex-col border-b lg:order-2 lg:w-64 lg:border-b-0 lg:border-l">
            {channels.map((channel) => {
              const Icon = channel.icon;

              if (channel.kind !== "link") {
                const isActive = channel.id === activeId;
                return (
                  <button
                    key={channel.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveId(channel.id)}
                    className={cn(
                      "group",
                      CHANNEL_TAB_BASE,
                      "text-left",
                      isActive ? "border-l-primary bg-primary/10" : CHANNEL_TAB_INTERACTIVE,
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex shrink-0 transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-primary group-focus-visible:text-primary",
                      )}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "mb-0.5 block text-sm leading-tight font-semibold",
                          isActive ? "text-primary" : "text-foreground",
                        )}
                      >
                        {channel.name}
                      </span>
                      <span className="text-muted-foreground block text-xs leading-tight">
                        {channel.caption}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-1.5 shrink-0 rounded-full transition-colors",
                        isActive
                          ? "bg-primary shadow-[0_0_8px_var(--color-nixie-base)]"
                          : "bg-muted-foreground/40 group-hover:bg-primary group-focus-visible:bg-primary",
                      )}
                    />
                  </button>
                );
              }

              return (
                <a
                  key={channel.name}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn("group", CHANNEL_TAB_BASE, CHANNEL_TAB_INTERACTIVE)}
                >
                  <span className="text-muted-foreground group-hover:text-primary group-focus-visible:text-primary inline-flex shrink-0 transition-colors">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-foreground mb-0.5 block text-sm leading-tight font-semibold">
                      {channel.name}
                    </span>
                    <span className="text-muted-foreground block text-xs leading-tight">
                      {channel.caption}
                    </span>
                  </span>
                  <LuArrowUpRight
                    className="text-muted-foreground group-hover:text-primary group-focus-visible:text-primary size-4 shrink-0 transition-colors"
                    aria-hidden="true"
                  />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
