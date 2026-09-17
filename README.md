# Tibbie X

A link-in-bio site for the musician Tibbie X — profile, discography, band
portfolio, a merch shop, tour dates, a podcast fund, a newsletter sign-up and a
tarot-reading menu. A single-page React app built with Vite and Tailwind, deployed to Vercel
with one serverless function for card payments.

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

| Script           | What it does                                     |
| ---------------- | ------------------------------------------------ |
| `pnpm dev`       | Vite dev server                                  |
| `pnpm build`     | Production build to `dist/` (does not typecheck) |
| `pnpm preview`   | Serve the built `dist/` locally                  |
| `pnpm typecheck` | `tsc --noEmit`, covering `src` and `api`         |
| `pnpm check`     | Typecheck **and** build — the pre-push gate      |
| `pnpm format`    | Format with Prettier                             |

Use pnpm, not npm — the `packageManager` field pins it. There is no test runner
or linter; `pnpm check` is the gate.

Prettier runs without semicolons (`.prettierrc`) and skips `pnpm-lock.yaml`
(`.prettierignore`).

The card rail (`api/checkout.ts`) does not run under `pnpm dev`, which serves
the static app only. Use `vercel dev` to exercise it, or expect every
Card option to report "Card payments only run on the deployed site."

## Layout

`App.tsx` is the page shell: the header, the profile card, the tab strip,
whichever tab is showing and whichever modal is open. Everything it lays out
sorts by one question — is it tied to this site's content?

- **components** are reusable and content-blind: everything arrives as props.
- **features** are one-off blocks tied to specific content. They may read
  `content/`, hold state and hand off to Venmo, Stripe or a mail client.
- **tabs** arrange features and components for one tab.

```
src/
  App.tsx            page shell — the tab and modal state that crosses between parts
  main.tsx           entry point
  tabs/              HomeTab, MusicTab, PortfolioTab, TourTab, BuyTab
  features/          content-bound blocks
    SiteHeader, SiteFooter, ProfileCard, RehearsalPanel,
    FundPanel, NewsletterSignup,
    AlbumModal, BookingModal, ShareModal, ReadingMenu, ProductModal
  components/        reusable, props only
    controls/          BrandButton, Field, EmailField, Chip, FilterPill, RailToggle
    rows/              LinkRow, ShowRow, SupporterRow
    cards/             ShopCard, AlbumTile, PhotoGrid, ShopLink
    overlays/          Overlay, OverlayBody, Lightbox
    Meter, Pill, PanelHeader, DetailList, MagicDust, SiteQrCode
  content/           ALL site content, one file per subject (see below)
  lib/               pure logic, no JSX
    payments.ts        payVia() for both rails, the Stripe call, the return toast
    email.ts           the address check
    share.ts           copy-the-link
    analytics.ts       Analytics and Speed Insights self-exclusion
    magic-dust.ts      the click-spark particle engine
  styles/            foundations: one stylesheet split by concern
    index.css          the entry: imports the rest in order
    tokens.css         colours, radii, the @theme inline mapping
    background.css     the record photo and scrim
    typography.css     display face, .mono-label
    surfaces.css       .surface, .brand-* (shapes and material effects)
    utilities.css      .hide-scrollbar
    marks.css          the Tibbie X wordmark, the Reagan Youth mark
    treatments/        profile, tarot, meter, magic-dust
  graphics/          everything drawn or photographed, by kind
    icons/             small symbols that act as controls (Venmo, TikTok, Patreon)
    marks/             identity: logos and wordmarks (ReaganYouthMark)
    illustrations/     characters, ornaments, spots -- created as they arrive
    imagery/           photographs and the raster textures CSS paints with
api/
  checkout.ts        Vercel serverless: opens a Stripe Checkout Session
```

Imports run one way: `App` → `tabs` → `features` → `components` → `lib` and
`content` → `graphics`. Features never import other features, tabs never import
other tabs, and `graphics` imports nothing from the app. A feature gets its own
folder only once it has a second file.

## Editing the content

Everything the site _says_ lives in `src/content/` as typed data, one file per
subject: `profile.ts` (the card, socials, tags), `links.ts`, `music.ts`,
`shows.ts`, `portfolio.ts`, `shop.ts`, `fund.ts`, `newsletter.ts`,
`readings.ts`, `payments.ts` (the rails), `tabs.ts` and `site.ts` (address,
inbox, Venmo handle). Changing what the site shows is an edit there, not to any
JSX.

To hide a tab, set its `enabled` flag to `false` in `tabs.ts`. A new tab needs
the flag set to `true`, or it will not appear.

The fonts (Inter, Roboto Mono, Special Elite) are loaded by a `<link>` in
`index.html`, not from the CSS. To change a font, edit `styles/typography.css`
and that link together.

### Placeholder content

Some of that content is still a stand-in: invented supporter names, stock
photos where real band photos will go, provisional prices, wording nobody has
signed off. Each such item carries `staged: true` in `src/content/`, so a
placeholder is marked in the type system, not only in a comment.

`content/status.ts` reads those flags back into a go-live checklist and prints
it once in the **dev console** (it is stripped from the production build). When
you confirm a piece of content, delete its `staged` flag at the source and it
drops off the checklist automatically. When the console is quiet, the site is
telling the truth end to end.

## Deploying

Deployed on Vercel. The static app builds with `pnpm build`; `api/checkout.ts`
is picked up as a serverless function automatically. Vercel runs it on the Node
version set by `engines.node` in `package.json` (24.x).

Set one environment variable in the Vercel project for the card rail:

- `STRIPE_SECRET_KEY` — card checkout for the fund, reading deposits and shop
  orders. Without it the endpoint returns "Card payments aren't configured yet"
  and the Venmo rail still works.

The newsletter sign-up and restock alerts have no list behind them yet: they
open the visitor's mail client with the request written out, like the booking
form. They stay on the go-live checklist until a mailing list is connected.

To keep your own visits out of the Analytics and Speed Insights numbers, open the
site once with `?no-analytics` in each browser you use. `?analytics` turns
tracking back on.

The site lives at `https://tibbiex.studio`; the `.vercel.app` address only
redirects there. If the domain changes, update `SITE_URL` in
`src/content/site.ts`, regenerate the pre-computed QR module path in
`components/SiteQrCode.tsx`, and hand-edit the absolute URLs in `index.html`
(canonical, Open Graph and Twitter tags, structured data). Otherwise they keep
pointing at the old address.
