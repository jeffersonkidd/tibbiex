import { PORTFOLIO } from "./portfolio"
import type { BandId } from "./portfolio"
import type { Mail } from "./payments"
import { MEDIA_URL } from "./site"

export type Size = { label: string; soldOut?: true }

/* One thing a buyer picks and pays for. A plain item is its own single
   format; a piece of art sold several ways (sticker, patch, tee) lists one
   per way, each with its own price, sizes and spec. */
export type ShopFormat = {
  id: string
  label: string
  /* Whole dollars, before shipping. Formatted where it is shown, and sent
     as-is to checkout. */
  price: number
  /* Offered sizes, in order. A sold-out size stays listed, struck through. */
  sizes?: Size[]
  /* What is in the box, label then detail. */
  includes?: { label: string; detail: string }[]
  /* Which shipping rate it takes -- see SHIPPING. A parcel unless it says. */
  mail?: Mail
}

type ShopItemBase = {
  id: string
  item: string
  image: string
  /* What the picture shows, when that is more than the item's name. */
  alt?: string
  /* A line or two under the price in the product modal. */
  blurb?: string
  /* Whose shelf it sits on under Bands. An art piece may name a band whose
     mark is on it, or none. */
  band?: BandId
  /* Everything below is optional detail for the product modal. An item
     without it still opens, and shows what it has. */
  /* Extra angles, shown as thumbnails under the main image. */
  gallery?: string[]
  /* The gallery photo to show when a format is picked, by format id. The
     formats are shared between designs, so the pairing lives on the item.
     Each photo must also be in the gallery. */
  formatPhotos?: Record<string, string>
  /* A numbered or limited run. */
  stock?: { left: number; of: number }
  ships?: string
  /* Stock art or a provisional price -- see the content-status note. */
  staged?: true
}

/* An item is either one thing, priced on itself, or a list of formats --
   never both, so a price only ever lives in one place. Read either shape
   through formatsOf() and lowestPrice() rather than branching on it. */
export type ShopItem = ShopItemBase &
  (
    | (Omit<ShopFormat, "id" | "label"> & { formats?: never })
    | { formats: ShopFormat[]; price?: never; sizes?: never }
  )

/* Every item as a list of formats: its own, or one standing in for the item
   itself. */
export function formatsOf(item: ShopItem): ShopFormat[] {
  if (item.formats) return item.formats
  const { id, item: label, price, sizes, includes, mail } = item
  return [{ id, label, price, sizes, includes, mail }]
}

export function lowestPrice(item: ShopItem) {
  return Math.min(...formatsOf(item).map((format) => format.price))
}

export const formatPrice = (price: number) => `$${price}`

const MENS_SIZES: Size[] = ["S", "M", "L", "XL", "2XL", "3XL"].map((label) => ({
  label,
}))
const WOMENS_SIZES: Size[] = ["XS", "S", "M", "L", "XL", "2XL"].map(
  (label) => ({ label }),
)

/* The four ways the studio prints a design, from the client's brief, all plus
   shipping. The men's tee is on a Gildan blank; the women's is the soft one
   with cap sleeves (not ribbed). Both tees are $35 -- the brief only priced
   the women's outright, so confirm the men's matches -- and the patch size
   came with a question mark ("5x7?"), so confirm that too.

   index.html restates every design's offers in its JSON-LD for crawlers, so
   a price or format change here is a hand-edit there as well. */
const STANDARD_FORMATS: ShopFormat[] = [
  {
    id: "sticker",
    label: "Sticker",
    price: 5,
    mail: "letter",
    includes: [
      { label: "Size", detail: "4 × 6 in" },
      { label: "Art", detail: "Full color" },
    ],
  },
  {
    id: "patch",
    label: "Patch",
    price: 10,
    mail: "flat",
    includes: [
      { label: "Size", detail: "5 × 7 in" },
      { label: "Art", detail: "Full color" },
    ],
  },
  {
    id: "tee",
    label: "Men’s tee",
    price: 35,
    sizes: MENS_SIZES,
    includes: [
      { label: "Blank", detail: "Gildan" },
      { label: "Cut", detail: "Men’s, classic fit" },
    ],
  },
  {
    id: "tee-womens",
    label: "Women’s tee",
    price: 35,
    sizes: WOMENS_SIZES,
    includes: [
      { label: "Blank", detail: "The soft one" },
      { label: "Cut", detail: "Women’s, cap sleeves" },
    ],
  },
]

/* The Next Generation's mockup for each of the standard formats, by id. */
const TNG_PHOTOS = {
  sticker: `${MEDIA_URL}/shop/bands/reagan-youth/the-next-generation/sticker-peel.cc9654f7.jpg`,
  patch: `${MEDIA_URL}/shop/bands/reagan-youth/the-next-generation/patch-angled.d131eae9.jpg`,
  tee: `${MEDIA_URL}/shop/bands/reagan-youth/the-next-generation/mens-tee.40c66256.jpg`,
  "tee-womens": `${MEDIA_URL}/shop/bands/reagan-youth/the-next-generation/womens-tee.d1c5399c.jpg`,
}

/* Reagan Youth's first real piece, in the standard formats. */
export const THE_NEXT_GENERATION: ShopItem = {
  id: "ry-the-next-generation",
  item: "The Next Generation",
  image: `${MEDIA_URL}/shop/bands/reagan-youth/the-next-generation/artwork.a873ae5c.jpg`,
  alt: "“Reagan Youth” in white blackletter over a guinea pig with an earring, a stitched scar and one fang, peeking over a ledge, above “The Next Generation” in gold, on dark brown.",
  blurb:
    "A pierced, scarred, fanged guinea pig peeks in under the Reagan Youth blackletter: the next generation. In four formats.",
  band: "reagan-youth",
  gallery: [
    `${MEDIA_URL}/shop/bands/reagan-youth/the-next-generation/artwork.a873ae5c.jpg`,
    TNG_PHOTOS["tee-womens"],
    TNG_PHOTOS.tee,
    TNG_PHOTOS.patch,
    TNG_PHOTOS.sticker,
  ],
  formatPhotos: TNG_PHOTOS,
  formats: STANDARD_FORMATS,
}

const FRANK_ARTWORK = `${MEDIA_URL}/shop/bands/leftover-crack/leftover-frank/artwork.294ced90.jpg`

/* Leftover Frank's mockup for each of the standard formats, by id. */
const FRANK_PHOTOS = {
  sticker: `${MEDIA_URL}/shop/bands/leftover-crack/leftover-frank/sticker-flat.6356155a.jpg`,
  patch: `${MEDIA_URL}/shop/bands/leftover-crack/leftover-frank/patch-angled.dd656839.jpg`,
  tee: `${MEDIA_URL}/shop/bands/leftover-crack/leftover-frank/mens-tee.1b32d64d.jpg`,
  "tee-womens": `${MEDIA_URL}/shop/bands/leftover-crack/leftover-frank/womens-tee.4d0c3a32.jpg`,
}

/* Leftover Crack's first real piece, in the standard formats: Frank is
   Tibbie X's cat, who lives at C-Squat and kills pigeons. */
export const LEFTOVER_FRANK: ShopItem = {
  id: "lc-leftover-frank",
  item: "Leftover Frank",
  image: FRANK_ARTWORK,
  alt: "“Leftover Frank” in white blackletter over a tabby in a spiked collar and a bone-shaped “Frank” tag, pinning a pigeon in a police cap on a rooftop with a water tower and the Empire State Building behind, above “Bird Laws Get Claws” between two pentagrams, in black-and-white woodcut.",
  blurb:
    "Frank lives at C-Squat and runs the roof. The pigeons made the mistake of deputizing. Bird laws get claws. In four formats.",
  band: "leftover-crack",
  gallery: [
    FRANK_ARTWORK,
    FRANK_PHOTOS["tee-womens"],
    FRANK_PHOTOS.tee,
    FRANK_PHOTOS.patch,
    FRANK_PHOTOS.sticker,
  ],
  formatPhotos: FRANK_PHOTOS,
  formats: STANDARD_FORMATS,
}

/* The Home tab's featured offer. Named so the link row can open it without
   re-finding it in the list. The pairing, price, run size and stock count are
   improvised, so it is off the Reagan Youth shelf and its link row is
   disabled; it stays defined for the row to come back to. */
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
  ships: "Ships in 5 days",
}

/* The Bands shelf. The placeholders are gone, so a band with no real piece
   yet drops out of the strip. */
export const BUY: ShopItem[] = [THE_NEXT_GENERATION, LEFTOVER_FRANK]

const VAMPIRE_CATS_ARTWORK = `${MEDIA_URL}/shop/art/vampire-cats/artwork.76622c0e.jpg`

/* Vampire Cats' mockup for each of the standard formats, by id. */
const VAMPIRE_CATS_PHOTOS = {
  sticker: `${MEDIA_URL}/shop/art/vampire-cats/sticker-flat.0fd3d3aa.jpg`,
  patch: `${MEDIA_URL}/shop/art/vampire-cats/patch-angled.6c7a1a14.jpg`,
  tee: `${MEDIA_URL}/shop/art/vampire-cats/mens-tee.895e322c.jpg`,
  "tee-womens": `${MEDIA_URL}/shop/art/vampire-cats/womens-tee.08516bec.jpg`,
}

/* The first real piece on the shelf: the client's own art, in the standard
   formats. Too detailed to shrink to a pin, so there deliberately is no pin.
   The photos are on the media bucket under their own hashes (see MEDIA_URL). */
export const VAMPIRE_CATS: ShopItem = {
  id: "a-vampire-cats",
  item: "Vampire Cats",
  image: VAMPIRE_CATS_ARTWORK,
  alt: "Two red cats in spiked collars, fangs out, batting balls of yarn through teal waves and falling shards of red glass. Signed Tibbie X.",
  blurb:
    "Two vampire cats in spiked collars, loose in a sea of red glass. Original art by Tibbie X, in four formats.",
  gallery: [
    VAMPIRE_CATS_ARTWORK,
    VAMPIRE_CATS_PHOTOS["tee-womens"],
    VAMPIRE_CATS_PHOTOS.tee,
    VAMPIRE_CATS_PHOTOS.patch,
    VAMPIRE_CATS_PHOTOS.sticker,
  ],
  formatPhotos: VAMPIRE_CATS_PHOTOS,
  formats: STANDARD_FORMATS,
}

/* The Art shelf: the studio's own work, and anything not tied to one band. It
   is not spread into BUY, so nothing here reaches SHOP_BY_BAND or a portfolio
   section's shop link -- `band`, where set, only says whose mark is on it. */
export const ART: ShopItem[] = [VAMPIRE_CATS]

/* The Buy tab's first filter. Bands narrows again by band (SHOP_GROUPS);
   Art is one flat shelf with no second strip. */
export type ShopShelf = "bands" | "art"

export const SHOP_SHELVES: { id: ShopShelf; title: string }[] = [
  { id: "bands", title: "Bands" },
  { id: "art", title: "Art" },
]

/* Portfolio -> Buy wiring. The groups are derived from the two arrays above
   rather than maintained by hand, so adding a band or a product needs no edit
   here. `SHOP_BY_BAND` keeps the catalogue order within each group. */
export const SHOP_BY_BAND = BUY.reduce(
  (groups, item) => {
    if (item.band) (groups[item.band] ??= []).push(item)
    return groups
  },
  {} as Record<BandId, ShopItem[] | undefined>,
)

export function shopFor(band: BandId) {
  return SHOP_BY_BAND[band] ?? []
}

/* The band strip under Bands, in portfolio order. Bands with nothing for sale
   drop out. */
export const SHOP_GROUPS: {
  id: BandId
  title: string
  items: ShopItem[]
}[] = PORTFOLIO.map((entry) => ({
  id: entry.id,
  title: entry.band,
  items: shopFor(entry.id),
})).filter((group) => group.items.length > 0)
