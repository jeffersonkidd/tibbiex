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
} from "lucide-react"

import profilePic from "./assets/tibbie_profile.jpeg"

// The MonoFly DSP kit ships design tokens + typography classes but no React
// components (its barrel is empty), so UI is built from raw primitives styled
// exclusively through the kit's tokens (bg-surface, text-ink, rounded-lg, …)
// and its typography classes (.title-page, .heading, .body-*).

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

async function copyLink() {
  const text = "https://tibbie-x.punk/bio"
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    /* clipboard unavailable — silently ignore */
  }
  toast.success("Bio link copied. Spread the word.")
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
    >
      {children}
    </button>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("Links")
  const [booking, setBooking] = useState(false)
  const [qr, setQr] = useState(false)
  const [album, setAlbum] = useState<Album | null>(null)

  return (
    <div className="flex min-h-screen justify-center px-4 py-8 text-ink selection:bg-accent-soft sm:py-14">
      <Toaster position="top-center" richColors />

      <main className="w-full max-w-[560px]">
        <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_24px_60px_-24px_rgba(30,30,30,0.28)]">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pt-5 sm:px-7">
            <span className="mono-label text-ink-3">tibbie-x.punk/bio</span>
            <div className="flex gap-2">
              <IconButton label="Show QR code" onClick={() => setQr(true)}>
                <QrCode size={17} />
              </IconButton>
              <IconButton label="Share bio link" onClick={copyLink}>
                <Share2 size={17} />
              </IconButton>
            </div>
          </div>

          {/* Cover */}
          <div className="relative mx-5 mt-4 h-44 overflow-hidden rounded-xl sm:mx-7">
            <img
              src="https://images.unsplash.com/photo-1508973379184-7517410fb0bc?q=80&w=1200&auto=format&fit=crop"
              alt="Tibbie X performing live"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span className="mono-label absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-surface/95 px-2.5 py-1 text-accent-ink">
              <Radio size={12} /> Touring Now
            </span>
          </div>

          {/* Identity */}
          <div className="px-5 sm:px-7">
            <div className="flex items-end gap-4">
              <img
                src={profilePic}
                alt="Tibbie X"
                className="relative z-10 -mt-10 h-24 w-24 rounded-2xl border-4 border-surface object-cover shadow-lg"
              />
            </div>

            <h1 className="wordmark mt-3 text-4xl uppercase leading-none text-ink">Tibbie X</h1>
            <span className="mono-label mt-2 block text-accent-strong">Bass · Vocals</span>
            <p className="subheading mt-2 text-ink-2">Leftover Crack · Star Fucking Hipsters</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { icon: MapPin, label: "NYC" },
                { icon: Mic2, label: "Squatting" },
                { icon: Disc, label: "No Gods No Masters" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="mono-label flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-ink-2"
                >
                  <Icon size={12} /> {label}
                </span>
              ))}
            </div>

            {/* Socials + book */}
            <div className="mt-5 flex items-center gap-2">
              {SOCIALS.map((Icon, i) => (
                <IconButton key={i} label="Social profile">
                  <Icon size={17} />
                </IconButton>
              ))}
              <button
                type="button"
                onClick={() => setBooking(true)}
                className="body-small-strong ml-auto flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-on-brand transition-colors hover:bg-brand-hover"
              >
                <MessageSquare size={15} /> Book / Contact
              </button>
            </div>

            {/* Status */}
            <div className="mt-6 rounded-xl border border-line bg-surface-2 p-4">
              <div className="flex items-center justify-between">
                <span className="body-small-strong text-ink">Studio Status</span>
                <span className="mono-label text-ink-3">66%</span>
              </div>
              <p className="body-small mt-1 text-ink-2">
                Recording new bass tracks for the split EP. Rehearsing the fall setlist.
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-3">
                <div className="h-full rounded-full bg-accent" style={{ width: "66%" }} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 px-5 sm:px-7">
            <div className="flex gap-1 rounded-full border border-line bg-surface-2 p-1">
              {TABS.map((tab) => {
                const active = tab === activeTab
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={
                      "body-small-strong flex-1 rounded-full py-2 transition-colors " +
                      (active ? "bg-brand text-on-brand" : "text-ink-2 hover:text-ink")
                    }
                  >
                    {tab}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Panels */}
          <div className="min-h-[280px] px-5 pb-8 pt-5 sm:px-7">
            {activeTab === "Links" && (
              <div className="flex flex-col gap-3">
                {LINKS.map(({ icon: Icon, title, meta, href, external }) => (
                  <a
                    key={title}
                    href={href}
                    className="group flex items-center gap-4 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent hover:bg-accent-tint"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-2 text-accent-strong">
                      <Icon size={20} />
                    </span>
                    <span className="flex-1">
                      <span className="body-strong block text-ink">{title}</span>
                      <span className="mono-label mt-1 block text-ink-3">{meta}</span>
                    </span>
                    {external ? (
                      <ExternalLink size={18} className="text-ink-3 group-hover:text-accent-strong" />
                    ) : (
                      <ChevronRight size={18} className="text-ink-3 group-hover:text-accent-strong" />
                    )}
                  </a>
                ))}
              </div>
            )}

            {activeTab === "Music" && (
              <div className="flex flex-col gap-3">
                {DISCOGRAPHY.map((rec) => (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => setAlbum(rec)}
                    className="group flex items-center gap-4 rounded-xl border border-line bg-surface p-3 text-left transition-colors hover:border-accent hover:bg-accent-tint"
                  >
                    <img
                      src={rec.image}
                      alt={rec.album}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="body-strong block truncate text-ink">{rec.album}</span>
                      <span className="body-small block text-accent-strong">{rec.band}</span>
                      <span className="mono-label mt-1 block text-ink-3">
                        {rec.year} · {rec.role}
                      </span>
                    </span>
                    <ChevronRight size={18} className="text-ink-3 group-hover:text-accent-strong" />
                  </button>
                ))}
              </div>
            )}

            {activeTab === "Tour" && (
              <div className="flex flex-col gap-3">
                {SHOWS.map((show) => (
                  <div
                    key={show.id}
                    className="flex items-center justify-between rounded-xl border border-line bg-surface p-4"
                  >
                    <div>
                      <span className="body-strong block text-ink">{show.venue}</span>
                      <span className="body-small block text-ink-2">
                        {show.city} · {show.date}
                      </span>
                    </div>
                    {show.status === "Tickets" ? (
                      <button
                        type="button"
                        className="body-small-strong flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-white transition-colors hover:bg-accent-strong"
                      >
                        <Ticket size={14} /> Tickets
                      </button>
                    ) : (
                      <span className="mono-label rounded-full bg-surface-2 px-3 py-2 text-ink-3">
                        {show.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Merch" && (
              <div className="grid grid-cols-2 gap-3">
                {MERCH.map((item) => (
                  <div
                    key={item.id}
                    className="group overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-accent"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.item}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3">
                      <span className="body-small-strong block leading-tight text-ink">{item.item}</span>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="body-strong text-accent-strong">{item.price}</span>
                        <ShoppingBag size={15} className="text-ink-3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="mono-label mt-5 text-center text-ink-3">Built in the squat · 2026</p>
      </main>

      {/* Album modal */}
      {album && (
        <Overlay onClose={() => setAlbum(null)}>
          <img src={album.image} alt={album.album} className="h-56 w-full object-cover" />
          <div className="p-6">
            <span className="mono-label text-accent-strong">{album.band}</span>
            <h2 className="heading mt-1 text-ink">{album.album}</h2>
            <p className="body-small mt-2 text-ink-2">
              Released {album.year} · {album.role}
            </p>
            <button
              type="button"
              className="body-strong mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3 text-on-brand transition-colors hover:bg-brand-hover"
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
            <h2 className="heading text-ink">Book / Contact</h2>
            <p className="body-small mt-1 text-ink-2">For booking, press, or hate mail.</p>
            <div className="mt-5 flex flex-col gap-3">
              <Field placeholder="Name" type="text" />
              <Field placeholder="Email" type="email" />
              <textarea
                required
                rows={4}
                placeholder="Message"
                className="body-base w-full resize-none rounded-md border border-line bg-surface-2 px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent"
              />
              <button
                type="submit"
                className="body-strong mt-1 rounded-full bg-accent py-3 text-white transition-colors hover:bg-accent-strong"
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
            <h2 className="heading text-ink">Scan &amp; Share</h2>
            <div className="mx-auto mt-5 w-fit rounded-md border border-line bg-surface p-4">
              <QrCode size={148} className="text-ink" />
            </div>
            <button
              type="button"
              onClick={copyLink}
              className="body-small-strong mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-line py-3 text-ink transition-colors hover:border-line-strong"
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
      className="body-base w-full rounded-md border border-line bg-surface-2 px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent"
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={
          "relative w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl " +
          (size === "xs" ? "max-w-xs" : "max-w-md")
        }
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-surface/80 text-ink-2 transition-colors hover:text-ink"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  )
}
