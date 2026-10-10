# design-sync notes — Tibbie X

Claude Design project: "Tibbie X Design System" (`projectId` in config.json).

## How this repo is synced

- This is an app, not a published package. `node .design-sync/build.mjs` (cfg.buildCmd)
  packages `src/ui/` into `.ds-sync/pkg/` (gitignored): a barrel re-exporting
  `.design-sync/entry.ts`, tsc declarations, `docs/` lifted from each component's
  `/* */` comment (frontmatter `category` = its src/ui folder, "brand" for
  src/assets), and the compiled stylesheet. Run it before the converter, every time.
- `entry.ts` is the component list. A new `src/ui/` component needs a line there.
  MagicDust and Honeypot are left out on purpose.
- The stylesheet is `.design-sync/ds.css` compiled by the site's own Vite + Tailwind:
  `src/styles/index.css` + a safelist (`@source inline`) of token utilities, layout
  utilities and every text style, + `@source "./previews"`. Tailwind only emits classes
  it finds, and designs are written after the build — anything not safelisted or used
  by the site/previews does not exist in a design. Extend the safelist, not the app.
- ds.css also sets `body { font-family; color }` — what App's root div does on the site.
  Without it, unclassed text (LinkRow titles) renders black.
- Images in the CSS (the record, the banner) are inlined as data URIs (~550 KB CSS).
- Google Fonts are an `@import url()` prepended by build.mjs from index.html's `<link>`.
- `extraEntries: ["lucide-react"]` puts every lucide icon on `window.TibbieX`. lucide's
  `Pill` collides with ours; ours wins ([EXPORT_COLLISION] warn is expected).
- `dtsPropsFor` hand-writes contracts for components whose props use content types
  (LinkEntry, ShopItem, Album, Photo, …) — the extractor emitted `unknown` or bare type
  names. **If a content type or a component's props change, update these by hand.**

## Previews

- All 32 authored in `.design-sync/previews/`, data inlined from `src/content/` (real
  media-bucket photos, real copy). Previews never import content modules — the
  `.prompt.md` examples are built from them and must be copy-pasteable.
- Overlay / Lightbox are `position: fixed`; the card harness contains fixed children in
  a zero-height box, so their previews wrap in an `h-[..rem]` stage (+ cardMode single).
- PriceCard previews leave `index` unset: the staggered deal-in animation was captured
  mid-flight and read as a broken tilted layout.
- Wide components use `cardMode: "column"` (validator [GRID_OVERFLOW]).
- Running prettier over previews changes their source hash and clears grades — format
  before grading, not after.

## Known render warns

- [RENDER_THIN] SiteQrCode — an SVG with no text; renders correctly.
- [RENDER_THIN] VenmoIcon / TikTokIcon / PatreonIcon — glyph-only; render correctly.

## Re-sync risks

- `dtsPropsFor` is a hand copy of prop shapes — it silently goes stale when a
  component's props or the content types change.
- Preview data (photo URLs, prices, Vampire Cats formats) is copied from content/ and
  goes stale when content changes; media-bucket keys are content-hashed, so a re-cut
  photo leaves the old URL in a preview (still loads until deleted from R2).
- ShopLink's preview renders live `shopFor("reagan-youth")` from the bundle: if that
  shelf empties, the card renders nothing.
- `music.ts` DISCOGRAPHY "Never Rest in Peace" points at an Unsplash photo that 404s;
  the AlbumTile preview uses a different image.
- The playwright pin (1.60.0) matches the cached chromium-1223; a new chromium cache
  needs a matching playwright in `.ds-sync/`.
- The bundle also needs network at design time for Google Fonts and media images.
