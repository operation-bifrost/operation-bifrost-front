export const wall = {
  eyebrow: "wall_of_thoughts_",
  heading: "ฝากข้อความถึงเรา",
  description:
    "อยากบอกอะไรกับทีมแปลหรือเพื่อน ๆ ที่รอเล่นม็อดอยู่ไหม จะเล่นจบแล้วหรือยังไม่ได้โหลดก็พิมพ์มาได้เลยนะ",
  sectionId: "wall",
  form: {
    namePlaceholder: "ชื่อ (เว้นว่างไว้เพื่อไม่ระบุตัวตน)",
    messagePlaceholder: "พิมพ์คอมเมนต์...",
    submitLabel: "ส่งคอมเมนต์",
    submittingLabel: "กำลังส่ง...",
  },
  success: {
    title: "ส่งแล้ว!",
    body: "ขอบคุณสำหรับทุกการสนับสนุนนะครับ",
  },
  errors: {
    empty: "กรุณาพิมพ์ข้อความก่อนส่ง",
    tooLong: "ข้อความต้องไม่เกิน 50 ตัวอักษร",
    nameTooLong: "ชื่อต้องไม่เกิน 20 ตัวอักษร",
    rateLimited: "ส่งบ่อยเกินไป รอสักครู่แล้วลองใหม่นะ",
    captcha: "ยืนยันว่าไม่ใช่บอทไม่สำเร็จ ลองใหม่อีกครั้ง",
    generic: "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง",
  },
  limits: {
    maxName: 20,
    maxMessage: 50,
  },
  display: {
    fetchLimit: 60,
    visibleBubbles: 8,
  },
} as const;
