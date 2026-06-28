import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

import react from "@astrojs/react";

// PUBLIC_TURNSTILE_SITE_KEY is read client-side (import.meta.env), so Vite bakes it
// into the JS bundle at BUILD time — it is NOT supplied by wrangler `vars`, which are
// runtime-only Worker bindings. The local .env that provides it is gitignored, so
// Cloudflare CI builds had no value and the Turnstile widget rendered with an
// undefined sitekey. Resolve it here so every build is self-contained: a local .env
// (or a process.env / dashboard build var) still wins, otherwise fall back to the real
// public site key. The key is public — it ships in client JS — so committing it is safe.
const TURNSTILE_SITE_KEY =
  loadEnv(process.env.NODE_ENV ?? "production", process.cwd(), "PUBLIC_")
    .PUBLIC_TURNSTILE_SITE_KEY ?? "0x4AAAAAADrBLBP56fAr_OT1";

// Which Worker this build targets. `yarn wrangler:deploy:dev` builds with
// CLOUDFLARE_ENV=dev (see wrangler.jsonc); production builds leave it unset.
// Resolved here at config-load time (plain Node — the var is reliably readable)
// and surfaced to components as import.meta.env.PUBLIC_DEPLOY_ENV, because bare
// process.env is NOT reliably available inside prerendered frontmatter under the
// Cloudflare adapter. base.astro uses this to emit a noindex on dev/staging.
const DEPLOY_ENV = process.env.CLOUDFLARE_ENV ?? "production";

// https://astro.build/config
export default defineConfig({
  // Canonical production origin. Lets layouts resolve absolute URLs (e.g. the
  // og:image / twitter:image, which FB / X / LINE scrapers require absolute).
  site: "https://operationbifrost.com",
  // sitemap() crawls the statically-generated routes and emits sitemap-index.xml
  // + sitemap-0.xml at build time (needs `site`, set above). robots.txt points
  // crawlers at it. No `news`/`video` content here, so trim those namespaces.
  integrations: [react(), sitemap({ namespaces: { news: false, video: false } })],
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
    define: {
      "import.meta.env.PUBLIC_TURNSTILE_SITE_KEY": JSON.stringify(TURNSTILE_SITE_KEY),
      "import.meta.env.PUBLIC_DEPLOY_ENV": JSON.stringify(DEPLOY_ENV),
    },
    server: {
      // Dev-server only (no effect on the built Worker). Lets a Cloudflare
      // quick-tunnel reach the local interactions endpoint for Discord testing.
      allowedHosts: [".trycloudflare.com"],
      watch: {
        ignored: ["**/design/**", "**/legacy/**"],
      },
    },
  },
});
