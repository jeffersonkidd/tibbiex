import type { Mail } from "../content/payments"
import { formatsOf, shelfOf } from "../content/shop"
import type { ShopFormat, ShopItem } from "../content/shop"

/* The catalogue as it travels: what the studio publishes to api/products.ts,
   what that endpoint stores and serves, and what api/checkout.ts prices an
   order from. It is ShopItem flattened to one regular shape -- every item a
   list of formats, every format naming its own photo, the shelf spelled out
   -- because a shape with two ways to say one thing is a shape an editor can
   get wrong.

   api/products.ts keeps a copy of these types and the validation that
   enforces them (the functions cannot import from src/): change both. */
export type CatalogFormat = {
  id: string
  label: string
  /* Whole dollars, before shipping, 1 to 1000. */
  price: number
  mail: Mail
  sizes?: { label: string; soldOut?: true }[]
  includes?: { label: string; detail: string }[]
  /* The gallery photo to turn to when this format is picked. */
  photo?: string
}

export type CatalogItem = {
  id: string
  item: string
  shelf: "bands" | "art"
  band?: string
  /* Always the first of `gallery`: the cover. */
  image: string
  alt?: string
  blurb?: string
  aspect?: "square" | "portrait" | "landscape"
  gallery: string[]
  formats: CatalogFormat[]
  stock?: { left: number; of: number }
  ships?: string
  hidden?: true
}

/* What GET /api/products answers with. `version` names the published file,
   and is what a save hands back to say which catalogue it edited. */
export type PublishedCatalog = {
  version: string | null
  publishedAt?: string
  items: CatalogItem[]
}

export function toCatalogItem(item: ShopItem): CatalogItem {
  const gallery = [
    item.image,
    ...(item.gallery ?? []).filter((src) => src !== item.image),
  ]
  const formats: CatalogFormat[] = formatsOf(item).map((format) => {
    const photo = item.formatPhotos?.[format.id]
    return {
      id: format.id,
      label: format.label,
      price: format.price,
      mail: format.mail ?? "parcel",
      ...(format.sizes?.length && { sizes: format.sizes }),
      ...(format.includes?.length && { includes: format.includes }),
      ...(photo && gallery.includes(photo) && { photo }),
    }
  })
  return {
    id: item.id,
    item: item.item,
    shelf: shelfOf(item),
    ...(item.band && { band: item.band }),
    image: gallery[0],
    ...(item.alt && { alt: item.alt }),
    ...(item.blurb && { blurb: item.blurb }),
    ...(item.aspect && { aspect: item.aspect }),
    gallery,
    formats,
    ...(item.stock && { stock: item.stock }),
    ...(item.ships && { ships: item.ships }),
    ...(item.hidden && { hidden: true as const }),
  }
}

export function toShopItem(entry: CatalogItem): ShopItem {
  const formats: ShopFormat[] = entry.formats.map(
    ({ photo: _photo, ...format }) => format,
  )
  const formatPhotos = Object.fromEntries(
    entry.formats.flatMap((format) =>
      format.photo ? [[format.id, format.photo]] : [],
    ),
  )
  return {
    id: entry.id,
    item: entry.item,
    shelf: entry.shelf,
    /* Unknown ids are carried as-is and simply match no portfolio band, so
       the item drops off the Bands strip rather than breaking it. */
    band: entry.band as ShopItem["band"],
    image: entry.gallery[0] ?? entry.image,
    alt: entry.alt,
    blurb: entry.blurb,
    aspect: entry.aspect,
    gallery: entry.gallery,
    formatPhotos,
    formats,
    stock: entry.stock,
    ships: entry.ships,
    hidden: entry.hidden,
  }
}
