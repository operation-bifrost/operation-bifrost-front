import { SiDiscord, SiFacebook } from "react-icons/si";

import type { CtaConfig, InstallStep, SocialBrand, SocialLink } from "./types";

export const download = {
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
} as const;
