// Recursively convert fonts (.ttf/.otf) to .woff2 (compression only, no subsetting
// — a generic tool can't know which glyphs the content needs).
//   yarn assets:woff2 <folder> [options]
import { extname } from "node:path";
import { readFile, writeFile, unlink } from "node:fs/promises";
import { compress as woff2Compress } from "wawoff2";
import { exists, fileSize, processAll, report, resolveCli } from "./lib/asset-job.mjs";

const FONT_EXT = new Set([".ttf", ".otf"]);

const HELP = `fonts-to-woff2 — convert ttf/otf fonts to woff2

  yarn assets:woff2 <folder> [options]

Options:
  -r, --recursive      recurse into subfolders (default: top level only)
  --delete-originals   delete the source font after a successful convert
  --force              re-convert even if the .woff2 already exists
  --dry-run            report planned work without writing
  -h, --help           show this help`;

const { folder, flags } = await resolveCli(
  process.argv.slice(2),
  { bool: ["-r", "--recursive", "--delete-originals", "--force", "--dry-run"], value: [] },
  HELP,
);

const recursive = Boolean(flags.recursive || flags.r);

console.log(
  `Converting fonts in "${folder}"${recursive ? " (recursive)" : ""}${flags.dryRun ? " (dry-run)" : ""}\n`,
);

const rows = await processAll({
  folder,
  recursive,
  match: (p) => FONT_EXT.has(extname(p).toLowerCase()),
  handle: async (path) => {
    const out = path.slice(0, -extname(path).length) + ".woff2";
    if (!flags.force && (await exists(out))) return { action: "woff2·skip", file: out };
    const before = await fileSize(path);
    if (flags.dryRun) return { action: "woff2·plan", file: out, before, after: 0 };
    const woff2 = Buffer.from(await woff2Compress(await readFile(path)));
    await writeFile(out, woff2);
    if (flags.deleteOriginals) await unlink(path);
    return { action: "font→woff2", file: out, before, after: woff2.length };
  },
});

report(rows);
