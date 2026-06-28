export const features = {
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
        beforeSrc: "/images/steins-gate/features/prologue-before.webp",
        beforeAlt: "Steins;Gate prologue (ต้นฉบับ)",
        afterSrc: "/images/steins-gate/features/prologue-after.webp",
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
        beforeSrc: "/images/steins-gate/features/whiteboard-before.webp",
        beforeAlt: "สารานุกรมต้นฉบับภาษาญี่ปุ่น",
        afterSrc: "/images/steins-gate/features/whiteboard-after.webp",
        afterAlt: "สารานุกรมฉบับแปลไทย",
      },
    },
    {
      terminalSlug: "phone",
      tag: "MULTIPLE ROUTES",
      title: "เปลี่ยนอนาคตด้วยมือคุณเอง",
      description: "เมลที่คุณส่งจะตัดสินชะตาของโลกได้!\nทางเลือกของคุณนำไปสู่ตอนจบทั้งหมด 6 รูปแบบ",
      bullets: null,
      comparison: {
        beforeSrc: "/images/steins-gate/features/dialogue-before.webp",
        beforeAlt: "ฉากต้นฉบับ",
        afterSrc: "/images/steins-gate/features/dialogue-after.webp",
        afterAlt: "ฉากแปลไทย",
      },
    },
  ],
} as const;
