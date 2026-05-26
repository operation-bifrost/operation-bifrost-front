import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import svelte from "@astrojs/svelte";
import cloudflare from "@astrojs/cloudflare";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte(), react()],
  adapter: cloudflare(),
  redirects: {
    '/': { status: 302, destination: '/steins-gate/' }
  },
  vite: {
    plugins: [tailwindcss()]
  }
});