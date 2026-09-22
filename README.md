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

Nothing in `api/` runs under `pnpm dev`, which serves the static app only. Use
`vercel dev` to exercise the endpoints, or expect every buy, deposit and
contribute button to report "Card payments only run on the deployed site" and
every form to report "Messages only send on the deployed site." The Venmo
links work either way.

## Layout

`App.tsx` is the page shell: the header, the profile card, the tab strip,
whichever tab is showing and whichever modal is open. Everything it lays out
sorts by one question — is it tied to this site's content?

- **ui** is reusable and content-blind: everything arrives as props.
- **site** is one-off blocks tied to this site's content. They may read
  `content/`, hold state and hand off to Venmo, Stripe or a mail client.
- **tabs** arrange site blocks and ui for one tab.

```
src/
  App.tsx            page shell — the tab and modal state that crosses between parts
  main.tsx           entry point
  tabs/              HomeTab, MusicTab, PortfolioTab, TourTab, BuyTab
  site/              content-bound blocks
    Header, ProfileCard, Footer   the page shell App stacks
    panels/            RehearsalPanel, FundPanel, NewsletterSignup
    modals/            AlbumModal, BookingModal, ShareModal, ReadingMenu,
                       ProductModal
  ui/                reusable, props only
    controls/          BrandButton, IconButton, SocialButton, TabItem, Field,
                       TextArea, EmailField, Chip, FilterPill, VenmoLink, Honeypot
    rows/              LinkRow, ShowRow, SupporterRow
    cards/             ShopCard, AlbumTile, PriceCard, PhotoGrid, ShopLink
    overlays/          Overlay, OverlayBody, Lightbox
    display/           Avatar, Pill, Meter, PanelHeader, DetailList, Separator,
                       SiteQrCode
    MagicDust          the spark canvas, mounted once in App
  content/           ALL site content, one file per subject (see below)
  lib/               pure logic, no JSX
    payments.ts        payVia() for either rail, the Stripe call, the return toast
    messages.ts        sendMessage() and subscribe(), the two mail endpoints
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
    treatments/        profile, featured, tarot, price-card, meter, magic-dust
  assets/            everything drawn or photographed, by kind
    icons/             small symbols that act as controls (Venmo, TikTok, Patreon)
    marks/             identity: logos and wordmarks (ReaganYouthMark)
    illustrations/     characters, ornaments, spots -- created as they arrive
    imagery/           photographs and the raster textures CSS paints with
api/
  checkout.ts        Vercel serverless: opens a Stripe Checkout Session
  contact.ts         sends the booking and restock messages via Resend
  subscribe.ts       adds a newsletter contact to the Resend audience
public/              files needing a stable, unhashed URL: og.jpg, the portrait
                     the structured data points at, icons, robots, sitemap
```

Imports run one way: `App` → `tabs` → `site` → `ui` → `lib` and
`content` → `assets`. Site blocks never import other site blocks, tabs never
import other tabs, and `assets` imports nothing from the app. A site block gets
its own folder only once it has a second file.

## Paying

`FundPanel`, `ReadingMenu` and `ProductModal` each build one order (amount,
note, purpose) and hand it to `payVia()`. The site never touches the money: it
composes hand-offs.

Card is the rail each panel is built around — its form, its button and the
Stripe Checkout Session `api/checkout.ts` opens — because it is the one that
returns the payer to the site, mails a receipt and can collect a shipping
address. Venmo is a link under the button (`VenmoLink`), not half a toggle:
nothing comes back from it, the note is public, and on desktop it often ignores
the amount in the URL.

No panel asks for an email. Stripe Checkout collects one on its own page for
every card payment, and prefilling it would render that field read-only, so a
typo could not be fixed there.

## Mail

Every form sends for real, through [Resend](https://resend.com). Two
functions:

- `api/contact.ts` — the booking form and restock alerts, sent to
  `CONTACT_EMAIL` with the visitor's address as reply-to, so hitting reply in
  your inbox answers them.
- `api/subscribe.ts` — the newsletter, which adds the address to a Resend
  audience (the actual mailing list, broadcastable from Resend's dashboard)
  and sends a confirmation.

Two addresses, one job each: mail goes out as `MAIL_FROM` (`hello@`), and
every message replies to `contact@tibbiex.studio`, which Cloudflare Email
Routing delivers to your inbox — booking and restock notifications reply to
the visitor instead, so hitting reply answers them. Resend's DNS records live
in Cloudflare with the rest of the zone.

Both endpoints carry an off-screen honeypot field, strip newlines out of
anything that becomes a mail header, and cap every field's length.

## Editing the content

Everything the site _says_ lives in `src/content/` as typed data, one file per
subject: `profile.ts` (the card, socials, tags), `links.ts`, `music.ts`,
`shows.ts`, `portfolio.ts`, `shop.ts`, `fund.ts`, `newsletter.ts`,
`readings.ts`, `payments.ts` (the Venmo URL), `tabs.ts` and `site.ts` (address,
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

Environment variables in the Vercel project:

- `STRIPE_SECRET_KEY` — card checkout for the fund, reading deposits and shop
  orders. Set by hand. Without it the endpoint returns "Card payments aren't
  configured yet" and the Venmo links still work.
- `RESEND_API_KEY` — from the Resend dashboard. Without it the forms return
  "Messages aren't configured yet".
- `MAIL_FROM` — what mail is sent as, e.g. `Tibbie X Studio
<hello@tibbiex.studio>`. An address that only sends: `contact@` receives
  through Cloudflare Email Routing, and sending as it invites a loop.
- `RESEND_AUDIENCE_ID` — the newsletter audience, set by hand. Without it the
  sign-up returns "The list isn't configured yet".

Resend will not deliver to anyone but your own address until `tibbiex.studio`
is verified: add the DKIM and SPF records it shows to Cloudflare DNS.

To keep your own visits out of the Analytics and Speed Insights numbers, open the
site once with `?no-analytics` in each browser you use. `?analytics` turns
tracking back on.

The site lives at `https://tibbiex.studio`; the `.vercel.app` address only
redirects there. If the domain changes, update `SITE_URL` in
`src/content/site.ts`, regenerate the pre-computed QR module path in
`ui/SiteQrCode.tsx`, and hand-edit the absolute URLs in `index.html`
(canonical, Open Graph and Twitter tags, structured data). Otherwise they keep
pointing at the old address.
