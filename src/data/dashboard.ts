export const DAY_MS = 86_400_000;

/** Range options for the time-series chart. `days: null` means "all time". */
export const RANGE_OPTIONS = [
  { key: "24h", label: "24 ชม.", days: 1 },
  { key: "7d", label: "7 วัน", days: 7 },
  { key: "30d", label: "30 วัน", days: 30 },
  { key: "all", label: "ทั้งหมด", days: null },
] as const;

export type RangeKey = (typeof RANGE_OPTIONS)[number]["key"];
export type SeriesMode = "daily" | "cumulative";

/**
 * Inclusive custom day-range for the time-series chart. Both fields are
 * "YYYY-MM-DD" day keys — the native `<input type="date">` value format, which
 * matches the repository's day keys exactly (no timezone conversion needed).
 * Empty strings mean "not set"; a range is only applied when both are set and
 * `from <= to` (see `isCustomRangeActive`).
 */
export type CustomRange = { from: string; to: string };

export const dashboardContent = {
  meta: {
    title: "สถิติการดาวน์โหลด — Operation Bifrost",
    description: "แดชบอร์ดวิเคราะห์การดาวน์โหลดแบบส่วนตัว",
  },
  console: {
    // Brand wordmark stays in English (BONX display face has no Thai glyphs).
    brand: "Operation Bifrost",
    subtitle: "สถิติการดาวน์โหลด",
    refreshLabel: "รีเฟรช",
    logoutLabel: "ออกจากระบบ",
    syncedPrefix: "อัปเดตเมื่อ",
  },
  hero: {
    label: "ยอดดาวน์โหลดทั้งหมด",
    emptyCaption: "ยังไม่มีการดาวน์โหลด",
  },
  tiles: {
    last24h: "24 ชม.ล่าสุด",
    last7d: "7 วันล่าสุด",
    peakDay: "วันที่สูงสุด",
    avgPerDay: "เฉลี่ยต่อวัน",
  },
  timeseries: {
    title: "ยอดดาวน์โหลดตามช่วงเวลา",
    empty: "ไม่มีข้อมูล",
    metric: "ดาวน์โหลด",
    daily: "รายวัน",
    cumulative: "สะสม",
    customRange: "กำหนดเอง",
    customRangeAria: "เลือกช่วงวันที่เอง",
  },
  version: { title: "ตามเวอร์ชัน", metric: "ดาวน์โหลด" },
  country: { title: "ตามประเทศ", topN: 8, othersLabel: "อื่น ๆ", unknownLabel: "ไม่ทราบ" },
  heatmap: {
    title: "ช่วงเวลาที่ใช้งาน",
    caption: "เอเชีย/กรุงเทพฯ · ชั่วโมง × วันในสัปดาห์",
    metricLabel: "ดาวน์โหลด",
    weekdays: ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."],
  },
  provenance:
    "ที่มา: บันทึกการดาวน์โหลดจาก D1 · นับตามจำนวนคลิก ไม่ใช่ผู้ใช้ที่ไม่ซ้ำ · เวลาเป็นเขตเอเชีย/กรุงเทพฯ",
  login: {
    title: "เข้าสู่ระบบ",
    prompt: "รหัสผ่าน",
    submitLabel: "เข้าสู่ระบบ",
    errorInvalid: "รหัสผ่านไม่ถูกต้อง",
    errorRateLimited: "พยายามมากเกินไป — รอ 60 วินาที",
    errorNetwork: "เกิดข้อผิดพลาดเครือข่าย — ลองใหม่อีกครั้ง",
  },
  errors: { snapshotFailed: "ไม่สามารถโหลดแดชบอร์ดได้", retryLabel: "ลองใหม่" },
} as const;
