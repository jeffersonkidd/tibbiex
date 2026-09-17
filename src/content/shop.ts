import { markStaged } from "./staged"
import { PORTFOLIO } from "./portfolio"
import type { BandId } from "./portfolio"

export type ShopItem = {
  id: string
  item: string
  /* Whole dollars. Formatted where it is shown, and sent as-is to checkout. */
  price: number
  image: string
  band: BandId | "general"
  /* Everything below is optional detail for the product modal. An item
     without it still opens, and shows what it has. */
  /* Extra angles, shown as thumbnails under the main image. */
  gallery?: string[]
  /* A numbered or limited run. */
  stock?: { left: number; of: number }
  /* Offered sizes, in order. A sold-out size stays listed, struck through. */
  sizes?: { label: string; soldOut?: true }[]
  /* What is in the box, label then detail. */
  includes?: { label: string; detail: string }[]
  ships?: string
  /* Stock art or a provisional price -- see the content-status note. */
  staged?: true
}

export const formatPrice = (price: number) => `$${price}`

// Placeholder catalogue — stock photography and provisional prices. Confirm
// the items, prices and artwork before this goes live. The whole set is
// stand-in, so markStaged flags every item at once.
/* The Home tab's featured offer. Named so the link row can open it without
   re-finding it in the list. The pairing, price, run size and stock count are
   improvised -- confirm all of it before this goes live. */
export const YOUTH_ANTHEMS_BUNDLE: ShopItem = {
  id: "m0",
  item: "Youth Anthems bundle",
  price: 50,
  image:
    "https://images.unsplash.com/photo-1526394931762-90052e97b376?q=80&w=800&auto=format&fit=crop",
  gallery: [
    "https://images.unsplash.com/photo-1526394931762-90052e97b376?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1538356111053-748a48e1acb8?q=80&w=800&auto=format&fit=crop",
  ],
  band: "reagan-youth",
  stock: { left: 12, of: 20 },
  sizes: [
    { label: "S" },
    { label: "M" },
    { label: "L" },
    { label: "XL", soldOut: true },
  ],
  includes: [
    { label: "Reissue LP", detail: "180g, gatefold" },
    { label: "Logo tee", detail: "Screen printed" },
    { label: "Numbered", detail: "Hand marked, 1–20" },
  ],
  ships: "Ships in 5 days · US and international",
}

export const BUY: ShopItem[] = markStaged([
  YOUTH_ANTHEMS_BUNDLE,
  {
    id: "m1",
    item: "Logo Patch",
    price: 5,
    image:
      "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?q=80&w=400&auto=format&fit=crop",
    band: "general",
  },
  {
    id: "m2",
    item: "Constructs of the State — Vinyl",
    price: 25,
    image:
      "https://images.unsplash.com/photo-1538356111053-748a48e1acb8?q=80&w=400&auto=format&fit=crop",
    band: "leftover-crack",
  },
  {
    id: "m3",
    item: "Signature Bass Pick (3-pack)",
    price: 10,
    image:
      "https://images.unsplash.com/photo-1519508234239-44619d854291?q=80&w=400&auto=format&fit=crop",
    band: "general",
  },
  {
    id: "m4",
    item: "Tour Tee — No Gods",
    price: 28,
    image:
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=400&auto=format&fit=crop",
    band: "leftover-crack",
  },
  {
    id: "m5",
    item: "Youth Anthems — Reissue LP",
    price: 30,
    image:
      "https://images.unsplash.com/photo-1526394931762-90052e97b376?q=80&w=400&auto=format&fit=crop",
    band: "reagan-youth",
  },
  {
    id: "m6",
    item: "Reagan Youth Logo Tee",
    price: 26,
    image:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=400&auto=format&fit=crop",
    band: "reagan-youth",
  },
  {
    id: "m7",
    item: "Gash Demo — Cassette",
    price: 8,
    image:
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=400&auto=format&fit=crop",
    band: "gash",
  },
  {
    id: "m8",
    item: 'Gash / Sputter — Split 7"',
    price: 12,
    image:
      "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=400&auto=format&fit=crop",
    band: "gash",
  },
])

/* Portfolio -> Buy wiring. The groups are derived from the two arrays above
   rather than maintained by hand, so adding a band or a product needs no edit
   here. `SHOP_BY_BAND` keeps the catalogue order within each group, and
   "general" is rendered last as the everything-else shelf. */
export const SHOP_BY_BAND = BUY.reduce(
  (groups, item) => {
    ;(groups[item.band] ??= []).push(item)
    return groups
  },
  {} as Record<ShopGroupId, ShopItem[] | undefined>,
)

export function shopFor(band: BandId) {
  return SHOP_BY_BAND[band] ?? []
}

/* Group order for the Buy tab: the bands in portfolio order, then the
   unaffiliated items. Groups with nothing in them drop out. */
export type ShopGroupId = BandId | "general"

export const SHOP_GROUPS: {
  id: ShopGroupId
  title: string
  items: ShopItem[]
}[] = [
  ...PORTFOLIO.map((entry) => ({
    id: entry.id,
    title: entry.band,
    items: shopFor(entry.id),
  })),
  {
    id: "general" as const,
    title: "Everything Else",
    items: SHOP_BY_BAND.general ?? [],
  },
].filter((group) => group.items.length > 0)
