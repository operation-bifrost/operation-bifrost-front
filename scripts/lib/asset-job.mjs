// Shared helpers for the asset-optimization jobs (scripts/*-to-*.mjs, generate-thumbs).
// Each job is its own command; this module holds the bits they all need:
// recursive walking, a generic flag parser, per-file error isolation, and a
// savings summary.

import { readdir, stat } from "node:fs/promises";
import { join, basename } from "node:path";

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".astro", ".wrangler", ".yarn"]);

export const kb = (bytes) => Math.round(bytes / 1024);

export async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

export async function fileSize(p) {
  return (await stat(p)).size;
}

/** Recursively yield every file path under `dir`, skipping build/vendor folders. */
export async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* walk(join(dir, entry.name));
    } else if (entry.isFile()) {
      yield join(dir, entry.name);
    }
  }
}

const toCamel = (flag) => flag.replace(/^--?/, "").replace(/-([a-z])/g, (_, c) => c.toUpperCase());

/**
 * Minimal arg parser. `spec.bool` / `spec.value` list the accepted flags.
 * Returns { folder, flags, help }; flag keys are camelCased (--max-width → maxWidth).
 */
export function parseArgs(argv, { bool = [], value = [] } = {}) {
  const flags = {};
  const positional = [];
  let help = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") help = true;
    else if (bool.includes(a)) flags[toCamel(a)] = true;
    else if (value.includes(a)) flags[toCamel(a)] = argv[++i];
    else if (a.startsWith("-")) throw new Error(`Unknown option: ${a}`);
    else positional.push(a);
  }
  return { folder: positional[0], flags, help };
}

/** Parse + validate common CLI shape (folder arg, --help). Exits the process on error/help. */
export async function resolveCli(argv, spec, help) {
  let parsed;
  try {
    parsed = parseArgs(argv, spec);
  } catch (err) {
    console.error(`✖ ${err.message}\n`);
    console.log(help);
    process.exit(1);
  }
  if (parsed.help) {
    console.log(help);
    process.exit(0);
  }
  if (!parsed.folder) {
    console.error("✖ Missing <folder> argument.\n");
    console.log(help);
    process.exit(1);
  }
  if (!(await exists(parsed.folder))) {
    console.error(`✖ Folder not found: ${parsed.folder}`);
    process.exit(1);
  }
  return parsed;
}

/**
 * Walk `folder`, run `handle(path)` on each file matching `match(path)`, isolating
 * per-file errors so one bad file doesn't abort the run. Returns the collected rows.
 */
export async function processAll({ folder, match, handle }) {
  const rows = [];
  for await (const path of walk(folder)) {
    if (!match(path)) continue;
    try {
      const row = await handle(path);
      if (row) rows.push(row);
    } catch (err) {
      console.error(`  ✖ ${path}: ${err.message}`);
    }
  }
  return rows;
}

/** Print a per-file + total savings summary. Rows whose action ends in "skip" show as skipped. */
export function report(rows) {
  if (rows.length === 0) return console.log("Nothing to do.");
  let totalBefore = 0;
  let totalAfter = 0;
  let written = 0;
  for (const r of rows) {
    if (r.action.endsWith("skip")) {
      console.log(`  ${r.action.padEnd(11)}  ${basename(r.file)}`);
      continue;
    }
    written++;
    totalBefore += r.before || 0;
    totalAfter += r.after || 0;
    const delta = r.before ? `${kb(r.before)}K → ${kb(r.after)}K` : `${kb(r.after)}K`;
    console.log(`  ${r.action.padEnd(11)}  ${basename(r.file).padEnd(34)} ${delta}`);
  }
  console.log(
    `\n${written} file(s) written.` +
      (totalBefore
        ? `  ${kb(totalBefore)}K → ${kb(totalAfter)}K (saved ${kb(totalBefore - totalAfter)}K)`
        : ""),
  );
}
