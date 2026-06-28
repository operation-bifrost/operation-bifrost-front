// render-og — build the Open Graph / social cards from scripts/og-template.html.
//
// Why a render step (not a hand-captured screenshot): the cards in
// scripts/og-template.html ARE the single source of truth. This job
// re-renders them to PNG with a real headless Chromium, so the
// shipped og:image always matches the design and there is no stale manual
// capture to babysit. The CSS leans on browser-only features (filters,
// mix-blend-mode, text-stroke, the Nixie text-shadow glow, WOFF2 fonts, WEBP
// images) that the WASM OG generators (Satori/workers-og) can't render — hence
// a Chromium screenshot rather than runtime generation in the Worker.
//
// Output (committed, like the other assets:* jobs):
//   #og-sg   -> public/og-steins-gate.png   (used by /steins-gate/)
//   #og-home -> public/og-image.png         (base.astro default, used by /)
//
// Usage:
//   yarn assets:og            # render both cards at 1200x630
//   yarn assets:og --scale 2  # 2400x1260 (retina-crisp; ~4x the file size)
//   yarn assets:og --help

import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const SOURCE = "/scripts/og-template.html";
const OUT_DIR = join(ROOT, "public");
// card node id (in the template) -> output filename
const CARDS = {
  "og-sg": "og-steins-gate.png",
  "og-home": "og-image.png",
};

const HELP = `render-og — build the OG cards from scripts/og-template.html

  yarn assets:og [--scale N]

  --scale N   device scale factor (1 = 1200x630, 2 = 2400x1260). Default 1.
  --help      show this message

Source : ${SOURCE}
Output : public/${Object.values(CARDS).join(", public/")}`;

function parseArgs(argv) {
  let scale = 1;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") return { help: true };
    else if (a === "--scale") scale = Number(argv[++i]);
    else throw new Error(`Unknown option: ${a}`);
  }
  if (!Number.isFinite(scale) || scale < 1) throw new Error("--scale must be a number >= 1");
  return { scale };
}

const CONTENT_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".woff2": "font/woff2",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json",
};

// Minimal static file server rooted at the repo so the template's relative
// paths (../public/fonts, ../public/images) resolve and fonts/images load
// without the file:// CORS quirks that break @font-face in headless Chromium.
function startServer() {
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      const safe = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
      const data = await readFile(join(ROOT, safe));
      res.writeHead(200, {
        "content-type": CONTENT_TYPES[extname(safe).toLowerCase()] ?? "application/octet-stream",
      });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end("not found");
    }
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    return;
  }

  const { server, port } = await startServer();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 1400 },
      deviceScaleFactor: args.scale,
    });
    await page.goto(`http://127.0.0.1:${port}${SOURCE}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);

    for (const [id, file] of Object.entries(CARDS)) {
      const node = page.locator(`#${id}`);
      const box = await node.boundingBox();
      if (!box) throw new Error(`Card node #${id} not found in ${SOURCE}`);
      await node.screenshot({ path: join(OUT_DIR, file) });
      console.log(
        `✓ public/${file}  (${Math.round(box.width)}x${Math.round(box.height)} @${args.scale}x)`,
      );
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(`render-og failed: ${err.message}`);
  process.exit(1);
});
