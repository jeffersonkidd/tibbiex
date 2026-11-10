import { useState } from "react"

import {
  BAND_TILES,
  COLLECTION_BANNERS,
  FORMAT_TAGS,
  SHOP_SHELVES,
  formatsOf,
} from "../content/shop"
import type { ShopItem, ShopShelf } from "../content/shop"
import { SERVICES } from "../content/offerings"
import type { Service } from "../content/offerings"
import { useShop } from "../lib/shop"
import Breadcrumbs from "../ui/controls/Breadcrumbs"
import FilterPill from "../ui/controls/FilterPill"
import ShelfTile from "../ui/cards/ShelfTile"
import ShopCard from "../ui/cards/ShopCard"

/* The Buy tab. Its first screen is a 3:1 banner per shelf (SHOP_SHELVES),
   and nothing for sale until one is picked. From there, breadcrumbs under
   the tab strip say where the visitor is and step back -- Buy > Bands >
   Leftover Crack -- and under them:

     Bands            each band's banner; a picked band shows its banner,
                      a strip of Collections and the kinds of item it sells,
                      and under that a banner over square photos of the
                      real products
     everything else  a strip of what the shelf holds (a tab per session,
                      per Art collection, or per band and Art for a kind of
                      item), then what is picked */
export default function BuyTab({
  shelf,
  pick,
  onShelfChange,
  onPickChange,
  onOpenProduct,
  onOpenService,
}: {
  shelf: ShopShelf | null
  pick: string | null
  onShelfChange: (shelf: ShopShelf | null) => void
  onPickChange: (pick: string | null) => void
  onOpenProduct: (item: ShopItem, format?: string) => void
  onOpenService: (service: Service) => void
}) {
  const shop = useShop()
  /* What a picked band shows: Collections, or one kind of item by its
     FORMAT_TAGS label. Every band starts on Collections. */
  const [view, setView] = useState("Collections")
  function openBand(band: string | null) {
    setView("Collections")
    onPickChange(band)
  }

  /* What each shelf's strip holds: an id and a title per tab. */
  const kindOf = (id: ShopShelf) => FORMAT_TAGS.find((tag) => tag.shelf === id)
  const sources = [
    ...shop.groups.map((group) => ({
      id: group.id as string,
      title: group.title,
      items: group.items,
    })),
    ...(shop.art.length ? [{ id: "art", title: "Art", items: shop.art }] : []),
  ]
  function tabsOf(id: ShopShelf): { id: string; title: string }[] {
    if (id === "sessions")
      return SERVICES.map((service) => ({
        id: service.id,
        title: service.short,
      }))
    if (id === "bands") return shop.groups
    if (id === "art")
      return shop.art.map((item) => ({ id: item.id, title: item.item }))
    const kind = kindOf(id)
    return sources.filter((source) =>
      source.items.some((item) =>
        formatsOf(item).some((format) => kind?.ids.includes(format.id)),
      ),
    )
  }

  /* A shelf with nothing on it is left off. */
  const shelves = SHOP_SHELVES.filter((entry) => tabsOf(entry.id).length > 0)
  const current = shelves.find((entry) => entry.id === shelf)

  if (!current) {
    return shelves.length ? (
      <div className="flex flex-col gap-stack">
        {shelves.map((entry) => (
          <ShelfTile
            key={entry.id}
            image={entry.banner}
            label={entry.title}
            width={600}
            height={200}
            onOpen={() => onShelfChange(entry.id)}
          />
        ))}
      </div>
    ) : (
      <p className="surface body-small rounded-lg p-panel text-center text-on-surface-variant">
        The shelves are empty right now. New pieces are on the way.
      </p>
    )
  }

  /* The first two crumbs every shelf shares: back to the first screen, and
     the shelf itself, which steps back out of a picked band. */
  const toBuy = { label: "Buy", onOpen: () => onShelfChange(null) }

  /* Says who made the goods, which is the studio's whole claim: the
     prints, apparel, stickers, patches and pins are its own work, not stock
     it resells. This is the visible counterpart of Product.manufacturer ->
     #studio in the index.html graph, so keep the two in step -- and note it
     is a claim about making, so it must not sit over anything
     label-pressed, nor over Sessions, which are her time. */
  const madeInHouse = (
    <p className="label-mono text-on-surface-variant">
      Made in-house at <span className="text-tertiary">Tibbie X Studio</span>
    </p>
  )

  if (current.id === "bands") {
    const band = shop.groups.find((group) => group.id === pick)

    /* Buy > Bands: a banner per band, and nothing else until one is
       tapped. A band with no drawing gets a plain button with its name. */
    if (!band) {
      return (
        <>
          <Breadcrumbs trail={[toBuy, { label: current.title }]} />
          <div className="flex flex-col gap-stack">
            {shop.groups.map((group) => {
              const image = BAND_TILES[group.id]
              return image ? (
                <ShelfTile
                  key={group.id}
                  image={image}
                  label={group.title}
                  width={600}
                  height={200}
                  onOpen={() => openBand(group.id)}
                />
              ) : (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => openBand(group.id)}
                  className="surface heading-l rounded-lg p-panel text-left transition-colors hover:border-tertiary"
                >
                  {group.title}
                </button>
              )
            })}
          </div>
        </>
      )
    }

    /* Buy > Bands > the band: its banner, as a header, then Collections
       and each kind of item the band sells. A kind shows its own banner
       from the first screen over the products. */
    const kinds = FORMAT_TAGS.filter((tag) =>
      band.items.some((item) =>
        formatsOf(item).some((format) => tag.ids.includes(format.id)),
      ),
    )
    const bandKind = kinds.find((tag) => tag.label === view)
    const bandBanner = BAND_TILES[band.id]
    const kindBanner = SHOP_SHELVES.find(
      (entry) => bandKind && entry.id === bandKind.shelf,
    )

    return (
      <>
        <Breadcrumbs
          trail={[
            toBuy,
            { label: current.title, onOpen: () => openBand(null) },
            { label: band.title },
          ]}
        />
        {bandBanner && <Banner image={bandBanner} label={band.title} />}
        <div className="surface hide-scrollbar flex gap-cluster overflow-x-auto rounded-lg bg-surface-container-low/50 p-strip">
          {["Collections", ...kinds.map((tag) => tag.label)].map((label) => (
            <FilterPill
              key={label}
              label={label}
              active={(bandKind?.label ?? "Collections") === label}
              onClick={() => setView(label)}
            />
          ))}
        </div>
        {madeInHouse}
        {bandKind ? (
          <>
            {kindBanner && (
              <Banner image={kindBanner.banner} label={kindBanner.title} />
            )}
            <KindCards
              items={band.items}
              ids={bandKind.ids}
              onOpen={onOpenProduct}
            />
          </>
        ) : (
          <ShopGrid items={band.items} onOpen={onOpenProduct} />
        )}
      </>
    )
  }

  const tabs = tabsOf(current.id)
  const tab = tabs.find((entry) => entry.id === pick) ?? tabs[0]
  const kind = kindOf(current.id)

  return (
    <>
      <Breadcrumbs trail={[toBuy, { label: current.title }]} />

      <div className="surface hide-scrollbar flex gap-cluster overflow-x-auto rounded-lg bg-surface-container-low/50 p-strip">
        {tabs.map((entry) => (
          <FilterPill
            key={entry.id}
            label={entry.title}
            active={tab.id === entry.id}
            onClick={() => onPickChange(entry.id)}
          />
        ))}
      </div>

      {current.id !== "sessions" && madeInHouse}

      {current.id === "sessions" &&
        SERVICES.filter((service) => service.id === tab.id).map((service) => (
          <ShelfTile
            key={service.id}
            image={service.banner}
            label={service.title}
            width={600}
            height={200}
            onOpen={() => onOpenService(service)}
          />
        ))}

      {current.id === "art" && (
        <ShopGrid
          items={shop.art.filter((item) => item.id === tab.id)}
          onOpen={onOpenProduct}
        />
      )}

      {/* A kind of item: every format of that kind from the picked band
          (or Art), a card each, men's and women's tees apart. */}
      {kind && (
        <KindCards
          items={sources.find((source) => source.id === tab.id)?.items ?? []}
          ids={kind.ids}
          onOpen={onOpenProduct}
        />
      )}
    </>
  )
}

/* A 3:1 banner shown as a header rather than a button: where the visitor
   already is, which the breadcrumbs above it step back from. */
function Banner({ image, label }: { image: string; label: string }) {
  return (
    <img
      src={image}
      alt={label}
      width={600}
      height={200}
      decoding="async"
      className="h-auto w-full rounded-lg border border-outline-variant shadow-[0_14px_24px_-12px_var(--color-shadow)]"
    />
  )
}

/* Every format of one kind across some items, a card each with that
   format's own mockup and price -- men's and women's tees apart -- each
   opening the product on that format. Within an item they come in the
   order of `ids`. */
function KindCards({
  items,
  ids,
  onOpen,
}: {
  items: ShopItem[]
  ids: string[]
  onOpen: (item: ShopItem, format?: string) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-stack">
      {items.flatMap((item) =>
        formatsOf(item)
          .filter((format) => ids.includes(format.id))
          .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
          .map((format) => (
            <ShopCard
              key={`${item.id}-${format.id}`}
              item={item}
              format={format}
              onOpen={() => onOpen(item, format.id)}
            />
          )),
      )}
    </div>
  )
}

/* A shelf's collections. One with a banner gets its own block: the 3:1
   poster strip full width, and under it a square photo of the real product
   for each format it comes in, two up, each opening the product on that
   format. Anything without a banner -- a new design from the studio --
   falls into an ordinary two-up grid of cards after them. */
function ShopGrid({
  items,
  onOpen,
}: {
  items: ShopItem[]
  onOpen: (item: ShopItem, format?: string) => void
}) {
  const bannered = items.filter((item) => COLLECTION_BANNERS[item.id])
  const rest = items.filter((item) => !COLLECTION_BANNERS[item.id])

  return (
    <div className="flex flex-col gap-stack">
      {bannered.map((item) => (
        <div key={item.id} className="flex flex-col gap-stack">
          <ShelfTile
            image={COLLECTION_BANNERS[item.id]}
            label={item.item}
            width={600}
            height={200}
            onOpen={() => onOpen(item)}
          />
          {/* Tees, patches, stickers, music -- the strip's order -- then
              any format none of those covers. */}
          <KindCards
            items={[item]}
            ids={[
              ...FORMAT_TAGS.flatMap((tag) => tag.ids),
              ...formatsOf(item)
                .map((format) => format.id)
                .filter(
                  (id) => !FORMAT_TAGS.some((tag) => tag.ids.includes(id)),
                ),
            ]}
            onOpen={onOpen}
          />
        </div>
      ))}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 gap-stack sm:grid-cols-2">
          {rest.map((item) => (
            <ShopCard key={item.id} item={item} onOpen={() => onOpen(item)} />
          ))}
        </div>
      )}
    </div>
  )
}
