import { VISIBLE_LINKS } from "../content/links"
import LinkRow from "../ui/rows/LinkRow"
import RehearsalPanel from "../site/RehearsalPanel"
import FundPanel from "../site/FundPanel"
import NewsletterSignup from "../site/NewsletterSignup"

/* The first tab: rehearsal status, the link rows, then the fund and the
   sign-up. Rows with an `action` open something in this view instead of
   navigating away. */
export default function HomeTab({
  onOpenRehearsal,
  onOpenReadings,
  onOpenOffer,
  onOpenBooking,
}: {
  onOpenRehearsal: () => void
  onOpenReadings: () => void
  onOpenOffer: () => void
  onOpenBooking: () => void
}) {
  return (
    <>
      <RehearsalPanel onOpen={onOpenRehearsal} />

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

      <NewsletterSignup />
    </>
  )
}
