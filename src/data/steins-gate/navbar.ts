import { SiDiscord, SiFacebook, SiYoutube } from "react-icons/si";

import type { CtaConfig, NavItem, SocialLink } from "./types";

export const navbar = {
  brand: {
    logoSrc: "/images/steins-gate/bifrost-logo.webp",
    logoAlt: "Operation Bifrost",
  },
  navItems: [
    { label: "รายละเอียดม็อด", href: "#features" },
    { label: "คำถามที่พบบ่อย", href: "#faq" },
    { label: "ผู้จัดทำ", href: "#credits" },
    { label: "สนับสนุน", href: "#donate" },
    { label: "กำแพงความในใจ", href: "#wall" },
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
} as const;
