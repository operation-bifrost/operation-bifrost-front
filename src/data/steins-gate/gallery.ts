import type { GalleryPhoto, GalleryVideo } from "./types";

export const gallery = {
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
} as const;
