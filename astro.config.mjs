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

// https://astro.build/config
export default defineConfig({
  // Canonical production origin. Lets layouts resolve absolute URLs (e.g. the
  // og:image / twitter:image, which FB / X / LINE scrapers require absolute).
  site: "https://operationbifrost.com",
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
