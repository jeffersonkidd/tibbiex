import { ChevronRight } from "lucide-react"

import { SHOP_GROUPS } from "../content/shop"
import type { ShopGroupId, ShopItem } from "../content/shop"
import type { BandId } from "../content/portfolio"
import FilterPill from "../ui/controls/FilterPill"
import ShopCard from "../ui/cards/ShopCard"

export default function BuyTab({
  band: shopBand,
  onBandChange,
  onOpenPortfolio,
  onOpenProduct,
}: {
  band: ShopGroupId | "all"
  onBandChange: (band: ShopGroupId | "all") => void
  onOpenPortfolio: (band: BandId) => void
  onOpenProduct: (item: ShopItem) => void
}) {
  return (
    <>
      {/* Says who made the goods, which is the studio's whole claim:
          the prints, apparel, stickers, patches and pins are its own
          work, not stock it resells. This is the visible counterpart
          of Product.manufacturer -> #studio in the index.html graph,
          so keep the two in step -- and note it is a claim about
          making, so it must not sit over anything label-pressed. */}
      <p className="mono-label pb-1 text-muted-foreground">
        Made in-house at{" "}
        <span className="text-accent-strong">Tibbie X Studio</span>
      </p>

      {/* Filter strip -- also the way back out of a band the portfolio
          dropped the visitor into. */}
      <div className="surface hide-scrollbar flex gap-2 overflow-x-auto rounded-lg bg-card/50 p-1.5">
        <FilterPill
          label="All"
          active={shopBand === "all"}
          onClick={() => onBandChange("all")}
        />
        {SHOP_GROUPS.map((group) => (
          <FilterPill
            key={group.id}
            label={group.title}
            active={shopBand === group.id}
            onClick={() => onBandChange(group.id)}
          />
        ))}
      </div>

      {SHOP_GROUPS.filter(
        (group) => shopBand === "all" || shopBand === group.id,
      ).map((group) => {
        /* Pulled out of the JSX so the "general" check narrows for the
           click handler too -- TS drops narrowing on a callback param
           once it is captured in a closure. */
        const band = group.id === "general" ? null : group.id

        return (
          <section key={group.id} className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 pt-2">
              <h2 className="text-xl uppercase leading-none tracking-tight">
                {group.title}
              </h2>
              {/* The return leg of the portfolio link. "general" has no
                  section to go back to, so it gets a count instead. */}
              {band === null ? (
                <span className="mono-label text-muted-foreground">
                  {group.items.length} items
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenPortfolio(band)}
                  className="mono-label flex items-center gap-1 text-muted-foreground transition-colors hover:text-accent-strong"
                >
                  View credits <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {group.items.map((item) => (
                <ShopCard
                  key={item.id}
                  item={item}
                  onOpen={() => onOpenProduct(item)}
                />
              ))}
            </div>
          </section>
        )
      })}
    </>
  )
}
