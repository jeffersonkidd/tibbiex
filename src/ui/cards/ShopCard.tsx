import { ShoppingBag } from "lucide-react"

import { formatPrice, formatsOf, lowestPrice } from "../../content/shop"
import type { ShopFormat, ShopItem } from "../../content/shop"

/* The image box for each `aspect`: 1:1, 4:5, 3:2, or the default strip. */
const IMAGE_BOX = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  landscape: "aspect-[3/2]",
  strip: "h-48",
}

/* One merch item in the Buy tab: image over a name-and-price bar. The whole
   card is the button that opens the item in the product modal. An item sold
   in several formats shows its lowest price, marked "from".

   With a `format`, the card is that one format of the item: its own mockup
   photo where it has one, the format named under the item, and its own
   price. */
export default function ShopCard({
  item,
  format,
  onOpen,
}: {
  item: ShopItem
  format?: ShopFormat
  onOpen: () => void
}) {
  const ranged = !format && formatsOf(item).length > 1
  const mockup = format && item.formatPhotos?.[format.id]

  return (
    <button
      type="button"
      onClick={onOpen}
      className="surface group block w-full overflow-hidden rounded-lg text-left transition-colors hover:border-tertiary"
    >
      <div
        className={`${mockup ? IMAGE_BOX.square : IMAGE_BOX[item.aspect ?? "strip"]} overflow-hidden`}
      >
        <img
          src={mockup || item.image}
          alt={
            format ? `${item.item}, ${format.label}` : (item.alt ?? item.item)
          }
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="flex items-center justify-between gap-part p-card">
        <div>
          <div className="body-small-bold">{item.item}</div>
          {format && (
            <div className="label-mono mt-0.5 text-on-surface-variant">
              {format.label}
            </div>
          )}
        </div>
        <span className="flex shrink-0 items-center gap-glyph body-base-bold text-tertiary">
          {ranged && (
            <span className="label-mono text-on-surface-variant">from</span>
          )}
          {formatPrice(format ? format.price : lowestPrice(item))}{" "}
          <ShoppingBag className="h-4 w-4 text-on-surface-variant" />
        </span>
      </div>
    </button>
  )
}
