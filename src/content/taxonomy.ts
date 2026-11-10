/* ---------------------------------------------------------------------------
   How everything for sale is filed: one category tree that says what a thing
   IS, and tags that say everything else about it.

   The tree is short on purpose. Each format of a design sits on exactly one
   leaf -- Vampire Cats' sticker is a Sticker, its tee is a Tee -- because a
   design sold four ways is four kinds of thing. Who made it, which design it
   is and whether it is a limited run are not branches: they are tags, so a
   new band or a new design never adds to the tree.

   Tags are never typed by hand. Each is worked out from a field the item
   already has (its shelf, its band, its run, its formats), so the tags and
   the fields cannot drift apart. A new tag means a new field, or a new
   reading of an old one, in tagsOf() below.

   Products
   ├── Apparel
   │   └── Tees
   ├── Patches
   ├── Stickers
   ├── Music
   └── Bundles
   Services
   └── Sessions
       ├── Tarot Readings
       ├── Video Chats
       └── Lessons
--------------------------------------------------------------------------- */
import type { Service } from "./offerings"
import type { ShopFormat } from "./shop"

/* The leaves a format can sit on. */
export type ProductCategory =
  "tees" | "patches" | "stickers" | "music" | "bundles"
/* The leaves a service sits on. */
export type ServiceCategory = "tarot" | "chats" | "lessons"

export type CategoryId =
  | "products"
  | "apparel"
  | "services"
  | "sessions"
  | ProductCategory
  | ServiceCategory

export type Category = {
  id: CategoryId
  title: string
  parent?: CategoryId
  /* Google's product taxonomy path, for the JSON-LD `category` in
     index.html and any feed built later. Services have none: Google's
     product list does not cover someone's time. */
  google?: string
}

export const CATEGORIES: Category[] = [
  { id: "products", title: "Products" },
  {
    id: "apparel",
    title: "Apparel",
    parent: "products",
    google: "Apparel & Accessories > Clothing",
  },
  {
    id: "tees",
    title: "Tees",
    parent: "apparel",
    google: "Apparel & Accessories > Clothing > Shirts & Tops",
  },
  {
    id: "patches",
    title: "Patches",
    parent: "products",
    google:
      "Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Crafting Materials > Embellishments & Trims > Appliques & Patches",
  },
  {
    id: "stickers",
    title: "Stickers",
    parent: "products",
    google:
      "Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Crafting Materials > Embellishments & Trims > Decorative Stickers",
  },
  {
    id: "music",
    title: "Music",
    parent: "products",
    google: "Media > Music & Sound Recordings",
  },
  { id: "bundles", title: "Bundles", parent: "products" },
  { id: "services", title: "Services" },
  { id: "sessions", title: "Sessions", parent: "services" },
  { id: "tarot", title: "Tarot Readings", parent: "sessions" },
  { id: "chats", title: "Video Chats", parent: "sessions" },
  { id: "lessons", title: "Lessons", parent: "sessions" },
]

/* The product leaves, in the order the shop and the studio list them. */
export const PRODUCT_CATEGORIES = CATEGORIES.filter(
  (entry): entry is Category & { id: ProductCategory } =>
    isProductCategory(entry.id),
)

export function isProductCategory(id: unknown): id is ProductCategory {
  return (
    id === "tees" ||
    id === "patches" ||
    id === "stickers" ||
    id === "music" ||
    id === "bundles"
  )
}

export const categoryById = (id: CategoryId) =>
  CATEGORIES.find((entry) => entry.id === id)!

/* A leaf and every branch above it, root first: Products › Apparel › Tees. */
export function pathOf(id: CategoryId): Category[] {
  const path: Category[] = []
  for (let at: Category | undefined = categoryById(id); at;) {
    path.unshift(at)
    at = at.parent ? categoryById(at.parent) : undefined
  }
  return path
}

/* --- Formats ------------------------------------------------------------- */

/* The standard format ids, and the music ones the shop already expects, on
   their leaves. A format that says its own category wins; these cover the
   catalogue published before formats carried one. */
const CATEGORY_BY_FORMAT: Record<string, ProductCategory> = {
  sticker: "stickers",
  patch: "patches",
  tee: "tees",
  "tee-womens": "tees",
  record: "music",
  track: "music",
  download: "music",
}

export type Fit = "mens" | "womens" | "unisex"

export const FITS: { id: Fit; title: string }[] = [
  { id: "mens", title: "Men’s" },
  { id: "womens", title: "Women’s" },
  { id: "unisex", title: "Unisex" },
]

const FIT_BY_FORMAT: Record<string, Fit> = {
  tee: "mens",
  "tee-womens": "womens",
}

type Fileable = Pick<ShopFormat, "id" | "category" | "fit">

export function categoryOf(format: Fileable): ProductCategory | undefined {
  return format.category ?? CATEGORY_BY_FORMAT[format.id]
}

/* Only apparel has a fit. */
export function fitOf(format: Fileable): Fit | undefined {
  if (categoryOf(format) !== "tees") return undefined
  return format.fit ?? FIT_BY_FORMAT[format.id]
}

/* --- Tags ---------------------------------------------------------------- */

/* The facets, each a prefix: `band:gash`, `fit:womens`. */
export type Facet =
  | "line"
  | "band"
  | "collection"
  | "category"
  | "fit"
  | "status"
  | "delivery"
  | "length"

export type Tag = `${Facet}:${string}`

export const FACETS: { id: Facet; title: string; from: string }[] = [
  { id: "line", title: "Line", from: "the shelf: band merch or her own art" },
  {
    id: "band",
    title: "Band",
    from: "the band it is for, or whose mark it bears",
  },
  { id: "collection", title: "Collection", from: "the design's name" },
  { id: "category", title: "Category", from: "each format's kind" },
  { id: "fit", title: "Fit", from: "each tee's cut" },
  { id: "status", title: "Status", from: "the run, the sizes, Hidden" },
  { id: "delivery", title: "Delivery", from: "how a session happens" },
  { id: "length", title: "Length", from: "each tier's minutes" },
]

export const tag = (facet: Facet, value: string): Tag => `${facet}:${value}`

export function splitTag(value: Tag): { facet: Facet; value: string } {
  const at = value.indexOf(":")
  return { facet: value.slice(0, at) as Facet, value: value.slice(at + 1) }
}

/* A design's name as a tag value: "Leftover Frank" -> leftover-frank. */
export const slugOf = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

/* Everything an item can be filtered by. `formats` and `shelf` are passed
   in rather than read through shop.ts's helpers, so this file stays free of
   runtime imports from the shop and the studio can call it on its own
   wire shape too. */
export function tagsOf(item: {
  item: string
  band?: string
  shelf: "bands" | "art"
  formats: (Fileable & { sizes?: { soldOut?: true }[] })[]
  stock?: { left: number }
  hidden?: true
  staged?: true
}): Tag[] {
  const tags: Tag[] = [tag("line", item.shelf === "art" ? "art" : "band")]
  if (item.band) tags.push(tag("band", item.band))
  const collection = slugOf(item.item)
  if (collection) tags.push(tag("collection", collection))
  for (const format of item.formats) {
    const category = categoryOf(format)
    if (category) tags.push(tag("category", category))
    const fit = fitOf(format)
    if (fit) tags.push(tag("fit", fit))
  }
  if (item.stock)
    tags.push(tag("status", item.stock.left > 0 ? "limited" : "sold-out"))
  const sizes = item.formats.flatMap((format) => format.sizes ?? [])
  if (!item.stock && sizes.length && sizes.every((size) => size.soldOut))
    tags.push(tag("status", "sold-out"))
  if (item.staged) tags.push(tag("status", "staged"))
  if (item.hidden) tags.push(tag("status", "hidden"))
  return [...new Set(tags)]
}

/* A service's tags: FaceTime always, in person when local (BOOKING_TERMS),
   and one length per tier. */
export function serviceTagsOf(service: Service): Tag[] {
  return [
    tag("category", service.category),
    tag("delivery", "facetime"),
    tag("delivery", "in-person"),
    ...service.tiers.map((tier) => tag("length", String(tier.minutes))),
    ...(service.staged ? [tag("status", "staged")] : []),
  ]
}

/* Whether an item's tags carry every tag asked for: the one query every
   filtered view is. */
export const hasTags = (tags: Tag[], wanted: Tag[]) =>
  wanted.every((want) => tags.includes(want))
