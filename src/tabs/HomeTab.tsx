import { VISIBLE_LINKS } from "../content/links"
import LinkRow from "../ui/rows/LinkRow"
import FundPanel from "../site/FundPanel"
import NewsletterSignup from "../site/NewsletterSignup"

/* The first tab: the sign-up, the link rows, then the fund. Rows with an
   `action` open something in this view instead of navigating away. */
export default function HomeTab({
  onOpenReadings,
  onOpenOffer,
  onOpenBooking,
}: {
  onOpenReadings: () => void
  onOpenOffer: () => void
  onOpenBooking: () => void
}) {
  return (
    <>
      <NewsletterSignup />

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
