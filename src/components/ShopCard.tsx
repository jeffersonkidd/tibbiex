import { ShoppingBag } from "lucide-react"

import type { ShopItem } from "../data"

/* One merch item in the Buy tab: image over a name-and-price bar. */
export default function ShopCard({ item }: { item: ShopItem }) {
  return (
    <div className="surface group cursor-pointer overflow-hidden rounded-lg transition-colors hover:border-accent">
      <div className="h-48 overflow-hidden">
        <img
          src={item.image}
          alt={item.item}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="text-sm font-bold leading-tight">{item.item}</div>
        <span className="flex shrink-0 items-center gap-1.5 text-base font-bold text-accent-strong">
          {item.price}{" "}
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </span>
      </div>
    </div>
  )
}
