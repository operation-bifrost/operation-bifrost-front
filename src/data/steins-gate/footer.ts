const DISCORD_GUILD_ID = "898151211889475624";

export const footer = {
  discord: {
    // Live community card is built from the public widget JSON (CORS-enabled).
    // Requires "Enable Server Widget" to stay on in Discord server settings.
    widgetJson: `https://discord.com/api/guilds/${DISCORD_GUILD_ID}/widget.json`,
    // Fallback invite used if the widget JSON can't be reached.
    inviteHref: "https://discord.gg/8WHxqbCjGD",
    name: "Operation Bifrost",
    subtitle: "ปฏิบัติการไบฟรอส",
    blurb: "เข้าร่วมแล็บออนไลน์ของเรา พูดคุย ถามปัญหา และติดตามความคืบหน้าการแปลแบบเรียลไทม์",
    ctaLabel: "เข้าร่วม Discord",
  },
  tagline: "โครงการแปลวิชวลโนเวล Steins;Gate เป็นภาษาไทยโดยแฟนๆ",
} as const;
