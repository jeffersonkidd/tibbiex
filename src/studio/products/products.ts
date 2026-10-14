import { cleanCatalog } from "../../../api/_lib/catalog.js"
import type {
  Catalog,
  CatalogFormat,
  Product,
} from "../../../api/_lib/catalog.js"
import { BUNDLED_SHOP, formatsOf } from "../../content/shop"
import type { ShopItem } from "../../content/shop"
import { encodeCanvas, studioWrite } from "../write"

/* The studio's side of api/products.ts: load the catalogue, save it whole,
   upload a photo. Before the first save there is no catalogue on the server,
   so the studio starts from the products bundled with the app -- the first
   save moves them all into the back office. */

const ENDPOINT = "/api/products"

export type Loaded = {
  products: Product[]
  /* False while the shop still runs on the bundled products. */
  saved: boolean
  savedAt?: string
}

export async function loadCatalog(): Promise<Loaded> {
  try {
    const response = await fetch(`${ENDPOINT}?fresh`)
    if (response.ok) {
      const catalog = (await response.json()) as Catalog
      if (catalog.products) {
        return {
          products: catalog.products,
          saved: true,
          savedAt: catalog.savedAt,
        }
      }
    }
  } catch {
    /* No endpoint (dev, or storage not set up): start from the bundle. */
  }
  return { products: bundledProducts(), saved: false }
}

/* Checks the list the way the server will, and saves it. Resolves to what
   the server stored. Throws a StudioError with a sentence to show. */
export async function saveCatalog(passcode: string, products: Product[]) {
  const checked = cleanCatalog({ products })
  if (typeof checked === "string") throw new Error(checked)
  return studioWrite<Catalog>(ENDPOINT, "PUT", passcode, { products })
}

/* Shrinks a photo in the browser and uploads it. Resolves to its URL. */
export async function uploadPhoto(passcode: string, file: File) {
  const image = await shrink(file, 1600)
  const { url } = await studioWrite<{ url: string }>(
    ENDPOINT,
    "POST",
    passcode,
    image,
  )
  return url
}

/* At most `max` px on the long side, re-encoded small. A phone photo is
   4000px and several MB; the shop shows it at 600px. */
async function shrink(file: File, max: number) {
  const src = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((done, fail) => {
      const el = new Image()
      el.onload = () => done(el)
      el.onerror = () =>
        fail(new Error("Couldn't open that photo. Try a JPG or PNG."))
      el.src = src
    })
    const scale = Math.min(
      1,
      max / Math.max(img.naturalWidth, img.naturalHeight),
    )
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    const ctx = canvas.getContext("2d")!
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return await encodeCanvas(canvas)
  } finally {
    URL.revokeObjectURL(src)
  }
}

/* A bundled ShopItem as a studio product. Ids are kept, so orders and links
   that name a product still find it after the first save. */
export function fromShopItem(item: ShopItem): Product {
  const photos = item.gallery?.length ? item.gallery : [item.image]
  return {
    id: item.id,
    name: item.item,
    shelf: item.band ?? "art",
    blurb: item.blurb ?? "",
    alt: item.alt ?? "",
    photos,
    aspect: item.aspect ?? "square",
    formats: formatsOf(item).map((format) => ({
      id: format.id,
      label: format.label,
      price: format.price,
      mail: format.mail ?? "parcel",
      sizes: (format.sizes ?? []).map((size) => ({
        label: size.label,
        ...(size.soldOut && { soldOut: true }),
      })),
      details: format.includes ?? [],
      ...(item.formatPhotos?.[format.id] && {
        photo: item.formatPhotos[format.id],
      }),
    })),
    ...(item.stock && { stock: item.stock }),
    live: true,
  }
}

function bundledProducts() {
  return [...BUNDLED_SHOP.bands, ...BUNDLED_SHOP.art].map(fromShopItem)
}

function shortId() {
  return Math.random().toString(36).slice(2, 8)
}

export function newProduct(): Product {
  return {
    id: `p-${shortId()}`,
    name: "",
    shelf: "art",
    blurb: "",
    alt: "",
    photos: [],
    aspect: "square",
    formats: [],
    /* New work starts hidden, so nothing half-made reaches the shop. */
    live: false,
  }
}

const MENS = ["S", "M", "L", "XL", "2XL", "3XL"]
const WOMENS = ["XS", "S", "M", "L", "XL", "2XL"]
const sized = (labels: string[]) => labels.map((label) => ({ label }))

/* The ways the studio usually sells a design, as starting points: picking
   one adds it with its usual price, shipping and spec, all editable. */
export const PRESETS: {
  label: string
  make: () => Omit<CatalogFormat, "id">
}[] = [
  {
    label: "Sticker",
    make: () => ({
      label: "Sticker",
      price: 5,
      mail: "letter",
      sizes: [],
      details: [
        { label: "Size", detail: "4 × 6 in" },
        { label: "Art", detail: "Full color" },
      ],
    }),
  },
  {
    label: "Patch",
    make: () => ({
      label: "Patch",
      price: 10,
      mail: "flat",
      sizes: [],
      details: [
        { label: "Size", detail: "5 × 7 in" },
        { label: "Art", detail: "Full color" },
      ],
    }),
  },
  {
    label: "Men’s tee",
    make: () => ({
      label: "Men’s tee",
      price: 35,
      mail: "parcel",
      sizes: sized(MENS),
      details: [
        { label: "Blank", detail: "Gildan" },
        { label: "Cut", detail: "Men’s, classic fit" },
      ],
    }),
  },
  {
    label: "Women’s tee",
    make: () => ({
      label: "Women’s tee",
      price: 35,
      mail: "parcel",
      sizes: sized(WOMENS),
      details: [
        { label: "Blank", detail: "The soft one" },
        { label: "Cut", detail: "Women’s, cap sleeves" },
      ],
    }),
  },
  {
    label: "Print",
    make: () => ({
      label: "Print",
      price: 25,
      mail: "flat",
      sizes: [],
      details: [{ label: "Size", detail: "8 × 10 in" }],
    }),
  },
  {
    label: "Other",
    make: () => ({
      label: "",
      price: 10,
      mail: "parcel",
      sizes: [],
      details: [],
    }),
  },
]

/* A format id unique within its product. */
export function formatId(product: Product, label: string) {
  const base =
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "format"
  const taken = new Set(product.formats.map((f) => f.id))
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}

export function lowest(product: Product) {
  return product.formats.length
    ? Math.min(...product.formats.map((f) => f.price))
    : null
}

/* Every size of every format is gone, or a limited run is. */
export function soldOut(product: Product) {
  if (product.stock && product.stock.left <= 0) return true
  return (
    product.formats.length > 0 &&
    product.formats.every(
      (f) => f.sizes.length > 0 && f.sizes.every((s) => s.soldOut),
    )
  )
}
