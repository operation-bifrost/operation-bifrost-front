# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project context

**Operation Bifrost** is the public hub site for a Thai fan-localization collective. The first (and currently only) localized project surfaced here is **Steins;Gate**. The repo is structured so additional localization projects can be added later as sibling sections under their own URL segment (`/steins-gate/`, `/<future-project>/`, ...). See `README.md` for background on the translation project itself.

This site is **not** the translation tooling — it is the public-facing site that announces the project, tracks progress, and routes visitors to the Discord/Crowdin/etc.

## Stack

- **Astro 6** (`astro.config.mjs`) with two UI framework integrations: **React 19** (primary, for interactive UI / shadcn) and **Svelte 5** (legacy / kept for incremental migration).
- **Tailwind CSS v4** via `@tailwindcss/vite` — note this is the Vite-plugin / CSS-first config, not v3 PostCSS. There is no `tailwind.config.*`. Tokens live in `src/styles/global.css` (`@theme` / `@theme inline`) and per-project theme files (`src/styles/themes/*.css`).
- **Cloudflare Workers** runtime via `@astrojs/cloudflare` + `wrangler` (`wrangler.jsonc`). Worker types are regenerated into `worker-configuration.d.ts` on every dev/build via `wrangler types`.
- **Plausible** analytics is wired in `src/layouts/base.astro` (`operationbifrost.com`).
- Package manager is **Yarn 4** (`packageManager: yarn@4.9.1`).
- `legacy/` holds the previous site implementation kept for reference — do not import from it in new code.

## Commands

```bash
yarn dev              # wrangler types + astro dev
yarn build            # wrangler types + astro check + astro build
yarn preview          # wrangler types + astro preview
yarn wrangler:dev     # run the built worker locally
yarn wrangler:deploy  # deploy to Cloudflare Workers
```

`astro check` runs on every build and gates the build on type errors — fix type errors at the source, do not bypass.

## Routing & per-project architecture

- `/` redirects to `/steins-gate/` (`astro.config.mjs`, `redirects`). Treat `/` as a router shim, not a real landing page.
- Each localization project owns a top-level URL segment and gets its own:
  - **Layout** in `src/layouts/<project>.astro` that wraps `base.astro` and applies a theme class (e.g. `theme-steins-gate dark`) on `<html>`.
  - **Pages** in `src/pages/<project>/`.
  - **Components** in `src/components/<project>/`.
  - **Theme CSS** in `src/styles/themes/<project>.css`, imported by that project's layout.
- `base.astro` owns shared `<head>` (SEO/OG/Twitter meta, favicon, Plausible script, IBM Plex Sans Thai font). Per-project layouts pass props through and add their own `<slot name="head">` content if needed.
- Theme tokens in `global.css` are declared **once** as `var(--<token>)` references, then each `.theme-<project>` class supplies concrete values. To add a new project, ship a new theme class — do not redefine the token-to-utility mapping.

## Design system direction

The component / motion stack is being introduced incrementally. Use these in order of preference when adding interactive UI:

1. **shadcn/ui** (`components.json` is already configured — `new-york` style, `neutral` base, `lucide` icons, aliases `@/components`, `@/components/ui`, `@/lib/utils`, `@/hooks`). Install components via the **`shadcn` skill** (registered in `skills-lock.json`, lives under `.claude/skills/shadcn`). Ask Claude to use the "shadcn" skill — do not hand-author shadcn primitives.
2. **DiceUI** (https://www.diceui.com/docs/) as a shadcn-compatible extension for primitives shadcn does not cover (combobox, data-table, kanban, sortable, mention, etc.).
3. **React Bits** (https://reactbits.dev/get-started/introduction) as the default registry for motion / decorative components.

All three are registered as **namespaced shadcn registries** in `components.json` under `registries`:

| Namespace     | Registry URL                                                            |
| ------------- | ----------------------------------------------------------------------- |
| `@shadcn`     | `https://ui.shadcn.com/r/styles/{style}/{name}.json` (implicit default) |
| `@diceui`     | `https://diceui.com/r/{name}.json`                                      |
| `@react-bits` | `https://reactbits.dev/r/{name}.json`                                   |

Install with the CLI directly:

```bash
yarn dlx shadcn@latest add button card                     # @shadcn (implicit)
yarn dlx shadcn@latest add @diceui/combobox                # DiceUI
yarn dlx shadcn@latest add @react-bits/FadeContent-TS-TW   # React Bits — pick the -TS-TW variant
```

React Bits component names are **case-sensitive** and **variant-suffixed** (`-TS-TW`, `-TS-CSS`, `-JS-TW`, `-JS-CSS`). This project is TypeScript + Tailwind, so always use `-TS-TW`.

When you add a component, prefer **shadcn first**, then DiceUI, then React Bits, then hand-rolled — and keep the project's per-section folder structure (`src/components/<project>/...`) for project-specific compositions. Generic UI primitives belong under `src/components/ui/` per the `components.json` alias.

After installing from `@diceui` or `@react-bits`, **read the added files** and rewrite any hardcoded imports (e.g. `@/components/ui/...`) that don't match the project's actual aliases. The CLI only rewrites imports for its own UI files.

## Design source: `design/`

`design/steins-gate.pen` is a Pencil (https://pencil.dev) source file containing layout scaffolding for the Steins;Gate section. Treat it as **directional, not contractual** — the .pen is a rough page-shape sketch, not a strict spec. Designers can change it.

- `.pen` files are just json files, but **don't** open them with `Read`/`Grep`/`cat` directly. Use the **pencil MCP server** tools (`pencil` server is declared in `.mcp.json`; tools include `open_document`, `batch_get`, `get_screenshot`, etc.).
- **Always read the notes inside the .pen file** before implementing a section — that's where the designer's intent lives. The visual scaffold alone is not enough.
- If the pencil MCP server is not running locally (Pencil extension not installed), say so and proceed from the existing implementation; do not invent design intent.

## File & naming conventions

- **File names: `kebab-case`** — components, pages, layouts, styles, assets. E.g. `landing-page.tsx`, `steins-gate.astro`, `steins-gate.css`.
- Within TS/React code, follow standard identifier casing: `PascalCase` components/types, `camelCase` functions/variables/hooks (`use*`), `UPPER_SNAKE_CASE` constants.
- Import via the `@/*` alias (`tsconfig.json` `paths`) — do not use long relative paths.
- The repo is in the middle of moving off Svelte; new interactive UI should use React unless there's a concrete reason otherwise.

## MCP servers wired in this repo (`.mcp.json`)

- **`astro-docs`** — Astro documentation (http). Use it for Astro 6 specifics; the model's training data may pre-date this release.
- **`shadcn`** — the shadcn MCP server (`npx shadcn@latest mcp`). It reads `components.json` `registries` and exposes search / view / add across **all** declared registries (`@shadcn`, `@diceui`, `@react-bits`). One server, three sources. Init/refresh with `npx shadcn@latest mcp init --client claude`.

When a new tool/library category is introduced (e.g. another component registry), wire its MCP server into `.mcp.json` and document it here so future sessions know it exists.

## Things to know

- `wrangler types` runs before every script; if `worker-configuration.d.ts` is dirty/out-of-date, run `yarn dev` once to regenerate before debugging type errors.
- `tsconfig.json` excludes `legacy/`, so the legacy implementation does not block builds — but it is also not under type-checking. Do not migrate code by importing from `legacy/`; copy what you need into `src/` and adapt it.
- The Steins;Gate theme has a custom Nixie-tube glow keyframe (`bifrost-glow`, `bifrost-glow-all`, `bifrost-typing` in `src/styles/themes/steins-gate.css`) and three custom BONX fonts loaded from `/public/fonts`. These are part of the established visual language — reuse them rather than inventing new glow effects.
