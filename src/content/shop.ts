import gashTile from "../assets/illustrations/shop/bands/gash.svg"
import leftoverCrackTile from "../assets/illustrations/shop/bands/leftover-crack.svg"
import reaganYouthTile from "../assets/illustrations/shop/bands/reagan-youth.svg"
import musicTag from "../assets/illustrations/shop/formats/music.svg"
import patchesTag from "../assets/illustrations/shop/formats/patches.svg"
import stickersTag from "../assets/illustrations/shop/formats/stickers.svg"
import teesTag from "../assets/illustrations/shop/formats/tees.svg"
import vampireCatsBanner from "../assets/illustrations/shop/collections/a-vampire-cats.svg"
import onALeashBanner from "../assets/illustrations/shop/collections/gash-on-a-leash.svg"
import leftoverFrankBanner from "../assets/illustrations/shop/collections/lc-leftover-frank.svg"
import nextGenerationBanner from "../assets/illustrations/shop/collections/ry-the-next-generation.svg"
import artBanner from "../assets/illustrations/shop/shelves/art.svg"
import bandsBanner from "../assets/illustrations/shop/shelves/bands.svg"
import patchesBanner from "../assets/illustrations/shop/shelves/patches.svg"
import sessionsBanner from "../assets/illustrations/shop/shelves/sessions.svg"
import stickersBanner from "../assets/illustrations/shop/shelves/stickers.svg"
import teesBanner from "../assets/illustrations/shop/shelves/tees.svg"
import { PORTFOLIO } from "./portfolio"
import type { BandId } from "./portfolio"
import type { Mail } from "./payments"
import { MEDIA_URL } from "./site"
import { categoryOf, tagsOf } from "./taxonomy"
import type { Fit, ProductCategory, Tag } from "./taxonomy"

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
  /* Which leaf of the category tree it sits on (content/taxonomy.ts). The
     standard ids fall back to theirs, so only a new kind of format must
     say -- read it through categoryOf(), not directly. */
  category?: ProductCategory
  /* A tee's cut. Read through fitOf(). */
  fit?: Fit
}

type ShopItemBase = {
  id: string
  item: string
  image: string
  /* What the picture shows, when that is more than the item's name. */
  alt?: string
  /* The shape of the photo on its shop card. Without it the card crops the
     photo to a fixed-height strip. */
  aspect?: "square" | "portrait" | "landscape"
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
  /* Which shelf of the Buy tab it sits on. Without it, an item that names a
     band is on Bands and anything else is on Art. */
  shelf?: "bands" | "art"
  /* Kept in the catalogue but off the site: a draft, or a run that is over
     and may come back. Set from the studio. */
  hidden?: true
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
  const { id, item: label, price, sizes, includes, mail, category, fit } = item
  return [{ id, label, price, sizes, includes, mail, category, fit }]
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

   The studio offers these four as the presets for a new product.

   index.html restates every design's offers in its JSON-LD for crawlers, so
   a price, format or category change here is a hand-edit there as well
   (each offer carries its leaf's Google path from content/taxonomy.ts). */
export const STANDARD_FORMATS: ShopFormat[] = [
  {
    id: "sticker",
    label: "Sticker",
    price: 5,
    mail: "letter",
    category: "stickers",
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
    category: "patches",
    includes: [
      { label: "Size", detail: "5 × 7 in" },
      { label: "Art", detail: "Full color" },
    ],
  },
  {
    id: "tee",
    label: "Men’s tee",
    price: 35,
    category: "tees",
    fit: "mens",
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
    category: "tees",
    fit: "womens",
    sizes: WOMENS_SIZES,
    includes: [
      { label: "Blank", detail: "The soft one" },
      { label: "Cut", detail: "Women’s, cap sleeves" },
    ],
  },
]

/* The two tees alone, for a design that is not printed as a sticker or patch. */
const TEE_FORMATS = STANDARD_FORMATS.filter(
  (format) => format.category === "tees",
)

/* The Next Generation's mockup for each of the standard formats, by id. */
const TNG_PHOTOS = {
  sticker: `${MEDIA_URL}/shop/bands/reagan-youth/the-next-generation/sticker-flat.0e12b0a6.jpg`,
  patch: `${MEDIA_URL}/shop/bands/reagan-youth/the-next-generation/patch-canvas.5ac6dfe3.jpg`,
  tee: `${MEDIA_URL}/shop/bands/reagan-youth/the-next-generation/mens-tee.1734781d.jpg`,
  "tee-womens": `${MEDIA_URL}/shop/bands/reagan-youth/the-next-generation/womens-tee.fe53a5a5.jpg`,
}

/* Reagan Youth's first real piece, in the standard formats. */
export const THE_NEXT_GENERATION: ShopItem = {
  id: "ry-the-next-generation",
  item: "The Next Generation",
  image: `${MEDIA_URL}/shop/bands/reagan-youth/the-next-generation/artwork.5a3e32a7.jpg`,
  aspect: "landscape",
  alt: "“Reagan Youth” in white blackletter over a guinea pig with an earring, a stitched scar and one fang, peeking over a ledge, above “The Next Generation” in gold, on black.",
  blurb:
    "A pierced, scarred, fanged guinea pig peeks in under the Reagan Youth blackletter: the next generation. In four formats.",
  band: "reagan-youth",
  gallery: [
    `${MEDIA_URL}/shop/bands/reagan-youth/the-next-generation/artwork.5a3e32a7.jpg`,
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
  patch: `${MEDIA_URL}/shop/bands/leftover-crack/leftover-frank/patch-canvas.3b040f94.jpg`,
  tee: `${MEDIA_URL}/shop/bands/leftover-crack/leftover-frank/mens-tee.1b32d64d.jpg`,
  "tee-womens": `${MEDIA_URL}/shop/bands/leftover-crack/leftover-frank/womens-tee.4d0c3a32.jpg`,
}

/* Leftover Crack's first real piece, in the standard formats: Frank is
   Tibbie X's cat, who lives at C-Squat and kills pigeons. */
export const LEFTOVER_FRANK: ShopItem = {
  id: "lc-leftover-frank",
  item: "Leftover Frank",
  image: FRANK_ARTWORK,
  aspect: "square",
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
  category: "bundles",
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

const ON_A_LEASH_ARTWORK = `${MEDIA_URL}/shop/bands/gash/on-a-leash/artwork.18aa4224.jpg`

/* On a Leash's mockup for each of its two formats, by id. */
const ON_A_LEASH_PHOTOS = {
  tee: `${MEDIA_URL}/shop/bands/gash/on-a-leash/mens-tee.21064ad1.jpg`,
  "tee-womens": `${MEDIA_URL}/shop/bands/gash/on-a-leash/womens-tee.0bc76e76.jpg`,
}

/* GASH's first real piece, and tees only: the client prints this one as no
   sticker and no patch. The portrait art is padded to a square on black so the
   square shop photo keeps the logo and the floor in frame. */
export const ON_A_LEASH: ShopItem = {
  id: "gash-on-a-leash",
  item: "On a Leash",
  image: ON_A_LEASH_ARTWORK,
  aspect: "portrait",
  alt: "The angular GASH logo over a masked woman in boots holding a chain, leading a masked singer who crawls across the stage with a microphone, the band in silhouette behind them, in white ink on black.",
  blurb:
    "GASH, with the singer on a short leash and the mic still live. Tees only, men’s and women’s.",
  band: "gash",
  gallery: [
    ON_A_LEASH_ARTWORK,
    ON_A_LEASH_PHOTOS["tee-womens"],
    ON_A_LEASH_PHOTOS.tee,
  ],
  formatPhotos: ON_A_LEASH_PHOTOS,
  formats: TEE_FORMATS,
}

/* Whether the product modal's Buy button carries CARD_HINT and "US shipping
   only." under it. Off; an item's own `ships` line still shows. */
export const SHOP_CARD_HINT = false

/* The Bands shelf as bundled with the app. The placeholders are gone. */
const BUY: ShopItem[] = [THE_NEXT_GENERATION, LEFTOVER_FRANK, ON_A_LEASH]

const VAMPIRE_CATS_ARTWORK = `${MEDIA_URL}/shop/art/vampire-cats/artwork.76622c0e.jpg`

/* Vampire Cats' mockup for each of the standard formats, by id. */
const VAMPIRE_CATS_PHOTOS = {
  sticker: `${MEDIA_URL}/shop/art/vampire-cats/sticker-flat.0fd3d3aa.jpg`,
  patch: `${MEDIA_URL}/shop/art/vampire-cats/patch-canvas.c52931ca.jpg`,
  tee: `${MEDIA_URL}/shop/art/vampire-cats/mens-tee.895e322c.jpg`,
  "tee-womens": `${MEDIA_URL}/shop/art/vampire-cats/womens-tee.08516bec.jpg`,
}

/* The first real piece on the shelf: the client's own art, in the standard
   formats. Too detailed to shrink to a pin, so there deliberately is no pin.
   The photos are on the media bucket under their own hashes (see MEDIA_URL). */
export const VAMPIRE_CATS: ShopItem = {
  id: "a-vampire-cats",
  item: "Vampire Cats",
  shelf: "art",
  image: VAMPIRE_CATS_ARTWORK,
  aspect: "square",
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

/* The Art shelf as bundled: the studio's own work, and anything not tied to
   one band. `band`, where an art piece sets it, only says whose mark is on
   it -- `shelf: "art"` keeps it off that band's shelf. */
const ART: ShopItem[] = [VAMPIRE_CATS]

/* The catalogue that ships with the app. The site shows it until the studio
   publishes one (api/products.ts), and the studio starts from it the first
   time, so the first publish carries every product over. After that the
   published catalogue is the truth and this is only the fallback for when
   the endpoint is unreachable -- `pnpm dev`, or storage not connected. */
export const BUNDLED_SHOP: ShopItem[] = [...BUY, ...ART]

export function shelfOf(item: ShopItem): "bands" | "art" {
  return item.shelf ?? (item.band ? "bands" : "art")
}

/* An item's tags (content/taxonomy.ts), worked out from its fields. */
export const shopTagsOf = (item: ShopItem): Tag[] =>
  tagsOf({ ...item, shelf: shelfOf(item), formats: formatsOf(item) })

/* Whether an item has a format on one of these category leaves. */
export const sellsAny = (item: ShopItem, categories: ProductCategory[]) =>
  formatsOf(item).some((format) => {
    const category = categoryOf(format)
    return category !== undefined && categories.includes(category)
  })

/* The Buy tab's shelves, in the order its first screen stacks them: a 3:1
   banner each (drawn by scripts/draw-illustrations.py, SHELF_BANNERS), and
   no products until one is picked. The picked shelf's banner stays on top,
   with a strip of what is under it:

     Sessions              each service in content/offerings.ts
     Bands                 each band with something for sale, then its
                           collections
     Art                   each collection on the Art shelf
     Tee Shirts, Patches,  each band and Art that has that kind of item,
     Stickers              then those items as cards, one per format

   Sessions is her time rather than her goods; the rest are products (see
   offerings.ts). A shelf with nothing on it is left off the first screen. */
export type ShopShelf =
  "sessions" | "bands" | "art" | "tees" | "patches" | "stickers"

export const SHOP_SHELVES: { id: ShopShelf; title: string; banner: string }[] =
  [
    { id: "sessions", title: "Sessions", banner: sessionsBanner },
    { id: "bands", title: "Bands", banner: bandsBanner },
    { id: "art", title: "Art", banner: artBanner },
    { id: "tees", title: "Tee Shirts", banner: teesBanner },
    { id: "patches", title: "Patches", banner: patchesBanner },
    { id: "stickers", title: "Stickers", banner: stickersBanner },
  ]

/* Each band's own gig-poster strip, drawn to the band level's template:
   what the Bands shelf shows, one per band, before a band is picked. */
export const BAND_TILES: Partial<Record<BandId, string>> = {
  "reagan-youth": reaganYouthTile,
  "leftover-crack": leftoverCrackTile,
  gash: gashTile,
}

/* Each design as a collection, by item id: the band strip's 3:1 poster,
   with the collection's name, its band (or Art) and what it comes in, and
   its sticker as the emblem. Shown full width at the top of the
   collection, over its format tags; it opens the product on its first
   format. */
export const COLLECTION_BANNERS: Record<string, string> = {
  "ry-the-next-generation": nextGenerationBanner,
  "lc-leftover-frank": leftoverFrankBanner,
  "gash-on-a-leash": onALeashBanner,
  "a-vampire-cats": vampireCatsBanner,
}

/* What a collection comes in: square hang tags under its banner, in this
   order. The first three are also shelves of their own on the Buy tab,
   named by `shelf`. Each tag is one leaf of the category tree
   (content/taxonomy.ts) -- Tees is both cuts, Music is any record or track
   -- and shows only when the collection has a format on it; tapping it
   opens the product on the first of those. The tags name no design, so the
   same four serve every collection. A format on any other leaf (a bundle)
   gets a plain button instead. */
export const FORMAT_TAGS: {
  label: string
  image: string
  category: ProductCategory
  shelf?: ShopShelf
}[] = [
  { label: "Tee Shirts", image: teesTag, category: "tees", shelf: "tees" },
  {
    label: "Patches",
    image: patchesTag,
    category: "patches",
    shelf: "patches",
  },
  {
    label: "Stickers",
    image: stickersTag,
    category: "stickers",
    shelf: "stickers",
  },
  { label: "Music", image: musicTag, category: "music" },
]

/* Everything the site derives from a catalogue, worked out in one place
   from whichever catalogue is live (lib/shop.ts): the band strip under Bands
   in portfolio order, the Art shelf, the polaroids on Home, and the
   portfolio -> Buy wiring. Hidden items are already gone by now; a band with
   nothing for sale drops out of every one of them. */
export type Shop = {
  groups: { id: BandId; title: string; items: ShopItem[] }[]
  art: ShopItem[]
  /* Every band's items in portfolio order, then Art: the All shelf. */
  all: ShopItem[]
  prints: Polaroid<BandId | "art">[][]
  forBand: (band: BandId) => ShopItem[]
}

type Polaroid<Id> = { id: Id; src: string; alt: string; caption: string }

export function arrangeShop(items: ShopItem[]): Shop {
  const shown = items.filter((item) => !item.hidden)
  const art = shown.filter((item) => shelfOf(item) === "art")
  const groups = PORTFOLIO.map((entry) => ({
    id: entry.id,
    title: entry.band,
    items: shown.filter(
      (item) => shelfOf(item) === "bands" && item.band === entry.id,
    ),
  })).filter((group) => group.items.length > 0)

  /* One polaroid per shelf, each the first item's photo: the bands, then
     Art, two to a row. */
  const prints: Polaroid<BandId | "art">[] = [
    ...groups.map((group) => ({
      id: group.id,
      src: group.items[0].image,
      alt: group.items[0].alt ?? group.items[0].item,
      caption: group.title,
    })),
    ...(art.length
      ? [
          {
            id: "art" as const,
            src: art[0].image,
            alt: art[0].alt ?? art[0].item,
            caption: "Art",
          },
        ]
      : []),
  ]
  const rows: Polaroid<BandId | "art">[][] = []
  for (let i = 0; i < prints.length; i += 2) rows.push(prints.slice(i, i + 2))

  return {
    groups,
    art,
    all: [...groups.flatMap((group) => group.items), ...art],
    prints: rows,
    forBand: (band) => groups.find((group) => group.id === band)?.items ?? [],
  }
}
