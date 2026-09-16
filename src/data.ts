/* Every piece of site content lives here: the records, shows, links, portfolio,
   catalogue, tip rails and reading tiers that App.tsx only lays out. Changing
   what the site says is an edit to this file, not to the JSX.

   Declaration order matters. These are `const`s, not hoisted function
   declarations, so one referenced inside another must be declared above it --
   VENMO_HANDLE sitting below SOCIALS is a TS2448 at build time.

   Constants tied to a single module stay with that module (OVERLAY_WIDTHS,
   the MOTES/MAGIC_INK spark state, ANALYTICS_OPT_OUT_KEY); they are
   implementation, not content. */

import {
  CreditCard,
  Disc,
  Facebook,
  Heart,
  Instagram,
  Mail,
  MapPin,
  MessageSquare,
  Mic2,
  Music,
  ShoppingBag,
  Sparkles,
  Youtube,
} from "lucide-react"

import VenmoIcon from "./icons/VenmoIcon"

/* Content-status convention. Anything shown to a visitor that is a stand-in --
   stock art, invented numbers, provisional prices, wording nobody has signed
   off -- carries `staged: true` so it is placeholder in the type system, not
   only in a comment above it. content-status.ts collects every flag into a
   go-live checklist and warns in the dev console, so a placeholder cannot quietly
   harden into truth across a run of quick fixes. `markStaged` tags a whole set
   at once, for the lists that are placeholder end to end. */
const markStaged = <T>(items: T[]): (T & { staged: true })[] =>
  items.map((item) => ({ ...item, staged: true }))

import gashPromo from "./assets/gash/gash_promo.jpg"
import gashLive from "./assets/gash/gash_live.jpeg"
import gashFlyer from "./assets/gash/gash_flyer.jpg"
import gashArt from "./assets/gash/gash_artwork.jpg"
import gashLogo from "./assets/gash/gash_logo.jpg"

export type Album = {
  id: string
  album: string
  band: string
  year: string
  role: string
  image: string
  /* The one song called out for this record. Optional -- only the rehearsal
     panel's target carries it today, and the modal hides the line without it. */
  track?: string
  /* Placeholder art or unconfirmed wording -- see the content-status note. */
  staged?: true
}

/* The rehearsal panel's destination, named so the panel can reach it without
   re-finding it in the list. `role` deliberately does not claim a credit on the
   1984 recording -- this is the live set with the current lineup. Confirm the
   wording, and the featured song, before this goes live. */
export const REAGAN_YOUTH_LP: Album = {
  id: "d0",
  album: "Youth Anthems for the New Order",
  band: "Reagan Youth",
  year: "1984",
  role: "Live — current lineup",
  track: "Degenerated",
  image:
    "https://images.unsplash.com/photo-1526394931762-90052e97b376?q=80&w=400&auto=format&fit=crop",
  staged: true,
}

export const DISCOGRAPHY: Album[] = [
  REAGAN_YOUTH_LP,
  {
    id: "d1",
    album: "Constructs of the State",
    band: "Leftover Crack",
    year: "2015",
    role: "Bass, Vocals",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "d2",
    album: "Never Rest in Peace",
    band: "Star Fucking Hipsters",
    year: "2009",
    role: "Guest Vocals",
    image:
      "https://images.unsplash.com/photo-1493225457224-ca2eb444624f?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "d3",
    album: "Fuck World Trade",
    band: "Leftover Crack",
    year: "2004",
    role: "Bass",
    image:
      "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=400&auto=format&fit=crop",
  },
]

export const SHOWS = [
  {
    id: "s1",
    venue: "924 Gilman",
    date: "Oct 31, 2026",
    city: "Berkeley, CA",
    status: "Tickets",
  },
  {
    id: "s2",
    venue: "The Bowery Electric",
    date: "Nov 15, 2026",
    city: "New York, NY",
    status: "Sold Out",
  },
  {
    id: "s3",
    venue: "Riot Fest",
    date: "Dec 5, 2026",
    city: "Chicago, IL",
    status: "Festival",
  },
]

export type Show = typeof SHOWS[number]

/* One id per band/project. It is the join between a portfolio section and the
   items it sells, so a typo is a type error rather than an empty shelf at
   runtime. Anything not tied to one band is tagged "general". */
export type BandId = "leftover-crack" | "reagan-youth" | "gash"

export type ShopItem = {
  id: string
  item: string
  price: string
  image: string
  band: BandId | "general"
  /* Stock art or a provisional price -- see the content-status note. */
  staged?: true
}

// Placeholder catalogue — stock photography and provisional prices. Confirm
// the items, prices and artwork before this goes live. The whole set is
// stand-in, so markStaged flags every item at once.
export const BUY: ShopItem[] = markStaged([
  {
    id: "m1",
    item: "Logo Patch",
    price: "$5",
    image:
      "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?q=80&w=400&auto=format&fit=crop",
    band: "general",
  },
  {
    id: "m2",
    item: "Constructs of the State — Vinyl",
    price: "$25",
    image:
      "https://images.unsplash.com/photo-1538356111053-748a48e1acb8?q=80&w=400&auto=format&fit=crop",
    band: "leftover-crack",
  },
  {
    id: "m3",
    item: "Signature Bass Pick (3-pack)",
    price: "$10",
    image:
      "https://images.unsplash.com/photo-1519508234239-44619d854291?q=80&w=400&auto=format&fit=crop",
    band: "general",
  },
  {
    id: "m4",
    item: "Tour Tee — No Gods",
    price: "$28",
    image:
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=400&auto=format&fit=crop",
    band: "leftover-crack",
  },
  {
    id: "m5",
    item: "Youth Anthems — Reissue LP",
    price: "$30",
    image:
      "https://images.unsplash.com/photo-1526394931762-90052e97b376?q=80&w=400&auto=format&fit=crop",
    band: "reagan-youth",
  },
  {
    id: "m6",
    item: "Reagan Youth Logo Tee",
    price: "$26",
    image:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=400&auto=format&fit=crop",
    band: "reagan-youth",
  },
  {
    id: "m7",
    item: "Gash Demo — Cassette",
    price: "$8",
    image:
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=400&auto=format&fit=crop",
    band: "gash",
  },
  {
    id: "m8",
    item: 'Gash / Sputter — Split 7"',
    price: "$12",
    image:
      "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=400&auto=format&fit=crop",
    band: "gash",
  },
])

/* The first tab. Rows are outbound links, except those carrying `action`: such
   a row is a button that opens something inside the app instead of navigating
   away -- the reading menu, the featured merch offer and the booking form.
   The offer row's title, pairing and price are improvised placeholders: it is
   a hand-off to the Reagan Youth shelf, not a real bundle SKU.

   `enabled: false` takes a row off the page while leaving its data here to
   switch back on. Unlike TABS, the flag is opt-out -- a row without it shows --
   so a new link cannot go missing by forgetting to add one. */
export const LINKS = [
  {
    icon: Sparkles,
    title: "1-on-1 Tarot Readings",
    meta: "Over FaceTime — 30, 60 or 90 minutes",
    href: "#",
    action: "tarot",
  },
  {
    icon: Music,
    title: "Listen on Spotify",
    meta: "Leftover Crack · SFH",
    href: "#",
    enabled: false,
  },
  {
    icon: Youtube,
    title: "Live Videos",
    meta: "Shows, squats & riots",
    href: "#",
    enabled: false,
  },
  {
    icon: Heart,
    title: "Support the Scene",
    meta: "Mutual aid links",
    href: "#",
    external: true,
    enabled: false,
  },
  {
    icon: ShoppingBag,
    title: "Youth Anthems Bundle",
    meta: "Reissue LP + logo tee, $50 — 20 numbered",
    href: "#",
    action: "offer",
    /* Improvised bundle -- not a real SKU. See the content-status note. */
    staged: true,
  },
  {
    icon: MessageSquare,
    title: "Book / Contact",
    meta: "Shows, sessions & readings",
    href: "#",
    action: "booking",
  },
]

export type LinkEntry = typeof LINKS[number]

export const VISIBLE_LINKS = LINKS.filter((link) => link.enabled !== false)

// Portfolio entries: one section per band/project. Dates and credits below are
// placeholders — confirm them before this goes live.
/* Intrinsic pixel dimensions travel with each photo so the masonry columns
   reserve the right space before the image loads -- without them the whole
   stack reflows as each one arrives. They must match the w/h in the URL. */
export type Photo = {
  src: string
  alt: string
  width: number
  height: number
  /* A stand-in image, not a real photo of this band -- see content-status. */
  staged?: true
}

export type PortfolioEntry = {
  id: BandId
  band: string
  role: string
  years: string
  blurb: string
  highlights: { label: string; detail: string }[]
  photos: Photo[]
}

export const PORTFOLIO: PortfolioEntry[] = [
  {
    id: "leftover-crack",
    band: "Leftover Crack",
    role: "Bass",
    years: "2015 — present",
    blurb:
      "Holding down low end for the crust-punk institution — squat shows, festival stages, and everything in between.",
    highlights: [
      { label: "Releases", detail: "Constructs of the State (2015)" },
      { label: "Live", detail: "924 Gilman · Riot Fest" },
      { label: "Touring", detail: "US · EU" },
    ],
    photos: [
      {
        src: "https://images.unsplash.com/photo-1549213783-8284d0336c4f?q=80&w=600&h=450&auto=format&fit=crop",
        alt: "Leftover Crack on a festival stage",
        width: 600,
        height: 450,
      },
      {
        src: "https://images.unsplash.com/photo-1415886541506-6efc5e4b1786?q=80&w=600&h=780&auto=format&fit=crop",
        alt: "Crowd surge during the set",
        width: 600,
        height: 780,
      },
      {
        src: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=600&h=600&auto=format&fit=crop",
        alt: "Records stacked on a table",
        width: 600,
        height: 600,
      },
      {
        src: "https://images.unsplash.com/photo-1462965326201-d02e4f455804?q=80&w=600&h=820&auto=format&fit=crop",
        alt: "Bass rig backstage before doors",
        width: 600,
        height: 820,
      },
      {
        src: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600&h=420&auto=format&fit=crop",
        alt: "House lights up on an emptying room",
        width: 600,
        height: 420,
      },
      {
        src: "https://images.unsplash.com/photo-1508973379184-7517410fb0bc?q=80&w=600&h=760&auto=format&fit=crop",
        alt: "Guitar neck and hands mid-chord",
        width: 600,
        height: 760,
      },
    ],
  },
  {
    id: "reagan-youth",
    band: "Reagan Youth",
    role: "Bass",
    years: "2018 — present",
    blurb:
      "Low end for the Queens band that helped write the New York hardcore canon, still playing the early catalogue at full volume.",
    highlights: [
      { label: "Live", detail: "NYC clubs · punk festivals" },
      { label: "Touring", detail: "US · EU" },
      { label: "Set", detail: "Early catalogue, full volume" },
    ],
    /* Placeholder gallery: these are stand-ins pulled from the same stock pool
       as the other sections, not Reagan Youth photos. Swap them for real ones
       before this goes live, and update alt text and dimensions to match.
       markStaged flags the whole set until real photos land. */
    photos: markStaged([
      {
        src: "https://images.unsplash.com/photo-1538356111053-748a48e1acb8?q=80&w=600&h=600&auto=format&fit=crop",
        alt: "Vinyl pressings stacked on the table by the door",
        width: 600,
        height: 600,
      },
      {
        src: "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?q=80&w=600&h=780&auto=format&fit=crop",
        alt: "Patches sewn across a battle jacket",
        width: 600,
        height: 780,
      },
      {
        src: "https://images.unsplash.com/photo-1519508234239-44619d854291?q=80&w=600&h=450&auto=format&fit=crop",
        alt: "Picks and spare strings in an open gig bag",
        width: 600,
        height: 450,
      },
    ]),
  },
  {
    id: "gash",
    band: "Gash",
    role: "Bass · Vocals",
    years: "2019 — present",
    blurb:
      "Bass and co-vocals in the NYC four-piece — fast, ugly, and built for basement rooms.",
    highlights: [
      { label: "Releases", detail: 'Demo tape · split 7"' },
      { label: "Live", detail: "East coast DIY circuit" },
      { label: "Writing", detail: "Co-writes the full set" },
    ],
    photos: [
      {
        src: gashPromo,
        alt: "Gash promo shot — the band's vocalist on a red-lit stage beneath the logo",
        width: 960,
        height: 960,
      },
      {
        src: gashLive,
        alt: "Black-and-white live shot of Gash mid-set, guitarist behind the vocalist",
        width: 905,
        height: 905,
      },
      {
        src: gashFlyer,
        alt: "Show flyer: Gash with Ballroom Zombies, Danse de Sade and Thorazine at North Star Bar",
        width: 685,
        height: 960,
      },
      {
        src: gashArt,
        alt: "Gash artwork — a screamed face in red and black beside the band logo",
        width: 960,
        height: 540,
      },
      {
        src: gashLogo,
        alt: "The Gash logo in white brushstrokes on black",
        width: 777,
        height: 777,
      },
    ],
  },
]

/* Portfolio -> Buy wiring. The groups are derived from the two arrays above
   rather than maintained by hand, so adding a band or a product needs no edit
   here. `SHOP_BY_BAND` keeps the catalogue order within each group, and
   "general" is rendered last as the everything-else shelf. */
export const SHOP_BY_BAND = BUY.reduce(
  (groups, item) => {
    ;(groups[item.band] ??= []).push(item)
    return groups
  },
  {} as Record<ShopGroupId, ShopItem[] | undefined>,
)

export function shopFor(band: BandId) {
  return SHOP_BY_BAND[band] ?? []
}

/* Group order for the Buy tab: the bands in portfolio order, then the
   unaffiliated items. Groups with nothing in them drop out. */
export type ShopGroupId = BandId | "general"

export const SHOP_GROUPS: { id: ShopGroupId; title: string; items: ShopItem[] }[] = [
  ...PORTFOLIO.map((entry) => ({
    id: entry.id,
    title: entry.band,
    items: shopFor(entry.id),
  })),
  {
    id: "general" as const,
    title: "Everything Else",
    items: SHOP_BY_BAND.general ?? [],
  },
].filter((group) => group.items.length > 0)

// Flip `enabled` to hide a tab from the strip. The Tab union still includes
// every label, so the tab's data and its panel below stay compiled and
// typechecked while it is off — turning it back on is a one-word change.
export const TABS = [
  { label: "Home", enabled: true },
  { label: "Music", enabled: true },
  { label: "Portfolio", enabled: true },
  { label: "Tour", enabled: true },
  { label: "Buy", enabled: true },
] as const

export type Tab = typeof TABS[number]["label"]

export const VISIBLE_TABS = TABS.filter((tab) => tab.enabled)

/* The tip jar has no backend — "Send Support" hands the amount and note to
   Venmo and lets the app (or venmo.com) take the payment from there. */
export const VENMO_HANDLE = "TibbieSkyeX"

/* The official address. Every mention of it on the site reads this const, so
   changing it here changes the icon row, the booking hand-off and the fallback
   line together. */
export const CONTACT_EMAIL = "contact@tibbiex.studio"

/* The booking form composes a message and hands it to the visitor's mail
   client, the same shape as the Venmo rail: this site never sends the mail
   itself. Built with encodeURIComponent rather than URLSearchParams, which
   encodes a space as "+" -- correct for a query string, but several mail
   clients render it literally in the body. */
export function bookingMailtoUrl(name: string, from: string, message: string) {
  const sender = name.trim()
  const subject = sender ? `Booking — ${sender}` : "Booking enquiry"
  const signoff = [sender || "Someone", from.trim() && `<${from.trim()}>`]
    .filter(Boolean)
    .join(" ")
  const body = `${message.trim()}\n\n— ${signoff}`
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export const SOCIALS = [
  {
    icon: Instagram,
    label: "Instagram — @tibbie_x",
    href: "https://www.instagram.com/tibbie_x",
  },
  {
    icon: Facebook,
    label: "Facebook — Tibbie.X",
    href: "https://www.facebook.com/Tibbie.X",
  },
  {
    icon: Mail,
    label: `Email — ${CONTACT_EMAIL}`,
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    icon: VenmoIcon,
    label: `Venmo — @${VENMO_HANDLE}`,
    href: `https://venmo.com/u/${VENMO_HANDLE}`,
  },
]

export const TIP_PRESETS = [10, 25, 50, 100]

/* PLACEHOLDER DATA — these five are invented, to see the feed laid out. Replace
   them with what actually arrives on either rail (Venmo's activity feed, or
   Stripe's payments with their note metadata) before this goes in front of
   anyone, and empty the array back out in the meantime if it ships first: the
   feed hides itself when there is nothing real to show. */
export type Supporter = {
  name: string
  msg: string
  amount: number
  staged?: true
}

export const SUPPORTERS: Supporter[] = markStaged([
  { name: "Sewer Tony", msg: "for the Reagan Youth episode", amount: 100 },
  { name: "Gary", msg: "keep the mics on", amount: 75 },
  { name: "Deb Void", msg: "still alive, still loud", amount: 50 },
  { name: "Ratface", msg: "gas money to the next one", amount: 25 },
  { name: "Kat Static", msg: "from the old Trenton crowd", amount: 10 },
])

/* The feed ranks by amount rather than by arrival: entries carry no timestamp,
   so "recent" would only ever mean "wherever it sits in the array above", while
   the amount is real data. Sorted on a copy -- sort() mutates, and SUPPORTERS is
   the source every other reading of the list would come from. */
export const TOP_CONTRIBUTORS = [...SUPPORTERS]
  .sort((a, b) => b.amount - a.amount)
  .slice(0, 5)

/* The two ways money can arrive. Venmo is a hand-off to an app the visitor
   already has; Stripe is a card checkout that this site's one serverless
   function opens. Same amount and note feed both. */
export const RAILS = [
  { id: "venmo", label: "Venmo", icon: VenmoIcon },
  { id: "card", label: "Card", icon: CreditCard },
] as const

export type Rail = typeof RAILS[number]["id"]

export function venmoPayUrl(amount: number, note: string) {
  const params = new URLSearchParams({
    txn: "pay",
    amount: amount.toFixed(2),
    note: note.trim() || "Still Alive podcast",
  })
  return `https://venmo.com/${VENMO_HANDLE}?${params}`
}

export const TAGS = [
  { icon: MapPin, label: "NYC" },
  { icon: Mic2, label: "Squatting" },
  { icon: Disc, label: "No Gods No Masters" },
]

/* The address the QR module path in `SiteQrCode` encodes. Regenerate that
   path if this ever changes, or the code points at the old site. */
export const SITE_URL = "https://tibbiex.studio"

/* ---------------------------------------------------------------------------
   1-on-1 tarot readings, sold by the half hour. Three tiers, and like
   every other list in this file they live as data: the panel below only lays
   them out, so changing what a session costs or includes is a data edit.

   Amber, not brand red, stays the colour of this corner of the app.
--------------------------------------------------------------------------- */
export type Reading = {
  id: string
  label: string
  minutes: number
  price: number
  blurb: string
  includes: string[]
  featured?: boolean
}

export const READINGS: Reading[] = [
  {
    id: "half",
    label: "Half Hour",
    minutes: 30,
    price: 45,
    blurb: "One question, cut clean.",
    includes: ["Three-card spread", "Voice note recap"],
  },
  {
    id: "hour",
    label: "Full Hour",
    minutes: 60,
    price: 80,
    blurb: "The whole board, front to back.",
    includes: [
      "Celtic cross",
      "Voice note recap",
      "One follow-up card by text",
    ],
    featured: true,
  },
  {
    id: "long",
    label: "Hour and a Half",
    minutes: 90,
    price: 110,
    blurb: "Deep read, nobody watching the clock.",
    includes: ["Two spreads, your pick", "Voice note recap", "Written summary"],
  },
]