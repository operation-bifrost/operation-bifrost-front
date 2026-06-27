import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

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

// `site` seeds the absolute URLs Astro bakes into the prerendered build (og:image,
// twitter:image, sitemap). It must match the origin that actually serves THIS build
// so social scrapers fetch a reachable card: the dev Worker references its own
// domain, prod references prod. The dev build is the one made with CLOUDFLARE_ENV=dev
// (see wrangler.jsonc / `yarn wrangler:deploy:dev`). `astro dev` is unaffected — there
// base.astro resolves og:image against the live request origin instead.
const SITE =
  process.env.CLOUDFLARE_ENV === "dev"
    ? "https://develop.operationbifrost.com"
    : "https://operationbifrost.com";

// https://astro.build/config
export default defineConfig({
  site: SITE,
  integrations: [react()],
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
    define: {
      "import.meta.env.PUBLIC_TURNSTILE_SITE_KEY": JSON.stringify(TURNSTILE_SITE_KEY),
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
