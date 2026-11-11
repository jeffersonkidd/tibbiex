import { VISIBLE_LINKS } from "../content/links"
import type { LinkEntry } from "../content/links"
import type { ShopShelf } from "../content/shop"
import type { MouseEvent } from "react"
import { isPlainClick, shouldAskToJoin } from "../lib/newsletter-prompt"
import { useShop } from "../lib/shop"
import LinkRow from "../ui/rows/LinkRow"
import FundPanel from "../site/panels/FundPanel"

/* The first tab: the link rows, then the fund. Rows with an `action` open
   something in this view instead of navigating away; rows with a `shop`
   band open the Buy tab's first screen, and go dark with the Buy tab or
   while the band has nothing for sale. The tarot row opens the Sessions
   shelf, or the reading menu when the Buy tab is off. Every row goes through
   `askFirst`, which is how App puts the newsletter in front of a
   visitor's first tap. */
export default function HomeTab({
  onOpenReadings,
  onOpenOffer,
  onOpenBooking,
  onOpenBuy,
  askFirst = (next) => next(),
}: {
  onOpenReadings: () => void
  onOpenOffer: () => void
  onOpenBooking: () => void
  onOpenBuy?: (shelf: ShopShelf | null) => void
  askFirst?: (next: () => void) => void
}) {
  const { groups } = useShop()

  function action(link: LinkEntry) {
    if (link.shop) return onOpenBuy && (() => onOpenBuy(null))
    if (link.action === "tarot")
      return onOpenBuy ? () => onOpenBuy("sessions") : onOpenReadings
    if (link.action === "offer") return onOpenOffer
    if (link.action === "booking") return onOpenBooking
    return undefined
  }

  function opener(link: LinkEntry) {
    const open = action(link)
    return open && (() => askFirst(open))
  }

  /* A link away from the site: held, and followed once whatever App shows
     first is closed. A click meant for a new tab goes straight through. */
  function follow(e: MouseEvent<HTMLAnchorElement>) {
    if (!isPlainClick(e) || !shouldAskToJoin()) return
    e.preventDefault()
    const href = e.currentTarget.href
    askFirst(() => window.location.assign(href))
  }

  const rows = VISIBLE_LINKS.filter(
    (link) =>
      !link.shop ||
      (onOpenBuy && groups.some((group) => group.id === link.shop)),
  )

  return (
    <>
      {rows.length > 0 && (
        <nav className="link-rows" aria-label="Links">
          {rows.map((link) => (
            <LinkRow
              key={link.title}
              link={link}
              onOpen={opener(link)}
              onFollow={follow}
            />
          ))}
        </nav>
      )}

      <FundPanel />
    </>
  )
}
