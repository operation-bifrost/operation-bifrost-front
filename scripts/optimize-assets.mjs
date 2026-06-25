// Recursively optimize a folder of static assets.
//
//   yarn optimize:assets <folder> [options]
//
// Three passes, in order:
//   1. fonts   — .ttf / .otf            → .woff2          (wawoff2)
//   2. images  — .png / .jpg / .jpeg    → .webp           (sharp, capped at --max-width)
//   3. thumbs  — every .webp wider than --thumb-width → <name>-thumb.webp
//
// Idempotent: an output that already exists is skipped unless --force. Originals
// are kept unless --delete-originals. Use --dry-run to preview.
//
// Options:
//   --quality <n>        webp quality for full images   (default 80)
//   --max-width <px>     downscale images wider than this (default 1920, no upscale)
//   --thumb-width <px>   thumbnail width                 (default 640)
//   --thumb-quality <n>  webp quality for thumbnails     (default 70)
//   --thumb-suffix <s>   thumbnail filename suffix       (default "-thumb")
//   --no-thumbs          skip the thumbnail pass
//   --delete-originals   delete source raster/font after a successful convert
//   --force              regenerate outputs that already exist
//   --dry-run            report planned work without writing
//   -h, --help           show this help

import { readdir, stat, readFile, writeFile, unlink } from "node:fs/promises";
import { join, extname, basename, dirname } from "node:path";
import sharp from "sharp";
import { compress as woff2Compress } from "wawoff2";

const RASTER_EXT = new Set([".png", ".jpg", ".jpeg"]);
const FONT_EXT = new Set([".ttf", ".otf"]);
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".astro", ".wrangler", ".yarn"]);

function parseArgs(argv) {
  const opts = {
    quality: 80,
    maxWidth: 1920,
    thumbWidth: 640,
    thumbQuality: 70,
    thumbSuffix: "-thumb",
    thumbs: true,
    deleteOriginals: false,
    force: false,
    dryRun: false,
  };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "-h":
      case "--help":
        opts.help = true;
        break;
      case "--no-thumbs":
        opts.thumbs = false;
        break;
      case "--delete-originals":
        opts.deleteOriginals = true;
        break;
      case "--force":
        opts.force = true;
        break;
      case "--dry-run":
        opts.dryRun = true;
        break;
      case "--quality":
        opts.quality = Number(argv[++i]);
        break;
      case "--max-width":
        opts.maxWidth = Number(argv[++i]);
        break;
      case "--thumb-width":
        opts.thumbWidth = Number(argv[++i]);
        break;
      case "--thumb-quality":
        opts.thumbQuality = Number(argv[++i]);
        break;
      case "--thumb-suffix":
        opts.thumbSuffix = argv[++i];
        break;
      default:
        if (a.startsWith("-")) throw new Error(`Unknown option: ${a}`);
        positional.push(a);
    }
  }
  opts.folder = positional[0];
  return opts;
}

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    throw new Error(`Cannot read folder "${dir}": ${err.message}`);
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walk(join(dir, entry.name));
    } else if (entry.isFile()) {
      yield join(dir, entry.name);
    }
  }
}

const kb = (bytes) => Math.round(bytes / 1024);
const fileSize = async (p) => (await stat(p)).size;

const summary = [];
function record(action, file, before, after) {
  summary.push({ action, file, before, after });
}

async function convertFont(path, opts) {
  const out = path.slice(0, -extname(path).length) + ".woff2";
  if (!opts.force && (await exists(out))) return record("font·skip", out, 0, await fileSize(out));
  const before = await fileSize(path);
  if (opts.dryRun) return record("font·plan", out, before, 0);
  const woff2 = Buffer.from(await woff2Compress(await readFile(path)));
  await writeFile(out, woff2);
  if (opts.deleteOriginals) await unlink(path);
  record("font→woff2", out, before, woff2.length);
}

async function convertImage(path, opts) {
  const out = path.slice(0, -extname(path).length) + ".webp";
  if (!opts.force && (await exists(out))) return record("img·skip", out, 0, await fileSize(out));
  const before = await fileSize(path);
  if (opts.dryRun) return record("img·plan", out, before, 0);
  await sharp(path)
    .resize({ width: opts.maxWidth, withoutEnlargement: true })
    .webp({ quality: opts.quality, effort: 6 })
    .toFile(out);
  if (opts.deleteOriginals) await unlink(path);
  record("img→webp", out, before, await fileSize(out));
}

async function makeThumb(path, opts) {
  const ext = extname(path);
  const stem = basename(path, ext);
  if (stem.endsWith(opts.thumbSuffix)) return; // never thumbnail a thumbnail
  const out = join(dirname(path), `${stem}${opts.thumbSuffix}${ext}`);
  if (!opts.force && (await exists(out))) return record("thumb·skip", out, 0, await fileSize(out));
  const { width } = await sharp(path).metadata();
  if (!width || width <= opts.thumbWidth) return; // already small enough
  if (opts.dryRun) return record("thumb·plan", out, 0, 0);
  await sharp(path)
    .resize({ width: opts.thumbWidth, withoutEnlargement: true })
    .webp({ quality: opts.thumbQuality, effort: 6 })
    .toFile(out);
  record("thumb", out, 0, await fileSize(out));
}

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

const HELP = `optimize-assets — recursively convert images to webp (+thumbnails) and fonts to woff2

  yarn optimize:assets <folder> [options]

Options:
  --quality <n>        webp quality for full images        (default 80)
  --max-width <px>     downscale images wider than this     (default 1920, no upscale)
  --thumb-width <px>   thumbnail width                      (default 640)
  --thumb-quality <n>  webp quality for thumbnails          (default 70)
  --thumb-suffix <s>   thumbnail filename suffix            (default "-thumb")
  --no-thumbs          skip the thumbnail pass
  --delete-originals   delete the source raster/font after a successful convert
  --force              regenerate outputs that already exist
  --dry-run            report planned work without writing
  -h, --help           show this help

Example:
  yarn optimize:assets public/images/steins-gate --quality 78`;

async function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`✖ ${err.message}\n`);
    console.log(HELP);
    process.exit(1);
  }
  if (opts.help) return console.log(HELP);
  if (!opts.folder) {
    console.error("✖ Missing <folder> argument.\n");
    console.log(HELP);
    process.exit(1);
  }
  if (!(await exists(opts.folder))) {
    console.error(`✖ Folder not found: ${opts.folder}`);
    process.exit(1);
  }

  const files = [];
  for await (const f of walk(opts.folder)) files.push(f);

  const fonts = files.filter((f) => FONT_EXT.has(extname(f).toLowerCase()));
  const rasters = files.filter((f) => RASTER_EXT.has(extname(f).toLowerCase()));

  console.log(
    `Optimizing "${opts.folder}"${opts.dryRun ? " (dry-run)" : ""} — ` +
      `${fonts.length} font(s), ${rasters.length} raster image(s)\n`,
  );

  // Pass 1: fonts
  for (const f of fonts) await safe(() => convertFont(f, opts), f);
  // Pass 2: rasters → webp (must run before thumbs so new webp get thumbnailed)
  for (const f of rasters) await safe(() => convertImage(f, opts), f);
  // Pass 3: thumbnails from every webp (skips -thumb files and small images)
  if (opts.thumbs) {
    const webps = [];
    for await (const f of walk(opts.folder))
      if (extname(f).toLowerCase() === ".webp") webps.push(f);
    for (const f of webps) await safe(() => makeThumb(f, opts), f);
  }

  report();
}

async function safe(fn, file) {
  try {
    await fn();
  } catch (err) {
    console.error(`  ✖ ${file}: ${err.message}`);
  }
}

function report() {
  if (summary.length === 0) return console.log("Nothing to do.");
  let totalBefore = 0,
    totalAfter = 0,
    converted = 0;
  for (const r of summary) {
    if (r.action.includes("skip")) {
      console.log(`  ${r.action.padEnd(11)}  ${basename(r.file)}`);
      continue;
    }
    converted++;
    totalBefore += r.before;
    totalAfter += r.after;
    const delta = r.before ? `${kb(r.before)}K → ${kb(r.after)}K` : `${kb(r.after)}K`;
    console.log(`  ${r.action.padEnd(11)}  ${basename(r.file).padEnd(34)} ${delta}`);
  }
  console.log(
    `\n${converted} file(s) written.` +
      (totalBefore
        ? `  ${kb(totalBefore)}K → ${kb(totalAfter)}K (saved ${kb(totalBefore - totalAfter)}K)`
        : ""),
  );
}

main();
