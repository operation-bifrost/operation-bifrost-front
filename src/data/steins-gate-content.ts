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
  features: {
    eyebrow: "features_",
    heading: "ม็อดนี้ประกอบด้วย",
    divergence: "1.048596%",
    items: [
      {
        terminalSlug: "story",
        tag: "ORIGINAL STORY",
        title: "สัมผัสเนื้อเรื่องต้นฉบับ",
        description:
          "เนื้อเรื่องหลักของ STEINS;GATE ที่มากกว่าในอนิเมะปี 2011\nรู้จักกับเหล่าตัวละครและโลกของอากิบะอย่างเข้มข้น",
        bullets: null,
        comparison: {
          beforeSrc: "/images/steins-gate/features/prologue-before.png",
          beforeAlt: "Steins;Gate prologue (ต้นฉบับ)",
          afterSrc: "/images/steins-gate/features/prologue-after.png",
          afterAlt: "Steins;Gate prologue (แปลไทย)",
        },
      },
      {
        terminalSlug: "scope",
        tag: "THAI LOCALIZATION",
        title: "แปลไทย 100%",
        description: "เนื้อหาทั้งหมดแปลด้วยใจรัก\nโดยคอมมูนิตี้คนชอบ STEINS;GATE",
        bullets: [
          "เนื้อเรื่องทั้งหมด",
          "สารานุกรม",
          "เมลโต้ตอบกับตัวละคร",
          "ภาพ CG",
          "ซับไทยเพลงประกอบ",
        ] as readonly string[],
        comparison: {
          beforeSrc: "/images/steins-gate/features/whiteboard-before.png",
          beforeAlt: "สารานุกรมต้นฉบับภาษาญี่ปุ่น",
          afterSrc: "/images/steins-gate/features/whiteboard-after.png",
          afterAlt: "สารานุกรมฉบับแปลไทย",
        },
      },
      {
        terminalSlug: "phone",
        tag: "MULTIPLE ROUTES",
        title: "เปลี่ยนอนาคตด้วยมือคุณเอง",
        description:
          "เมลที่คุณส่งจะตัดสินชะตาของโลกได้!\nทางเลือกของคุณนำไปสู่ตอนจบทั้งหมด 6 รูปแบบ",
        bullets: null,
        comparison: {
          beforeSrc: "/images/steins-gate/features/dialogue-before.jpg",
          beforeAlt: "ฉากต้นฉบับ",
          afterSrc: "/images/steins-gate/features/dialogue-after.jpg",
          afterAlt: "ฉากแปลไทย",
        },
      },
    ],
  },
  gallery: {
    eyebrow: "gallery_",
    heading: "ภาพ-วิดิโอตัวอย่าง",
    videos: [
      {
        id: "LL3arzyY_Ew",
        title: "[ตัวอย่างซับไทย] คลิป Prologue (อารัมภบท) | Steins;Gate ม็อดภาษาไทย",
        channel: "Operation Bifrost",
        duration: "2:51",
      },
      {
        id: "TyLS4HXfP60",
        title: "[ตัวอย่างซับไทย] Visual Novel Opening: Skyclad Observer | Steins;Gate ม็อดภาษาไทย",
        channel: "Operation Bifrost",
        duration: "1:55",
      },
      {
        id: "BctM6HuQE7M",
        title: "[ตัวอย่างซับไทย] Visual Novel Bonus Opening: A.R. | Steins;Gate ม็อดภาษาไทย",
        channel: "Operation Bifrost",
        duration: "1:57",
      },
    ] satisfies ReadonlyArray<GalleryVideo>,
    photos: [
      {
        src: "/images/steins-gate/features/prologue-after.png",
        alt: "สกรีนช็อตเกม Steins;Gate แปลไทย — ฉากบทสนทนา",
      },
      {
        src: "/images/steins-gate/features/prologue-before.png",
        alt: "สกรีนช็อตเกม Steins;Gate — ฉากต้นฉบับ",
      },
      {
        src: "/images/steins-gate/features/whiteboard-after.png",
        alt: "สารานุกรมฉบับแปลไทย",
      },
      {
        src: "/images/steins-gate/features/whiteboard-before.png",
        alt: "สารานุกรมต้นฉบับภาษาญี่ปุ่น",
      },
      {
        src: "/images/steins-gate/features/dialogue-after.jpg",
        alt: "ฉากบทสนทนาแปลไทย",
      },
      {
        src: "/images/steins-gate/features/dialogue-before.jpg",
        alt: "ฉากบทสนทนาต้นฉบับ",
      },
      {
        src: "/images/steins-gate/features/prologue-after.png",
        alt: "อีกมุมของฉากแปลไทย",
      },
      {
        src: "/images/steins-gate/features/prologue-before.png",
        alt: "อีกมุมของฉากต้นฉบับ",
      },
    ] satisfies ReadonlyArray<GalleryPhoto>,
  },
} as const;

export interface GalleryVideo {
  id: string;
  title: string;
  channel?: string;
  duration?: string;
}

export interface GalleryPhoto {
  src: string;
  alt: string;
}

export type SteinsGateContent = typeof steinsGateContent;
export type FeatureItem = (typeof steinsGateContent.features.items)[number] & {
  terminalLabel?: string;
};
