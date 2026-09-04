import { useEffect, useRef, useState } from "react"
import { Toaster, toast } from "sonner"
import { Analytics } from "@vercel/analytics/react"
import {
  QrCode,
  Share2,
  MapPin,
  Mic2,
  Radio,
  Instagram,
  Facebook,
  Coffee,
  Send,
  CreditCard,
  Youtube,
  MessageSquare,
  Music,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  ShoppingBag,
  X,
  Disc,
  Copy,
  Ticket,
  Heart,
  Calendar,
  Guitar,
  Sparkles,
  Check,
  Star,
} from "lucide-react"

import profilePic from "./assets/tibbie_profile.jpeg"
import bannerPic from "./assets/tibbie_background.jpeg"

// Layout follows the added.tsx reference: a stack of self-contained rounded
// cards on a dark page (control bar, profile card, socials, tab strip, panels)
// rather than one monolithic sheet. Colors come from the added.css token set
// mirrored into src/index.css (background / card / muted / border), with the
// buttons and accents kept on the original brand ramp (bg-brand / accent).

type Album = {
  id: string
  album: string
  band: string
  year: string
  role: string
  image: string
}

const DISCOGRAPHY: Album[] = [
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

const SHOWS = [
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

/* One id per band/project. It is the join between a portfolio section and the
   items it sells, so a typo is a type error rather than an empty shelf at
   runtime. Anything not tied to one band is tagged "general". */
type BandId = "leftover-crack" | "reagan-youth" | "gash"

type ShopItem = {
  id: string
  item: string
  price: string
  image: string
  band: BandId | "general"
}

// Placeholder catalogue — stock photography and provisional prices. Confirm
// the items, prices and artwork before this goes live.
const BUY: ShopItem[] = [
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
]

/* The first tab. Rows are outbound links, except one: a row carrying `action`
   is a button that opens something inside the app instead of navigating away.
   The reading menu is the only one so far. */
const LINKS = [
  {
    icon: Sparkles,
    title: "The Midnight Pull",
    meta: "Tarot readings — 30, 60 or 90 minutes",
    href: "#",
    action: "tarot",
  },
  {
    icon: Music,
    title: "Listen on Spotify",
    meta: "Leftover Crack · SFH",
    href: "#",
  },
  {
    icon: Youtube,
    title: "Live Videos",
    meta: "Shows, squats & riots",
    href: "#",
  },
  {
    icon: Heart,
    title: "Support the Scene",
    meta: "Mutual aid links",
    href: "#",
    external: true,
  },
]

type LinkEntry = typeof LINKS[number]

// Portfolio entries: one section per band/project. Dates and credits below are
// placeholders — confirm them before this goes live.
/* Intrinsic pixel dimensions travel with each photo so the masonry columns
   reserve the right space before the image loads -- without them the whole
   stack reflows as each one arrives. They must match the w/h in the URL. */
type Photo = {
  src: string
  alt: string
  width: number
  height: number
}

type PortfolioEntry = {
  id: BandId
  band: string
  role: string
  years: string
  blurb: string
  highlights: { label: string; detail: string }[]
  photos: Photo[]
}

const PORTFOLIO: PortfolioEntry[] = [
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
       before this goes live, and update alt text and dimensions to match. */
    photos: [
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
    ],
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
        src: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=600&h=800&auto=format&fit=crop",
        alt: "Gash mid-set in a packed basement room",
        width: 600,
        height: 800,
      },
      {
        src: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=600&h=400&auto=format&fit=crop",
        alt: "Stage lights over the crowd at a Gash show",
        width: 600,
        height: 400,
      },
      {
        src: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&h=750&auto=format&fit=crop",
        alt: "Guitarist leaning into the front row",
        width: 600,
        height: 750,
      },
      {
        src: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600&h=450&auto=format&fit=crop",
        alt: "Wide shot of the band from the back of the room",
        width: 600,
        height: 450,
      },
      {
        src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&h=600&auto=format&fit=crop",
        alt: "Drum kit lit from the side",
        width: 600,
        height: 600,
      },
      {
        src: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&h=820&auto=format&fit=crop",
        alt: "Vocal mic in a smoke-filled spotlight",
        width: 600,
        height: 820,
      },
    ],
  },
]

/* Portfolio -> Buy wiring. The groups are derived from the two arrays above
   rather than maintained by hand, so adding a band or a product needs no edit
   here. `SHOP_BY_BAND` keeps the catalogue order within each group, and
   "general" is rendered last as the everything-else shelf. */
const SHOP_BY_BAND = BUY.reduce(
  (groups, item) => {
    ;(groups[item.band] ??= []).push(item)
    return groups
  },
  {} as Record<ShopGroupId, ShopItem[] | undefined>,
)

function shopFor(band: BandId) {
  return SHOP_BY_BAND[band] ?? []
}

/* Group order for the Buy tab: the bands in portfolio order, then the
   unaffiliated items. Groups with nothing in them drop out. */
type ShopGroupId = BandId | "general"

const SHOP_GROUPS: { id: ShopGroupId; title: string; items: ShopItem[] }[] = [
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
const TABS = [
  { label: "Links", enabled: true },
  { label: "Music", enabled: true },
  { label: "Portfolio", enabled: true },
  { label: "Tour", enabled: false },
  { label: "Buy", enabled: true },
] as const

type Tab = typeof TABS[number]["label"]

const VISIBLE_TABS = TABS.filter((tab) => tab.enabled)

/* The tip jar has no backend — "Send Support" hands the amount and note to
   Venmo and lets the app (or venmo.com) take the payment from there. */
const VENMO_HANDLE = "TibbieSkyeX"

const SOCIALS = [
  {
    icon: Instagram,
    label: "Instagram — @tibbie_x",
    href: "https://www.instagram.com/tibbie_x",
  },
  {
    icon: Instagram,
    label: "Instagram — @tibbiexstudios",
    href: "https://www.instagram.com/tibbiexstudios",
  },
  {
    icon: Facebook,
    label: "Facebook — Tibbie.X",
    href: "https://www.facebook.com/Tibbie.X",
  },
  {
    icon: VenmoIcon,
    label: `Venmo — @${VENMO_HANDLE}`,
    href: `https://venmo.com/u/${VENMO_HANDLE}`,
  },
]

const TIP_PRESETS = [3, 5, 10, 25]

/* Real supporters only — fill this in from what actually arrives, on either
   rail (Venmo's activity feed, or Stripe's payments with their note metadata).
   Shape: { name: "Ratface", msg: "for the new strings", amount: 10 }.
   The feed hides itself while this is empty rather than showing invented names. */
const SUPPORTERS: { name: string; msg: string; amount: number }[] = []

/* The two ways money can arrive. Venmo is a hand-off to an app the visitor
   already has; Stripe is a card checkout that this site's one serverless
   function opens. Same amount and note feed both. */
const RAILS = [
  { id: "venmo", label: "Venmo", icon: VenmoIcon },
  { id: "card", label: "Card", icon: CreditCard },
] as const

type Rail = typeof RAILS[number]["id"]

function venmoPayUrl(amount: number, note: string) {
  const params = new URLSearchParams({
    txn: "pay",
    amount: amount.toFixed(2),
    note: note.trim() || "Supporting Tibbie X",
  })
  return `https://venmo.com/${VENMO_HANDLE}?${params}`
}

/* Asks the serverless function for a Stripe Checkout Session and returns the
   hosted page's URL. Errors come back as a thrown message the widget can put
   in a toast -- the caller has no useful way to recover, only to say so. */
async function stripeCheckoutUrl(amount: number, note: string) {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, note }),
  })

  /* A 404 here is the everyday case of running `pnpm dev`, which serves the
     static app without the function. */
  if (response.status === 404) {
    throw new Error("Card payments only run on the deployed site.")
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.url) {
    throw new Error(data.error ?? "Could not reach Stripe.")
  }
  return data.url as string
}

const TAGS = [
  { icon: MapPin, label: "NYC" },
  { icon: Mic2, label: "Squatting" },
  { icon: Disc, label: "No Gods No Masters" },
]

async function copyLink() {
  const text = SITE_URL
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    /* clipboard unavailable — silently ignore */
  }
  toast.success("Bio link copied. Spread the word.")
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(VISIBLE_TABS[0].label)
  const [booking, setBooking] = useState(false)
  const [qr, setQr] = useState(false)
  const [tarot, setTarot] = useState(false)
  const [album, setAlbum] = useState<Album | null>(null)
  /* Which photo set is open and where we are in it -- the set is carried in
     state rather than looked up by id so the arrows stay inside one band. */
  const [lightbox, setLightbox] = useState<LightboxState | null>(null)
  /* Which band the Buy tab is narrowed to. Set from a portfolio section's
     shop link, and resettable from the filter strip. */
  const [shopBand, setShopBand] = useState<ShopGroupId | "all">("all")
  const tabsRef = useRef<HTMLElement>(null)
  const pendingScroll = useRef<BandId | null>(null)

  /* The one hand-off between the two tabs: switch to Buy, narrow it to the
     band, and put the tab strip back under the user's eye -- the Buy panel
     can start well below the fold after a long portfolio scroll. */
  function openShop(band: BandId) {
    setShopBand(band)
    setActiveTab("Buy")
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  /* The return leg. The Portfolio panel is unmounted while Buy is showing, so
     the target section cannot be scrolled to until after the switch renders --
     hence the ref handed to the effect below rather than a scroll right here. */
  function openPortfolio(band: BandId) {
    pendingScroll.current = band
    setActiveTab("Portfolio")
  }

  useEffect(() => {
    const band = pendingScroll.current
    if (activeTab !== "Portfolio" || !band) return
    pendingScroll.current = null
    document
      .getElementById(`portfolio-${band}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [activeTab])

  return (
    <div className="flex min-h-screen justify-center pb-20 font-sans text-foreground selection:bg-accent-soft">
      <Toaster position="top-center" richColors />

      <div className="w-full max-w-2xl px-4 pt-6 sm:px-6">
        {/* Header Controls */}
        <header className="card-surface mb-8 flex items-center justify-between rounded-lg bg-card/60 p-3">
          <span className="mono-label px-2 text-muted-foreground">
            tibbiex.vercel.app
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Show QR code"
              onClick={() => setQr(true)}
              className="rounded-md border border-border bg-card p-2.5 text-foreground transition-all hover:bg-muted"
            >
              <QrCode className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Share bio link"
              onClick={copyLink}
              className="flex items-center gap-1.5 rounded-md border border-border bg-card p-2.5 text-xs font-medium text-foreground transition-all hover:bg-muted"
            >
              <Share2 className="h-4 w-4" />{" "}
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </header>

        {/* Profile Section */}
        <div className="card-surface relative mb-8 overflow-hidden rounded-xl shadow-[0_30px_80px_-32px_rgba(0,0,0,0.85)]">
          <div className="relative h-48 w-full overflow-hidden bg-muted sm:h-56">
            <img
              src={bannerPic}
              alt="Tibbie X performing live"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
            <span className="mono-label absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-2.5 py-1 text-accent-strong backdrop-blur-sm">
              <Radio size={12} /> Recording Now
            </span>
          </div>

          <div className="relative -mt-20 px-6 pb-6 pt-0">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:text-left">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-2xl">
                <img
                  src={profilePic}
                  alt="Tibbie X"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 pb-2">
                <h1 className="wordmark text-3xl uppercase leading-none tracking-tight sm:text-4xl">
                  Tibbie <span className="wordmark-x">X</span>
                </h1>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-muted-foreground sm:justify-start">
                  <span className="mono-label rounded-full border border-border bg-card px-2 py-1 text-accent-strong">
                    Bass · Vocals
                  </span>
                  {/* basis-full drops the band list onto its own row under the
                      Bass · Vocals pill at every width. */}
                  <span className="basis-full text-sm">
                    • Leftover Crack • GASH • Reagan Youth
                    <br />• X-Possibles • Kissy Kamikaze
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
              {TAGS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="mono-label flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-muted-foreground"
                >
                  <Icon size={12} /> {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Social Icons */}
        <div className="mb-6 flex justify-center gap-4">
          {SOCIALS.map(({ icon: Icon, label, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={label}
              title={label}
              className="flex h-12 w-12 transform items-center justify-center rounded-full border border-border bg-card shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:bg-brand hover:text-on-brand"
            >
              <Icon size={20} />
            </a>
          ))}
        </div>

        {/* Booking CTA */}
        <BrandButton onClick={() => setBooking(true)} className="mb-6">
          <MessageSquare className="h-4 w-4" /> Book / Contact
        </BrandButton>

        {/* Studio Status */}
        <div className="card-surface mb-8 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div className="text-base font-bold">Studio Status</div>
            <span className="mono-label text-muted-foreground">66%</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Recording new bass tracks for the split EP. Rehearsing the fall
            setlist.
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: "66%" }}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav
          ref={tabsRef}
          className="card-surface hide-scrollbar mb-6 flex scroll-mt-4 gap-2 overflow-x-auto rounded-lg bg-card/50 p-1.5"
        >
          {VISIBLE_TABS.map(({ label }) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveTab(label)}
              className={`min-w-[80px] flex-1 rounded-md py-2.5 text-sm font-bold transition-all ${
                activeTab === label
                  ? "brand-surface brand-pop bg-brand text-on-brand"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <main className="space-y-4">
          {activeTab === "Links" && (
            <>
              {LINKS.map((link) =>
                link.action === "tarot" ? (
                  <button
                    key={link.title}
                    type="button"
                    onClick={(e) => {
                      castMagicFrom(e)
                      setTarot(true)
                    }}
                    className={`${LINK_ROW} arcana-row w-full text-left`}
                  >
                    <LinkFace link={link} />
                  </button>
                ) : (
                  <a
                    key={link.title}
                    href={link.href}
                    onClick={castMagicFrom}
                    className={LINK_ROW}
                  >
                    <LinkFace link={link} />
                  </a>
                ),
              )}

              <TipJar />
            </>
          )}

          {activeTab === "Music" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {DISCOGRAPHY.map((rec) => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => setAlbum(rec)}
                  className="card-surface group relative cursor-pointer overflow-hidden rounded-lg text-left transition-colors hover:border-accent"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={rec.image}
                      alt={rec.album}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/80 to-transparent p-4 pt-12">
                    <div className="text-lg font-bold leading-tight">
                      {rec.album}
                    </div>
                    <p className="text-xs font-medium text-accent-strong">
                      {rec.band}
                    </p>
                    <p className="mono-label mt-1 text-muted-foreground">
                      {rec.year} · {rec.role}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === "Portfolio" &&
            PORTFOLIO.map((entry) => (
              <section
                key={entry.id}
                id={`portfolio-${entry.id}`}
                className="card-surface scroll-mt-4 rounded-lg p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h2 className="text-2xl uppercase leading-none tracking-tight">
                    {entry.band}
                  </h2>
                  <span className="mono-label text-muted-foreground">
                    {entry.years}
                  </span>
                </div>

                <span className="mono-label mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-accent-strong">
                  <Guitar size={12} /> {entry.role}
                </span>

                <p className="mt-3 text-sm text-muted-foreground">
                  {entry.blurb}
                </p>

                <dl className="mt-4 space-y-2 border-t border-border pt-4">
                  {entry.highlights.map(({ label, detail }) => (
                    <div
                      key={label}
                      className="flex items-baseline justify-between gap-4"
                    >
                      <dt className="mono-label shrink-0 text-muted-foreground">
                        {label}
                      </dt>
                      <dd className="text-right text-sm font-medium">
                        {detail}
                      </dd>
                    </div>
                  ))}
                </dl>

                <ShopLink entry={entry} onOpen={openShop} />

                <PhotoGrid
                  photos={entry.photos}
                  onOpen={(index) =>
                    setLightbox({ photos: entry.photos, index })
                  }
                />
              </section>
            ))}

          {activeTab === "Tour" &&
            SHOWS.map((show) => (
              <div key={show.id} className="card-surface rounded-lg p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-bold">{show.venue}</div>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" /> {show.date}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" /> {show.city}
                    </div>
                  </div>
                  {show.status === "Tickets" ? (
                    <BrandButton variant="pill">
                      <Ticket className="h-4 w-4" /> Tickets
                    </BrandButton>
                  ) : (
                    <span className="rounded-full bg-accent-tint px-3 py-1 text-xs font-bold text-accent-strong">
                      {show.status}
                    </span>
                  )}
                </div>
              </div>
            ))}

          {activeTab === "Buy" && (
            <>
              {/* Filter strip -- also the way back out of a band the portfolio
                  dropped the visitor into. */}
              <div className="card-surface hide-scrollbar flex gap-2 overflow-x-auto rounded-lg bg-card/50 p-1.5">
                <ShopFilter
                  label="All"
                  active={shopBand === "all"}
                  onClick={() => setShopBand("all")}
                />
                {SHOP_GROUPS.map((group) => (
                  <ShopFilter
                    key={group.id}
                    label={group.title}
                    active={shopBand === group.id}
                    onClick={() => setShopBand(group.id)}
                  />
                ))}
              </div>

              {SHOP_GROUPS.filter(
                (group) => shopBand === "all" || shopBand === group.id,
              ).map((group) => {
                /* Pulled out of the JSX so the "general" check narrows for the
                   click handler too -- TS drops narrowing on a callback param
                   once it is captured in a closure. */
                const band = group.id === "general" ? null : group.id

                return (
                  <section key={group.id} className="space-y-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 pt-2">
                      <h2 className="text-xl uppercase leading-none tracking-tight">
                        {group.title}
                      </h2>
                      {/* The return leg of the portfolio link. "general" has no
                          section to go back to, so it gets a count instead. */}
                      {band === null ? (
                        <span className="mono-label text-muted-foreground">
                          {group.items.length} items
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openPortfolio(band)}
                          className="mono-label flex items-center gap-1 text-muted-foreground transition-colors hover:text-accent-strong"
                        >
                          View credits <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="card-surface group cursor-pointer overflow-hidden rounded-lg transition-colors hover:border-accent"
                        >
                          <div className="h-48 overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.item}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                          <div className="flex items-center justify-between gap-3 p-4">
                            <div className="text-sm font-bold leading-tight">
                              {item.item}
                            </div>
                            <span className="flex shrink-0 items-center gap-1.5 text-base font-bold text-accent-strong">
                              {item.price}{" "}
                              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )
              })}
            </>
          )}
        </main>

        <p className="mono-label mt-8 text-center text-muted-foreground">
          Built in the squat · 2026
        </p>
      </div>

      {/* Album modal */}
      {album && (
        <Overlay onClose={() => setAlbum(null)}>
          <img
            src={album.image}
            alt={album.album}
            className="h-56 w-full object-cover"
          />
          <div className="p-6">
            <span className="mono-label text-accent-strong">{album.band}</span>
            <h2 className="mt-1 text-2xl font-bold">{album.album}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Released {album.year} · {album.role}
            </p>
            <BrandButton className="mt-6">
              <Disc size={18} /> Stream Now
            </BrandButton>
          </div>
        </Overlay>
      )}

      {/* Booking modal */}
      {booking && (
        <Overlay onClose={() => setBooking(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setBooking(false)
              toast.success("Message sent into the void.")
            }}
            className="p-6"
          >
            <h2 className="text-2xl font-bold">Book / Contact</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              For booking, press, or hate mail.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Field placeholder="Name" type="text" />
              <Field placeholder="Email" type="email" />
              <textarea
                required
                rows={4}
                placeholder="Message"
                className="w-full resize-none rounded-md border border-border bg-input-background px-4 py-3 text-base text-foreground outline-none sm:text-sm transition-colors placeholder:text-muted-foreground focus:border-accent"
              />
              <BrandButton type="submit" className="mt-1">
                Send Message
              </BrandButton>
            </div>
          </form>
        </Overlay>
      )}

      {/* QR modal */}
      {qr && (
        <Overlay onClose={() => setQr(false)} size="xs">
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold">Scan &amp; Share</h2>
            <div className="mx-auto mt-5 w-fit rounded-md border border-border bg-muted p-4">
              <SiteQrCode size={148} />
            </div>
            <button
              type="button"
              onClick={copyLink}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-border py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted"
            >
              <Copy size={16} /> Copy Link
            </button>
          </div>
        </Overlay>
      )}
      {/* Reading menu */}
      {tarot && <ReadingMenu onClose={() => setTarot(false)} />}

      {/* Photo lightbox */}
      {lightbox && (
        <Lightbox
          state={lightbox}
          onChange={setLightbox}
          onClose={() => setLightbox(null)}
        />
      )}

      <MagicDust />

      <Analytics beforeSend={(event) => (analyticsOptedOut() ? null : event)} />
    </div>
  )
}

// The brand-red CTA, shared by the booking button, the ticket link and both
// modal actions. Shape and margins are the only things that vary between call
// sites, so those are props; the gradient/sheen/lift live in .brand-surface.
function BrandButton({
  children,
  variant = "block",
  type = "button",
  onClick,
  disabled = false,
  className = "",
}: {
  children: React.ReactNode
  variant?: "block" | "pill"
  type?: "button" | "submit"
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  className?: string
}) {
  const shape =
    variant === "pill"
      ? "gap-1.5 rounded-full px-4 py-2 text-xs"
      : "w-full gap-2 rounded-lg py-3 text-sm"

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`brand-surface brand-lift flex items-center justify-center bg-brand font-bold text-on-brand disabled:pointer-events-none disabled:opacity-60 ${shape} ${className}`}
    >
      {children}
    </button>
  )
}

/* Scannable QR for the bio link, replacing the decorative lucide QrCode glyph
   that used to sit in the modal -- that one encoded nothing. The module path
   is pre-computed (byte mode, ECC level M, version 2, 25x25) so nothing has to
   be generated at runtime and the app takes on no QR dependency. The viewBox
   carries the mandatory 4-module quiet zone, and the light background travels
   with the symbol: QR readers need dark-on-light, and the modal panel it sits
   on is dark. Regenerate the path if SITE_URL ever changes. */
const SITE_URL = "https://tibbiex.vercel.app"

function SiteQrCode({ size = 148 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="-4 -4 33 33"
      shapeRendering="crispEdges"
      role="img"
      aria-label={`QR code linking to ${SITE_URL}`}
    >
      <rect x="-4" y="-4" width="33" height="33" fill="#FFFDF7" />
      <path
        d="M0 0h7v1h-7zM8 0h3v1h-3zM12 0h1v1h-1zM16 0h1v1h-1zM18 0h7v1h-7zM0 1h1v1h-1zM6 1h1v1h-1zM8 1h5v1h-5zM18 1h1v1h-1zM24 1h1v1h-1zM0 2h1v1h-1zM2 2h3v1h-3zM6 2h1v1h-1zM10 2h1v1h-1zM12 2h4v1h-4zM18 2h1v1h-1zM20 2h3v1h-3zM24 2h1v1h-1zM0 3h1v1h-1zM2 3h3v1h-3zM6 3h1v1h-1zM8 3h4v1h-4zM13 3h4v1h-4zM18 3h1v1h-1zM20 3h3v1h-3zM24 3h1v1h-1zM0 4h1v1h-1zM2 4h3v1h-3zM6 4h1v1h-1zM9 4h1v1h-1zM11 4h1v1h-1zM15 4h2v1h-2zM18 4h1v1h-1zM20 4h3v1h-3zM24 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM9 5h1v1h-1zM16 5h1v1h-1zM18 5h1v1h-1zM24 5h1v1h-1zM0 6h7v1h-7zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM14 6h1v1h-1zM16 6h1v1h-1zM18 6h7v1h-7zM8 7h2v1h-2zM12 7h1v1h-1zM14 7h3v1h-3zM0 8h1v1h-1zM2 8h2v1h-2zM5 8h3v1h-3zM10 8h1v1h-1zM12 8h1v1h-1zM14 8h3v1h-3zM18 8h1v1h-1zM21 8h1v1h-1zM23 8h2v1h-2zM2 9h2v1h-2zM8 9h5v1h-5zM19 9h1v1h-1zM23 9h1v1h-1zM1 10h1v1h-1zM6 10h1v1h-1zM10 10h2v1h-2zM13 10h2v1h-2zM17 10h2v1h-2zM20 10h1v1h-1zM1 11h1v1h-1zM5 11h1v1h-1zM8 11h1v1h-1zM11 11h4v1h-4zM16 11h2v1h-2zM21 11h2v1h-2zM0 12h2v1h-2zM3 12h1v1h-1zM5 12h3v1h-3zM9 12h6v1h-6zM16 12h5v1h-5zM22 12h3v1h-3zM1 13h4v1h-4zM8 13h1v1h-1zM10 13h2v1h-2zM14 13h7v1h-7zM24 13h1v1h-1zM1 14h2v1h-2zM4 14h4v1h-4zM9 14h2v1h-2zM13 14h2v1h-2zM20 14h1v1h-1zM22 14h2v1h-2zM0 15h1v1h-1zM3 15h2v1h-2zM7 15h2v1h-2zM10 15h1v1h-1zM12 15h1v1h-1zM14 15h3v1h-3zM19 15h2v1h-2zM24 15h1v1h-1zM2 16h2v1h-2zM5 16h3v1h-3zM9 16h1v1h-1zM11 16h3v1h-3zM16 16h9v1h-9zM8 17h5v1h-5zM16 17h1v1h-1zM20 17h1v1h-1zM22 17h1v1h-1zM24 17h1v1h-1zM0 18h7v1h-7zM8 18h1v1h-1zM10 18h1v1h-1zM12 18h1v1h-1zM14 18h1v1h-1zM16 18h1v1h-1zM18 18h1v1h-1zM20 18h1v1h-1zM22 18h3v1h-3zM0 19h1v1h-1zM6 19h1v1h-1zM8 19h2v1h-2zM11 19h1v1h-1zM14 19h3v1h-3zM20 19h1v1h-1zM23 19h2v1h-2zM0 20h1v1h-1zM2 20h3v1h-3zM6 20h1v1h-1zM9 20h1v1h-1zM12 20h1v1h-1zM16 20h6v1h-6zM24 20h1v1h-1zM0 21h1v1h-1zM2 21h3v1h-3zM6 21h1v1h-1zM8 21h1v1h-1zM10 21h2v1h-2zM13 21h1v1h-1zM17 21h2v1h-2zM20 21h5v1h-5zM0 22h1v1h-1zM2 22h3v1h-3zM6 22h1v1h-1zM8 22h1v1h-1zM10 22h4v1h-4zM16 22h3v1h-3zM20 22h1v1h-1zM22 22h2v1h-2zM0 23h1v1h-1zM6 23h1v1h-1zM9 23h1v1h-1zM13 23h1v1h-1zM20 23h1v1h-1zM22 23h1v1h-1zM0 24h7v1h-7zM8 24h2v1h-2zM12 24h3v1h-3zM19 24h6v1h-6z"
        fill="#0B0B0D"
      />
    </svg>
  )
}

/* lucide-react ships no Venmo glyph, so this is a hand-drawn one in the same
   idiom as the rest of the set: 24x24 viewBox, currentColor stroke, 2px
   round-joined strokes and a `size` prop, so it drops into the SOCIALS row
   beside the lucide icons without reading as a different weight. The shape is
   Venmo's app tile -- a rounded square around the angled V, its right arm
   curved the way the mark's is. */
function VenmoIcon({
  size = 24,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="4.5" />
      <path d="M8.3 7.9l3.3 8.4c2.4-2.6 3.9-5.7 4.1-8.4" />
    </svg>
  )
}

/* Self-exclusion from Vercel Web Analytics.

   Vercel has no IP or geo filter for your own visits, and a VPN moves the exit
   IP around anyway, so the opt-out lives in this browser: load the site once
   with ?no-analytics to set the flag, ?analytics to clear it. beforeSend
   returning null drops the event before it leaves the page. The flag is
   per-browser, so repeat it on every device/profile you browse the site from. */
const ANALYTICS_OPT_OUT_KEY = "tibbiex:no-analytics"

function analyticsOptedOut() {
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.has("no-analytics")) {
      localStorage.setItem(ANALYTICS_OPT_OUT_KEY, "1")
    } else if (params.has("analytics")) {
      localStorage.removeItem(ANALYTICS_OPT_OUT_KEY)
    }
    return localStorage.getItem(ANALYTICS_OPT_OUT_KEY) === "1"
  } catch {
    /* Private window or blocked storage — count the visit rather than break. */
    return false
  }
}

// The shared input treatment. The booking form uses it uncontrolled and
// required; the tip jar passes value/onChange and opts out of required, so
// both forms keep the same border, fill and focus colour.
function Field({
  placeholder,
  type,
  value,
  onChange,
  required = true,
  min,
  step,
  inputMode,
  className = "",
}: {
  placeholder: string
  type: string
  value?: string
  onChange?: (value: string) => void
  required?: boolean
  min?: string
  step?: string
  inputMode?: "decimal" | "text"
  className?: string
}) {
  return (
    <input
      required={required}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      min={min}
      step={step}
      inputMode={inputMode}
      className={`w-full rounded-md border border-border bg-input-background px-4 py-3 text-base text-foreground outline-none sm:text-sm transition-colors placeholder:text-muted-foreground focus:border-accent ${className}`}
    />
  )
}

/* Tip jar under the link rows. One amount and one note, two ways out: Venmo
   hands off to the app with both in the query string, while Card posts them to
   api/checkout.ts and follows the Stripe Checkout Session it opens. Neither
   path touches money in this component -- it only composes the hand-off. The
   rail toggle and the preset chips both reuse .brand-surface, the treatment
   the active tab uses, so "selected" reads the same way across the page. */
function TipJar() {
  const [rail, setRail] = useState<Rail>("venmo")
  const [preset, setPreset] = useState(TIP_PRESETS[1])
  const [custom, setCustom] = useState("")
  const [note, setNote] = useState("")
  const [sending, setSending] = useState(false)

  const amount = custom ? Number(custom) : preset
  const validAmount = Number.isFinite(amount) && amount > 0

  /* Stripe sends the payer back here with a flag on the URL. Say thank you,
     then strip the flag so a refresh does not repeat the toast. */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const outcome = params.get("tip")
    if (!outcome) return

    if (outcome === "thanks") {
      toast.success("Payment received — thank you, seriously.")
    } else if (outcome === "cancelled") {
      toast("Payment cancelled. No hard feelings.")
    }

    params.delete("tip")
    const query = params.toString()
    window.history.replaceState(
      {},
      "",
      window.location.pathname + (query ? `?${query}` : ""),
    )
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validAmount) {
      toast.error("Enter an amount above $0.")
      return
    }

    if (rail === "venmo") {
      window.open(venmoPayUrl(amount, note), "_blank", "noopener,noreferrer")
      toast.success("Venmo is open — thank you, seriously.")
      return
    }

    setSending(true)
    try {
      /* A full navigation rather than a new tab: Stripe's hosted page returns
         the payer to the success_url, and that round trip only works in the
         tab that left. */
      window.location.href = await stripeCheckoutUrl(amount, note)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not reach Stripe.",
      )
      setSending(false)
    }
  }

  return (
    <section className="card-surface rounded-lg p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-md border border-accent-soft bg-accent-tint p-2 text-accent-strong">
            <Coffee className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">Fuel the Next Record</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Strings, van gas and studio time
            </p>
          </div>
        </div>
        <span className="mono-label shrink-0 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-accent-strong">
          Tip Jar
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        {/* Which rail the money travels on. Same segmented treatment as the
            tab strip, so "selected" looks the same everywhere on the page. */}
        <div className="flex gap-2 rounded-md border border-border bg-input-background p-1">
          {RAILS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setRail(id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-sm py-2 text-xs font-bold transition-all ${
                rail === id
                  ? "brand-surface brand-pop bg-brand text-on-brand"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {TIP_PRESETS.map((amt) => {
            const selected = preset === amt && !custom
            return (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setPreset(amt)
                  setCustom("")
                }}
                className={`rounded-md py-2 text-sm font-bold transition-all ${
                  selected
                    ? "brand-surface brand-pop bg-brand text-on-brand"
                    : "border border-border bg-input-background text-muted-foreground hover:border-accent hover:text-foreground"
                }`}
              >
                ${amt}
              </button>
            )
          })}
        </div>

        {/* Field carries w-full, so the row's widths live on wrappers rather
            than in Field's className -- two width utilities on one element let
            the stylesheet's order decide the winner, which put the amount at
            full width and pushed the note field out of the card. */}
        <div className="flex gap-2">
          <div className="w-28 shrink-0">
            <Field
              type="number"
              placeholder="Custom $"
              value={custom}
              onChange={setCustom}
              required={false}
              min="1"
              step="1"
              inputMode="decimal"
              className="px-3 py-2.5"
            />
          </div>
          <div className="min-w-0 flex-1">
            <Field
              type="text"
              placeholder="Say something…"
              value={note}
              onChange={setNote}
              required={false}
              className="px-3 py-2.5"
            />
          </div>
        </div>

        <BrandButton type="submit" disabled={sending}>
          <Send className="h-4 w-4" />
          {sending
            ? "Opening Stripe…"
            : `Send Support${validAmount ? ` $${amount}` : ""}`}
        </BrandButton>

        <p className="text-center text-[11px] text-muted-foreground">
          {rail === "venmo"
            ? `Opens Venmo to pay @${VENMO_HANDLE} directly.`
            : "Card payments are processed by Stripe."}
        </p>
      </form>

      {SUPPORTERS.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <span className="mono-label block text-muted-foreground">
            Recent Supporters
          </span>
          <div className="hide-scrollbar mt-2 max-h-32 space-y-1.5 overflow-y-auto">
            {SUPPORTERS.map((sup) => (
              <div
                key={`${sup.name}-${sup.msg}`}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/40 p-2 text-xs"
              >
                <p className="truncate">
                  <span className="font-bold">{sup.name}</span>
                  <span className="ml-1.5 text-muted-foreground">
                    “{sup.msg}”
                  </span>
                </p>
                <span className="shrink-0 font-bold text-accent-strong">
                  +${sup.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

const OVERLAY_WIDTHS = {
  xs: "max-w-xs",
  md: "max-w-md",
  lg: "max-w-3xl",
}

function Overlay({
  children,
  onClose,
  size = "md",
}: {
  children: React.ReactNode
  onClose: () => void
  size?: "xs" | "md" | "lg"
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#08080a]/85 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={
          "relative w-full overflow-hidden rounded-xl border border-border bg-popover shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] backdrop-blur-2xl " +
          OVERLAY_WIDTHS[size]
        }
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-border bg-card/80 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  )
}

/* Masonry with no library and no measuring pass: CSS multi-column flows the
   photos down each column in turn, and `break-inside-avoid` stops one being
   split across a column boundary. The trade is a ragged bottom edge, which
   suits the zine treatment better than a locked grid would. */
/* The portfolio -> Buy hand-off, rendered inside a portfolio section. It is a
   button rather than an anchor because the destination is a tab in this same
   view, not a URL. Bands with nothing for sale render nothing at all. */
function ShopLink({
  entry,
  onOpen,
}: {
  entry: PortfolioEntry
  onOpen: (band: BandId) => void
}) {
  const items = shopFor(entry.id)
  if (items.length === 0) return null

  const cheapest = items.reduce((low, item) =>
    priceValue(item) < priceValue(low) ? item : low,
  )

  return (
    <button
      type="button"
      onClick={() => onOpen(entry.id)}
      className="group mt-4 flex w-full items-center justify-between gap-3 rounded-md border border-border bg-muted/40 p-3 text-left transition-colors hover:border-accent hover:bg-muted"
    >
      <span className="flex items-center gap-3">
        <span className="rounded-md bg-card p-2 text-muted-foreground transition-colors group-hover:bg-brand group-hover:text-on-brand">
          <ShoppingBag className="h-4 w-4" />
        </span>
        <span>
          <span className="block text-sm font-bold">Shop {entry.band}</span>
          <span className="mono-label mt-0.5 block text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"} · from{" "}
            {cheapest.price}
          </span>
        </span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent-strong" />
    </button>
  )
}

/* "$25" -> 25, so the "from" price is the real cheapest item and not just
   whichever one happens to sort first as a string. */
function priceValue(item: ShopItem) {
  return Number(item.price.replace(/[^0-9.]/g, "")) || 0
}

function ShopFilter({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm font-bold transition-all ${
        active
          ? "brand-surface brand-pop bg-brand text-on-brand"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  )
}

function PhotoGrid({
  photos,
  onOpen,
}: {
  photos: Photo[]
  onOpen: (index: number) => void
}) {
  if (photos.length === 0) return null

  return (
    <div className="mt-5 border-t border-border pt-4">
      <span className="mono-label text-muted-foreground">Photos</span>

      <div className="mt-3 columns-2 gap-2 sm:columns-3">
        {photos.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => onOpen(index)}
            aria-label={`Open photo: ${photo.alt}`}
            className="group mb-2 block w-full break-inside-avoid overflow-hidden rounded-md border border-border transition-colors hover:border-accent"
          >
            <img
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              decoding="async"
              className="h-auto w-full transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

type LightboxState = {
  photos: Photo[]
  index: number
}

/* The expanded view. Key handling lives here rather than in Overlay so the
   booking and QR modals keep their click-only dismissal, and the arrows wrap
   at both ends so the set never dead-ends. */
function Lightbox({
  state,
  onChange,
  onClose,
}: {
  state: LightboxState
  onChange: (next: LightboxState) => void
  onClose: () => void
}) {
  const { photos, index } = state
  const photo = photos[index]

  function step(delta: number) {
    onChange({
      photos,
      index: (index + delta + photos.length) % photos.length,
    })
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") step(1)
      if (e.key === "ArrowLeft") step(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  return (
    <Overlay onClose={onClose} size="lg">
      {/* object-contain, not cover: a lightbox that crops the photo defeats
          the point of opening it. */}
      <img
        src={photo.src}
        alt={photo.alt}
        className="max-h-[70vh] w-full bg-muted object-contain"
      />

      <div className="flex items-center gap-3 border-t border-border p-4">
        {photos.length > 1 && (
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => step(-1)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-xs text-muted-foreground">{photo.alt}</p>
          {photos.length > 1 && (
            <span className="mono-label mt-0.5 block text-accent-strong">
              {index + 1} / {photos.length}
            </span>
          )}
        </div>

        {photos.length > 1 && (
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => step(1)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </Overlay>
  )
}

/* The shared class string for a Links-tab row. It is a const rather than a
   repeated literal because the row is an <a> for outbound links and a <button>
   for the tarot -- two elements that have to look identical. */
const LINK_ROW =
  "card-surface group block transform rounded-lg p-4 transition-all duration-300 hover:scale-[1.01] hover:border-accent"

/* The inside of a link row, identical for both element types. The tarot row is
   the one that gets colour: an amber sigil box and a sparkle in place of the
   chevron, since amber is what the magic is drawn in everywhere else. */
function LinkFace({ link }: { link: LinkEntry }) {
  const { icon: Icon, title, meta, external, action } = link
  const magic = action === "tarot"

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div
          className={`rounded-md p-3 transition-colors ${
            magic
              ? "arcana-sigil bg-accent-tint text-accent"
              : "bg-muted text-muted-foreground group-hover:bg-brand group-hover:text-on-brand"
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-base font-bold">{title}</div>
          <p className="mono-label mt-1 text-muted-foreground">{meta}</p>
        </div>
      </div>
      {magic ? (
        <Sparkles className="h-5 w-5 text-accent transition-transform group-hover:scale-125" />
      ) : external ? (
        <ExternalLink className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent-strong" />
      ) : (
        <ChevronRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent-strong" />
      )}
    </div>
  )
}

/* ---------------------------------------------------------------------------
   The magic — a canvas of sparks that dances across the screen when a link is
   clicked. It sits above everything (including the overlays) and never takes a
   pointer event, so it is decoration only: nothing here can swallow a tap.

   The particles live in a module-level array rather than React state. They are
   updated sixty times a second and never read during render, so putting them
   in state would only buy re-renders nobody wants. `castMagic` pushes into
   that array from anywhere; the mounted <MagicDust /> is what draws it.
--------------------------------------------------------------------------- */
type Mote = {
  kind: "spark" | "comet" | "ring"
  x: number
  y: number
  vx: number
  vy: number
  age: number
  span: number
  size: number
  color: string
  spin: number
  wobble: number
}

const MOTES: Mote[] = []

/* Set by <MagicDust /> while it is mounted. castMagic calls it to restart the
   animation loop, which parks itself whenever the array empties. */
let wakeMagic: (() => void) | null = null

/* Ceiling on how much is in the air at once. One burst peaks around 240, so
   this only bites when somebody mashes the link -- and it trims from the front
   of the array, dropping the oldest sparks, which are the ones already nearly
   burned out. Without it, ten fast clicks stack past two thousand sparkles and
   an older phone starts dropping frames. */
const MAX_MOTES = 700

/* Amber and off-white carry the magic; the brand red is a rare ember so the
   burst still ties back to the CTAs without turning into a colour wheel. */
const MAGIC_INK = [
  "#FFD84D",
  "#FFD84D",
  "#FFE9A3",
  "#FFFDF7",
  "#FF5433",
]

function prefersStillness() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

function pickInk() {
  return MAGIC_INK[Math.floor(Math.random() * MAGIC_INK.length)]
}

/* One burst: an expanding ring at the point of contact, a shower of sparks
   around it, and a handful of comets that streak off across the viewport
   shedding a trail as they go. */
function castMagic(x: number, y: number) {
  if (prefersStillness()) return

  MOTES.push({
    kind: "ring",
    x,
    y,
    vx: 0,
    vy: 0,
    age: 0,
    span: 620,
    size: 150,
    color: "#FFD84D",
    spin: 0,
    wobble: 0,
  })

  for (let i = 0; i < 44; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 70 + Math.random() * 320
    MOTES.push({
      kind: "spark",
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 60,
      age: 0,
      span: 620 + Math.random() * 900,
      size: 3 + Math.random() * 8,
      color: pickInk(),
      spin: Math.random() * Math.PI,
      wobble: Math.random() * Math.PI * 2,
    })
  }

  for (let i = 0; i < 6; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 620 + Math.random() * 620
    MOTES.push({
      kind: "comet",
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed * 0.7,
      age: 0,
      span: 900 + Math.random() * 500,
      size: 4 + Math.random() * 4,
      color: pickInk(),
      spin: Math.random() * Math.PI,
      wobble: Math.random() * Math.PI * 2,
    })
  }

  if (MOTES.length > MAX_MOTES) MOTES.splice(0, MOTES.length - MAX_MOTES)
  wakeMagic?.()
}

/* Bursts from where the pointer actually was. Keyboard activation reports
   0,0 for the click coordinates, so fall back to the middle of the element --
   otherwise every Enter press throws sparks from the top-left corner. */
function castMagicFrom(e: React.MouseEvent<HTMLElement>) {
  if (e.clientX !== 0 || e.clientY !== 0) {
    castMagic(e.clientX, e.clientY)
    return
  }
  const box = e.currentTarget.getBoundingClientRect()
  castMagic(box.left + box.width / 2, box.top + box.height / 2)
}

/* A four-pointed sparkle: four spikes pulled in tight at the waist. Cheaper
   than an image and it scales to any size without going soft. */
function sparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rot: number,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  ctx.beginPath()
  ctx.moveTo(0, -r)
  ctx.quadraticCurveTo(r * 0.16, -r * 0.16, r, 0)
  ctx.quadraticCurveTo(r * 0.16, r * 0.16, 0, r)
  ctx.quadraticCurveTo(-r * 0.16, r * 0.16, -r, 0)
  ctx.quadraticCurveTo(-r * 0.16, -r * 0.16, 0, -r)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

/* One frame of the whole burst: age everything, drop what has burned out, move
   what has not, and draw it. Module-level rather than buried in the component
   below so the physics is reachable on its own -- it takes a context and a
   timestep and touches nothing else.

   Composite mode is "lighter" throughout, so overlapping sparks add up into a
   glow instead of painting over each other. */
function advanceMagic(
  ctx: CanvasRenderingContext2D,
  dt: number,
  width: number,
  height: number,
) {
  ctx.clearRect(0, 0, width, height)
  ctx.globalCompositeOperation = "lighter"

  for (let i = MOTES.length - 1; i >= 0; i--) {
    const m = MOTES[i]
    m.age += dt * 1000
    const life = m.age / m.span
    if (life >= 1) {
      MOTES.splice(i, 1)
      continue
    }

    if (m.kind === "ring") {
      const eased = 1 - Math.pow(1 - life, 3)
      ctx.globalAlpha = (1 - life) * 0.5
      ctx.strokeStyle = m.color
      ctx.lineWidth = 2.5 * (1 - life)
      ctx.beginPath()
      ctx.arc(m.x, m.y, eased * m.size, 0, Math.PI * 2)
      ctx.stroke()
      continue
    }

    m.wobble += dt * 6
    if (m.kind === "spark") {
      /* Drag plus a gentle lift: sparks slow down and drift upward like ash
         off a fire rather than falling like confetti. */
      m.vx *= 1 - 2.1 * dt
      m.vy = m.vy * (1 - 2.1 * dt) - 26 * dt
      m.x += m.vx * dt + Math.sin(m.wobble) * 14 * dt
      m.y += m.vy * dt
    } else {
      m.vx *= 1 - 0.9 * dt
      m.vy = m.vy * (1 - 0.9 * dt) + Math.sin(m.wobble * 0.8) * 260 * dt
      m.x += m.vx * dt
      m.y += m.vy * dt

      /* The trail: one short-lived spark dropped at the comet's heel every
         frame, which is what makes it read as a streak rather than a dot.
         Appended past `i`, so it is not also stepped this frame. */
      if (MOTES.length < MAX_MOTES) {
        MOTES.push({
          kind: "spark",
          x: m.x,
          y: m.y,
          vx: (Math.random() - 0.5) * 40,
          vy: (Math.random() - 0.5) * 40,
          age: 0,
          span: 320 + Math.random() * 380,
          size: 2 + Math.random() * 4,
          color: m.color,
          spin: Math.random() * Math.PI,
          wobble: Math.random() * Math.PI * 2,
        })
      }
    }

    /* Twinkle: alpha beats faster than the fade, so each spark blinks on its
       way out instead of dimming evenly. */
    const twinkle = 0.55 + 0.45 * Math.sin(m.wobble * 2.2)
    ctx.globalAlpha = Math.max(0, (1 - life) * twinkle)
    ctx.fillStyle = m.color
    sparkle(ctx, m.x, m.y, m.size * (1 - life * 0.55), m.spin + m.wobble * 0.4)
  }

  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = "source-over"
}

/* The one canvas the whole app draws its magic on. The loop only runs while
   there is something to draw: the last frame with an empty array clears the
   canvas and drops the rAF, and castMagic starts it again. */
function MagicDust() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    let frame = 0
    let last = 0

    function resize() {
      if (!canvas || !ctx) return
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * ratio)
      canvas.height = Math.floor(window.innerHeight * ratio)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    function step(now: number) {
      if (!canvas || !ctx) return
      /* Clamp the step so a backgrounded tab does not resume with one enormous
         frame that teleports every spark off screen. */
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      advanceMagic(ctx, dt, window.innerWidth, window.innerHeight)

      if (MOTES.length === 0) {
        frame = 0
        return
      }
      frame = requestAnimationFrame(step)
    }

    resize()
    window.addEventListener("resize", resize)
    wakeMagic = () => {
      if (frame) return
      last = performance.now()
      frame = requestAnimationFrame(step)
    }

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
      wakeMagic = null
      MOTES.length = 0
    }
  }, [])

  return <canvas ref={ref} className="magic-canvas" aria-hidden="true" />
}

/* ---------------------------------------------------------------------------
   The Midnight Pull — readings sold by the half hour. Three tiers, and like
   every other list in this file they live as data: the panel below only lays
   them out, so changing what a session costs or includes is a data edit.

   Amber, not brand red, stays the colour of this corner of the app.
--------------------------------------------------------------------------- */
type Reading = {
  id: string
  label: string
  minutes: number
  price: number
  blurb: string
  includes: string[]
  featured?: boolean
}

const READINGS: Reading[] = [
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

/* The menu. One tier is always selected -- the hour, since it is the one most
   people want -- so the button at the bottom always has something to say. Like
   the tip jar, this panel only composes a hand-off: the deposit opens Venmo in
   a new tab and the time itself is settled in a DM. */
function ReadingMenu({ onClose }: { onClose: () => void }) {
  const [pickedId, setPickedId] = useState("hour")
  const picked = READINGS.find((reading) => reading.id === pickedId) ?? READINGS[0]

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  function pick(id: string, e: React.MouseEvent<HTMLElement>) {
    castMagicFrom(e)
    setPickedId(id)
  }

  function hold(e: React.MouseEvent<HTMLElement>) {
    castMagicFrom(e)
    window.open(
      venmoPayUrl(picked.price, `${picked.minutes}-minute reading`),
      "_blank",
      "noopener,noreferrer",
    )
  }

  return (
    <Overlay onClose={onClose} size="md">
      {/* Three cards plus their lists clear a short phone viewport, and Overlay
          clips its children rather than scrolling them. So this panel does its
          own scrolling. */}
      <div className="arcana-veil max-h-[85vh] overflow-y-auto p-6">
        <span className="mono-label text-accent-strong">Readings</span>
        <h2 className="mt-1 text-2xl font-bold">The Midnight Pull</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Twenty-two cards, cut in the dark. Pick how long you want the table
          open.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {READINGS.map((reading, i) => (
            <PriceCard
              key={reading.id}
              reading={reading}
              index={i}
              selected={reading.id === picked.id}
              onPick={(e) => pick(reading.id, e)}
            />
          ))}
        </div>

        <p className="mt-5 text-xs leading-snug text-muted-foreground">
          The deposit holds the slot; we settle the time by DM. In person or
          over video, your call. No gods, no gatekeeping — the deck has no
          authority over you.
        </p>

        <BrandButton className="mt-4" onClick={hold}>
          <Sparkles size={18} /> Hold {picked.minutes} minutes — ${picked.price}
        </BrandButton>
      </div>
    </Overlay>
  )
}

/* One tier. It is a button because picking it drives the CTA below, and it
   keeps the spread's deal-in animation: the cards still land one after the
   other, staggered by the --deal index set here. */
function PriceCard({
  reading,
  index,
  selected,
  onPick,
}: {
  reading: Reading
  index: number
  selected: boolean
  onPick: (e: React.MouseEvent<HTMLElement>) => void
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={selected}
      data-state={selected ? "on" : "off"}
      style={{ "--deal": index } as React.CSSProperties}
      aria-label={`${reading.label}, ${reading.minutes} minutes, $${reading.price}`}
      className="price-card"
    >
      <div className="price-frame" />
      {reading.featured && <span className="price-flag">Most asked for</span>}
      <span className="mono-label price-duration">{reading.minutes} min</span>
      <span className="price-name">{reading.label}</span>
      <span className="price-amount">
        ${reading.price}
        <span className="price-unit">flat</span>
      </span>
      <p className="price-blurb">{reading.blurb}</p>
      <ul className="price-includes">
        {reading.includes.map((line) => (
          <li key={line}>
            <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
            {line}
          </li>
        ))}
      </ul>
    </button>
  )
}
