# tibbiex

React + Vite + Tailwind CSS single-page app.

## Commands

This repo uses **pnpm** (see `pnpm-lock.yaml` and `.mise.toml`). Do not use npm.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Vite dev server on http://localhost:5173 (`PORT=xxxx pnpm dev` to override). Start it yourself; hot reload is immediate. |
| `pnpm build` | Production build into `dist/`. **Does not typecheck** — the script is `vite build` alone. |
| `pnpm preview` | Serve the built `dist/` on http://localhost:4173 (`PORT=xxxx` to override). |
| `pnpm format` | Format with oxfmt. |
| `pnpm exec tsc --noEmit` | Typecheck. Not wired to a script, and the only way to catch type errors. |

There is no test runner and no lint script here — no `pnpm test`, no vitest/jest config, so
there is no "run a single test" command to reach for. Verify changes with
`pnpm exec tsc --noEmit`, `pnpm build`, and the running dev server.

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into the `#root` element
- `src/App.tsx` - Primary application component and the usual starting point for UI work
- `src/index.css` - Global CSS entrypoint, Tailwind CSS v4 import, and the design token layers described below
- `src/assets/` - Images imported directly by components (e.g. the profile photo)
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with React and Tailwind CSS v4 plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- UI: `lucide-react` (icons) and `sonner` (toasts)
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

`package.json` carries a large scaffold dependency set (recharts, react-router, react-hook-form,
embla, vaul, cmdk, and more) that `src/` never imports. The only runtime imports are React,
React DOM, `lucide-react` and `sonner`. There is no router — `App.tsx` is the entire app — so
do not assume a dependency is wired up just because it is installed.

`vite.config.ts` pins a single React instance via `resolve.dedupe` plus `optimizeDeps.include`.
Removing that makes `sonner`'s hooks resolve against a null dispatcher at runtime.

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

## Design tokens

`src/index.css` defines **two independent token layers**, and `App.tsx` draws from both. Knowing
which layer a utility comes from is the difference between a one-line change and a confusing one.

1. **Design-kit tokens** — escaped-slash names (`--background\/default\/default`, `--radius\/200`)
   declared in the first `:root`, aliased by the first `@theme inline` into utilities like
   `bg-brand`, `text-on-brand`, `text-accent-strong`, `bg-surface`, `border-line`, and the
   `rounded-sm|md|lg|full` scale.
2. **Surface palette** — plain names (`--background`, `--card`, `--muted`, `--border`) declared in
   the second `:root`, aliased by the second `@theme inline` into `bg-card`, `bg-muted`,
   `border-border`, `text-foreground`, `text-muted-foreground`.

Two traps live here:

- **The radius scale is remapped.** `rounded-sm|md|lg` resolve to `--radius/100|200|400`, while
  `rounded-xl|2xl|3xl` still come from Tailwind's defaults. To change corner rounding, edit the
  token values — renaming classes silently hops between the two scales and can make corners
  *rounder* when you meant to tighten them.
- **Every token referenced by `@theme inline` must be declared.** An undefined one makes its
  `calc()` invalid and the property collapses to `0`. This is what silently squared off every
  `rounded-full` element until `--radius/full` was added.

## Shared visual treatments

Repeated styling lives as CSS classes in `src/index.css`, not as React components:
`.brand-surface` + `.brand-lift` + `.brand-pop` (red CTAs and the active tab), `.card-surface`
(the panels in the stack), `.mono-label`, `.wordmark`, `.hide-scrollbar`. Prefer extending these
over re-typing long class strings in JSX.

`.card-surface` sits in `@layer components` specifically so Tailwind utilities still override it —
that is how individual panels opt into `bg-card/60` or `hover:border-accent`. Keep new shared
treatments in that layer for the same reason.

`App.tsx` also defines local, non-exported helper components (`BrandButton`, `Field`, `Overlay`)
below the default-exported `App`. Small shared JSX belongs there rather than in a new file.

## Page background

The background is four fixed layers, and they only work together:

- `body` — dark red gradient ramp with radial blooms
- `body::before` — animated ember glows
- `body::after` — grain, halftone and vignette
- `#root` — `position: relative; z-index: 1`, above all of it

The app root element in `App.tsx` is deliberately transparent. Giving it a background colour
hides every layer above.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export the component a file is named for as a default export. Small helper components used
  only within one file stay local and unexported (see `BrandButton`/`Field`/`Overlay` in `App.tsx`).
