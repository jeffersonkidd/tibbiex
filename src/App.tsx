import { useState } from "react"
import { Toaster, toast } from "sonner"
import {
  QrCode,
  Share2,
  MapPin,
  Mic2,
  Radio,
  Instagram,
  Twitter,
  Youtube,
  MessageSquare,
  Music,
  ChevronRight,
  ExternalLink,
  ShoppingBag,
  X,
  Disc,
  Copy,
  Ticket,
  Heart,
  Calendar,
} from "lucide-react"

import profilePic from "./assets/tibbie_profile.jpeg"

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
  { id: "s1", venue: "924 Gilman", date: "Oct 31, 2026", city: "Berkeley, CA", status: "Tickets" },
  { id: "s2", venue: "The Bowery Electric", date: "Nov 15, 2026", city: "New York, NY", status: "Sold Out" },
  { id: "s3", venue: "Riot Fest", date: "Dec 5, 2026", city: "Chicago, IL", status: "Festival" },
]

const MERCH = [
  {
    id: "m1",
    item: "Logo Patch",
    price: "$5",
    image:
      "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "m2",
    item: "Constructs of the State — Vinyl",
    price: "$25",
    image:
      "https://images.unsplash.com/photo-1538356111053-748a48e1acb8?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "m3",
    item: "Signature Bass Pick (3-pack)",
    price: "$10",
    image:
      "https://images.unsplash.com/photo-1519508234239-44619d854291?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "m4",
    item: "Tour Tee — No Gods",
    price: "$28",
    image:
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=400&auto=format&fit=crop",
  },
]

const LINKS = [
  { icon: Music, title: "Listen on Spotify", meta: "Leftover Crack · SFH", href: "#" },
  { icon: Youtube, title: "Live Videos", meta: "Shows, squats & riots", href: "#" },
  { icon: Heart, title: "Support the Scene", meta: "Mutual aid links", href: "#", external: true },
]

const TABS = ["Links", "Music", "Tour", "Merch"] as const
type Tab = (typeof TABS)[number]

const SOCIALS = [Instagram, Twitter, Youtube]

const TAGS = [
  { icon: MapPin, label: "NYC" },
  { icon: Mic2, label: "Squatting" },
  { icon: Disc, label: "No Gods No Masters" },
]

async function copyLink() {
  const text = "https://tibbie-x.punk/bio"
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    /* clipboard unavailable — silently ignore */
  }
  toast.success("Bio link copied. Spread the word.")
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("Links")
  const [booking, setBooking] = useState(false)
  const [qr, setQr] = useState(false)
  const [album, setAlbum] = useState<Album | null>(null)

  return (
    <div className="flex min-h-screen justify-center pb-20 font-sans text-foreground selection:bg-accent-soft">
      <Toaster position="top-center" richColors />

      <div className="w-full max-w-2xl px-4 pt-6 sm:px-6">
        {/* Header Controls */}
        <header className="mb-8 flex items-center justify-between rounded-lg border border-border bg-card/60 p-3 backdrop-blur-xl">
          <span className="mono-label px-2 text-muted-foreground">tibbie-x.punk/bio</span>
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
              <Share2 className="h-4 w-4" /> <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </header>

        {/* Profile Section */}
        <div className="relative mb-8 overflow-hidden rounded-xl border border-border bg-card shadow-[0_30px_80px_-32px_rgba(236,32,15,0.6)] backdrop-blur-xl">
          <div className="relative h-48 w-full overflow-hidden bg-muted sm:h-56">
            <img
              src="https://images.unsplash.com/photo-1508973379184-7517410fb0bc?q=80&w=1200&auto=format&fit=crop"
              alt="Tibbie X performing live"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
            <span className="mono-label absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-2.5 py-1 text-accent-strong backdrop-blur-sm">
              <Radio size={12} /> Touring Now
            </span>
          </div>

          <div className="relative -mt-20 px-6 pb-6 pt-0">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:text-left">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-2xl">
                <img src={profilePic} alt="Tibbie X" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 pb-2">
                <h1 className="wordmark text-3xl uppercase leading-none tracking-tight sm:text-4xl">
                  Tibbie X
                </h1>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-muted-foreground sm:justify-start">
                  <span className="mono-label rounded-full border border-border bg-card px-2 py-1 text-accent-strong">
                    Bass · Vocals
                  </span>
                  <span className="text-sm">• Leftover Crack · Star Fucking Hipsters</span>
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
          {SOCIALS.map((Icon, i) => (
            <a
              key={i}
              href="#"
              aria-label="Social profile"
              className="flex h-12 w-12 transform items-center justify-center rounded-full border border-border bg-card shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:bg-brand hover:text-on-brand"
            >
              <Icon size={20} />
            </a>
          ))}
        </div>

        {/* Booking CTA */}
        <button
          type="button"
          onClick={() => setBooking(true)}
          className="mb-6 flex w-full items-center justify-center gap-2 brand-surface brand-lift rounded-lg bg-brand py-3.5 text-sm font-bold text-on-brand"
        >
          <MessageSquare className="h-4 w-4" /> Book / Contact
        </button>

        {/* Studio Status */}
        <div className="mb-8 rounded-lg border border-border bg-card p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="text-base font-bold">Studio Status</div>
            <span className="mono-label text-muted-foreground">66%</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Recording new bass tracks for the split EP. Rehearsing the fall setlist.
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-accent" style={{ width: "66%" }} />
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hide-scrollbar mb-6 flex gap-2 overflow-x-auto rounded-lg border border-border bg-card/50 p-1.5 backdrop-blur-xl">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`min-w-[80px] flex-1 rounded-md py-2.5 text-sm font-bold transition-all ${
                activeTab === tab
                  ? "brand-surface brand-pop bg-brand text-on-brand"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <main className="space-y-4">
          {activeTab === "Links" &&
            LINKS.map(({ icon: Icon, title, meta, href, external }) => (
              <a
                key={title}
                href={href}
                className="group block transform rounded-lg border border-border bg-card p-4 backdrop-blur-xl transition-all duration-300 hover:scale-[1.01] hover:border-accent"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-md bg-muted p-3 text-muted-foreground transition-colors group-hover:bg-brand group-hover:text-on-brand">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-base font-bold">{title}</div>
                      <p className="mono-label mt-1 text-muted-foreground">{meta}</p>
                    </div>
                  </div>
                  {external ? (
                    <ExternalLink className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent-strong" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent-strong" />
                  )}
                </div>
              </a>
            ))}

          {activeTab === "Music" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {DISCOGRAPHY.map((rec) => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => setAlbum(rec)}
                  className="group relative cursor-pointer overflow-hidden rounded-lg border border-border bg-card text-left backdrop-blur-xl transition-colors hover:border-accent"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={rec.image}
                      alt={rec.album}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/80 to-transparent p-4 pt-12">
                    <div className="text-lg font-bold leading-tight">{rec.album}</div>
                    <p className="text-xs font-medium text-accent-strong">{rec.band}</p>
                    <p className="mono-label mt-1 text-muted-foreground">
                      {rec.year} · {rec.role}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === "Tour" &&
            SHOWS.map((show) => (
              <div key={show.id} className="rounded-lg border border-border bg-card p-5 backdrop-blur-xl">
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
                    <button
                      type="button"
                      className="flex items-center gap-1.5 brand-surface brand-lift rounded-full bg-brand px-4 py-2 text-xs font-bold text-on-brand"
                    >
                      <Ticket className="h-4 w-4" /> Tickets
                    </button>
                  ) : (
                    <span className="rounded-full bg-accent-tint px-3 py-1 text-xs font-bold text-accent-strong">
                      {show.status}
                    </span>
                  )}
                </div>
              </div>
            ))}

          {activeTab === "Merch" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {MERCH.map((item) => (
                <div
                  key={item.id}
                  className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card backdrop-blur-xl transition-colors hover:border-accent"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.item}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="text-sm font-bold leading-tight">{item.item}</div>
                    <span className="flex shrink-0 items-center gap-1.5 text-base font-bold text-accent-strong">
                      {item.price} <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <p className="mono-label mt-8 text-center text-muted-foreground">Built in the squat · 2026</p>
      </div>

      {/* Album modal */}
      {album && (
        <Overlay onClose={() => setAlbum(null)}>
          <img src={album.image} alt={album.album} className="h-56 w-full object-cover" />
          <div className="p-6">
            <span className="mono-label text-accent-strong">{album.band}</span>
            <h2 className="mt-1 text-2xl font-bold">{album.album}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Released {album.year} · {album.role}
            </p>
            <button
              type="button"
              className="mt-6 flex w-full items-center justify-center gap-2 brand-surface brand-lift rounded-lg bg-brand py-3 text-sm font-bold text-on-brand"
            >
              <Disc size={18} /> Stream Now
            </button>
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
            <p className="mt-1 text-sm text-muted-foreground">For booking, press, or hate mail.</p>
            <div className="mt-5 flex flex-col gap-3">
              <Field placeholder="Name" type="text" />
              <Field placeholder="Email" type="email" />
              <textarea
                required
                rows={4}
                placeholder="Message"
                className="w-full resize-none rounded-md border border-border bg-input-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
              />
              <button
                type="submit"
                className="mt-1 brand-surface brand-lift rounded-lg bg-brand py-3 text-sm font-bold text-on-brand"
              >
                Send Message
              </button>
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
              <QrCode size={148} className="text-foreground" />
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
    </div>
  )
}

function Field({ placeholder, type }: { placeholder: string; type: string }) {
  return (
    <input
      required
      type={type}
      placeholder={placeholder}
      className="w-full rounded-md border border-border bg-input-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
    />
  )
}

function Overlay({
  children,
  onClose,
  size = "md",
}: {
  children: React.ReactNode
  onClose: () => void
  size?: "xs" | "md"
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0405]/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={
          "relative w-full overflow-hidden rounded-xl border border-border bg-popover shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] backdrop-blur-2xl " +
          (size === "xs" ? "max-w-xs" : "max-w-md")
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
