import { useEffect, useRef, useState } from "react"
import { Toaster } from "sonner"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

import { REAGAN_YOUTH_LP } from "./content/music"
import type { Album } from "./content/music"
import { TAROT_SESSION } from "./content/offerings"
import type { Service } from "./content/offerings"
import { PORTFOLIO } from "./content/portfolio"
import type { BandId, Photo } from "./content/portfolio"
import { YOUTH_ANTHEMS_BUNDLE } from "./content/shop"
import type { ShopItem, ShopShelf } from "./content/shop"
import { VISIBLE_TABS, isTabEnabled } from "./content/tabs"
import type { Tab } from "./content/tabs"

import { analyticsOptedOut, trackTab } from "./lib/analytics"
import { useCheckoutReturn } from "./lib/payments"

import Lightbox from "./ui/overlays/Lightbox"
import MagicDust from "./ui/MagicDust"

import Footer from "./site/Footer"
import Header from "./site/Header"
import ProfileCard from "./site/ProfileCard"
import TabStrip from "./site/TabStrip"
import AlbumModal from "./site/modals/AlbumModal"
import BookingModal from "./site/modals/BookingModal"
import ProductModal from "./site/modals/ProductModal"
import SessionMenu from "./site/modals/SessionMenu"
import ShareModal from "./site/modals/ShareModal"

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
  | { kind: "session"; service: Service }
  | { kind: "product"; item: ShopItem; format?: string }
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
  /* Which shelf the Buy tab shows -- null for its first screen, a banner
     per shelf -- and which tab under it is picked: a band, a session, a
     collection. Set from a shop link elsewhere on the page too. */
  const [shopShelf, setShopShelf] = useState<ShopShelf | null>(null)
  const [shopPick, setShopPick] = useState<string | null>(null)
  /* The same idea one tab over, except the Portfolio strip always has exactly
     one band selected -- there is no "all" view of the credits. */
  const [portfolioBand, setPortfolioBand] = useState<BandId>(PORTFOLIO[0].id)
  const tabsRef = useRef<HTMLElement>(null)
  const close = () => setModal(null)

  useCheckoutReturn()

  /* The one hand-off between the two tabs: switch to Buy, narrow it to the
     band, and put the tab strip back under the user's eye -- the Buy panel
     can start well below the fold after a long portfolio scroll. */
  function openShop(band: BandId) {
    setShopShelf("bands")
    setShopPick(band)
    setActiveTab("Buy")
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  useEffect(() => trackTab(activeTab), [activeTab])

  return (
    /* The column is 480px until md, then 780px: narrow enough below md that
       a link row's polaroid keeps phone proportions on a tablet, wide enough
       above it for each print to sit beside its copy. overflow-x: clip trims
       the tape and stickers that hang past a print at the screen's edge,
       without making a scroll container. */
    <div className="flex min-h-screen justify-center overflow-x-clip px-4 pb-20 font-sans text-on-surface selection:bg-tertiary/20 sm:px-6">
      <Toaster position="top-center" richColors />

      <div className="w-full min-w-0 max-w-[480px] space-y-stack pt-6 md:max-w-[780px]">
        <Header onShare={() => setModal({ kind: "share" })} />

        <ProfileCard
          onContact={() => setModal({ kind: "booking" })}
          onOpenShop={isTabEnabled("Buy") ? openShop : undefined}
        />

        <TabStrip ref={tabsRef} active={activeTab} onSelect={setActiveTab} />

        <main className="space-y-stack">
          {activeTab === "Home" && (
            <HomeTab
              onOpenReadings={() =>
                setModal({ kind: "session", service: TAROT_SESSION })
              }
              onOpenOffer={() =>
                setModal({ kind: "product", item: YOUTH_ANTHEMS_BUNDLE })
              }
              onOpenBooking={() => setModal({ kind: "booking" })}
              onOpenShop={isTabEnabled("Buy") ? openShop : undefined}
            />
          )}

          {activeTab === "Listen" && (
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
              shelf={shopShelf}
              pick={shopPick}
              onShelfChange={(next) => {
                /* A new shelf, or back to the first screen: start at the
                   top of the Buy tab, under the tab strip. */
                setShopShelf(next)
                setShopPick(null)
                tabsRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }}
              onPickChange={setShopPick}
              onOpenProduct={(item, format) =>
                setModal({ kind: "product", item, format })
              }
              onOpenService={(service) =>
                setModal({ kind: "session", service })
              }
            />
          )}
        </main>

        <Footer />
      </div>

      {modal?.kind === "album" && (
        <AlbumModal album={modal.album} onClose={close} />
      )}
      {modal?.kind === "booking" && <BookingModal onClose={close} />}
      {modal?.kind === "share" && <ShareModal onClose={close} />}
      {modal?.kind === "session" && (
        <SessionMenu service={modal.service} onClose={close} />
      )}
      {modal?.kind === "product" && (
        <ProductModal
          item={modal.item}
          formatId={modal.format}
          onClose={close}
        />
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
