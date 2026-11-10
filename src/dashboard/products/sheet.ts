import { PORTFOLIO } from "../../content/portfolio"
import { BUNDLED_SHOP, formatsOf } from "../../content/shop"
import type { ShopFormat, ShopItem } from "../../content/shop"
import {
  categoryById,
  categoryOf,
  categoryOfType,
  fitOf,
  slugOf,
} from "../../content/taxonomy"
import { StudioError, TOO_MANY_TRIES, savePasscode } from "../passcode"

/* The studio's import sheet: Shopify's product CSV, kept as rows, edited
   here and downloaded for Shopify's importer (Products → Import). Shopify is
   the source of truth for the shop; this sheet is how products get into it.

   The shape is Shopify's own, not ours. One row per variant, grouped by
   "URL handle"; the product's own fields (Title, Description, Tags…) sit on
   its first row only; a product with more photos than variants carries the
   rest on extra rows holding just the handle and the image. The columns and
   their order are Shopify's template (help.shopify.com, product_template.csv),
   so a download imports without mapping anything.

   api/products.ts stores the sheet and keeps its own copy of COLUMNS, which
   it cannot import from here: change both. */

export const COLUMNS = [
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

export type Column = (typeof COLUMNS)[number]
export type Row = Record<Column, string>

/* The columns that belong to one variant. Everything that is neither a
   variant column, an image column nor the handle belongs to the product, and
   is read from its first row. */
export const VARIANT_COLUMNS: Column[] = [
  "SKU",
  "Variant Barcodes",
  "Option1 value",
  "Option2 value",
  "Option3 value",
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
  "Variant image URL",
  "Google Shopping / Manufacturer part number (MPN)",
  "Packed product length",
  "Packed product width",
  "Packed product height",
  "Packed product dimension unit",
]

const IMAGE_COLUMNS: Column[] = [
  "Product image URL",
  "Image position",
  "Image alt text",
]

export const OPTION_NAMES = [
  "Option1 name",
  "Option2 name",
  "Option3 name",
] as const
export const OPTION_VALUES = [
  "Option1 value",
  "Option2 value",
  "Option3 value",
] as const

export function blankRow(handle = ""): Row {
  const row = Object.fromEntries(COLUMNS.map((column) => [column, ""])) as Row
  row["URL handle"] = handle
  return row
}

/* --- Reading the rows as products ---------------------------------------- */

export type Product = { handle: string; rows: number[] }

export const isVariantRow = (row: Row) =>
  VARIANT_COLUMNS.some((column) => row[column].trim())

/* The products in sheet order, each with the indexes of its rows. */
export function productsOf(rows: Row[]): Product[] {
  const byHandle = new Map<string, Product>()
  rows.forEach((row, index) => {
    const handle = row["URL handle"]
    const product = byHandle.get(handle)
    if (product) product.rows.push(index)
    else byHandle.set(handle, { handle, rows: [index] })
  })
  return [...byHandle.values()]
}

/* Shopify wants a product's rows together. A sheet uploaded with them
   scattered is gathered, each product where its first row was. */
export function gather(rows: Row[]): Row[] {
  return productsOf(rows).flatMap((product) =>
    product.rows.map((index) => rows[index]),
  )
}

export const first = (rows: Row[], product: Product) => rows[product.rows[0]]

export const variantRows = (rows: Row[], product: Product) =>
  product.rows.filter((index) => isVariantRow(rows[index]))

export type Photo = { url: string; alt: string }

export function photosOf(rows: Row[], product: Product): Photo[] {
  return product.rows
    .map((index) => rows[index])
    .filter((row) => row["Product image URL"].trim())
    .map((row, order) => ({
      row,
      order,
      position: Number(row["Image position"]) || Infinity,
    }))
    .sort((a, b) => a.position - b.position || a.order - b.order)
    .map(({ row }) => ({
      url: row["Product image URL"].trim(),
      alt: row["Image alt text"],
    }))
}

/* --- Editing ------------------------------------------------------------- */

export function setCell(
  rows: Row[],
  index: number,
  column: Column,
  value: string,
): Row[] {
  return rows.map((row, i) => (i === index ? { ...row, [column]: value } : row))
}

/* A product field lives on the product's first row. */
export const setField = (
  rows: Row[],
  product: Product,
  column: Column,
  value: string,
) => setCell(rows, product.rows[0], column, value)

/* The handle is on every row, so it changes on every row. */
export function setHandle(rows: Row[], product: Product, handle: string) {
  return rows.map((row, i) =>
    product.rows.includes(i) ? { ...row, "URL handle": handle } : row,
  )
}

/* A row with nothing on it but its handle is padding, unless it is the
   product's first row, which carries the product. */
const isPadding = (row: Row) =>
  COLUMNS.every((column) => column === "URL handle" || !row[column].trim())

/* Lay a product's photos out again, one per row from its first, numbered in
   order; photos beyond its rows get rows of their own, and rows left holding
   nothing go. */
export function setPhotos(rows: Row[], product: Product, photos: Photo[]) {
  const own = product.rows.map((index) => {
    const row = { ...rows[index] }
    for (const column of IMAGE_COLUMNS) row[column] = ""
    return row
  })
  photos.forEach((photo, i) => {
    const row = own[i] ?? blankRow(product.handle)
    row["Product image URL"] = photo.url
    row["Image position"] = String(i + 1)
    row["Image alt text"] = photo.alt
    own[i] = row
  })
  const kept = own.filter((row, i) => i === 0 || !isPadding(row))
  return splice(rows, product, kept)
}

/* Replace a product's rows with `next`, where they were. */
function splice(rows: Row[], product: Product, next: Row[]) {
  const at = product.rows[0]
  const others = rows.filter((_, i) => !product.rows.includes(i))
  const before = others.slice(
    0,
    rows.slice(0, at).filter((_, i) => !product.rows.includes(i)).length,
  )
  return [...before, ...next, ...others.slice(before.length)]
}

/* What a new variant copies from the product's first one: how it is taxed,
   shipped and stocked, and its price as a starting point. */
const INHERITED: Column[] = [
  "Price",
  "Charge tax",
  "Inventory tracker",
  "Continue selling when out of stock",
  "Requires shipping",
  "Fulfillment service",
  "Weight unit for display",
]

export function addVariant(rows: Row[], product: Product): Row[] {
  const own = product.rows.map((index) => ({ ...rows[index] }))
  const model = own.find(isVariantRow)
  const fresh: Partial<Row> = Object.fromEntries(
    INHERITED.map((column) => [column, model?.[column] ?? ""]),
  )
  if (!model) {
    fresh["Charge tax"] = "TRUE"
    fresh["Requires shipping"] = "TRUE"
    fresh["Fulfillment service"] = "manual"
    fresh["Continue selling when out of stock"] = "DENY"
  }
  /* An image-only row takes the variant before a new row is made. */
  const free = own.findIndex((row) => !isVariantRow(row))
  if (free !== -1) Object.assign(own[free], fresh)
  else own.push({ ...blankRow(product.handle), ...fresh })
  return splice(rows, product, own)
}

export function removeVariant(rows: Row[], product: Product, index: number) {
  const own = product.rows.map((i) => ({ ...rows[i] }))
  const at = product.rows.indexOf(index)
  const clear = (row: Row) => {
    for (const column of VARIANT_COLUMNS) row[column] = ""
  }
  /* The first row keeps the product, so a variant removed from it is
     replaced by the next one, which moves up. */
  const next = own.findIndex((row, i) => i > at && isVariantRow(row))
  if (at === 0 && next !== -1) {
    for (const column of VARIANT_COLUMNS) own[0][column] = own[next][column]
    clear(own[next])
  } else {
    clear(own[at])
  }
  return splice(
    rows,
    product,
    own.filter((row, i) => i === 0 || !isPadding(row)),
  )
}

export function addProduct(rows: Row[]): { rows: Row[]; handle: string } {
  const taken = new Set(rows.map((row) => row["URL handle"]))
  let handle = "new-product"
  for (let n = 2; taken.has(handle); n++) handle = `new-product-${n}`
  const row: Row = {
    ...blankRow(handle),
    Status: "Draft",
    "Published on online store": "FALSE",
    "Option1 name": "Title",
    "Option1 value": "Default Title",
    "Charge tax": "TRUE",
    "Continue selling when out of stock": "DENY",
    "Requires shipping": "TRUE",
    "Fulfillment service": "manual",
    "Gift card": "FALSE",
  }
  return { rows: [...rows, row], handle }
}

export const removeProduct = (rows: Row[], product: Product) =>
  rows.filter((_, i) => !product.rows.includes(i))

/* --- Checks -------------------------------------------------------------- */

const HANDLE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const STATUSES = ["active", "draft", "archived"]
const BOOLEAN = ["", "true", "false"]

/* What would make Shopify's importer refuse or mangle a product, in words,
   naming the column to fix. A download waits until there are none. */
export function problems(rows: Row[], product: Product): string[] {
  const found: string[] = []
  const head = first(rows, product)
  if (!head.Title.trim()) found.push("Give it a Title.")
  if (!HANDLE.test(product.handle))
    found.push("The URL handle can only use a–z, 0–9 and single hyphens.")
  if (head.Status && !STATUSES.includes(head.Status.trim().toLowerCase()))
    found.push("Status must be Active, Draft or Archived.")
  if (!BOOLEAN.includes(head["Published on online store"].trim().toLowerCase()))
    found.push("Published on online store must be TRUE or FALSE.")

  const variants = variantRows(rows, product).map((index) => rows[index])
  if (!variants.length) found.push("Add a variant, so it has a Price.")
  const names = OPTION_NAMES.map((column) => head[column].trim())
  if (variants.length > 1 && !names[0])
    found.push("Name the option in Option1 name, e.g. Size.")
  const seen = new Set<string>()
  variants.forEach((row, i) => {
    const which = variants.length > 1 ? `Variant ${i + 1}` : "The variant"
    const price = Number(row.Price)
    if (!row.Price.trim() || !Number.isFinite(price) || price <= 0)
      found.push(`${which} needs a Price above 0.`)
    const quantity = row["Inventory quantity"].trim()
    if (quantity && !/^-?\d+$/.test(quantity))
      found.push(`${which}: Inventory quantity must be a whole number.`)
    const values = OPTION_VALUES.map((column) => row[column].trim())
    values.forEach((value, n) => {
      if (names[n] && !value)
        found.push(`${which} has no ${names[n]} (Option${n + 1} value).`)
    })
    const key = values.join(" / ")
    if (seen.has(key)) found.push(`Two variants are both “${key}”.`)
    seen.add(key)
  })
  for (const photo of photosOf(rows, product)) {
    if (!/^https:\/\//.test(photo.url)) {
      found.push("A Product image URL isn't a public https link.")
      break
    }
  }
  return [...new Set(found)]
}

/* What the site will make of a product, where it would surprise her: it
   files a product by its Type and gathers designs by tag, so a product
   without those still imports but shows up somewhere odd. Advice, never a
   block. */
export function siteNotes(rows: Row[], product: Product): string[] {
  const head = first(rows, product)
  const tags = head.Tags.split(",").map((tag) => tag.trim().toLowerCase())
  const notes: string[] = []
  const category = categoryOfType(head.Type)
  if (!category)
    notes.push(
      "The site files a product by its Type: Sticker, Patch, T-Shirt, Record or Bundle.",
    )
  if (category === "tees" && !tags.some((tag) => tag.startsWith("fit:")))
    notes.push("A T-Shirt wants a fit: tag (fit:mens or fit:womens).")
  if (!tags.some((tag) => tag.startsWith("design:")))
    notes.push(
      "No design: tag, so the site shows it as a design of its own rather than a format of one.",
    )
  return notes
}

/* --- CSV ----------------------------------------------------------------- */

const quote = (value: string) =>
  /[",\r\n]|^\s|\s$/.test(value) ? `"${value.replace(/"/g, '""')}"` : value

export function toCsv(rows: Row[]): string {
  const lines = [
    COLUMNS.map(quote).join(","),
    ...rows.map((row) =>
      COLUMNS.map((column) => quote(row[column] ?? "")).join(","),
    ),
  ]
  return lines.join("\n") + "\n"
}

/* RFC 4180, forgiving: quoted fields across lines, doubled quotes, CRLF or
   LF, and a byte-order mark if a spreadsheet added one. */
function parseCsv(text: string): string[][] {
  const records: string[][] = []
  let record: string[] = []
  let field = ""
  let quoted = false
  const source = text.replace(/^﻿/, "")
  for (let i = 0; i < source.length; i++) {
    const char = source[i]
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') {
        field += '"'
        i++
      } else if (char === '"') quoted = false
      else field += char
    } else if (char === '"') quoted = true
    else if (char === ",") {
      record.push(field)
      field = ""
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[i + 1] === "\n") i++
      record.push(field)
      records.push(record)
      record = []
      field = ""
    } else field += char
  }
  if (field || record.length) {
    record.push(field)
    records.push(record)
  }
  return records.filter((r) => r.some((cell) => cell.trim()))
}

/* Shopify's older product CSV, which some exports and older sheets still
   use, by its names for the same columns. */
const CLASSIC: Record<string, Column> = {
  handle: "URL handle",
  "body (html)": "Description",
  "product category": "Product category",
  published: "Published on online store",
  "option1 name": "Option1 name",
  "option1 value": "Option1 value",
  "option2 name": "Option2 name",
  "option2 value": "Option2 value",
  "option3 name": "Option3 name",
  "option3 value": "Option3 value",
  "variant sku": "SKU",
  "variant barcode": "Variant Barcodes",
  "variant grams": "Weight value (grams)",
  "variant inventory tracker": "Inventory tracker",
  "variant inventory qty": "Inventory quantity",
  "variant inventory policy": "Continue selling when out of stock",
  "variant fulfillment service": "Fulfillment service",
  "variant price": "Price",
  "variant compare at price": "Compare-at price",
  "variant requires shipping": "Requires shipping",
  "variant taxable": "Charge tax",
  "variant tax code": "Tax code",
  "variant weight unit": "Weight unit for display",
  "variant image": "Variant image URL",
  "image src": "Product image URL",
  "image position": "Image position",
  "image alt text": "Image alt text",
  "gift card": "Gift card",
  "seo title": "SEO title",
  "seo description": "SEO description",
}

/* A CSV back into rows: Shopify's template, a Shopify export (either
   generation of its column names) or this studio's own download. Columns it
   doesn't know are dropped and named, so nothing goes silently. */
export function fromCsv(text: string): { rows: Row[]; dropped: string[] } {
  const [header, ...records] = parseCsv(text)
  if (!header) throw new StudioError("That file is empty.")
  const byName = new Map(
    COLUMNS.map((column) => [column.toLowerCase(), column] as const),
  )
  const mapped = header.map((name) => {
    const key = name.trim().toLowerCase()
    return byName.get(key) ?? CLASSIC[key]
  })
  if (!mapped.includes("URL handle"))
    throw new StudioError(
      "That isn't a Shopify product sheet: it has no URL handle column.",
    )
  const dropped = header.filter((_, i) => !mapped[i])
  const rows = records.map((record) => {
    const row = blankRow()
    mapped.forEach((column, i) => {
      if (column) row[column] = (record[i] ?? "").trim()
    })
    return row
  })
  return { rows: gather(rows.filter((row) => row["URL handle"])), dropped }
}

/* --- The first fill ------------------------------------------------------ */

const titleCase = (label: string) =>
  label.replace(
    /(^|\s)(\p{Ll})/gu,
    (_, gap, letter) => gap + letter.toUpperCase(),
  )

/* The shop the site was built with, written out as Shopify products: one
   per format, as Shopify files them. Prices, sizes, photos and words come
   over; stock does not, except for sizes already sold out and a counted run,
   because Shopify counts stock once it has it and this catalogue never did.
   Weight and shipping are left to Shopify's shipping settings. */
export function seedRows(items: ShopItem[] = BUNDLED_SHOP): Row[] {
  const taken = new Set<string>()
  const rows: Row[] = []
  for (const item of items) {
    const design = slugOf(item.item)
    const formats = formatsOf(item)
    const band = PORTFOLIO.find((entry) => entry.id === item.band)
    const shelf = item.shelf ?? (item.band ? "bands" : "art")
    for (const format of formats) {
      rows.push(...rowsFor(item, format, formats.length > 1))
    }

    function rowsFor(item: ShopItem, format: ShopFormat, several: boolean) {
      const title = several
        ? `${item.item} ${titleCase(format.label)}`
        : item.item
      let handle = slugOf(title)
      for (let n = 2; taken.has(handle); n++) handle = `${slugOf(title)}-${n}`
      taken.add(handle)

      const category = categoryOf(format)
      const shopify = category ? categoryById(category).shopify : undefined
      const fit = fitOf(format)
      const tags = [
        `design:${design}`,
        `line:${shelf === "art" ? "art" : "band"}`,
        band && `band:${band.id}`,
        fit && `fit:${fit}`,
        item.stock && `run:${item.stock.of}`,
      ].filter(Boolean)

      const mockup = item.formatPhotos?.[format.id]
      const photos: Photo[] = [
        ...(mockup
          ? [{ url: mockup, alt: `${item.item}, ${format.label}` }]
          : []),
        ...(item.image && item.image !== mockup
          ? [{ url: item.image, alt: item.alt ?? item.item }]
          : []),
      ]

      const sizes = format.sizes ?? []
      const variants = sizes.length
        ? sizes.map((size) => ({ value: size.label, soldOut: size.soldOut }))
        : [{ value: "Default Title", soldOut: undefined }]

      const count = Math.max(variants.length, photos.length)
      return Array.from({ length: count }, (_, i) => {
        const row = blankRow(handle)
        if (i === 0) {
          row.Title = title
          row.Description = item.blurb ?? ""
          row.Vendor = band?.band ?? "Tibbie X"
          row["Product category"] = shopify?.category ?? ""
          row.Type = shopify?.type ?? ""
          row.Tags = tags.join(", ")
          row["Published on online store"] = item.hidden ? "FALSE" : "TRUE"
          row.Status = item.hidden ? "Draft" : "Active"
          row["Option1 name"] = sizes.length ? "Size" : "Title"
          row["Gift card"] = "FALSE"
        }
        const variant = variants[i]
        if (variant) {
          const counted = variant.soldOut || item.stock?.left !== undefined
          row.SKU = [design, format.id, sizes.length ? variant.value : ""]
            .filter(Boolean)
            .join("-")
            .toUpperCase()
          row["Option1 value"] = variant.value
          row.Price = format.price.toFixed(2)
          row["Charge tax"] = "TRUE"
          row["Inventory tracker"] = counted ? "shopify" : ""
          row["Inventory quantity"] = variant.soldOut
            ? "0"
            : counted && !sizes.length
              ? String(item.stock?.left ?? "")
              : ""
          row["Continue selling when out of stock"] = "DENY"
          row["Requires shipping"] = "TRUE"
          row["Fulfillment service"] = "manual"
        }
        const photo = photos[i]
        if (photo) {
          row["Product image URL"] = photo.url
          row["Image position"] = String(i + 1)
          row["Image alt text"] = photo.alt
        }
        return row
      })
    }
  }
  return rows
}

/* The catalogue the studio used to publish to Blob before Shopify, if one
   was ever published, as the site's items: the sheet's first fill starts
   from it rather than the bundled one, so nothing she changed is lost. */
type LegacyItem = {
  id: string
  item: string
  shelf: "bands" | "art"
  band?: string
  image: string
  alt?: string
  blurb?: string
  gallery?: string[]
  formats: (Omit<ShopFormat, "variantId" | "soldOut"> & { photo?: string })[]
  stock?: { left: number; of: number }
  hidden?: true
}

function fromLegacy(items: LegacyItem[]): ShopItem[] {
  return items.map((entry) => ({
    id: entry.id,
    item: entry.item,
    shelf: entry.shelf,
    band: entry.band as ShopItem["band"],
    image: entry.gallery?.[0] ?? entry.image,
    alt: entry.alt,
    blurb: entry.blurb,
    gallery: entry.gallery,
    formatPhotos: Object.fromEntries(
      entry.formats.flatMap((f) => (f.photo ? [[f.id, f.photo]] : [])),
    ),
    formats: entry.formats.map(({ photo: _photo, ...format }) => format),
    stock: entry.stock,
    hidden: entry.hidden,
  }))
}

/* --- Reading and writing ------------------------------------------------- */

export const SHEET_URL = "/api/products"

/* What the editor works on: the sheet it loaded, by version, and the rows
   as edited since. `base` null means nothing has been saved yet, and the
   rows are the first fill. */
export type Desk = {
  base: string | null
  savedAt?: string
  saved: Row[]
  rows: Row[]
  /* Where a first fill came from, said once on the screen. */
  seededFrom?: "studio" | "site"
}

async function call(
  init: RequestInit & { passcode: string },
): Promise<Record<string, unknown>> {
  const { passcode, headers, ...rest } = init
  let response: Response
  try {
    response = await fetch(SHEET_URL, {
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
  if (response.status === 429) throw new StudioError(TOO_MANY_TRIES)
  /* Under `pnpm dev` the path answers 200 with the app's own HTML, not the
     endpoint. */
  const json = response.headers
    .get("content-type")
    ?.includes("application/json")
  if (!response.ok || !json) {
    throw new StudioError(
      data.error ??
        "The sheet is only kept on the deployed site, not on this preview.",
    )
  }
  savePasscode(passcode)
  return data
}

/* Rows as the server stores them may lack a column added since; fill them. */
const complete = (rows: Partial<Row>[]): Row[] =>
  rows.map((row) => ({ ...blankRow(), ...row }))

export async function fetchDesk(passcode: string): Promise<Desk> {
  const data = (await call({ method: "GET", passcode })) as {
    version?: string | null
    savedAt?: string
    rows?: Partial<Row>[]
    legacy?: LegacyItem[]
  }
  if (data.version && Array.isArray(data.rows)) {
    const rows = complete(data.rows)
    return { base: data.version, savedAt: data.savedAt, saved: rows, rows }
  }
  const legacy = Array.isArray(data.legacy) ? data.legacy : null
  const rows = legacy?.length ? seedRows(fromLegacy(legacy)) : seedRows()
  return {
    base: null,
    saved: [],
    rows,
    seededFrom: legacy?.length ? "studio" : "site",
  }
}

/* Without the endpoint (`pnpm dev`), the sheet still opens from the
   bundled catalogue; it just can't be saved. */
export const offlineDesk = (): Desk => ({
  base: null,
  saved: [],
  rows: seedRows(),
  seededFrom: "site",
})

export async function saveSheet(
  passcode: string,
  base: string | null,
  rows: Row[],
): Promise<Desk> {
  const data = (await call({
    method: "PUT",
    passcode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base, rows }),
  })) as { version: string; savedAt: string; rows: Partial<Row>[] }
  const saved = complete(data.rows)
  return { base: data.version, savedAt: data.savedAt, saved, rows: saved }
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

/* --- The draft, kept in this browser ------------------------------------- */

/* Edits survive a closed tab: the draft is kept against the version it was
   made on, and only picked back up while that version is still the saved
   one. */
const DRAFT_KEY = "tibbiex:studio:sheet-draft"

export function savedDraft(base: string | null): Row[] | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const draft = JSON.parse(raw) as { base: string | null; rows: unknown }
    return draft.base === base && Array.isArray(draft.rows)
      ? complete(draft.rows as Partial<Row>[])
      : null
  } catch {
    return null
  }
}

export function keepDraft(base: string | null, rows: Row[] | null) {
  try {
    if (rows) localStorage.setItem(DRAFT_KEY, JSON.stringify({ base, rows }))
    else localStorage.removeItem(DRAFT_KEY)
  } catch {
    /* Private window: the draft lasts as long as the tab. */
  }
}

export const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b)

/* --- Photos -------------------------------------------------------------- */

/* Long edge of an uploaded photo. Shopify fetches it once at import and
   serves its own sizes after, so this only has to be generous: 2048 is
   Shopify's own recommendation for a square product photo. */
const LONG_EDGE = 2048

/* Shrink a picked photo in the browser before it goes up: a phone photo is
   several MB. WebP where the browser can encode it; otherwise JPEG, or PNG
   for a PNG so a cut-out keeps its transparency. */
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
