/* The shop catalogue, editable from the studio without a deploy.

     GET     the live catalogue as JSON, edge-cached for a minute -- what the
             site asks for. 404 while nothing has been published, and the site
             keeps the catalogue bundled with the app (src/content/shop.ts).
             ?fresh skips the cache and is what the studio asks for: it also
             names the version, so a save can say which one it edited.
     PUT     publish a whole catalogue: { base, items }. `base` is the version
             the studio loaded; if another device has published since, the
             write is refused with 409 rather than silently undoing it.
     POST    upload one product photo, already shrunk in the browser, as the
             raw request body. Answers with its URL; nothing goes live until a
             catalogue that names it is published.

   Writes need the studio passcode in `x-studio-passcode`, as api/avatar.ts.

   Storage is Vercel Blob, the same store as the avatar:
     shop/catalog/  one JSON file per publish, random suffix, newest wins.
                    The last KEEP are kept, so a bad publish can be rolled back
                    from the Blob dashboard by deleting the newest.
     shop/photos/   uploaded photos. A publish sweeps out the ones no kept
                    catalogue names, once they are a day old -- the day covers
                    a photo uploaded for an edit not yet published.

   The shape is validated field by field and rebuilt, so what is stored is
   only ever what the site knows how to show. It is a copy of the wire type in
   src/lib/catalog.ts, which cannot be imported here: change both.
   api/checkout.ts reads the same file to price a shop order.

   Requires a Blob store connected to the project (BLOB_READ_WRITE_TOKEN) and
   STUDIO_PASSCODE. `pnpm dev` does not run this file -- use `vercel dev`. */
import { createHash, timingSafeEqual } from "node:crypto"
import { del, list, put } from "@vercel/blob"

const CATALOG = "shop/catalog/"
const PHOTOS = "shop/photos/"
const KEEP = 5
const SWEEP_AFTER_MS = 24 * 60 * 60 * 1000

const EDGE_CACHE = "public, max-age=0, s-maxage=60, stale-while-revalidate=600"

/* The studio sends at most a 1600px WebP, a few hundred KB; this is room for
   a PNG with transparency and still under Vercel's 4.5 MB body cap. */
const MAX_PHOTO_BYTES = 4 * 1024 * 1024
const MAX_CATALOG_BYTES = 256 * 1024

const PHOTO_FORMATS: Record<
  string,
  { ext: string; is: (b: Uint8Array) => boolean }
> = {
  "image/webp": {
    ext: "webp",
    is: (b) => ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP",
  },
  "image/jpeg": {
    ext: "jpg",
    is: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  "image/png": { ext: "png", is: (b) => ascii(b, 1, 4) === "PNG" },
}

function ascii(bytes: Uint8Array, from: number, to: number) {
  return String.fromCharCode(...bytes.subarray(from, to))
}

/* --- The wire shape ------------------------------------------------------ */

type Mail = "letter" | "flat" | "parcel"
const MAILS: Mail[] = ["letter", "flat", "parcel"]
const ASPECTS = ["square", "portrait", "landscape"] as const

type Format = {
  id: string
  label: string
  price: number
  mail: Mail
  sizes?: { label: string; soldOut?: true }[]
  includes?: { label: string; detail: string }[]
  photo?: string
}

type Item = {
  id: string
  item: string
  shelf: "bands" | "art"
  band?: string
  image: string
  alt?: string
  blurb?: string
  aspect?: (typeof ASPECTS)[number]
  gallery?: string[]
  formats: Format[]
  stock?: { left: number; of: number }
  ships?: string
  hidden?: true
}

type Catalog = { items: Item[] }

/* --- Validation: rebuild, never pass through ----------------------------- */

class Invalid extends Error {}

const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/

function text(value: unknown, max: number, what: string): string {
  if (typeof value !== "string") throw new Invalid(`${what} is missing.`)
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, " ").trim()
  if (!clean) throw new Invalid(`${what} is empty.`)
  if (clean.length > max)
    throw new Invalid(`${what} is too long (${max} characters at most).`)
  return clean
}

function optionalText(value: unknown, max: number, what: string) {
  if (value === undefined || value === null || value === "") return undefined
  return text(value, max, what)
}

function slug(value: unknown, what: string) {
  if (typeof value !== "string" || !SLUG.test(value))
    throw new Invalid(`${what} has a broken id.`)
  return value
}

function photoUrl(value: unknown, what: string) {
  if (typeof value !== "string" || value.length > 600)
    throw new Invalid(`${what} has a broken photo.`)
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Invalid(`${what} has a broken photo.`)
  }
  if (url.protocol !== "https:")
    throw new Invalid(`${what} has a photo that isn't on https.`)
  return url.toString()
}

function whole(value: unknown, min: number, max: number, what: string) {
  const n = Number(value)
  if (!Number.isInteger(n) || n < min || n > max)
    throw new Invalid(`${what} must be a whole number from ${min} to ${max}.`)
  return n
}

function many<T>(
  value: unknown,
  max: number,
  what: string,
  each: (entry: unknown, index: number) => T,
): T[] {
  if (!Array.isArray(value)) throw new Invalid(`${what} is missing.`)
  if (value.length > max) throw new Invalid(`${what}: ${max} at most.`)
  return value.map(each)
}

function record(value: unknown, what: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Invalid(`${what} is missing.`)
  return value as Record<string, unknown>
}

function unique(ids: string[], what: string) {
  const seen = new Set<string>()
  for (const id of ids) {
    if (seen.has(id)) throw new Invalid(`${what} uses "${id}" twice.`)
    seen.add(id)
  }
}

function parseFormat(raw: unknown, name: string, gallery: string[]): Format {
  const f = record(raw, `${name}: a format`)
  const label = text(f.label, 40, `${name}: a format's name`)
  const where = `${name} · ${label}`
  const format: Format = {
    id: slug(f.id, where),
    label,
    price: whole(f.price, 1, 1000, `${where}: the price`),
    mail: MAILS.includes(f.mail as Mail) ? (f.mail as Mail) : "parcel",
  }
  if (f.sizes !== undefined) {
    const sizes = many(f.sizes, 12, `${where}: sizes`, (s) => {
      const size = record(s, `${where}: a size`)
      return {
        label: text(size.label, 12, `${where}: a size`),
        ...(size.soldOut === true && { soldOut: true as const }),
      }
    })
    unique(
      sizes.map((s) => s.label),
      `${where}: sizes`,
    )
    if (sizes.length) format.sizes = sizes
  }
  if (f.includes !== undefined) {
    const includes = many(f.includes, 8, `${where}: details`, (d) => {
      const detail = record(d, `${where}: a detail`)
      return {
        label: text(detail.label, 40, `${where}: a detail's name`),
        detail: text(detail.detail, 80, `${where}: a detail`),
      }
    })
    if (includes.length) format.includes = includes
  }
  if (f.photo !== undefined && f.photo !== null && f.photo !== "") {
    const photo = photoUrl(f.photo, where)
    if (!gallery.includes(photo))
      throw new Invalid(`${where}: its photo isn't one of the item's photos.`)
    format.photo = photo
  }
  return format
}

function parseItem(raw: unknown): Item {
  const i = record(raw, "A product")
  const name = text(i.item, 80, "A product's name")
  const gallery = many(i.gallery, 12, `${name}: photos`, (p) =>
    photoUrl(p, name),
  )
  if (!gallery.length) throw new Invalid(`${name} needs at least one photo.`)
  const formats = many(i.formats, 8, `${name}: formats`, (f) =>
    parseFormat(f, name, gallery),
  )
  if (!formats.length) throw new Invalid(`${name} needs a price.`)
  unique(
    formats.map((f) => f.id),
    `${name}: formats`,
  )

  const shelf = i.shelf === "art" ? "art" : "bands"
  const band =
    i.band === undefined || i.band === null || i.band === ""
      ? undefined
      : slug(i.band, `${name}: the band`)
  if (shelf === "bands" && !band)
    throw new Invalid(`${name} is on the Bands shelf but names no band.`)

  const item: Item = {
    id: slug(i.id, name),
    item: name,
    shelf,
    ...(band && { band }),
    /* The first photo is the cover, so the two can never disagree. */
    image: gallery[0],
    gallery,
    formats,
  }
  const alt = optionalText(i.alt, 400, `${name}: the photo description`)
  if (alt) item.alt = alt
  const blurb = optionalText(i.blurb, 400, `${name}: the description`)
  if (blurb) item.blurb = blurb
  const ships = optionalText(i.ships, 80, `${name}: the shipping note`)
  if (ships) item.ships = ships
  const aspect = ASPECTS.find((a) => a === i.aspect)
  if (aspect) item.aspect = aspect
  if (i.stock !== undefined && i.stock !== null) {
    const s = record(i.stock, `${name}: the run`)
    const of = whole(s.of, 1, 10_000, `${name}: the run size`)
    const left = whole(s.left, 0, of, `${name}: how many are left`)
    item.stock = { left, of }
  }
  if (i.hidden === true) item.hidden = true
  return item
}

function parseCatalog(raw: unknown): Catalog {
  const c = record(raw, "The catalogue")
  const items = many(c.items, 200, "Products", parseItem)
  unique(
    items.map((i) => i.id),
    "The catalogue",
  )
  return { items }
}

/* --- Storage ------------------------------------------------------------- */

async function versions() {
  const { blobs } = await list({ prefix: CATALOG })
  return blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))
}

async function read(url: string): Promise<Catalog> {
  const response = await fetch(url, { cache: "no-store" })
  if (!response.ok) throw new Error(`catalog fetch ${response.status}`)
  return (await response.json()) as Catalog
}

function photosIn(catalog: Catalog) {
  return catalog.items.flatMap((item) => item.gallery ?? [item.image])
}

/* Drop catalogues past the KEEP newest, then photos none of the kept ones
   name. Best effort: a failed sweep leaves files behind, never breaks a
   publish. */
async function sweep(kept: { url: string }[], newest: Catalog) {
  try {
    const all = await versions()
    const old = all.slice(KEEP)
    if (old.length) await del(old.map((b) => b.url))

    const named = new Set(photosIn(newest))
    for (const version of kept.slice(1)) {
      for (const url of photosIn(await read(version.url))) named.add(url)
    }
    const { blobs } = await list({ prefix: PHOTOS })
    const cutoff = Date.now() - SWEEP_AFTER_MS
    const stale = blobs.filter(
      (b) => !named.has(b.url) && +new Date(b.uploadedAt) < cutoff,
    )
    if (stale.length) await del(stale.map((b) => b.url))
  } catch (error) {
    console.error("Shop sweep failed", error)
  }
}

/* --- Gate ---------------------------------------------------------------- */

function authorised(request: Request) {
  const expected = process.env.STUDIO_PASSCODE
  const given = request.headers.get("x-studio-passcode")
  if (!expected || !given) return false
  const digest = (value: string) => createHash("sha256").update(value).digest()
  return timingSafeEqual(digest(given), digest(expected))
}

function refused() {
  return Response.json({ error: "That passcode isn't right." }, { status: 401 })
}

function unavailable() {
  return Response.json(
    { error: "Shop storage isn't configured yet." },
    { status: 503 },
  )
}

/* --- Handlers ------------------------------------------------------------ */

export async function GET(request: Request) {
  const fresh = new URL(request.url).searchParams.has("fresh")
  const cache = fresh ? "no-store" : EDGE_CACHE

  let latest: { url: string; pathname: string; uploadedAt: Date } | undefined
  try {
    latest = (await versions())[0]
  } catch {
    /* Unconfigured storage reads as "nothing published": the site keeps its
       bundled catalogue. */
    latest = undefined
  }
  if (!latest) {
    return Response.json(
      { version: null },
      { status: 404, headers: { "Cache-Control": cache } },
    )
  }
  try {
    const catalog = await read(latest.url)
    return Response.json(
      {
        version: latest.pathname,
        publishedAt: new Date(latest.uploadedAt).toISOString(),
        items: catalog.items,
      },
      { headers: { "Cache-Control": cache } },
    )
  } catch {
    return Response.json(
      { error: "Couldn't read the catalogue." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    )
  }
}

export async function PUT(request: Request) {
  if (!authorised(request)) return refused()

  const body = await request.text()
  if (body.length > MAX_CATALOG_BYTES) {
    return Response.json(
      { error: "That catalogue is too large." },
      { status: 413 },
    )
  }

  let payload: { base?: unknown; items?: unknown }
  try {
    payload = JSON.parse(body)
  } catch {
    return Response.json({ error: "Expected JSON." }, { status: 400 })
  }

  let catalog: Catalog
  try {
    catalog = parseCatalog(payload)
  } catch (error) {
    if (error instanceof Invalid)
      return Response.json({ error: error.message }, { status: 422 })
    throw error
  }

  try {
    const before = await versions()
    const current = before[0]?.pathname ?? null
    const base = typeof payload.base === "string" ? payload.base : null
    if (base !== current) {
      return Response.json(
        {
          error:
            "The shop changed on another device since you opened it. Reload to see it, then make your edit again.",
        },
        { status: 409 },
      )
    }

    const blob = await put(`${CATALOG}catalog.json`, JSON.stringify(catalog), {
      access: "public",
      addRandomSuffix: true,
      contentType: "application/json",
    })
    await sweep([{ url: blob.url }, ...before.slice(0, KEEP - 1)], catalog)
    return Response.json({
      version: blob.pathname,
      publishedAt: new Date().toISOString(),
      items: catalog.items,
    })
  } catch (error) {
    console.error("Shop publish failed", error)
    return unavailable()
  }
}

export async function POST(request: Request) {
  if (!authorised(request)) return refused()

  const type = request.headers.get("content-type") ?? ""
  const format = PHOTO_FORMATS[type]
  if (!format) {
    return Response.json(
      { error: "Expected a WebP, JPEG or PNG photo." },
      { status: 415 },
    )
  }
  const bytes = new Uint8Array(await request.arrayBuffer())
  if (
    bytes.length < 12 ||
    bytes.length > MAX_PHOTO_BYTES ||
    !format.is(bytes)
  ) {
    return Response.json(
      { error: "That photo is too large or not what it says it is." },
      { status: 400 },
    )
  }

  try {
    const blob = await put(`${PHOTOS}photo.${format.ext}`, Buffer.from(bytes), {
      access: "public",
      addRandomSuffix: true,
      contentType: type,
    })
    return Response.json({ url: blob.url })
  } catch {
    return unavailable()
  }
}
