import type { CtaConfig } from "./types";

export const hero = {
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
} as const;
