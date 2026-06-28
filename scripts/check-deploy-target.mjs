// Predeploy tripwire: asserts the BUILT worker (dist/server/wrangler.json) targets the
// D1 database that matches the current git branch, before `wrangler deploy` ships it.
//
// Why this exists: with @astrojs/cloudflare (Astro 6) the deploy target is resolved at
// BUILD time via CLOUDFLARE_ENV — NOT by `wrangler deploy --env`. A build done without
// CLOUDFLARE_ENV=dev bakes the PROD D1 binding into dist, so a "dev" deploy from the
// develop branch silently reads/writes the PROD database. This guard fails loudly on that
// mismatch instead of letting the bad artifact deploy. See wrangler.jsonc for the footgun.
//
// Branch -> expected D1 (mirror wrangler.jsonc: top-level = prod, env.dev = dev):
//   develop -> operationbifrost-comments-dev  (build with CLOUDFLARE_ENV=dev)
//   main    -> operationbifrost-comments      (build with no CLOUDFLARE_ENV)
//
// Escape hatch (deliberate, e.g. one-off / CI): SKIP_DEPLOY_GUARD=1 yarn wrangler:deploy
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST_CONFIG = resolve(repoRoot, "dist/server/wrangler.json");

// Branch -> the only D1 database a deploy from that branch is allowed to ship.
// Keep these database_id values in sync with wrangler.jsonc if they ever change.
const TARGETS = {
  develop: {
    databaseName: "operationbifrost-comments-dev",
    databaseId: "8bacea09-edc7-4b49-a012-ee9e144edaf2",
    buildCmd: "CLOUDFLARE_ENV=dev yarn build",
  },
  main: {
    databaseName: "operationbifrost-comments",
    databaseId: "d1a8ad43-eecf-4dc5-bd88-a9a659fd2c84",
    buildCmd: "yarn build",
  },
};

const c = { red: "\x1b[31m", yellow: "\x1b[33m", green: "\x1b[32m", reset: "\x1b[0m" };

function fail(msg) {
  console.error(`${c.red}✖ deploy guard: ${msg}${c.reset}`);
  process.exit(1);
}

if (process.env.SKIP_DEPLOY_GUARD === "1") {
  console.warn(`${c.yellow}⚠ deploy guard skipped (SKIP_DEPLOY_GUARD=1)${c.reset}`);
  process.exit(0);
}

let branch;
try {
  branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
} catch {
  fail("could not determine the current git branch.");
}

const target = TARGETS[branch];
if (!target) {
  console.warn(
    `${c.yellow}⚠ deploy guard: branch "${branch}" has no known D1 mapping — skipping. ` +
      `Deploy dev from "develop" and prod from "main", or set SKIP_DEPLOY_GUARD=1 deliberately.${c.reset}`,
  );
  process.exit(0);
}

let config;
try {
  config = JSON.parse(readFileSync(DIST_CONFIG, "utf8"));
} catch {
  fail(`no build found at dist/server/wrangler.json — run \`${target.buildCmd}\` first.`);
}

const db = (config.d1_databases ?? []).find((d) => d.binding === "DB");
if (!db) fail('the built artifact has no "DB" D1 binding.');

if (db.database_id !== target.databaseId) {
  fail(
    `branch "${branch}" must deploy D1 "${target.databaseName}" (${target.databaseId}),\n` +
      `  but dist/server/wrangler.json targets "${db.database_name}" (${db.database_id}) ` +
      `as worker "${config.name}".\n` +
      `  -> Rebuild with the correct env:  ${target.buildCmd}`,
  );
}

console.log(
  `${c.green}✔ deploy guard: branch "${branch}" -> D1 "${db.database_name}" ` +
    `(worker "${config.name}") — OK${c.reset}`,
);
