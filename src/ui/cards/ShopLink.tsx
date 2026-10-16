import { ChevronRight, ShoppingBag } from "lucide-react"

import { formatPrice, lowestPrice } from "../../content/shop"
import type { ShopItem } from "../../content/shop"
import type { BandId, PortfolioEntry } from "../../content/portfolio"

/* The portfolio -> Buy hand-off, rendered inside a portfolio section. It is a
   button rather than an anchor because the destination is a tab in this same
   view, not a URL. Bands with nothing for sale render nothing at all. */
export default function ShopLink({
  entry,
  items,
  onOpen,
}: {
  entry: PortfolioEntry
  /* What the band has for sale now -- the live shop's, handed down. */
  items: ShopItem[]
  onOpen: (band: BandId) => void
}) {
  if (items.length === 0) return null

  const cheapest = Math.min(...items.map(lowestPrice))

  return (
    <button
      type="button"
      onClick={() => onOpen(entry.id)}
      className="group mt-4 flex w-full items-center justify-between gap-part rounded-md border border-outline-variant bg-surface-container-highest/40 p-3 text-left transition-colors hover:border-tertiary hover:bg-surface-container-highest"
    >
      <span className="flex items-center gap-part">
        <span className="rounded-md bg-surface-container-low p-2 text-on-surface-variant transition-colors group-hover:bg-primary group-hover:text-on-primary">
          <ShoppingBag className="h-4 w-4" />
        </span>
        <span>
          <span className="body-small-bold block">Shop {entry.band}</span>
          <span className="label-mono mt-0.5 block text-on-surface-variant">
            {items.length} {items.length === 1 ? "item" : "items"} · from{" "}
            {formatPrice(cheapest)}
          </span>
        </span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-on-surface-variant transition-all group-hover:translate-x-1 group-hover:text-tertiary" />
    </button>
  )
}
