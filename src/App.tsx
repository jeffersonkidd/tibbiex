import { useEffect, useRef, useState } from "react"
import { Toaster, toast } from "sonner"
import { Analytics } from "@vercel/analytics/react"
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Copy,
  Disc,
  Guitar,
  Instagram,
  MapPin,
  MessageSquare,
  QrCode,
  Radio,
  Share2,
  ShoppingBag,
  Ticket,
  Trophy,
  Youtube,
} from "lucide-react"

import profilePic from "./assets/tibbie_profile.jpg"
import bannerPic from "./assets/tibbie_background.jpg"

import {
  DISCOGRAPHY,
  PORTFOLIO,
  REAGAN_YOUTH_LP,
  SHOP_GROUPS,
  SHOWS,
  SOCIALS,
  TAGS,
  VISIBLE_LINKS,
  VISIBLE_TABS,
} from "./data"
import type { Album, BandId, ShopGroupId, Tab } from "./data"

import PatreonIcon from "./icons/PatreonIcon"
import TikTokIcon from "./icons/TikTokIcon"

import { analyticsOptedOut } from "./lib/analytics"
import { castMagicFrom } from "./lib/magic-dust"
import { copyLink } from "./lib/share"

import BrandButton from "./components/BrandButton"
import Field from "./components/Field"
import FilterPill from "./components/FilterPill"
import Lightbox from "./components/Lightbox"
import type { LightboxState } from "./components/Lightbox"
import LinkFace, { LINK_ROW } from "./components/LinkFace"
import MagicDust from "./components/MagicDust"
import Overlay from "./components/Overlay"
import PhotoGrid from "./components/PhotoGrid"
import ReaganYouthMark from "./components/ReaganYouthMark"
import ShopLink from "./components/ShopLink"
import SiteQrCode from "./components/SiteQrCode"

import ReadingMenu from "./features/ReadingMenu"
import TipJar from "./features/TipJar"

// Layout is a stack of self-contained rounded cards on a dark page (control
// bar, profile card, socials, tab strip, panels) rather than one monolithic
// sheet. Colors come from the surface palette in src/index.css (background /
// card / muted / border), with the buttons and accents on the brand ramp
// (bg-brand / accent). The pieces themselves live in ./components, ./features
// and ./lib -- this file only orchestrates them and holds the page's state.

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
  /* The same idea one tab over, except the Portfolio strip always has exactly
     one band selected -- there is no "all" view of the credits. */
  const [portfolioBand, setPortfolioBand] = useState<BandId>(PORTFOLIO[0].id)
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

  /* Same shape for the rehearsal panel: open the record's modal and leave the
     Music tab behind it, so closing the modal lands on the discography rather
     than back on Home. */
  function openAlbum(rec: Album) {
    setAlbum(rec)
    setActiveTab("Music")
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  /* The return leg. The Portfolio panel is unmounted while Buy is showing, so
     the target section cannot be scrolled to until after the switch renders --
     hence the ref handed to the effect below rather than a scroll right here. */
  function openPortfolio(band: BandId) {
    pendingScroll.current = band
    setPortfolioBand(band)
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

      <div className="w-full min-w-0 max-w-2xl px-4 pt-6 sm:px-6">
        {/* Header Controls */}
        <header className="card-surface mb-8 flex items-center justify-between rounded-lg bg-card p-3">
          <span className="mono-label px-2 text-muted-foreground">
            tibbiex.studio
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

       {/* HERO HEADER & AVATAR CARD */}
        <section className="card-surface bg-card rounded-3xl overflow-hidden mb-6 backdrop-blur-xl">
          {/* Animated Banner Cover */}



          <div className="relative h-72 w-full overflow-hidden bg-muted sm:h-88">
            <img
              src={bannerPic}
              alt="Tibbie X performing live"
              className="h-full w-full object-cover object-top opacity-100 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />

            <span className="hidden mono-label absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-2.5 py-1 text-accent-strong backdrop-blur-sm">
              <Radio size={12} /> Practicing Now
            </span>

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Live Streaming Badge */}
            <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-md animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white" />
                LIVE ON TIKTOK
            </div>

            {/* Verification & Award Ribbon */}
            <div className="hidden absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-amber-300 text-xs font-medium px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> East Coast Punk Legend
            </div>
          </div>

          {/* Avatar & Profile Details */}
          <div className="px-6 pb-6 pt-0 relative -mt-16 sm:-mt-48">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              {/* Profile Avatar Frame with Glow */}
              <div className="relative group">
                <div className={`absolute -inset-1 rounded-full bg-gradient-to-t from-red-500 via-yellow-500 to-white opacity-80 blur-md group-hover:opacity-100 transition duration-500`} />
                <img
                  src={profilePic}
                  alt="Tibbie X Profile"
                  className="relative w-36 h-36 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-slate-950 shadow-2xl"
                />
                <span className="absolute bottom-4 right-2 bg-emerald-400 w-5 h-5 rounded-full border-4 border-slate-950" title="Online & Crafting" />
              </div>

              {/* Identity Info */}
              <div className="flex-1">

                <h1 className="wordmark uppercase leading-none tracking-tight text-4xl sm:text-5xl">
                  Tibbie <span className="wordmark-x">X</span>
                </h1>

                <span className="hidden text-sm font-medium rounded-full bg-amber-500/20 text-amber-300 border-amber-500/40">
                  @TibbieX
                </span>

                <span className="mono-label text-sm rounded-full font-medium border border-border bg-card px-2 py-1 text-accent-strong">
                  Bass & Vocals
                </span>

                <span className="hidden text-xs px-2.5 py-0.5 rounded-full font-semibold border ">
                    Bass + Vocals
                </span>


                <ul className="text-xs max-w-xs list-disc list-inside flex flex-wrap my-4 items-center sm:items-end justify-center sm:justify-start text-slate-300 gap-x-3.5 gap-y-1">
                 <li>Leftover Crack</li> <li>Reagan Youth</li> <li>GASH</li> <li>X-Possibles</li> <li>Kissy Kamikaze</li>
                </ul>


                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-pink-400" /> New York, NY
                  </span>
                  <span className="hidden flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" /> Next: Katsucon '26 (#B-42)
                  </span>
                  <span className="hidden flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Bookings Open
                  </span>
                </div>

              </div>
            </div>

            {/* Social Quick Bar */}
            <div className="grid grid-cols-5 gap-2 mt-5 pt-4 border-t border-border">
              <a
                href="https://instagram.com/tibbie_x"
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-2 rounded-xl border-border border border-border bg-card shadow-sm backdrop-blur-xl hover:bg-pink-500/10 hover:text-pink-400 text-slate-300 transition-all group"
              >
                <Instagram className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-semibold">185K</span>
              </a>

              <a
                href="https://patreon.com/tibbie_x"
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-2 rounded-xl border-border border border-border bg-card shadow-sm backdrop-blur-xl hover:bg-purple-500/10 hover:text-purple-400 text-slate-300 transition-all group"
              >
                <PatreonIcon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-semibold">95K</span>
              </a>
              <a
                href="https://www.youtube.com/@tibbieskyex"
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-2 rounded-xl border-border border border-border bg-card shadow-sm backdrop-blur-xl hover:bg-red-500/10 hover:text-red-400 text-slate-300 transition-all group"
              >
                <Youtube className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-semibold">320K</span>
              </a>
              <a
                href="https://www.tiktok.com/@tibbieskyex"
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-2 rounded-xl border-border border border-border bg-card shadow-sm backdrop-blur-xl hover:bg-cyan-500/10 hover:text-cyan-400 text-slate-300 transition-all group"
              >
                <TikTokIcon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-semibold">140K</span>
              </a>
              <button

                className="flex flex-col items-center justify-center p-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 transition-all group"
              >
                <MessageSquare className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold">Inquire</span>
              </button>
            </div>

            {/* Tags */}
            <div className="mt-5 flex flex-wrap justify-start gap-2">
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
        </section>

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
          {activeTab === "Home" && (
            <>
              {/* Rehearsal status -- also the way into the record it is about */}
              <button
                type="button"
                onClick={() => openAlbum(REAGAN_YOUTH_LP)}
                className="card-surface group block w-full rounded-lg p-5 text-left transition-colors hover:border-accent"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ReaganYouthMark />
                    <div>
                      <div className="text-base font-bold">
                        Practicing with Reagan Youth
                      </div>
                      <p className="mono-label mt-1 text-muted-foreground">
                        The next generation — L.E.S.
                      </p>
                    </div>
                  </div>
                  <span className="mono-label shrink-0 text-muted-foreground">
                    80%
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Three nights a week in a Lower East Side basement, running the set
                  end to end. Carrying the songs forward, not covering them.
                </p>
                <div className="meter-track mt-3 h-2.5">
                  <div className="meter-fill" style={{ width: "80%" }} />
                </div>
                <span className="mono-label mt-3 flex items-center gap-1.5 text-accent-strong">
                  <Disc size={12} /> Hear “{REAGAN_YOUTH_LP.track}”
                  <ChevronRight
                    size={12}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </button>

              {VISIBLE_LINKS.map((link) =>
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
                ) : link.action === "offer" ? (
                  <button
                    key={link.title}
                    type="button"
                    onClick={(e) => {
                      castMagicFrom(e)
                      openShop("reagan-youth")
                    }}
                    className={`${LINK_ROW} w-full text-left`}
                  >
                    <LinkFace link={link} />
                  </button>
                ) : link.action === "booking" ? (
                  <button
                    key={link.title}
                    type="button"
                    onClick={(e) => {
                      castMagicFrom(e)
                      setBooking(true)
                    }}
                    className={`${LINK_ROW} w-full text-left`}
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

          {activeTab === "Portfolio" && (
            <>
              {/* Band strip -- the same filter treatment the Buy tab uses, and
                  where a shop group's "View credits" link lands. */}
              <div className="card-surface hide-scrollbar flex gap-2 overflow-x-auto rounded-lg bg-card/50 p-1.5">
                {PORTFOLIO.map((entry) => (
                  <FilterPill
                    key={entry.id}
                    label={entry.band}
                    active={portfolioBand === entry.id}
                    onClick={() => setPortfolioBand(entry.id)}
                  />
                ))}
              </div>

              {PORTFOLIO.filter((entry) => entry.id === portfolioBand).map((
                entry,
              ) => (
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
            </>
          )}

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
                <FilterPill
                  label="All"
                  active={shopBand === "all"}
                  onClick={() => setShopBand("all")}
                />
                {SHOP_GROUPS.map((group) => (
                  <FilterPill
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
            {album.track && (
              <p className="mono-label mt-3 text-accent-strong">
                Featured track — “{album.track}”
              </p>
            )}
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
