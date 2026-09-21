import { useEffect, useRef, useState } from "react"
import { Toaster } from "sonner"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

import { REAGAN_YOUTH_LP } from "./content/music"
import type { Album } from "./content/music"
import { PORTFOLIO } from "./content/portfolio"
import type { BandId, Photo } from "./content/portfolio"
import { YOUTH_ANTHEMS_BUNDLE } from "./content/shop"
import type { ShopGroupId, ShopItem } from "./content/shop"
import { VISIBLE_TABS } from "./content/tabs"
import type { Tab } from "./content/tabs"

import { analyticsOptedOut } from "./lib/analytics"
import { useCheckoutReturn } from "./lib/payments"

import Lightbox from "./ui/overlays/Lightbox"
import TabItem from "./ui/controls/TabItem"
import MagicDust from "./ui/MagicDust"

import AlbumModal from "./site/AlbumModal"
import BookingModal from "./site/BookingModal"
import ProductModal from "./site/ProductModal"
import ProfileCard from "./site/ProfileCard"
import ReadingMenu from "./site/ReadingMenu"
import ShareModal from "./site/ShareModal"
import SiteFooter from "./site/SiteFooter"
import SiteHeader from "./site/SiteHeader"

import BuyTab from "./tabs/BuyTab"
import HomeTab from "./tabs/HomeTab"
import MusicTab from "./tabs/MusicTab"
import PortfolioTab from "./tabs/PortfolioTab"
import TourTab from "./tabs/TourTab"

/* At most one modal is open at a time, so which one -- and whatever it needs --
   is a single piece of state. Adding a modal is one line here and one branch
   at the bottom of the page. */
type Modal =
  | { kind: "album"; album: Album }
  | { kind: "booking" }
  | { kind: "share" }
  | { kind: "readings" }
  | { kind: "product"; item: ShopItem }
  /* The photo set travels with the index rather than being looked up by id,
     so the arrows stay inside one band. */
  | { kind: "lightbox"; photos: Photo[]; index: number }

// The page shell: header, profile, the tab strip, whichever tab is active and
// whichever modal is open. Everything it lays out lives in ./tabs (one file per
// tab), ./features (content-bound blocks that may hold state) and ./components
// (reusable pieces that only take props). This file holds the state that
// crosses between them and nothing else.
export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(VISIBLE_TABS[0].label)
  const [modal, setModal] = useState<Modal | null>(null)
  /* Which band the Buy tab is narrowed to. Set from a portfolio section's
     shop link, and resettable from the filter strip. */
  const [shopBand, setShopBand] = useState<ShopGroupId | "all">("all")
  /* The same idea one tab over, except the Portfolio strip always has exactly
     one band selected -- there is no "all" view of the credits. */
  const [portfolioBand, setPortfolioBand] = useState<BandId>(PORTFOLIO[0].id)
  const tabsRef = useRef<HTMLElement>(null)
  const pendingScroll = useRef<BandId | null>(null)
  const close = () => setModal(null)

  useCheckoutReturn()

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

      <div className="w-full min-w-0 max-w-2xl space-y-6 px-4 pt-6 sm:px-6">
        <SiteHeader onShowQr={() => setModal({ kind: "share" })} />

        <ProfileCard onContact={() => setModal({ kind: "booking" })} />

        <nav
          ref={tabsRef}
          className="surface hide-scrollbar flex scroll-mt-4 gap-2 overflow-x-auto rounded-lg bg-card/50 p-1.5"
        >
          {VISIBLE_TABS.map(({ label }) => (
            <TabItem
              key={label}
              label={label}
              active={activeTab === label}
              onSelect={() => setActiveTab(label)}
            />
          ))}
        </nav>

        <main className="space-y-4">
          {activeTab === "Home" && (
            <HomeTab
              onOpenReadings={() => setModal({ kind: "readings" })}
              onOpenOffer={() =>
                setModal({ kind: "product", item: YOUTH_ANTHEMS_BUNDLE })
              }
              onOpenBooking={() => setModal({ kind: "booking" })}
            />
          )}

          {activeTab === "Music" && (
            <MusicTab
              onOpenRehearsal={() =>
                setModal({ kind: "album", album: REAGAN_YOUTH_LP })
              }
              onOpenAlbum={(album) => setModal({ kind: "album", album })}
            />
          )}

          {activeTab === "Portfolio" && (
            <PortfolioTab
              band={portfolioBand}
              onBandChange={setPortfolioBand}
              onOpenShop={openShop}
              onOpenPhoto={(photos, index) =>
                setModal({ kind: "lightbox", photos, index })
              }
            />
          )}

          {activeTab === "Tour" && <TourTab />}

          {activeTab === "Buy" && (
            <BuyTab
              band={shopBand}
              onBandChange={setShopBand}
              onOpenPortfolio={openPortfolio}
              onOpenProduct={(item) => setModal({ kind: "product", item })}
            />
          )}
        </main>

        <SiteFooter />
      </div>

      {modal?.kind === "album" && (
        <AlbumModal album={modal.album} onClose={close} />
      )}
      {modal?.kind === "booking" && <BookingModal onClose={close} />}
      {modal?.kind === "share" && <ShareModal onClose={close} />}
      {modal?.kind === "readings" && <ReadingMenu onClose={close} />}
      {modal?.kind === "product" && (
        <ProductModal item={modal.item} onClose={close} />
      )}
      {modal?.kind === "lightbox" && (
        <Lightbox
          state={modal}
          onChange={(next) => setModal({ kind: "lightbox", ...next })}
          onClose={close}
        />
      )}

      <MagicDust />

      <Analytics beforeSend={(event) => (analyticsOptedOut() ? null : event)} />
      <SpeedInsights
        beforeSend={(event) => (analyticsOptedOut() ? null : event)}
      />
    </div>
  )
}
