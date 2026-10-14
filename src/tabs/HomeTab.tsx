import { VISIBLE_LINKS } from "../content/links"
import type { BandId } from "../content/portfolio"
import { useShop } from "../lib/catalog"
import PolaroidStack from "../ui/cards/PolaroidStack"
import LinkRow from "../ui/rows/LinkRow"
import FundPanel from "../site/panels/FundPanel"
import NewsletterSignup from "../site/panels/NewsletterSignup"

/* The first tab: the sign-up, the polaroids into the shop, the link rows,
   then the fund. The polaroids go dark with the Buy tab. Rows with an
   `action` open something in this view instead of navigating away. */
export default function HomeTab({
  onOpenReadings,
  onOpenOffer,
  onOpenBooking,
  onOpenShop,
  onOpenArt,
}: {
  onOpenReadings: () => void
  onOpenOffer: () => void
  onOpenBooking: () => void
  onOpenShop?: (band: BandId) => void
  onOpenArt: () => void
}) {
  const { prints } = useShop()

  return (
    <>
      <NewsletterSignup />

      {onOpenShop && (
        <PolaroidStack
          rows={prints}
          onOpen={(id) => (id === "art" ? onOpenArt() : onOpenShop(id))}
        />
      )}

      {VISIBLE_LINKS.map((link) => (
        <LinkRow
          key={link.title}
          link={link}
          onOpen={
            link.action === "tarot"
              ? onOpenReadings
              : link.action === "offer"
                ? onOpenOffer
                : link.action === "booking"
                  ? onOpenBooking
                  : undefined
          }
        />
      ))}

      <FundPanel />
    </>
  )
}
