# Tibbie X

A link-in-bio site for the musician Tibbie X — profile, discography, band
portfolio, a merch shelf, tour dates, a podcast tip jar, and a tarot-reading
menu. A single-page React app built with Vite and Tailwind, deployed to Vercel
with one serverless function for card payments.

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

| Script           | What it does                                        |
| ---------------- | --------------------------------------------------- |
| `pnpm dev`       | Vite dev server                                     |
| `pnpm build`     | Production build to `dist/`                          |
| `pnpm preview`   | Serve the built `dist/` locally                     |
| `pnpm typecheck` | `tsc --noEmit`                                       |
| `pnpm check`     | Typecheck **and** build — the pre-push gate         |
| `pnpm format`    | Format with oxfmt                                    |

The card rail (`api/checkout.ts`) does not run under `pnpm dev`, which serves
the static app only. Use `vercel dev` to exercise it, or expect the tip jar's
Card option to report "Card payments only run on the deployed site."

## Layout

The app is a stack of self-contained cards. `App.tsx` holds the page state and
lays out the tabs; everything else lives in a module next to it.

```
src/
  App.tsx            page shell — state, tabs, and the modals it owns
  data.ts            ALL site content (see below)
  content-status.ts  the go-live checklist, derived from data.ts
  main.tsx           entry point
  styles/            foundations: one stylesheet split by concern
    index.css          the entry: imports the rest in order
    tokens.css         colours, radii, the @theme inline mapping
    background.css     the record photo and scrim
    typography.css     display face, .mono-label
    surfaces.css       .surface, .brand-* (shapes and material effects)
    utilities.css      .hide-scrollbar
    marks.css          the wordmark X, the Reagan Youth mark
    treatments/        tarot, meter, magic-dust
  lib/               pure logic, no JSX
    payments.ts        Stripe Checkout client call
    share.ts           copy-the-link
    analytics.ts       Vercel Analytics self-exclusion
    magic-dust.ts      the click-spark particle engine
  components/        reusable presentational pieces
    BrandButton, Field, Overlay, Lightbox, PhotoGrid,
    LinkRow, ShowRow, SupporterRow, ShopCard, AlbumTile,
    ShopLink, FilterPill, SiteQrCode, MagicDust
  features/          the two stateful panels
    TipJar.tsx         podcast tip jar (Venmo / card)
    ReadingMenu.tsx    tarot reading tiers
  graphics/          everything drawn or photographed, by kind
    icons/             small symbols that act as controls (Venmo, TikTok, Patreon)
    marks/             identity: logos and wordmarks (ReaganYouthMark)
    illustrations/     characters, ornaments, spots -- created as they arrive
    imagery/           photographs
api/
  checkout.ts        Vercel serverless: opens a Stripe Checkout Session
```

The dependency direction is one way: `features` and `App` use `components` and
`lib`; `components` use `lib` and `data`; `data` uses only `graphics`; `lib` and
`graphics` depend on nothing above them.

## Editing the content

Everything the site *says* — records, shows, links, portfolio, catalogue, tip
rails, reading tiers — lives in `src/data.ts` as typed data. Changing what the
site shows is an edit to that file, not to any JSX.

### Placeholder content

Some of that content is still a stand-in: invented supporter names, stock
photos where real band photos will go, provisional prices, wording nobody has
signed off. Each such item carries `staged: true` in `data.ts`, so a
placeholder is marked in the type system, not only in a comment.

`content-status.ts` reads those flags back into a go-live checklist and prints
it once in the **dev console** (it is stripped from the production build). When
you confirm a piece of content, delete its `staged` flag at the source and it
drops off the checklist automatically. When the console is quiet, the site is
telling the truth end to end.

## Deploying

Deployed on Vercel. The static app builds with `pnpm build`; `api/checkout.ts`
is picked up as a serverless function automatically.

Set one environment variable in the Vercel project for the card rail:

- `STRIPE_SECRET_KEY` — the tip jar's card checkout. Without it the endpoint
  returns "Card payments aren't configured yet" and the Venmo rail still works.

If the deployed URL changes, update `SITE_URL` in `data.ts` and regenerate the
pre-computed QR module path in `components/SiteQrCode.tsx` — otherwise the code
points at the old address.
