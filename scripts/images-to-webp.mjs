// Recursively convert raster images (.png/.jpg/.jpeg) to .webp.
//   yarn assets:webp <folder> [options]
import { extname } from "node:path";
import { unlink } from "node:fs/promises";
import sharp from "sharp";
import { exists, fileSize, processAll, report, resolveCli } from "./lib/asset-job.mjs";

const RASTER_EXT = new Set([".png", ".jpg", ".jpeg"]);

const HELP = `images-to-webp — convert png/jpg/jpeg to webp

  yarn assets:webp <folder> [options]

Options:
  -r, --recursive      recurse into subfolders (default: top level only)
  --quality <n>        webp quality                      (default 80)
  --max-width <px>     downscale images wider than this  (default 1920, no upscale)
  --delete-originals   delete the source raster after a successful convert
  --force              re-convert even if the .webp already exists
  --dry-run            report planned work without writing
  -h, --help           show this help`;

const { folder, flags } = await resolveCli(
  process.argv.slice(2),
  {
    bool: ["-r", "--recursive", "--delete-originals", "--force", "--dry-run"],
    value: ["--quality", "--max-width"],
  },
  HELP,
);

const quality = flags.quality ? Number(flags.quality) : 80;
const maxWidth = flags.maxWidth ? Number(flags.maxWidth) : 1920;
const recursive = Boolean(flags.recursive || flags.r);

console.log(
  `Converting images in "${folder}"${recursive ? " (recursive)" : ""}${flags.dryRun ? " (dry-run)" : ""}\n`,
);

const rows = await processAll({
  folder,
  recursive,
  match: (p) => RASTER_EXT.has(extname(p).toLowerCase()),
  handle: async (path) => {
    const out = path.slice(0, -extname(path).length) + ".webp";
    if (!flags.force && (await exists(out))) return { action: "webp·skip", file: out };
    const before = await fileSize(path);
    if (flags.dryRun) return { action: "webp·plan", file: out, before, after: 0 };
    await sharp(path)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toFile(out);
    if (flags.deleteOriginals) await unlink(path);
    return { action: "img→webp", file: out, before, after: await fileSize(out) };
  },
});

report(rows);
