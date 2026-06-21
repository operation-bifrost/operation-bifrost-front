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
  download: {
    eyebrow: "download_",
    heading: "ดาวน์โหลดม็อด",
    version: "v1.2.1",
    versionDate: "อัปเดต 10 ต.ค. 2026",
    patchNotesLabel: "รายละเอียดแพตช์",
    patchNotesHref: "#",
    downloadCta: {
      label: "ดาวน์โหลด (.zip ขนาด 150MB)",
      href: "#",
    } satisfies CtaConfig,
    warning:
      "*** แพตช์ภาษาไทยนี้พัฒนาจากแพตช์ภาษาอังกฤษของ Committee of Zero สามารถใช้ได้กับ STEINS;GATE เวอร์ชัน Steam ที่เป็นเวอร์ชันภาษาอังกฤษเท่านั้น ไม่สามารถทำงานบนเวอร์ชันอื่นได้",
    installSteps: [
      {
        number: "01",
        title: "เลื่อนลงมาในส่วน Download Assets แล้วกด",
        subtitle: "อุอิอาอุอิอาอุอิอาอุอิอาอุอิอา",
        imageSrc: "/images/steins-gate/download/install-step-01.png",
        imageAlt: "ขั้นตอนที่ 1: กดดาวน์โหลดไฟล์",
      },
      {
        number: "02",
        title: "แตกไฟล์ zip แล้วรันไฟล์ถึงถึง ทำตามขั้นตอนในตัวติดตั้ง",
        subtitle: "อุอิอาอุอิอาอุอิอาอุอิอาอุอิอาอุอิอา",
        imageSrc: "/images/steins-gate/download/install-step-02.png",
        imageAlt: "ขั้นตอนที่ 2: แตกไฟล์ zip",
      },
    ] satisfies ReadonlyArray<InstallStep>,
    supportHeading: "ติดปัญหา? สอบถามทางดิสคอร์ดและหน้าเพจได้เลย",
    supportLinks: [
      {
        label: "เข้าร่วม Discord",
        href: "https://discord.gg/8WHxqbCjGD",
        brand: "discord" as SocialBrand,
        icon: SiDiscord,
      },
      {
        label: "ทักเพจ Facebook",
        href: "https://www.facebook.com/operationbifrost",
        brand: "facebook" as SocialBrand,
        icon: SiFacebook,
      },
    ] satisfies ReadonlyArray<SocialLink>,
  },
  faq: {
    eyebrow: "faq_",
    heading: "คำถามที่พบบ่อย",
    items: [
      {
        question: "แพตช์ล่าสุดแปลไปถึงไหนแล้ว เล่นได้ถึงส่วนไหนของเกม?",
        answer:
          "ตอนนี้แปลถึงบทที่ 6 และจบ 1 รูท คิดเป็นเนื้อหาราว 50–60% ของเกม ครอบคลุมจนถึงจุดเปลี่ยนสำคัญของเรื่องและฉากจบแบบที่ 1 จากทั้งหมด 6 ฉากจบ ส่วนที่เหลือทีมงานกำลังทยอยแปลและอัปเดตอย่างต่อเนื่อง",
      },
      {
        question: "ม็อดนี้ใช้กับ STEINS;GATE เวอร์ชันไหนได้บ้าง?",
        answer:
          "ใช้ได้กับ STEINS;GATE เวอร์ชัน Steam (ภาษาอังกฤษ) เท่านั้น เพราะพัฒนาต่อยอดจากแพตช์ภาษาอังกฤษของ Committee of Zero จึงยังไม่รองรับเวอร์ชันอื่น",
      },
      {
        question: "ดาวน์โหลดและติดตั้งม็อดอย่างไร?",
        answer:
          "ดาวน์โหลดไฟล์ .zip (ขนาดราว 150MB) จากส่วนดาวน์โหลดด้านบน แตกไฟล์ แล้วรันตัวติดตั้ง จากนั้นทำตามขั้นตอนบนหน้าจอจนเสร็จ ก็พร้อมเล่นได้ทันที",
      },
      {
        question: "ม็อดนี้แปลเนื้อหาส่วนไหนบ้าง?",
        answer:
          "แปลครบทั้งเนื้อเรื่องหลัก สารานุกรมในเกม เมลโต้ตอบกับตัวละคร ข้อความบนภาพ CG รวมถึงซับไทยของเพลงประกอบ ตั้งใจให้สัมผัสประสบการณ์ทั้งหมดเป็นภาษาไทยได้เต็มที่",
      },
      {
        question: "ม็อดนี้เสียเงินไหม ต้องมีตัวเกมก่อนหรือเปล่า?",
        answer:
          "แพตช์แปลไทยนี้ทำโดยแฟนๆ และแจกฟรี แต่คุณต้องเป็นเจ้าของ STEINS;GATE เวอร์ชัน Steam อยู่ก่อนแล้วจึงจะติดตั้งและเล่นได้",
      },
      {
        question: "เจอบั๊ก ติดปัญหา หรืออยากมาช่วยแปล ต้องทำอย่างไร?",
        answer:
          "ทักเข้ามาได้ที่ดิสคอร์ดหรือเพจ Facebook ของเรา ทีมงานยินดีช่วยแก้ปัญหา และเปิดรับอาสาสมัครที่อยากมาร่วมแปลเสมอ",
      },
    ] satisfies ReadonlyArray<FaqItem>,
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

export type SteinsGateContent = typeof steinsGateContent;
export type FeatureItem = (typeof steinsGateContent.features.items)[number] & {
  terminalLabel?: string;
};
