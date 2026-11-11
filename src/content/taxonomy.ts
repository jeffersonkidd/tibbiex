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
   ├── Buttons
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
  "tees" | "patches" | "stickers" | "buttons" | "music" | "bundles"
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
  /* A product leaf's place in Shopify: the Standard Product Taxonomy path
     that goes in the import sheet's "Product category" column (checked
     against Shopify/product-taxonomy, dist/en/categories.txt), and the
     "Type" a product on this leaf carries -- which is what the site reads
     back to file a Shopify product. Shopify's tree is fixed and drives tax
     and channel feeds; ours stays short and drives the shelves. */
  shopify?: { category: string; type: string }
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
    shopify: {
      category: "Apparel & Accessories > Clothing > Clothing Tops > T-Shirts",
      type: "T-Shirt",
    },
  },
  {
    id: "patches",
    title: "Patches",
    parent: "products",
    google:
      "Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Crafting Materials > Embellishments & Trims > Appliques & Patches",
    /* A sew-on band patch is a clothing accessory to Shopify, not a
       crafting supply, though Google files it under crafts. */
    shopify: {
      category:
        "Apparel & Accessories > Clothing Accessories > Clothing Patches",
      type: "Patch",
    },
  },
  {
    id: "stickers",
    title: "Stickers",
    parent: "products",
    google:
      "Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Crafting Materials > Embellishments & Trims > Decorative Stickers",
    shopify: {
      category:
        "Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Crafting Materials > Embellishments & Trims > Decorative Stickers",
      type: "Sticker",
    },
  },
  {
    id: "buttons",
    title: "Buttons",
    parent: "products",
    /* Pinback buttons; Google's taxonomy has no leaf for them. */
    shopify: {
      category:
        "Apparel & Accessories > Clothing Accessories > Pinback Buttons",
      type: "Button",
    },
  },
  {
    id: "music",
    title: "Music",
    parent: "products",
    google: "Media > Music & Sound Recordings",
    shopify: { category: "Media > Music & Sound Recordings", type: "Record" },
  },
  /* A bundle is several things, so Shopify gets no category for it. */
  {
    id: "bundles",
    title: "Bundles",
    parent: "products",
    shopify: { category: "", type: "Bundle" },
  },
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
    id === "buttons" ||
    id === "music" ||
    id === "bundles"
  )
}

export const categoryById = (id: CategoryId) =>
  CATEGORIES.find((entry) => entry.id === id)!

/* The other words people type into Shopify's Type for each leaf. Compared
   squashed -- lower case, letters and digits only, singular -- so "T Shirt",
   "t-shirts" and "TSHIRT" are all one. */
const TYPE_WORDS: Record<ProductCategory, string[]> = {
  tees: ["tee", "tshirt", "shirt", "graphic tee"],
  patches: ["patch", "sew on patch", "iron on patch", "back patch"],
  stickers: ["sticker", "decal", "vinyl sticker"],
  buttons: ["button", "pin", "pinback", "pinback button", "badge"],
  music: [
    "record",
    "vinyl",
    "lp",
    "ep",
    "album",
    "cd",
    "cassette",
    "tape",
    "music",
  ],
  bundles: ["bundle", "set", "pack", "kit"],
}

const squash = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/(ch|sh|x)es$/, "$1")
    .replace(/s$/, "")

/* The leaf a Shopify product sits on, read from its Type, or failing that
   from the end of its Product category path ("… > Pinback Buttons"). Case,
   spacing, hyphens, plurals and the usual other words are forgiven; a Type
   the shop has never heard of files nowhere. */
export function categoryOfType(
  type: string,
  path = "",
): ProductCategory | undefined {
  const wanted = squash(type)
  const byType = wanted
    ? PRODUCT_CATEGORIES.find(
        (entry) =>
          squash(entry.shopify?.type ?? "") === wanted ||
          squash(entry.title) === wanted ||
          TYPE_WORDS[entry.id].some((word) => squash(word) === wanted),
      )
    : undefined
  if (byType) return byType.id
  const leaf = path.trim().toLowerCase()
  return leaf
    ? PRODUCT_CATEGORIES.find(
        (entry) =>
          entry.shopify?.category &&
          entry.shopify.category.toLowerCase() === leaf,
      )?.id
    : undefined
}

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
  button: "buttons",
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

/* The facets, each a prefix: `band:gash`, `fit:womens`.

   They are Shopify tags as well. The import sheet writes `line:`, `band:`,
   `design:`, `fit:` and `run:` into each product's Tags column, and the
   site reads them back off the Storefront API to rebuild what it shows:
   `design:` is what gathers one design's products (a sticker, a patch, two
   tees) into one modal. `category:` comes from the product's Type and
   `status:` from what is in stock, so those two are never typed into
   Shopify. */
export type Facet =
  | "line"
  | "band"
  | "design"
  | "run"
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
  { id: "design", title: "Design", from: "the design it is a format of" },
  { id: "run", title: "Run", from: "how many were made, on a limited run" },
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

/* The value of a `facet:value` tag on a Shopify product, however it was
   typed: "Design: Vampire Cats", "design-vampire-cats" and
   "design:vampire-cats" are all vampire-cats. The facet's case, a space
   round the colon, a hyphen or equals sign in its place and the value's
   own case and spacing are forgiven. Undefined when no tag has the facet. */
export function readTag(tags: string[], facet: Facet): string | undefined {
  const pattern = new RegExp(`^\\s*${facet}\\s*[:=-]\\s*(.+)$`, "i")
  for (const value of tags) {
    const found = value.match(pattern)?.[1]
    const slug = found && slugOf(found)
    if (slug) return slug
  }
  return undefined
}

/* A tag tidied to the shape the site writes -- the facets above lower-cased
   and slugged, `design:vampire-cats` -- and anything else left as typed. */
export function tidyTag(value: string): string {
  const trimmed = value.trim()
  const match = trimmed.match(/^\s*([a-z]+)\s*[:=-]\s*(.+)$/i)
  const facet = match?.[1].toLowerCase() as Facet | undefined
  if (!match || !facet || !FACETS.some((entry) => entry.id === facet))
    return trimmed
  const tidied =
    facet === "fit"
      ? (fitOfValue(match[2]) ?? slugOf(match[2]))
      : slugOf(match[2])
  return tidied ? `${facet}:${tidied}` : trimmed
}

/* A fit however it was written: Men's, mens, male, Ladies, women… */
export function fitOfValue(value: string): Fit | undefined {
  const word = value.toLowerCase().replace(/[^a-z]/g, "")
  if (/^(wom[ae]ns?|female|ladies|lady|girls?)$/.test(word)) return "womens"
  if (/^(m[ae]ns?|male|guys?|boys?)$/.test(word)) return "mens"
  if (/^(unisex|either|all)$/.test(word)) return "unisex"
  return undefined
}

/* A design's name as a tag value: "Leftover Frank" -> leftover-frank. */
export const slugOf = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    /* An apostrophe joins rather than splits: "Men's Tee" is mens-tee. */
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

/* Everything an item can be filtered by. `formats` and `shelf` are passed
   in rather than read through shop.ts's helpers, so this file stays free of
   runtime imports from the shop. */
export function tagsOf(item: {
  id: string
  band?: string
  shelf: "bands" | "art"
  formats: (Fileable & {
    soldOut?: true
    sizes?: { soldOut?: true }[]
  })[]
  stock?: { of: number; left?: number }
  hidden?: true
  staged?: true
}): Tag[] {
  const tags: Tag[] = [tag("line", item.shelf === "art" ? "art" : "band")]
  if (item.band) tags.push(tag("band", item.band))
  tags.push(tag("design", item.id))
  for (const format of item.formats) {
    const category = categoryOf(format)
    if (category) tags.push(tag("category", category))
    const fit = fitOf(format)
    if (fit) tags.push(tag("fit", fit))
  }
  const gone = (format: (typeof item.formats)[number]) =>
    Boolean(format.soldOut) ||
    Boolean(format.sizes?.length && format.sizes.every((size) => size.soldOut))
  const soldOut =
    item.stock?.left === 0 ||
    (item.formats.length > 0 && item.formats.every(gone))
  if (item.stock) tags.push(tag("run", String(item.stock.of)))
  if (soldOut) tags.push(tag("status", "sold-out"))
  else if (item.stock) tags.push(tag("status", "limited"))
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

/* The pills a shopper can narrow the Buy tab by, each a test on one card's
   tags (one format of one design). Only the facets a buyer cares about are
   here -- line, band and category are already the shelves and strips.

   A fit pill lets through anything that has no fit at all, so picking
   Women's on a collection drops the men's tee and keeps the sticker; and a
   unisex tee answers to both. Within a group one pill is on at a time. */
export type ShopFilter = {
  id: string
  group: "fit" | "status"
  label: string
  match: (tags: Tag[]) => boolean
}

const fitMatch = (fit: Fit) => (tags: Tag[]) =>
  !tags.some((t) => t.startsWith("fit:")) ||
  tags.includes(tag("fit", fit)) ||
  tags.includes(tag("fit", "unisex"))

export const SHOP_FILTERS: ShopFilter[] = [
  { id: "mens", group: "fit", label: "Men’s", match: fitMatch("mens") },
  { id: "womens", group: "fit", label: "Women’s", match: fitMatch("womens") },
  {
    id: "in-stock",
    group: "status",
    label: "In stock",
    match: (tags) => !tags.includes(tag("status", "sold-out")),
  },
  {
    id: "limited",
    group: "status",
    label: "Limited run",
    match: (tags) => tags.includes(tag("status", "limited")),
  },
]

/* Whether an item's tags carry every tag asked for: the one query every
   filtered view is. */
export const hasTags = (tags: Tag[], wanted: Tag[]) =>
  wanted.every((want) => tags.includes(want))
