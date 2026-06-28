// Recursively generate <name>-thumb.webp thumbnails from every .webp wider than
// --thumb-width (for gallery-style srcset). Skips thumbnails of thumbnails and
// images already small enough.
//   yarn assets:thumbs <folder> [options]
import { extname, basename, dirname, join } from "node:path";
import sharp from "sharp";
import { exists, fileSize, processAll, report, resolveCli } from "./lib/asset-job.mjs";

const HELP = `generate-thumbs — create -thumb.webp variants from webp images

  yarn assets:thumbs <folder> [options]

Options:
  -r, --recursive      recurse into subfolders (default: top level only)
  --thumb-width <px>   thumbnail width                  (default 640)
  --thumb-quality <n>  webp quality for thumbnails      (default 70)
  --thumb-suffix <s>   thumbnail filename suffix        (default "-thumb")
  --force              regenerate even if the thumbnail already exists
  --dry-run            report planned work without writing
  -h, --help           show this help`;

const { folder, flags } = await resolveCli(
  process.argv.slice(2),
  {
    bool: ["-r", "--recursive", "--force", "--dry-run"],
    value: ["--thumb-width", "--thumb-quality", "--thumb-suffix"],
  },
  HELP,
);

const thumbWidth = flags.thumbWidth ? Number(flags.thumbWidth) : 640;
const thumbQuality = flags.thumbQuality ? Number(flags.thumbQuality) : 70;
const suffix = flags.thumbSuffix ?? "-thumb";
const recursive = Boolean(flags.recursive || flags.r);

console.log(
  `Generating thumbnails in "${folder}"${recursive ? " (recursive)" : ""}${flags.dryRun ? " (dry-run)" : ""}\n`,
);

const rows = await processAll({
  folder,
  recursive,
  match: (p) => extname(p).toLowerCase() === ".webp" && !basename(p, ".webp").endsWith(suffix),
  handle: async (path) => {
    const out = join(dirname(path), `${basename(path, ".webp")}${suffix}.webp`);
    if (!flags.force && (await exists(out))) return { action: "thumb·skip", file: out };
    const { width } = await sharp(path).metadata();
    if (!width || width <= thumbWidth) return null; // already small enough
    if (flags.dryRun) return { action: "thumb·plan", file: out, after: 0 };
    await sharp(path)
      .resize({ width: thumbWidth, withoutEnlargement: true })
      .webp({ quality: thumbQuality, effort: 6 })
      .toFile(out);
    return { action: "thumb", file: out, after: await fileSize(out) };
  },
});

report(rows);
