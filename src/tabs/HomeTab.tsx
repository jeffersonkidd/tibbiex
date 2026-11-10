import { VISIBLE_LINKS } from "../content/links"
import type { LinkEntry } from "../content/links"
import type { BandId } from "../content/portfolio"
import { useShop } from "../lib/shop"
import LinkRow from "../ui/rows/LinkRow"
import FundPanel from "../site/panels/FundPanel"
import NewsletterSignup from "../site/panels/NewsletterSignup"

/* The first tab: the sign-up, the link rows, then the fund. Rows with an
   `action` open something in this view instead of navigating away; rows
   with a `shop` band open that band's shelf in the Buy tab, and go dark
   with the Buy tab or while the band has nothing for sale. */
export default function HomeTab({
  onOpenReadings,
  onOpenOffer,
  onOpenBooking,
  onOpenShop,
}: {
  onOpenReadings: () => void
  onOpenOffer: () => void
  onOpenBooking: () => void
  onOpenShop?: (band: BandId) => void
}) {
  const { groups } = useShop()

  function opener(link: LinkEntry) {
    const band = link.shop
    if (band) return onOpenShop && (() => onOpenShop(band))
    if (link.action === "tarot") return onOpenReadings
    if (link.action === "offer") return onOpenOffer
    if (link.action === "booking") return onOpenBooking
    return undefined
  }

  const rows = VISIBLE_LINKS.filter(
    (link) =>
      !link.shop ||
      (onOpenShop && groups.some((group) => group.id === link.shop)),
  )

  return (
    <>
      <NewsletterSignup />

      {rows.length > 0 && (
        <nav className="link-rows" aria-label="Links">
          {rows.map((link) => (
            <LinkRow key={link.title} link={link} onOpen={opener(link)} />
          ))}
        </nav>
      )}

      <FundPanel />
    </>
  )
}
