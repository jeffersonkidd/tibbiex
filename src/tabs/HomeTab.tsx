import { VISIBLE_LINKS } from "../content/links"
import { SHOP_PRINTS } from "../content/shop"
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
}: {
  onOpenReadings: () => void
  onOpenOffer: () => void
  onOpenBooking: () => void
  onOpenShop?: () => void
}) {
  return (
    <>
      <NewsletterSignup />

      {onOpenShop && (
        <PolaroidStack
          photos={SHOP_PRINTS}
          label="Shop the art"
          onOpen={onOpenShop}
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
