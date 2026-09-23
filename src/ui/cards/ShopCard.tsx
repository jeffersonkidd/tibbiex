import { ShoppingBag } from "lucide-react"

import { formatPrice } from "../../content/shop"
import type { ShopItem } from "../../content/shop"

/* One merch item in the Buy tab: image over a name-and-price bar. The whole
   card is the button that opens the item in the product modal. */
export default function ShopCard({
  item,
  onOpen,
}: {
  item: ShopItem
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="surface group block w-full overflow-hidden rounded-lg text-left transition-colors hover:border-accent"
    >
      <div className="h-48 overflow-hidden">
        <img
          src={item.image}
          alt={item.item}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="flex items-center justify-between gap-part p-card">
        <div className="text-sm font-bold leading-tight">{item.item}</div>
        <span className="flex shrink-0 items-center gap-glyph text-base font-bold text-accent">
          {formatPrice(item.price)}{" "}
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </span>
      </div>
    </button>
  )
}
