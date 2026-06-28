import type { IconType } from "react-icons";

export interface NavItem {
  label: string;
  href: string;
}

export type SocialBrand = "facebook" | "discord" | "youtube";

export interface SocialLink {
  label: string;
  href: string;
  brand: SocialBrand;
  icon: IconType;
}

export interface CtaConfig {
  label: string;
  href: string;
}

/**
 * Configuration controlling the download card's CTA state.
 *
 * If `targetDate` is specified, the state is derived:
 * - If countdown hasn't ended yet: status is countdown (shows countdown timer + disabled button).
 * - If countdown has ended: status is download (shows active link button + version details).
 *
 * If no `targetDate` is specified, it defaults to a disabled "เร็ว ๆ นี้" button.
 */
export type DownloadState = {
  label: string;
  href: string;
  note?: string;
  /**
   * Optional ISO-8601 date string the timer counts down to.
   * If not specified, displays the disabled "เร็ว ๆ นี้" button.
   */
  targetDate?: string;
};

export interface GalleryVideo {
  id: string;
  title: string;
  channel?: string;
  duration?: string;
}

export interface GalleryPhoto {
  /** Full-resolution image, shown in the lightbox. */
  src: string;
  /** Smaller variant for the grid thumbnail (served to mobile via srcset). */
  thumbSrc: string;
  alt: string;
}

export interface InstallStep {
  number: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface CreditSocial {
  label: string;
  href: string;
  icon: IconType;
}

export interface CreditPerson {
  name: string;
  role?: string;
  socials?: ReadonlyArray<CreditSocial>;
}

/** Shared shape for any channel tab in the support console's right rail. */
interface DonateChannelBase {
  /** Display name of the channel (e.g. "PromptPay", "Ko-fi"). */
  name: string;
  /** Short, Thai-facing caption shown under the name in the tab. */
  caption: string;
  icon: IconType;
}

/**
 * A "view" channel: selecting its tab swaps the console's left panel to show
 * this channel's content (a QR slip) in place — it does not navigate away.
 */
/** Manual-transfer bank details shown as a fallback beside a view channel's QR. */
export interface DonateBankAccount {
  /** Account holder name. */
  holder: string;
  /** Bank name. */
  bank: string;
  /** Account number for a manual transfer. */
  number: string;
}

export interface DonateViewChannel extends DonateChannelBase {
  kind: "view";
  /** Stable id — the active-tab key. */
  id: string;
  /** Short lead shown above the manual-transfer fallback details. */
  fallbackLabel: string;
  /** Bank account shown as a manual-transfer fallback beside the QR. */
  account: DonateBankAccount;
  /** Path to the QR image (e.g. "/images/qr-promptpay.webp"). */
  qrSrc: string;
}

/**
 * A "link" channel: selecting its tab navigates to an external URL instead of
 * changing the left panel.
 */
export interface DonateLinkChannel extends DonateChannelBase {
  kind: "link";
  href: string;
}

/**
 * One receiving network inside a crypto channel. A single EVM address receives
 * ETH and ERC-20 tokens across every EVM chain; the Solana address receives SOL
 * and SPL tokens. `assets` spells out what is safe to send — wrong-chain or
 * wrong-asset transfers are unrecoverable.
 */
export interface CryptoNetwork {
  /** Network display label, e.g. "Ethereum / EVM" or "Solana". */
  label: string;
  /** Full, copyable public receiving address. */
  address: string;
  /** Thai note describing which assets/networks are safe to send here. */
  assets: string;
  /** Icon for the network switcher (e.g. SiEthereum, SiSolana). */
  icon: IconType;
}

/**
 * A "crypto" channel: like a view channel, selecting its tab swaps the console's
 * left panel in place (rather than navigating away) — here to a wallet panel
 * with a per-network switcher and copy-to-clipboard address.
 */
export interface DonateCryptoChannel extends DonateChannelBase {
  kind: "crypto";
  /** Stable id — the active-tab key. */
  id: string;
  /** Receiving networks the visitor can switch between. */
  networks: ReadonlyArray<CryptoNetwork>;
}

export type DonateChannel = DonateViewChannel | DonateLinkChannel | DonateCryptoChannel;
