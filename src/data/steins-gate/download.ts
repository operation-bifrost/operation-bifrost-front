import { SiDiscord, SiFacebook } from "react-icons/si";

import type { CtaConfig, InstallStep, SocialBrand, SocialLink } from "./types";

export const download = {
  eyebrow: "download_",
  heading: "ดาวน์โหลดม็อด",
  version: "v1.0.0",
  versionDate: "อัปเดต 06/07/2026",
  patchNotesLabel: "รายละเอียดแพตช์",
  patchNotesHref: "#",
  downloadCta: {
    label: "ดาวน์โหลด (.zip ขนาด 1.24GB)",
    href: "#",
  } satisfies CtaConfig,
  warning:
    "*** แพตช์ภาษาไทยนี้พัฒนาจากแพตช์ภาษาอังกฤษของ Committee of Zero สามารถใช้ได้กับ STEINS;GATE เวอร์ชัน Steam ที่เป็นเวอร์ชันภาษาอังกฤษเท่านั้น ไม่สามารถทำงานบนเวอร์ชันอื่นได้",
  installSteps: [
    {
      number: "01",
      title: "แตกไฟล์ zip แล้วเปิดโปรแกรม SGPatch-Installer.exe",
      subtitle: "หากเปิดโปรแกรม SGPatch-Installer.exe แบบยังไม่ได้แตกไฟล์ะทำให้ลงม็อดไม่สำเร็จ",
      imageSrc: "/images/steins-gate/download/install-step-01.webp",
      imageAlt: "ขั้นตอนที่ 1: แตกไฟล์ zip",
    },
    {
      number: "02",
      title: "ทำตามขั้นตอนในตัวติดตั้งเพื่อลงม็อด",
      subtitle: "อย่าลืมติ๊กยอมรับเงื่อนไขและเช็คตำแหน่งโฟลเดอร์เกมให้ถูกต้อง",
      imageSrc: "/images/steins-gate/download/install-step-02.webp",
      imageAlt: "ขั้นตอนที่ 2: ติดตั้ง",
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
