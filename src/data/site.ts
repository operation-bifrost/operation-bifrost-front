// Canonical, site-wide identity for Operation Bifrost — the hub brand that every
// localization project shares. Used for SEO structured data (JSON-LD) and any
// place that needs the org's name / origin / social profiles.
//
// Per-project social links still live in each project's own data module
// (e.g. src/data/steins-gate/navbar.ts); the entries here are the *org-level*
// profiles that represent Operation Bifrost as a whole (schema.org `sameAs`).

export const SITE = {
  name: "Operation Bifrost",
  alternateName: "ปฏิบัติการไบฟรอสต์",
  /** Canonical production origin (no trailing slash). Mirrors `site` in astro.config.mjs. */
  url: "https://operationbifrost.com",
  description: "ศูนย์รวมม็อดแปลเกมเป็นภาษาไทยจากทีม Operation Bifrost เริ่มจาก STEINS;GATE!",
  /** Org-level social profiles, surfaced as schema.org `sameAs`. */
  social: [
    "https://www.facebook.com/operationbifrost",
    "https://discord.gg/8WHxqbCjGD",
    "https://www.youtube.com/@operationbifrost",
  ],
} as const;
