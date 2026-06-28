declare module "@fontsource/*";

// Worker secrets are set out-of-band (`wrangler secret put`, and `.dev.vars` for
// local dev), so they are absent from wrangler.jsonc. `wrangler types` derives the
// Env type from wrangler.jsonc only, so on CI (no `.dev.vars`) it regenerates
// worker-configuration.d.ts WITHOUT these keys and `astro check` fails. Declaration-
// merge them onto Cloudflare.Env here so they survive every `wrangler types` regen.
declare namespace Cloudflare {
  interface Env {
    DISCORD_PUBLIC_KEY: string;
    DISCORD_BOT_TOKEN: string;
    DISCORD_CHANNEL_ID: string;
    TURNSTILE_SECRET_KEY: string;
  }
}
