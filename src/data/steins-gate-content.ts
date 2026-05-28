import type { IconType } from "react-icons";
import { SiDiscord, SiFacebook, SiYoutube } from "react-icons/si";

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

export const steinsGateContent = {
  navbar: {
    brand: {
      logoSrc: "/images/steins-gate/bifrost-logo.png",
      logoAlt: "Operation Bifrost",
    },
    navItems: [
      { label: "รายละเอียดม็อด", href: "#features" },
      { label: "คำถามที่พบบ่อย", href: "#faq" },
      { label: "ผู้จัดทำ", href: "#credits" },
    ] satisfies ReadonlyArray<NavItem>,
    socials: [
      {
        label: "Facebook",
        href: "https://www.facebook.com/operationbifrost",
        brand: "facebook",
        icon: SiFacebook,
      },
      {
        label: "Discord",
        href: "https://discord.gg/8WHxqbCjGD",
        brand: "discord",
        icon: SiDiscord,
      },
      {
        label: "YouTube",
        href: "https://www.youtube.com/@operationbifrost",
        brand: "youtube",
        icon: SiYoutube,
      },
    ] satisfies ReadonlyArray<SocialLink>,
    primaryCta: {
      label: "ดาวน์โหลดม็อด",
      href: "#download",
    } satisfies CtaConfig,
  },
  hero: {
    bgLargeSrc: "/images/steins-gate/hero-bg-large.png",
    bgMediumSrc: "/images/steins-gate/hero-bg-medium.png",
    bgSmallSrc: "/images/steins-gate/hero-bg-small.png",
    h1: "ม็อด STEINS;GATE\nฉบับแปลไทยเต็มรูปแบบ",
    tagline: "ใช้กับ STEINS;GATE เวอร์ชัน Steam",
    detailsCta: {
      label: "รายละเอียดม็อด",
      href: "#features",
    } satisfies CtaConfig,
    downloadCta: {
      label: "ดาวน์โหลดเลย",
      href: "#download",
    } satisfies CtaConfig,
  },
} as const;

export type SteinsGateContent = typeof steinsGateContent;
