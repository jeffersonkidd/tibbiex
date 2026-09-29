import { ShoppingBag } from "lucide-react"

import { formatPrice, formatsOf, lowestPrice } from "../../content/shop"
import type { ShopItem } from "../../content/shop"

/* One merch item in the Buy tab: image over a name-and-price bar. The whole
   card is the button that opens the item in the product modal. An item sold
   in several formats shows its lowest price, marked "from". */
export default function ShopCard({
  item,
  onOpen,
}: {
  item: ShopItem
  onOpen: () => void
}) {
  const ranged = formatsOf(item).length > 1

  return (
    <button
      type="button"
      onClick={onOpen}
      className="surface group block w-full overflow-hidden rounded-lg text-left transition-colors hover:border-accent"
    >
      <div className="h-48 overflow-hidden">
        <img
          src={item.image}
          alt={item.alt ?? item.item}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="flex items-center justify-between gap-part p-card">
        <div className="body-small-bold">{item.item}</div>
        <span className="flex shrink-0 items-center gap-glyph body-base-bold text-accent">
          {ranged && (
            <span className="label-mono text-muted-foreground">from</span>
          )}
          {formatPrice(lowestPrice(item))}{" "}
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </span>
      </div>
    </button>
  )
}
