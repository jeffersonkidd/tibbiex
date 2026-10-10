# Tibbie X — building with this library

Dark, colourless page (a black vinyl record photo behind everything), one saturated
action colour (brand red) and one highlight colour (amber). Components are
`window.TibbieX.*` — the site's own `src/ui/` — plus every `lucide-react` icon on the
same global (`TibbieX.Spade`, `TibbieX.Mail`, …). `TibbieX.Pill` is the library's Pill,
not lucide's.

## Setup

No provider. `styles.css` carries everything: tokens, fonts (Inter, Roboto Mono,
Permanent Marker), the record background on `body::before`, and body text in
`font-sans` / `text-foreground`. Lay pages out the way the site does — one centred
column:

```jsx
<div className="flex min-h-screen justify-center pb-20">
  <div className="w-full max-w-2xl space-y-stack px-4 pt-6 sm:px-6">…blocks…</div>
</div>
```

Never give the page or that column a background colour — it hides the record.

## Styling idiom: Tailwind v4 utilities on the site's tokens

Only pre-compiled classes exist (no JIT in a design). Use these names:

| Job | Classes |
| --- | --- |
| Text colour | `text-foreground`, `text-muted-foreground`, `text-accent`, `text-primary` |
| Surfaces | `bg-card` (panels), `bg-muted`, `bg-popover`, `bg-input-background`, `bg-card/50` (sheer strips), `border-border`, `border-border-strong` |
| Brand | `bg-primary` / `.brand-surface` (red CTAs + active tab only), `bg-accent-tint`, `bg-accent-soft`, `border-accent` |
| Text styles (one per element, no extra size/weight) | `heading-xl`, `heading-l`, `heading-m`, `heading-s` (Permanent Marker — never bold it), `body-large(-bold)`, `body-base(-bold)`, `body-small(-bold)`, `body-xs(-bold)`, `label-mono`, `label-mono-xs` |
| Insets | `p-strip` 6px, `p-card` 16, `p-panel` 20 (every block in the column), `p-modal` 24 |
| Gaps | `gap-glyph` 6, `gap-cluster` 8, `gap-part` 12, `gap-stack` / `space-y-stack` 16 (between blocks) |
| Treatments | `.surface` (panel fill + border + blur), `.featured` (amber breathing highlight, one block per page), `.arcana-veil`, `.hide-scrollbar` |

A panel is `<section className="surface rounded-lg p-panel">`. Radii: `rounded-md` for
controls, `rounded-lg` for panels and rows. Layout utilities (`flex`, `grid-cols-*`,
`w-*`, `max-w-*`, numbered `p-*`/`gap-*`, `sm:`/`md:` variants) are compiled too.

Rules: red is only for the one CTA in a block and the active tab; amber marks choices,
prices and the featured block; green (`bg-live`) only means "live right now".

## Component rules learned the hard way

- A `block` `Button` fills its parent — size it with a wrapper, never `className="w-…"`.
- `Avatar`'s root is full width (the live dot pins to its corner): put it in a
  `w-fit` or `items-start` parent.
- `Overlay` is a fixed full-viewport modal; put `OverlayBody` inside it. Modals grow
  with their content and the backdrop scrolls — no inner scroll areas.
- `Separator` has no margin by default; use `space="sm|md|lg"` only in normal flow.
- `ShopLink` reads the live shop catalogue and renders nothing for a band without items.

## Where the truth lives

`styles.css` → `_ds_bundle.css` holds every token (`--color-*`, `--spacing-*`,
`--radius-*`, `--font-*`) and treatment class. Each component's `.prompt.md` carries the
source's own notes and examples; its `.d.ts` is the prop contract.

## Example

```jsx
const { PanelHeader, Chip, Button, VenmoLink, Flame, Send } = window.TibbieX
<section className="surface rounded-lg p-panel">
  <PanelHeader icon={Flame} title="Van Fund" sub="Get the band to the next show" badge="62% there" />
  <div className="mt-5 grid grid-cols-4 gap-cluster">
    {[5, 10, 25, 50].map((n) => (
      <Chip key={n} pressed={n === 10} onClick={() => {}}>${n}</Chip>
    ))}
  </div>
  <div className="mt-4 flex flex-col gap-part">
    <Button icon={Send}>Contribute $10</Button>
    <VenmoLink handle="tibbiex" onClick={() => {}} />
  </div>
</section>
```
