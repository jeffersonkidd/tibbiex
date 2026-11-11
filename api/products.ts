/* The studio's import sheet: Shopify's product CSV, kept as rows so it can
   be edited from the studio between visits and downloaded for Shopify's
   importer. Shopify is the source of truth for the shop -- the site reads
   products from the Storefront API, not from here -- so nothing saved here
   reaches a visitor until it is imported into Shopify.

     GET     the saved sheet: { version, savedAt, rows }. With nothing saved
             yet, { version: null } plus `legacy`, the catalogue the studio
             used to publish before Shopify, if there was one, so the first
             sheet can start from it. Needs the passcode: the sheet holds
             cost prices and stock counts.
     PUT     save a whole sheet: { base, rows }. `base` is the version the
             studio loaded; if another device has saved since, the write is
             refused with 409 rather than silently undoing it.
     POST    upload one product photo, already shrunk in the browser, as the
             raw request body. Answers with its public URL, which goes in the
             sheet's Product image URL column for Shopify to fetch at import.

   Every method needs the studio passcode in `x-studio-passcode`, as
   api/avatar.ts. The Vercel Firewall rule "Studio passcode guesses" counts
   every method here, GETs included, so guessing can't move to the read.

   Storage is Vercel Blob, the same store as the avatar:
     shop/sheet/    one JSON file per save, random suffix, newest wins. The
                    last KEEP are kept, so a bad save can be rolled back from
                    the Blob dashboard by deleting the newest.
     shop/photos/   uploaded photos. A save sweeps out the ones no kept sheet
                    names, once they are a day old -- the day covers a photo
                    uploaded for an edit not yet saved.
     shop/catalog/  the pre-Shopify catalogue, read once for the first sheet
                    and otherwise left alone.

   Rows are checked cell by cell and rebuilt, so only Shopify's own columns
   are stored. COLUMNS is a copy of the one in
   src/dashboard/products/sheet.ts, which cannot be imported here: change
   both.

   Requires a Blob store connected to the project (BLOB_READ_WRITE_TOKEN) and
   DASHBOARD_PASSWORD. `pnpm dev` does not run this file -- use `vercel dev`. */
import { createHash, timingSafeEqual } from "node:crypto"
import { del, list, put } from "@vercel/blob"

const SHEET = "shop/sheet/"
const PHOTOS = "shop/photos/"
const LEGACY = "shop/catalog/"
const KEEP = 5
const SWEEP_AFTER_MS = 24 * 60 * 60 * 1000

/* The studio sends at most a 2048px WebP, well under a megabyte; this is
   room for a PNG with transparency and still under Vercel's 4.5 MB body cap. */
const MAX_PHOTO_BYTES = 4 * 1024 * 1024
const MAX_SHEET_BYTES = 2 * 1024 * 1024
const MAX_ROWS = 2000
/* A Description can be long HTML; nothing else comes near this. */
const MAX_CELL = 20_000

const COLUMNS = [
  "Title",
  "URL handle",
  "Description",
  "Vendor",
  "Product category",
  "Type",
  "Tags",
  "Published on online store",
  "Status",
  "SKU",
  "Variant Barcodes",
  "Option1 name",
  "Option1 value",
  "Option1 Linked To",
  "Option2 name",
  "Option2 value",
  "Option2 Linked To",
  "Option3 name",
  "Option3 value",
  "Option3 Linked To",
  "Price",
  "Compare-at price",
  "Cost per item",
  "Charge tax",
  "Tax code",
  "Unit price total measure",
  "Unit price total measure unit",
  "Unit price base measure",
  "Unit price base measure unit",
  "Inventory tracker",
  "Inventory quantity",
  "Continue selling when out of stock",
  "Weight value (grams)",
  "Weight unit for display",
  "Requires shipping",
  "Fulfillment service",
  "Product image URL",
  "Image position",
  "Image alt text",
  "Variant image URL",
  "Gift card",
  "SEO title",
  "SEO description",
  "Color (product.metafields.shopify.color-pattern)",
  "Google Shopping / Google product category",
  "Google Shopping / Gender",
  "Google Shopping / Age group",
  "Google Shopping / Manufacturer part number (MPN)",
  "Google Shopping / Ad group name",
  "Google Shopping / Ads labels",
  "Google Shopping / Condition",
  "Google Shopping / Custom product",
  "Google Shopping / Custom label 0",
  "Google Shopping / Custom label 1",
  "Google Shopping / Custom label 2",
  "Google Shopping / Custom label 3",
  "Google Shopping / Custom label 4",
  "Packed product length",
  "Packed product width",
  "Packed product height",
  "Packed product dimension unit",
] as const

type Row = Record<(typeof COLUMNS)[number], string>
type Sheet = { rows: Row[] }

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

/* --- Validation: rebuild, never pass through ----------------------------- */

class Invalid extends Error {}

const HANDLE = /^[a-z0-9][a-z0-9-]{0,254}$/

function parseRow(raw: unknown, index: number): Row {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new Invalid(`Row ${index + 1} is broken.`)
  const source = raw as Record<string, unknown>
  const row = {} as Row
  for (const column of COLUMNS) {
    const value = source[column]
    if (value !== undefined && typeof value !== "string")
      throw new Invalid(`Row ${index + 1}: ${column} isn't text.`)
    /* Control characters out, except the line breaks a Description may
       hold. */
    const clean = (value ?? "").replace(
      /[\u0000-\u0009\u000b-\u001f\u007f]/g,
      " ",
    )
    if (clean.length > MAX_CELL)
      throw new Invalid(`Row ${index + 1}: ${column} is too long.`)
    row[column] = column === "Description" ? clean : clean.trim()
  }
  if (!HANDLE.test(row["URL handle"]))
    throw new Invalid(
      `Row ${index + 1}: the URL handle "${row["URL handle"]}" can only use a–z, 0–9 and hyphens.`,
    )
  for (const column of ["Product image URL", "Variant image URL"] as const) {
    const url = row[column]
    if (url && !/^https:\/\/\S+$/.test(url))
      throw new Invalid(
        `Row ${index + 1}: ${column} isn't a public https link.`,
      )
  }
  return row
}

function parseSheet(raw: unknown): Sheet {
  const rows = (raw as { rows?: unknown })?.rows
  if (!Array.isArray(rows)) throw new Invalid("The sheet is missing.")
  if (rows.length > MAX_ROWS)
    throw new Invalid(`The sheet has more than ${MAX_ROWS} rows.`)
  return { rows: rows.map(parseRow) }
}

/* --- Storage ------------------------------------------------------------- */

async function versions(prefix = SHEET) {
  const { blobs } = await list({ prefix })
  return blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))
}

async function read<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" })
  if (!response.ok) throw new Error(`sheet fetch ${response.status}`)
  return (await response.json()) as T
}

function photosIn(sheet: Sheet) {
  return sheet.rows.flatMap((row) =>
    [row["Product image URL"], row["Variant image URL"]].filter(Boolean),
  )
}

/* The photos the pre-Shopify catalogue names, so a sweep never takes one
   the first sheet might still be filled from. */
async function legacyPhotos(): Promise<string[]> {
  const newest = (await versions(LEGACY))[0]
  if (!newest) return []
  const catalog = await read<{
    items?: { gallery?: string[]; image?: string }[]
  }>(newest.url)
  return (catalog.items ?? []).flatMap(
    (item) => item.gallery ?? [item.image ?? ""],
  )
}

/* Drop sheets past the KEEP newest, then photos none of the kept ones (nor
   the old catalogue) name. Best effort: a failed sweep leaves files behind,
   never breaks a save. */
async function sweep(kept: { url: string }[], newest: Sheet) {
  try {
    const all = await versions()
    const old = all.slice(KEEP)
    if (old.length) await del(old.map((b) => b.url))

    const named = new Set([...photosIn(newest), ...(await legacyPhotos())])
    for (const version of kept.slice(1)) {
      for (const url of photosIn(await read<Sheet>(version.url))) named.add(url)
    }
    const { blobs } = await list({ prefix: PHOTOS })
    const cutoff = Date.now() - SWEEP_AFTER_MS
    const stale = blobs.filter(
      (b) => !named.has(b.url) && +new Date(b.uploadedAt) < cutoff,
    )
    if (stale.length) await del(stale.map((b) => b.url))
  } catch (error) {
    console.error("Sheet sweep failed", error)
  }
}

/* --- Gate ---------------------------------------------------------------- */

function authorised(request: Request) {
  const expected = process.env.DASHBOARD_PASSWORD
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
    { error: "Sheet storage isn't configured yet." },
    { status: 503 },
  )
}

const NO_STORE = { "Cache-Control": "no-store" }

/* --- Handlers ------------------------------------------------------------ */

export async function GET(request: Request) {
  if (!authorised(request)) return refused()

  let latest: { url: string; pathname: string; uploadedAt: Date } | undefined
  try {
    latest = (await versions())[0]
  } catch {
    return unavailable()
  }

  if (!latest) {
    /* Nothing saved yet: hand over the old catalogue, if any, to start
       from. A failure here just means starting from the bundled one. */
    let legacy: unknown[] = []
    try {
      const newest = (await versions(LEGACY))[0]
      if (newest)
        legacy = (await read<{ items?: unknown[] }>(newest.url)).items ?? []
    } catch {
      legacy = []
    }
    return Response.json({ version: null, legacy }, { headers: NO_STORE })
  }

  try {
    const sheet = await read<Sheet>(latest.url)
    return Response.json(
      {
        version: latest.pathname,
        savedAt: new Date(latest.uploadedAt).toISOString(),
        rows: sheet.rows,
      },
      { headers: NO_STORE },
    )
  } catch {
    return Response.json(
      { error: "Couldn't read the sheet." },
      { status: 502, headers: NO_STORE },
    )
  }
}

export async function PUT(request: Request) {
  if (!authorised(request)) return refused()

  const body = await request.text()
  if (body.length > MAX_SHEET_BYTES) {
    return Response.json({ error: "That sheet is too large." }, { status: 413 })
  }

  let payload: { base?: unknown; rows?: unknown }
  try {
    payload = JSON.parse(body)
  } catch {
    return Response.json({ error: "Expected JSON." }, { status: 400 })
  }

  let sheet: Sheet
  try {
    sheet = parseSheet(payload)
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
            "The sheet changed on another device since you opened it. Reload to see it, then make your edit again.",
        },
        { status: 409 },
      )
    }

    const blob = await put(`${SHEET}sheet.json`, JSON.stringify(sheet), {
      access: "public",
      addRandomSuffix: true,
      contentType: "application/json",
    })
    await sweep([{ url: blob.url }, ...before.slice(0, KEEP - 1)], sheet)
    return Response.json({
      version: blob.pathname,
      savedAt: new Date().toISOString(),
      rows: sheet.rows,
    })
  } catch (error) {
    console.error("Sheet save failed", error)
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
