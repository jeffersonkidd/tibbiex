import { ChevronRight, ShoppingBag } from "lucide-react"

import { formatPrice, shopFor } from "../../content/shop"
import type { BandId, PortfolioEntry } from "../../content/portfolio"

/* The portfolio -> Buy hand-off, rendered inside a portfolio section. It is a
   button rather than an anchor because the destination is a tab in this same
   view, not a URL. Bands with nothing for sale render nothing at all. */
export default function ShopLink({
  entry,
  onOpen,
}: {
  entry: PortfolioEntry
  onOpen: (band: BandId) => void
}) {
  const items = shopFor(entry.id)
  if (items.length === 0) return null

  const cheapest = items.reduce((low, item) =>
    item.price < low.price ? item : low,
  )

  return (
    <button
      type="button"
      onClick={() => onOpen(entry.id)}
      className="group mt-4 flex w-full items-center justify-between gap-part rounded-md border border-border bg-muted/40 p-3 text-left transition-colors hover:border-accent hover:bg-muted"
    >
      <span className="flex items-center gap-part">
        <span className="rounded-md bg-card p-2 text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <ShoppingBag className="h-4 w-4" />
        </span>
        <span>
          <span className="block text-sm font-bold">Shop {entry.band}</span>
          <span className="mono-label mt-0.5 block text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"} · from{" "}
            {formatPrice(cheapest.price)}
          </span>
        </span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent" />
    </button>
  )
}
