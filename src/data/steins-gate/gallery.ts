import type { GalleryPhoto, GalleryVideo } from "./types";

export const gallery = {
  eyebrow: "gallery_",
  heading: "ภาพ-วิดิโอตัวอย่าง",
  videos: [
    {
      id: "_hBitbkesvw",
      title: "[Teaser] ตัวอย่างม็อดภาษาไทย STEINS;GATE | Operation Bifrost - ปฏิบัติการไบฟรอสต์",
      channel: "Operation Bifrost",
      duration: "0:59",
    },
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
  ] satisfies ReadonlyArray<GalleryVideo>,
  photos: [
    {
      src: "/images/steins-gate/gallery/dialogue-1.webp",
      thumbSrc: "/images/steins-gate/gallery/dialogue-1-thumb.webp",
      alt: "บทพูดตัวละคร 1",
    },
    {
      src: "/images/steins-gate/gallery/dialogue-2.webp",
      thumbSrc: "/images/steins-gate/gallery/dialogue-2-thumb.webp",
      alt: "บทพูดตัวละคร 2",
    },
    {
      src: "/images/steins-gate/gallery/dialogue-3.webp",
      thumbSrc: "/images/steins-gate/gallery/dialogue-3-thumb.webp",
      alt: "บทพูดตัวละคร 3",
    },
    {
      src: "/images/steins-gate/gallery/dialogue-4.webp",
      thumbSrc: "/images/steins-gate/gallery/dialogue-4-thumb.webp",
      alt: "บทพูดตัวละคร 4",
    },
    {
      src: "/images/steins-gate/gallery/phone-interface.webp",
      thumbSrc: "/images/steins-gate/gallery/phone-interface-thumb.webp",
      alt: "เมนูโทรศัพท์",
    },
    {
      src: "/images/steins-gate/gallery/main-menu.webp",
      thumbSrc: "/images/steins-gate/gallery/main-menu-thumb.webp",
      alt: "เมนูหลัก",
    },
    {
      src: "/images/steins-gate/gallery/tips-list.webp",
      thumbSrc: "/images/steins-gate/gallery/tips-list-thumb.webp",
      alt: "สารานุกรม",
    },
    {
      src: "/images/steins-gate/gallery/config.webp",
      thumbSrc: "/images/steins-gate/gallery/config-thumb.webp",
      alt: "หน้าการตั้งค่า",
    },
  ] satisfies ReadonlyArray<GalleryPhoto>,
} as const;
