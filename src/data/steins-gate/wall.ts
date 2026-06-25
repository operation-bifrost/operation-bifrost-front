// Single source of truth for the comment-wall section. Thai-first copy.
export const wall = {
  eyebrow: "at_channel_",
  heading: "ฝากความในใจ",
  description:
    "อยากบอกอะไรกับทีมแปลหรือเพื่อน ๆ ที่รอม็อดอยู่ไหม จะเล่นจบแล้วหรือยังไม่ได้โหลดก็พิมพ์มาได้เลย ข้อความจะลอยขึ้นบนกำแพงนี้หลังทีมงานตรวจแล้ว",
  sectionId: "wall",
  navLabel: "กำแพงความในใจ",
  form: {
    namePlaceholder: "ชื่อ (เว้นว่างไว้เพื่อไม่ระบุตัวตน)",
    messagePlaceholder: "พิมพ์ความในใจ...",
    submitLabel: "ส่งความในใจ",
    submittingLabel: "กำลังส่ง...",
  },
  success: {
    title: "ส่งแล้ว!",
    body: "ขอบคุณนะ ข้อความจะขึ้นบนกำแพงหลังทีมงานตรวจเรียบร้อย",
  },
  errors: {
    empty: "กรุณาพิมพ์ข้อความก่อนส่ง",
    tooLong: "ข้อความต้องไม่เกิน 280 ตัวอักษร",
    nameTooLong: "ชื่อต้องไม่เกิน 40 ตัวอักษร",
    rateLimited: "ส่งบ่อยเกินไป รอสักครู่แล้วลองใหม่นะ",
    captcha: "ยืนยันว่าไม่ใช่บอทไม่สำเร็จ ลองใหม่อีกครั้ง",
    generic: "เกิดข้อผิดพลาด ลองใหม่อีกครั้งนะ",
  },
  limits: {
    maxName: 40,
    maxMessage: 280,
  },
  display: {
    fetchLimit: 60,
    visibleBubbles: 12,
  },
} as const;
