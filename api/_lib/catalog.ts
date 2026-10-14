/* The shop catalogue as the studio edits it and the server stores it: one
   JSON document of products. Pure -- no storage, no DOM -- so the endpoint,
   checkout and the studio all import the same shape and the same checks.

   It is deliberately flatter than ShopItem in src/content/shop.ts: every
   product has a list of formats (a plain item is one format), photos are one
   ordered list whose first entry is the cover, and a format's photo is a URL
   from that list. src/lib/catalog.ts turns it back into ShopItems for the
   shop. */

/* Where a product sits: the Art shelf, or a band's. Mirrors BandId in
   src/content/portfolio.ts, which this file cannot import. */
export const SHELVES = [
  "art",
  "leftover-crack",
  "reagan-youth",
  "gash",
] as const
export type Shelf = (typeof SHELVES)[number]

/* USPS classes, as in src/content/payments.ts. */
export const MAILS = ["letter", "flat", "parcel"] as const
export type Mail = (typeof MAILS)[number]

export const ASPECTS = ["square", "portrait", "landscape"] as const
export type Aspect = (typeof ASPECTS)[number]

export type CatalogFormat = {
  id: string
  label: string
  /* Whole dollars, before shipping. */
  price: number
  mail: Mail
  /* In order; a sold-out size stays listed, struck through. */
  sizes: { label: string; soldOut?: boolean }[]
  details: { label: string; detail: string }[]
  /* Which of the product's photos to show when this format is picked. */
  photo?: string
}

export type Product = {
  id: string
  name: string
  shelf: Shelf
  blurb: string
  /* What the cover photo shows, for screen readers. */
  alt: string
  photos: string[]
  aspect: Aspect
  formats: CatalogFormat[]
  /* A numbered or limited run. */
  stock?: { left: number; of: number }
  /* Off means hidden from the shop, kept in the studio. */
  live: boolean
}

export type Catalog = { products: Product[]; savedAt: string }

export const LIMITS = {
  products: 200,
  photos: 12,
  formats: 8,
  sizes: 12,
  details: 6,
  minPrice: 1,
  maxPrice: 1000,
}

const ID = /^[a-z0-9][a-z0-9-]{0,59}$/

/* A slug for a new product or format: lowercase, hyphens, short. */
export function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "item"
  )
}

function text(value: unknown, max: number) {
  return typeof value === "string"
    ? value
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .trim()
        .slice(0, max)
    : ""
}

function oneOf<T extends string>(value: unknown, options: readonly T[], or: T) {
  return options.includes(value as T) ? (value as T) : or
}

function photoUrl(value: unknown) {
  if (typeof value !== "string" || value.length > 500) return null
  try {
    return new URL(value).protocol === "https:" ? value : null
  } catch {
    return null
  }
}

function wholeNumber(value: unknown, min: number, max: number) {
  const n = Number(value)
  return Number.isInteger(n) && n >= min && n <= max ? n : null
}

/* Checks a catalogue sent from the studio and returns a clean copy, or a
   sentence saying what is wrong, in the words the studio shows. Anything
   that is not part of the shape is dropped rather than stored. */
export function cleanCatalog(input: unknown): Catalog | string {
  const raw = (input as { products?: unknown })?.products
  if (!Array.isArray(raw)) return "Expected a list of products."
  if (raw.length > LIMITS.products) {
    return `The shop holds up to ${LIMITS.products} products.`
  }

  const products: Product[] = []
  const ids = new Set<string>()

  for (const entry of raw as Record<string, unknown>[]) {
    const name = text(entry?.name, 80)
    const label = name || "A product"
    const id = typeof entry?.id === "string" ? entry.id : ""
    if (!ID.test(id) || ids.has(id)) return `${label} has a bad or repeated id.`
    ids.add(id)
    if (!name) return "Every product needs a name."

    const photos = (Array.isArray(entry.photos) ? entry.photos : [])
      .map(photoUrl)
      .filter((url): url is string => Boolean(url))
      .slice(0, LIMITS.photos)
    if (photos.length === 0) return `${name} needs at least one photo.`

    const rawFormats = Array.isArray(entry.formats) ? entry.formats : []
    if (rawFormats.length === 0) return `${name} needs something to sell.`
    if (rawFormats.length > LIMITS.formats) {
      return `${name} has more than ${LIMITS.formats} formats.`
    }

    const formats: CatalogFormat[] = []
    const formatIds = new Set<string>()
    for (const f of rawFormats as Record<string, unknown>[]) {
      const formatLabel = text(f?.label, 40)
      const fid = typeof f?.id === "string" ? f.id : ""
      if (!formatLabel) return `Every format of ${name} needs a name.`
      if (!ID.test(fid) || formatIds.has(fid)) {
        return `${name}: ${formatLabel} has a bad or repeated id.`
      }
      formatIds.add(fid)
      const price = wholeNumber(f.price, LIMITS.minPrice, LIMITS.maxPrice)
      if (price === null) {
        return `${name}: ${formatLabel} needs a whole-dollar price from $${LIMITS.minPrice} to $${LIMITS.maxPrice}.`
      }
      const sizes = (Array.isArray(f.sizes) ? f.sizes : [])
        .slice(0, LIMITS.sizes)
        .map((s: { label?: unknown; soldOut?: unknown }) => ({
          label: text(s?.label, 12),
          ...(s?.soldOut === true && { soldOut: true }),
        }))
        .filter((s) => s.label)
      const details = (Array.isArray(f.details) ? f.details : [])
        .slice(0, LIMITS.details)
        .map((d: { label?: unknown; detail?: unknown }) => ({
          label: text(d?.label, 24),
          detail: text(d?.detail, 80),
        }))
        .filter((d) => d.label && d.detail)
      const photo = photoUrl(f.photo)
      formats.push({
        id: fid,
        label: formatLabel,
        price,
        mail: oneOf(f.mail, MAILS, "parcel"),
        sizes,
        details,
        ...(photo && photos.includes(photo) && { photo }),
      })
    }

    let stock: Product["stock"]
    const rawStock = entry.stock as { left?: unknown; of?: unknown } | undefined
    if (rawStock) {
      const of = wholeNumber(rawStock.of, 1, 100_000)
      const left = of === null ? null : wholeNumber(rawStock.left, 0, of)
      if (of === null || left === null) {
        return `${name}: a limited run needs how many were made, and how many are left (no more than that).`
      }
      stock = { left, of }
    }

    products.push({
      id,
      name,
      shelf: oneOf(entry.shelf, SHELVES, "art"),
      blurb: text(entry.blurb, 400),
      alt: text(entry.alt, 300),
      photos,
      aspect: oneOf(entry.aspect, ASPECTS, "square"),
      formats,
      ...(stock && { stock }),
      live: entry.live !== false,
    })
  }

  return { products, savedAt: new Date().toISOString() }
}
