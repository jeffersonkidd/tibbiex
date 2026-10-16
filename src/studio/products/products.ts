import { PORTFOLIO } from "../../content/portfolio"
import { SHIPPING } from "../../content/payments"
import { BUNDLED_SHOP, STANDARD_FORMATS } from "../../content/shop"
import { toCatalogItem } from "../../lib/catalog"
import type {
  CatalogFormat,
  CatalogItem,
  PublishedCatalog,
} from "../../lib/catalog"
import { SHOP_URL } from "../../lib/shop"
import { StudioError, savePasscode } from "../passcode"

/* The studio's side of api/products.ts -- read what is live, upload a photo,
   publish the whole catalogue -- plus everything the editor needs that is
   not drawing: new items and formats, the checks a publish must pass, the
   photo shrink, and the draft kept in this browser between visits. */

/* What the editor works on: the catalogue it loaded, by version, and the
   items as edited since. `base` null means nothing has been published, and
   the items started from the catalogue bundled with the app. */
export type Desk = {
  base: string | null
  publishedAt?: string
  published: CatalogItem[]
  items: CatalogItem[]
}

/* --- Reading and writing ------------------------------------------------- */

export async function fetchDesk(): Promise<Desk> {
  try {
    const response = await fetch(`${SHOP_URL}?fresh`, {
      headers: { Accept: "application/json" },
    })
    const json = response.headers
      .get("content-type")
      ?.includes("application/json")
    if (response.ok && json) {
      const data = (await response.json()) as PublishedCatalog
      return {
        base: data.version,
        publishedAt: data.publishedAt,
        published: data.items,
        items: data.items,
      }
    }
  } catch {
    /* Unreachable, or `pnpm dev`: start from the bundled shop. */
  }
  const bundled = BUNDLED_SHOP.map(toCatalogItem)
  return { base: null, published: bundled, items: bundled }
}

async function call(
  init: RequestInit & { passcode: string },
): Promise<Record<string, unknown>> {
  const { passcode, headers, ...rest } = init
  let response: Response
  try {
    response = await fetch(SHOP_URL, {
      ...rest,
      headers: { ...headers, "x-studio-passcode": passcode },
    })
  } catch {
    throw new StudioError("Couldn't reach the site. Check the connection.")
  }
  const data = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  > & { error?: string }
  if (response.status === 401) {
    savePasscode(null)
    throw new StudioError(data.error ?? "That passcode isn't right.", true)
  }
  if (!response.ok) {
    throw new StudioError(
      data.error ??
        "The shop only changes on the deployed site, not on this preview.",
    )
  }
  savePasscode(passcode)
  return data
}

export async function uploadPhoto(passcode: string, photo: Blob) {
  const data = await call({
    method: "POST",
    passcode,
    headers: { "Content-Type": photo.type },
    body: photo,
  })
  if (typeof data.url !== "string")
    throw new StudioError("The photo went up but came back without a link.")
  return data.url
}

export async function publish(
  passcode: string,
  base: string | null,
  items: CatalogItem[],
): Promise<Desk> {
  const data = (await call({
    method: "PUT",
    passcode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base, items }),
  })) as unknown as PublishedCatalog
  return {
    base: data.version,
    publishedAt: data.publishedAt,
    published: data.items,
    items: data.items,
  }
}

/* --- The draft, kept in this browser ------------------------------------- */

/* Edits survive a closed tab or a dead phone battery: the draft is kept
   against the version it was made on, and only picked back up while that
   version is still the live one. */
const DRAFT_KEY = "tibbiex:studio:shop-draft"

export function savedDraft(base: string | null): CatalogItem[] | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const draft = JSON.parse(raw) as { base: string | null; items: unknown }
    return draft.base === base && Array.isArray(draft.items)
      ? (draft.items as CatalogItem[])
      : null
  } catch {
    return null
  }
}

export function keepDraft(base: string | null, items: CatalogItem[] | null) {
  try {
    if (items) localStorage.setItem(DRAFT_KEY, JSON.stringify({ base, items }))
    else localStorage.removeItem(DRAFT_KEY)
  } catch {
    /* Private window: the draft lasts as long as the tab. */
  }
}

/* --- New things ---------------------------------------------------------- */

const token = () => Math.random().toString(36).slice(2, 8)

/* Ids are made once and never follow the name, so renaming a piece cannot
   break a checkout that is already open. */
export const newItemId = () => `p-${token()}`
const newFormatId = () => `f-${token()}`

export function newItem(): CatalogItem {
  return {
    id: newItemId(),
    item: "",
    shelf: "bands",
    band: PORTFOLIO[0].id,
    image: "",
    gallery: [],
    aspect: "square",
    formats: [],
    hidden: true,
  }
}

/* The four standard prints, then "something else". A preset brings its
   price, sizes, mail class and details, all editable after. */
export const FORMAT_PRESETS: { id: string; label: string }[] = [
  ...STANDARD_FORMATS.map(({ id, label }) => ({ id, label })),
  { id: "custom", label: "Something else" },
]

export function newFormat(preset: string, taken: string[]): CatalogFormat {
  const standard = STANDARD_FORMATS.find((format) => format.id === preset)
  if (standard && !taken.includes(standard.id)) {
    return {
      id: standard.id,
      label: standard.label,
      price: standard.price,
      mail: standard.mail ?? "parcel",
      ...(standard.sizes && {
        sizes: standard.sizes.map(({ label }) => ({ label })),
      }),
      ...(standard.includes && {
        includes: standard.includes.map((entry) => ({ ...entry })),
      }),
    }
  }
  return { id: newFormatId(), label: "", price: 10, mail: "parcel" }
}

/* The size runs the presets use, offered to any format. */
export const SIZE_RUNS = STANDARD_FORMATS.filter((format) => format.sizes).map(
  (format) => ({
    label: format.label,
    sizes: format.sizes!.map((size) => size.label),
  }),
)

export const MAIL_CLASSES = [
  { id: "letter", label: "Letter", hint: "a sticker" },
  { id: "flat", label: "Flat", hint: "a patch" },
  { id: "parcel", label: "Parcel", hint: "a tee, a record" },
] as const

export const shippingFor = (mail: CatalogFormat["mail"]) => SHIPPING.rates[mail]

/* --- Checks -------------------------------------------------------------- */

/* What would stop a publish, in words, item by item. api/products.ts checks
   the same rules and has the last word; these say it before the round trip,
   next to the thing to fix. */
export function problems(item: CatalogItem): string[] {
  const found: string[] = []
  if (!item.item.trim()) found.push("Give it a name.")
  if (!item.gallery.length) found.push("Add at least one photo.")
  if (!item.formats.length) found.push("Add a format, so it has a price.")
  if (item.shelf === "bands" && !item.band) found.push("Pick a band.")
  item.formats.forEach((format, index) => {
    const name = format.label.trim() || `Format ${index + 1}`
    if (!format.label.trim()) found.push(`${name} needs a name.`)
    if (
      !Number.isInteger(format.price) ||
      format.price < 1 ||
      format.price > 1000
    )
      found.push(`${name}: the price must be whole dollars, $1 to $1000.`)
    const sizes = format.sizes?.map((size) => size.label.trim()) ?? []
    if (sizes.some((size) => !size)) found.push(`${name} has a blank size.`)
    if (new Set(sizes).size !== sizes.length)
      found.push(`${name} lists a size twice.`)
    if (format.includes?.some((d) => !d.label.trim() || !d.detail.trim()))
      found.push(`${name} has a half-filled detail.`)
  })
  if (item.stock) {
    const { left, of } = item.stock
    if (!Number.isInteger(of) || of < 1)
      found.push("The run size must be at least 1.")
    else if (!Number.isInteger(left) || left < 0 || left > of)
      found.push(`How many are left must be 0 to ${of}.`)
  }
  return found
}

/* An item as it will be published: the cover is the first photo, a format
   photo that was removed from the gallery is dropped, and empty optional
   fields go. */
export function tidy(item: CatalogItem): CatalogItem {
  const formats = item.formats.map((format) => {
    const next: CatalogFormat = {
      ...format,
      label: format.label.trim(),
      sizes: format.sizes?.map((size) => ({
        ...size,
        label: size.label.trim(),
      })),
    }
    if (!next.sizes?.length) delete next.sizes
    if (!next.includes?.length) delete next.includes
    if (!next.photo || !item.gallery.includes(next.photo)) delete next.photo
    return next
  })
  const next: CatalogItem = {
    ...item,
    item: item.item.trim(),
    image: item.gallery[0] ?? "",
    formats,
  }
  for (const key of ["alt", "blurb", "ships"] as const) {
    const value = next[key]?.trim()
    if (value) next[key] = value
    else delete next[key]
  }
  if (next.shelf === "art" && !next.band) delete next.band
  return next
}

export const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b)

/* --- Photos -------------------------------------------------------------- */

/* Long edge of an uploaded photo. The product modal shows it at 600px wide;
   1600 covers that at more than 2x and keeps the upload small. */
const LONG_EDGE = 1600

/* Shrink a picked photo in the browser before it goes up: a phone photo is
   several MB, the shop needs a few hundred KB. WebP where the browser can
   encode it; otherwise JPEG, or PNG for a PNG so a cut-out keeps its
   transparency. */
export async function shrinkPhoto(file: File): Promise<Blob> {
  const src = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((done, fail) => {
      const el = new Image()
      el.onload = () => done(el)
      el.onerror = () =>
        fail(new StudioError("Couldn't open that photo. Try a JPG or PNG."))
      el.src = src
    })
    const scale = Math.min(
      1,
      LONG_EDGE / Math.max(image.naturalWidth, image.naturalHeight),
    )
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(image.naturalWidth * scale)
    canvas.height = Math.round(image.naturalHeight * scale)
    const ctx = canvas.getContext("2d")!
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    const encode = (type: string, quality?: number) =>
      new Promise<Blob | null>((done) => canvas.toBlob(done, type, quality))
    const webp = await encode("image/webp", 0.86)
    if (webp?.type === "image/webp") return webp
    const fallback =
      file.type === "image/png"
        ? await encode("image/png")
        : await encode("image/jpeg", 0.88)
    if (!fallback) throw new StudioError("Couldn't prepare that photo.")
    return fallback
  } finally {
    URL.revokeObjectURL(src)
  }
}
