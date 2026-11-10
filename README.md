# Tibbie X

A link-in-bio site for the musician Tibbie X — profile, discography, band
portfolio, a merch shop, tour dates, a podcast fund, a newsletter sign-up and a
tarot-reading menu. A single-page React app built with Vite and Tailwind, deployed to Vercel
with a handful of serverless functions: card payments, mail, and the studio's
avatar and shop catalogue.

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
    shop.ts            the live shop: bundled, then cached, then Shopify
    shopify.ts         the Storefront API: products into designs, the checkout
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
  avatar.ts          the studio's avatar: serves it, swaps it in Vercel Blob
  products.ts        the studio's Shopify import sheet and its photos, in Blob
public/              files needing a stable, unhashed URL: og.jpg, the portrait
                     the structured data points at, icons, robots, sitemap
```

Imports run one way: `App` → `tabs` → `site` → `ui` → `lib` and
`content` → `assets`. Site blocks never import other site blocks, tabs never
import other tabs, and `assets` imports nothing from the app. A site block gets
its own folder only once it has a second file.

## Studio

The owner's back office lives at `/dashboard` (`dashboard.html`, a second Vite
entry, so the public page ships none of it; `vercel.json` rewrites `/dashboard`
to it, redirects the old `/studio` address there, and `robots.txt` keeps
crawlers out; `vite.config.ts` does the same for `pnpm dev` and `pnpm
preview`). It wears the site's tokens and type, and a strip at the top switches
modules (`/dashboard#avatar` opens straight onto one).

The door is a login screen: an all-access laminate that asks for the studio
passcode (`DASHBOARD_PASSWORD`) and checks it with `api/login.ts`. A device asks
once, then walks straight in until **Lock** forgets it or the passcode changes.
The screen is a courtesy rather than the lock: every module that changes the
live site still sends the passcode with its write, and that endpoint checks it.
Getting past the door sets the `?no-analytics` flag in that browser, since its
only visitor is the owner. Guessing is capped by a Vercel Firewall rule,
**Studio passcode guesses** (set in the dashboard, not in this repo): 30
requests per 10 minutes per IP across `/api/login`, every request to
`/api/products` (its GET checks the passcode too, since the import sheet holds
cost prices) and every non-GET to `/api/avatar`, answered with a 429 the
studio explains. A
spread-out attacker gets more IPs, so make the passcode long too (four random
words or more).

```
src/dashboard/
  main.tsx, Studio.tsx   the entry and the shell, door first
  Login.tsx              the door: the all-access pass at /dashboard
  links/                 Module 01, Link Maker
    LinkMaker.tsx          pick a profile and a spot on it, copy, paste
    LinkTicket.tsx         the link, each UTM tag inked and explained
    ledger.ts              which profiles are wired, in localStorage
  passcode.ts            the passcode: saved once per device, checked at the door
  avatar/                Module 02, Avatar
    AvatarMaker.tsx        drop, paste or pick a photo; frame it in the ring
    avatar.ts              the crop maths, the image it renders, the API calls
  products/              Module 03, Products: Shopify's import sheet
    SheetDesk.tsx          the products by design; download, upload; the save bar
    SheetProduct.tsx       one product, field by field, under the CSV's names
    SheetGrid.tsx          the whole sheet as rows and columns
    PhotoShelf.tsx         upload and order a product's photos
    sheet.ts               the columns, CSV in and out, checks, first fill,
                           the API calls, draft, photo shrink
src/content/channels.ts  the profiles, their UTM source and where to paste
src/lib/utm.ts           buildLink() and slug()
src/styles/studio.css    loaded by the studio only
```

**Link Maker** builds `https://tibbiex.studio/?utm_source=…&utm_medium=…&utm_campaign=…`
for each profile, so Google Analytics can tell an Instagram bio visit from a
TikTok one. Adding a platform, or fixing a menu path that moved, is an edit to
`channels.ts`. `C` copies and `1`–`0` pick a profile.

**Avatar** swaps the face on the profile card without a deploy. The ring is the
card's own avatar treatment, and it becomes the crop window in place: drag to
frame, slide or scroll to zoom. **Make it live** squares the frame into a 720px
WebP in the browser and posts it to `api/avatar.ts`, which stores it in Vercel
Blob. The profile card asks `/api/avatar` for its image and falls back to the
bundled portrait while none is uploaded (and under `pnpm dev`). A new face
reaches visitors within a minute; **Back to the original** deletes the upload.

**Products** is how products get into Shopify, which runs the shop and is
its source of truth. The site reads products, prices and stock from the
Storefront API (`src/lib/shopify.ts`) and sells through Shopify's checkout;
nothing in the Studio reaches a visitor until it is imported into Shopify.

The module keeps Shopify's own product CSV, column for column as Shopify's
template has it, so it can be filled in on a phone and saved between visits.
Products are listed under their `design:` tag; opening one edits it field by
field, every label the CSV's own column name (Title, URL handle, Description,
Vendor, Type, Tags, the options and each variant's value, SKU, price and
inventory quantity, Status, Published on online store, the SEO fields), with
photos dropped, pasted or picked, shrunk in the browser and uploaded to Blob
for their public **Product image URL**. **Sheet** shows the whole grid for the
columns the product page leaves out. Each product lists what would stop
Shopify's importer, and **Download CSV** waits until there is nothing on any
of those lists; the file goes into Shopify under **Products → Import**.
**Upload a CSV** replaces the sheet from a file: the template, a Shopify
export (either generation of its column names) or an earlier download.

Edits pile up as a draft in the browser, and **Save the sheet** stores the
whole sheet through `api/products.ts`, which checks it cell by cell and keeps
it in Vercel Blob. A save made on an older copy than the saved one (two
devices) is refused rather than undoing the other one; the last five saves are
kept under `shop/sheet/`.

The first sheet is filled from what the site already sold: the catalogue the
Studio used to publish (`shop/catalog/`), if there is one, otherwise the one
bundled in `content/shop.ts`. It is written as Shopify wants it, **one product
per format** ("Vampire Cats Sticker", "Vampire Cats Men's Tee"), because Shopify
files a product, not a variant, under a category and a type. Each carries
`design:`, `line:`, `band:`, `fit:` and `run:` tags, its format's mockup as
photo 1 and the design's artwork as photo 2, and the site gathers products
sharing a `design:` tag back into one piece with one modal. A Shopify
collection whose handle is the design's tag, if there is one, names it,
describes it and gives it its cover.

Modules still to come, roughly in order:

1. **Link Maker** — done.
2. **Avatar** — done.
3. **Products** — done.
4. **Where they came from** — a read-only view of visits by UTM source, from the
   GA Data API through one serverless function, behind the same passcode.
5. **Links, live** — switch the Home rows and profile socials on and off without a
   deploy, via Vercel Edge Config instead of `enabled` flags in `content/`.
6. **Go-live checklist** — the `staged` entries from `content/status.ts`, shown
   here rather than in the dev console.

## Paying

The shop sells through **Shopify**. `ProductModal` names the one variant
picked, `lib/shopify.ts` makes a one-line cart with the Storefront API, and the
buyer goes to Shopify's checkout, which prices it, adds shipping and tax, takes
the address and counts the stock down. There is no Venmo on a product: a Venmo
sale would never reach Shopify, so its stock and orders would stop being true.

Everything else that takes money — `FundPanel` and the session deposits —
builds one order (amount, note, purpose) and hands it to `payVia()`. The site
never touches the money: it composes hand-offs.

Card is the rail those panels are built around — its form, its button and the
Stripe Checkout Session `api/checkout.ts` opens — because it is the one that
returns the payer to the site and mails a receipt. Venmo is a link under the button (`VenmoLink`), not half a toggle:
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
`shows.ts`, `portfolio.ts`, `shop.ts` (the formats, banners and shelves; the
products themselves are in Shopify, and the catalogue here is only the
fallback), `fund.ts`, `newsletter.ts`,
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

- `VITE_SHOPIFY_STOREFRONT_TOKEN` — the Storefront API's public token for
  `tibbiex.myshopify.com` (`SHOPIFY_DOMAIN` in `content/site.ts`), from the
  Headless channel in the Shopify admin, with product, collection and cart
  access. Public by design: Vite builds it into the page. Without it the shop
  shows the catalogue bundled with the app and nothing can be bought. Like
  every `VITE_` variable it is read at build time, so redeploy after setting it.
- `STRIPE_SECRET_KEY` — card checkout for the fund and session deposits. Set by
  hand. Without it the endpoint returns "Card payments aren't
  configured yet" and the Venmo links still work.
- `RESEND_API_KEY` — from the Resend dashboard. Without it the forms return
  "Messages aren't configured yet".
- `MAIL_FROM` — what mail is sent as, e.g. `Tibbie X Studio
<hello@tibbiex.studio>`. An address that only sends: `contact@` receives
  through Cloudflare Email Routing, and sending as it invites a loop.
- `DASHBOARD_PASSWORD` — what the studio asks for before it changes the live
  site. Set by hand, and make it long: it is the only gate on the avatar
  upload and the import sheet. Without it every studio write is refused.
- `BLOB_READ_WRITE_TOKEN` — set by Vercel when a Blob store is connected to the
  project (Storage → Create → Blob). Without it the profile card keeps the
  bundled portrait, and studio uploads and saves say storage isn't configured
  yet.
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
