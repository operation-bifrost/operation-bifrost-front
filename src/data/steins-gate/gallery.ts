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
      src: "/images/steins-gate/gallery/dialogue-1.webp",
      alt: "บทพูดตัวละคร 1",
    },
    {
      src: "/images/steins-gate/gallery/dialogue-2.webp",
      alt: "บทพูดตัวละคร 2",
    },
    {
      src: "/images/steins-gate/gallery/dialogue-3.webp",
      alt: "บทพูดตัวละคร 3",
    },
    {
      src: "/images/steins-gate/gallery/dialogue-4.webp",
      alt: "บทพูดตัวละคร 4",
    },
    {
      src: "/images/steins-gate/gallery/phone-interface.webp",
      alt: "เมนูโทรศัพท์",
    },
    {
      src: "/images/steins-gate/gallery/main-menu.webp",
      alt: "เมนูหลัก",
    },
    {
      src: "/images/steins-gate/gallery/tips-list.webp",
      alt: "สารานุกรม",
    },
    {
      src: "/images/steins-gate/gallery/config.webp",
      alt: "หน้าการตั้งค่า",
    },
  ] satisfies ReadonlyArray<GalleryPhoto>,
} as const;
