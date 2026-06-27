import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
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
