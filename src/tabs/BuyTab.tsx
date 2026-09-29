import { ChevronRight } from "lucide-react"

import { ART, SHOP_GROUPS, SHOP_SHELVES } from "../content/shop"
import type { ShopItem, ShopShelf } from "../content/shop"
import type { BandId } from "../content/portfolio"
import FilterPill from "../ui/controls/FilterPill"
import ShopCard from "../ui/cards/ShopCard"

export default function BuyTab({
  shelf,
  onShelfChange,
  band: shopBand,
  onBandChange,
  onOpenPortfolio,
  onOpenProduct,
}: {
  shelf: ShopShelf
  onShelfChange: (shelf: ShopShelf) => void
  band: BandId
  onBandChange: (band: BandId) => void
  onOpenPortfolio?: (band: BandId) => void
  onOpenProduct: (item: ShopItem) => void
}) {
  /* A band with nothing for sale has no pill, so a hand-off to one falls back
     to the first band rather than an empty shelf. */
  const shown =
    SHOP_GROUPS.find((group) => group.id === shopBand) ?? SHOP_GROUPS[0]

  return (
    <>
      {/* Says who made the goods, which is the studio's whole claim:
          the prints, apparel, stickers, patches and pins are its own
          work, not stock it resells. This is the visible counterpart
          of Product.manufacturer -> #studio in the index.html graph,
          so keep the two in step -- and note it is a claim about
          making, so it must not sit over anything label-pressed. */}
      <p className="label-mono text-muted-foreground">
        Made in-house at <span className="text-accent">Tibbie X Studio</span>
      </p>

      {/* First filter: which shelf. */}
      <div className="surface hide-scrollbar flex gap-cluster overflow-x-auto rounded-lg bg-card/50 p-strip">
        {SHOP_SHELVES.map((entry) => (
          <FilterPill
            key={entry.id}
            label={entry.title}
            active={shelf === entry.id}
            onClick={() => onShelfChange(entry.id)}
          />
        ))}
      </div>

      {shelf === "art" && <ShopGrid items={ART} onOpen={onOpenProduct} />}

      {/* Second filter, Bands only -- also the way back out of a band the
          portfolio dropped the visitor into. */}
      {shelf === "bands" && (
        <>
          <div className="surface hide-scrollbar flex gap-cluster overflow-x-auto rounded-lg bg-card/50 p-strip">
            {SHOP_GROUPS.map((group) => (
              <FilterPill
                key={group.id}
                label={group.title}
                active={shown.id === group.id}
                onClick={() => onBandChange(group.id)}
              />
            ))}
          </div>

          <section className="space-y-stack">
            <div className="flex flex-col items-start gap-1 pt-2">
              <h2 className="heading-xl">{shown.title}</h2>
              {/* The return leg of the portfolio link. Nothing to go back to
                  while the Portfolio tab is off, so it gets a count instead. */}
              {onOpenPortfolio ? (
                <button
                  type="button"
                  onClick={() => onOpenPortfolio(shown.id)}
                  className="label-mono flex items-center gap-1 text-muted-foreground transition-colors hover:text-accent"
                >
                  View credits <ChevronRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <span className="label-mono text-muted-foreground">
                  {shown.items.length} items
                </span>
              )}
            </div>

            <ShopGrid items={shown.items} onOpen={onOpenProduct} />
          </section>
        </>
      )}
    </>
  )
}

function ShopGrid({
  items,
  onOpen,
}: {
  items: ShopItem[]
  onOpen: (item: ShopItem) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-stack sm:grid-cols-2">
      {items.map((item) => (
        <ShopCard key={item.id} item={item} onOpen={() => onOpen(item)} />
      ))}
    </div>
  )
}
