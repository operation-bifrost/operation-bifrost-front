// Content source of truth for the "/" hub (Operation Bifrost portal).
//
// The hub is an index of localization projects. Adding a new project to the
// catalogue is a one-object append to `projects` below — no markup changes.
// `index.astro` renders a "feature" row for live projects and a ghosted
// "soon" row for placeholders, keyed off `status`.

export type ProjectStatus = "live" | "soon";

interface HomeMasthead {
  /** Latin half of the bilingual wordmark. */
  titleEn: string;
  /** Thai half of the bilingual wordmark (same line, same style). */
  titleTh: string;
  /** Glyph between the two halves of the wordmark. */
  separator: string;
  /** One-line Thai subtitle under the wordmark. */
  lede: string;
}

interface HomeProject {
  /** Catalogue index, rendered in tabular mono ("01", "02", ...). */
  number: string;
  /** Latin meta line above the title (studio / series tag). */
  series: string;
  /** Project title, set uppercase. */
  title: string;
  /** Thai one-liner describing the project. */
  thaiSub: string;
  status: ProjectStatus;
  /** Accessible label for the row. */
  ariaLabel: string;
  /** Destination URL — required for `status: "live"`. */
  href?: string;
  /** CTA label on a live row (Thai). */
  ctaLabel?: string;
  /** Badge text on a "soon" row (Thai). */
  badge?: string;
  /** Cover keyart behind a live row (grayscale at rest, blooms to color on hover). */
  cover?: string;
  /** Alt text for the cover keyart. */
  coverAlt?: string;
}

interface HomeContent {
  masthead: HomeMasthead;
  projects: HomeProject[];
}

export const homeContent: HomeContent = {
  masthead: {
    titleEn: "Operation Bifrost",
    titleTh: "ปฏิบัติการไบฟรอสต์",
    separator: "·",
    lede: "เพจทำม็อดแปลเกมที่อยากแปล เกมไหนอยากมาก ๆ ก็จะหาทางแปลให้ได้ ฝึกไปเรื่อย ๆ จนกว่าจะโปร",
  },
  projects: [
    {
      number: "01",
      series: "Science Adventure · MAGES / Nitroplus · 2009",
      title: "Steins;Gate",
      thaiSub: "ม็อด STEINS;GATE ฉบับแปลไทยเต็มรูปแบบ",
      status: "live",
      href: "/steins-gate/",
      ctaLabel: "เปิดโปรเจกต์",
      ariaLabel: "เปิดโปรเจกต์ Steins;Gate",
      cover: "/images/home/sg-cover.webp",
      coverAlt: "ภาพปกโปรเจกต์ Steins;Gate",
    },
    {
      number: "02",
      series: "Future Project",
      title: "Untitled",
      thaiSub: "",
      status: "soon",
      badge: "or not to [B]e",
      ariaLabel: "โปรเจกต์ถัดไป เร็ว ๆ นี้",
    },
  ],
};
