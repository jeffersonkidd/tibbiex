import { PORTFOLIO } from "../../content/portfolio"
import { BUNDLED_SHOP, formatsOf } from "../../content/shop"
import type { ShopFormat, ShopItem } from "../../content/shop"
import {
  PRODUCT_CATEGORIES,
  categoryById,
  categoryOf,
  categoryOfType,
  fitOf,
  readTag,
  slugOf,
  tidyTag,
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

/* --- Reading what people type ---------------------------------------- */

/* Each reader takes a cell as someone might have typed it -- in the
   editor, in Excel, in Numbers, in Shopify's own export -- and gives back
   what Shopify's importer wants, or undefined when it can't tell. The
   checks below and tidy() use the same ones, so a sheet the checks pass is
   a sheet tidy() can make importable. */

/* "$35", "35", "35,00", "1,200.50", "USD 35" -> "35.00". */
export function money(value: string): string | undefined {
  let digits = value.trim().replace(/[^\d.,-]/g, "")
  if (!/\d/.test(digits)) return undefined
  /* A comma before the last one or two digits is a decimal comma. */
  if (/^-?[\d.]*\d,\d{1,2}$/.test(digits))
    digits = digits.replace(/\./g, "").replace(",", ".")
  else digits = digits.replace(/,/g, "")
  const amount = Number(digits)
  return Number.isFinite(amount) ? amount.toFixed(2) : undefined
}

/* yes, y, 1, x, ✓, on, true -> TRUE; no, n, 0, off, false -> FALSE. */
export function truth(value: string): "TRUE" | "FALSE" | undefined {
  const word = value.trim().toLowerCase()
  if (/^(true|yes|y|1|x|✓|✔|on)$/.test(word)) return "TRUE"
  if (/^(false|no|n|0|off)$/.test(word)) return "FALSE"
  return undefined
}

export function statusOf(value: string) {
  const word = value.trim().toLowerCase()
  if (/^(active|live|published|public|visible|on|for sale)$/.test(word))
    return "Active"
  if (/^(draft|hidden|off|unpublished|private|not live|pending)$/.test(word))
    return "Draft"
  if (/^(archived?|retired|old|gone)$/.test(word)) return "Archived"
  return undefined
}

/* "12", "12.0", "1,200", " 5 " -> a whole number as text. */
export function whole(value: string): string | undefined {
  const amount = Number(value.trim().replace(/[\s,]/g, ""))
  return value.trim() && Number.isFinite(amount)
    ? String(Math.round(amount))
    : undefined
}

function sellingPolicy(value: string) {
  const word = value.trim().toLowerCase()
  if (/^(deny|no|n|false|0|stop)$/.test(word)) return "DENY"
  if (/^(continue|yes|y|true|1|allow)$/.test(word)) return "CONTINUE"
  return undefined
}

function tracker(value: string) {
  const word = value.trim().toLowerCase()
  if (/^(shopify|yes|y|true|1|track(ed)?)$/.test(word)) return "shopify"
  if (/^(no|n|false|0|none|untracked|not tracked)$/.test(word)) return ""
  return undefined
}

/* "150", "150 g", "5.3 oz", "1 lb", "0.2kg" -> grams. */
function grams(value: string): string | undefined {
  const match = value
    .trim()
    .toLowerCase()
    .match(/^([\d.,]+)\s*(g|grams?|kg|kilos?|oz|ounces?|lbs?|pounds?)?$/)
  if (!match) return undefined
  const amount = Number(match[1].replace(",", "."))
  if (!Number.isFinite(amount)) return undefined
  const unit = match[2] ?? "g"
  const factor = unit.startsWith("k")
    ? 1000
    : unit.startsWith("o")
      ? 28.3495
      : unit.startsWith("l") || unit.startsWith("p")
        ? 453.592
        : 1
  return String(Math.round(amount * factor))
}

/* A photo link Shopify can download: https, whatever was pasted. */
export function imageUrl(value: string): string | undefined {
  const link = value.trim()
  if (!link) return undefined
  const full = link.startsWith("//")
    ? `https:${link}`
    : /^www\./i.test(link)
      ? `https://${link}`
      : link.replace(/^http:\/\//i, "https://")
  try {
    return new URL(full).protocol === "https:" ? full : undefined
  } catch {
    return undefined
  }
}

const tidyTags = (value: string) => {
  const seen = new Set<string>()
  return value
    .split(/[,;]/)
    .map(tidyTag)
    .filter((tag) => {
      const key = tag.toLowerCase()
      if (!tag || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .join(", ")
}

/* --- Checks -------------------------------------------------------------- */

/* What would make Shopify's importer refuse or mangle a product even after
   tidy() has had its go, in words, naming the column to fix. A download
   waits until there are none. */
export function problems(rows: Row[], product: Product): string[] {
  const found: string[] = []
  const head = first(rows, product)
  if (!head.Title.trim()) found.push("Give it a Title.")
  if (!slugOf(product.handle)) found.push("Give it a URL handle.")
  if (head.Status.trim() && !statusOf(head.Status))
    found.push("Status must be Active, Draft or Archived.")
  const published = head["Published on online store"]
  if (published.trim() && !truth(published))
    found.push("Published on online store must be yes or no.")

  const variants = variantRows(rows, product).map((index) => rows[index])
  if (!variants.length) found.push("Add a variant, so it has a Price.")
  const names = OPTION_NAMES.map((column) => head[column].trim())
  if (variants.length > 1 && !names[0])
    found.push("Name the option in Option1 name, e.g. Size.")
  /* A variant with no Price takes the first priced one's (tidy()), so
     only a product with none at all is stuck. */
  const priced = variants.filter((row) => row.Price.trim())
  if (variants.length && !priced.length) found.push("Give it a Price above 0.")
  const seen = new Set<string>()
  variants.forEach((row, i) => {
    const which = variants.length > 1 ? `Variant ${i + 1}` : "The variant"
    if (row.Price.trim() && !(Number(money(row.Price)) > 0))
      found.push(`${which} needs a Price above 0.`)
    const quantity = row["Inventory quantity"]
    if (quantity.trim() && whole(quantity) === undefined)
      found.push(`${which}: Inventory quantity must be a number.`)
    const values = OPTION_VALUES.map((column) => row[column].trim())
    values.forEach((value, n) => {
      if (names[n] && !value)
        found.push(`${which} has no ${names[n]} (Option${n + 1} value).`)
    })
    const key = values.join(" / ").toLowerCase()
    if (seen.has(key) && key.replace(/[ /]/g, ""))
      found.push(`Two variants are both “${values.join(" / ")}”.`)
    seen.add(key)
  })
  for (const photo of photosOf(rows, product)) {
    if (!imageUrl(photo.url)) {
      found.push("A Product image URL isn't a web link Shopify can reach.")
      break
    }
  }
  return [...new Set(found)]
}

const TYPE_NAMES = PRODUCT_CATEGORIES.flatMap((entry) =>
  entry.shopify ? [entry.shopify.type] : [],
)

/* What the site will make of a product, where it would surprise her: it
   files a product by its Type and gathers designs by tag, so a product
   without those still imports but shows up somewhere odd. Advice, never a
   block. */
export function siteNotes(rows: Row[], product: Product): string[] {
  const head = first(rows, product)
  const tags = head.Tags.split(/[,;]/)
  const notes: string[] = []
  const category =
    categoryOfType(head.Type, head["Product category"]) ??
    categoryOfType(head.Title.trim().split(/\s+/).at(-1) ?? "")
  if (!category)
    notes.push(
      `The site files a product by its Type: ${TYPE_NAMES.slice(0, -1).join(", ")} or ${TYPE_NAMES.at(-1)}.`,
    )
  if (
    category === "tees" &&
    !readTag(tags, "fit") &&
    !/\b(wom[ae]n|ladies|m[ae]n['’]?s?)\b/i.test(head.Title)
  )
    notes.push("A T-Shirt wants a fit: tag (fit:mens or fit:womens).")
  if (!readTag(tags, "design"))
    notes.push(
      "No design: tag, so the site shows it as a design of its own rather than a format of one.",
    )
  return notes
}

/* --- Tidying ------------------------------------------------------------- */

const MONEY: Column[] = ["Price", "Compare-at price", "Cost per item"]
const YES_NO: Column[] = [
  "Published on online store",
  "Charge tax",
  "Requires shipping",
  "Gift card",
  "Google Shopping / Custom product",
]

/* The sheet made importable wherever that can be done without guessing at
   what she meant, and every change said in words: a price typed "$35",
   "yes" for TRUE, a handle with capitals, "Tee" as a Type, a tag typed
   "Design: Vampire Cats", a photo link on http, a variant left without a
   price (it takes the first one's), a row repeated by a paste. Runs on an
   uploaded file and before every download. */
export function tidy(input: Row[]): { rows: Row[]; fixed: string[] } {
  const counts = new Map<string, number>()
  const say = (message: string) =>
    counts.set(message, (counts.get(message) ?? 0) + 1)
  let rows = input.map((row) => ({ ...row }))

  /* Handles first, since they say which rows are one product. Two handles
     that tidy to the same one stay two products. */
  const handles = new Map<string, string>()
  const owner = new Map<string, string>()
  for (const row of rows) {
    const original = row["URL handle"]
    if (!handles.has(original)) {
      const base = slugOf(original) || slugOf(row.Title) || "product"
      let handle = base
      for (let n = 2; owner.has(handle) && owner.get(handle) !== original; n++)
        handle = `${base}-${n}`
      handles.set(original, handle)
      owner.set(handle, original)
      if (handle !== original)
        say("URL handles made lowercase words joined by hyphens")
    }
    row["URL handle"] = handles.get(original)!
  }
  rows = gather(rows)

  const set = (row: Row, column: Column, value: string | undefined) => {
    if (value === undefined || value === row[column]) return false
    row[column] = value
    return true
  }

  for (const row of rows) {
    for (const column of MONEY) {
      const typed = row[column].trim()
      if (set(row, column, typed ? money(typed) : undefined)) {
        if (!/^\d+(\.\d+)?$/.test(typed))
          say("Prices written as plain dollars and cents")
      }
    }
    for (const column of YES_NO) {
      const typed = row[column]
      if (
        set(row, column, truth(typed)) &&
        typed.trim().toUpperCase() !== row[column]
      )
        say("Yes and no written as TRUE and FALSE")
    }
    const status = row.Status
    if (set(row, "Status", status.trim() ? statusOf(status) : undefined)) {
      if (status.trim().toLowerCase() !== row.Status.toLowerCase())
        say(`Status “${status.trim()}” read as ${row.Status}`)
    }
    const policy = row["Continue selling when out of stock"]
    if (
      set(row, "Continue selling when out of stock", sellingPolicy(policy)) &&
      policy.trim().toUpperCase() !== row["Continue selling when out of stock"]
    )
      say("Continue selling when out of stock written as DENY or CONTINUE")
    const tracked = row["Inventory tracker"]
    if (
      set(
        row,
        "Inventory tracker",
        tracked.trim() ? tracker(tracked) : undefined,
      ) &&
      tracked.trim().toLowerCase() !== row["Inventory tracker"]
    )
      say("Inventory tracker written as shopify, or left blank")
    if (
      set(
        row,
        "Inventory quantity",
        row["Inventory quantity"].trim()
          ? whole(row["Inventory quantity"])
          : undefined,
      )
    )
      say("Stock counts made whole numbers")
    const weight = row["Weight value (grams)"]
    if (
      set(
        row,
        "Weight value (grams)",
        weight.trim() ? grams(weight) : undefined,
      )
    )
      say("Weights turned into grams")
    for (const column of ["Product image URL", "Variant image URL"] as const) {
      if (set(row, column, imageUrl(row[column])) && row[column])
        say("Photo links made https")
    }
    const position = row["Image position"].trim()
    if (position && !/^\d+$/.test(position)) {
      row["Image position"] = whole(position) ?? ""
      say("Image positions made whole numbers")
    }
    const typedTags = row.Tags
    if (typedTags.trim()) {
      const tags = tidyTags(typedTags)
      if (
        set(row, "Tags", tags) &&
        tags.replace(/\s/g, "") !== typedTags.replace(/\s/g, "")
      )
        say(
          "Tags tidied to design:, band:, fit: and the rest as the site reads them",
        )
    }
  }

  /* Rows are gathered, so the sheet is each product's rows in turn. */
  const next: Row[] = []
  for (const product of productsOf(rows)) {
    const own = product.rows.map((index) => rows[index])

    /* The row carrying the product's details goes first, wherever a sort
       left it. */
    const detailed = own.findIndex((row) => row.Title.trim())
    if (detailed > 0) {
      own.unshift(...own.splice(detailed, 1))
      say("Rows reordered so each product's details come first")
    }
    const head = own[0]
    const name = head.Title.trim() || product.handle

    /* The Type in the site's own word, and the category it implies. */
    const category =
      categoryOfType(head.Type, head["Product category"]) ??
      (head.Type.trim()
        ? undefined
        : categoryOfType(head.Title.trim().split(/\s+/).at(-1) ?? ""))
    const leaf = category ? categoryById(category).shopify : undefined
    if (leaf) {
      const typed = head.Type.trim()
      if (typed !== leaf.type) {
        head.Type = leaf.type
        say(
          typed
            ? `Type “${typed}” read as ${leaf.type}`
            : `${name}: Type filled in as ${leaf.type}, from its title`,
        )
      }
      if (!head["Product category"].trim() && leaf.category) {
        head["Product category"] = leaf.category
        say("Product category filled in from the Type")
      }
    }

    /* Repeated rows, from a paste or a merge, go. */
    const seen = new Set<string>()
    const kept = own.filter((row) => {
      const key = COLUMNS.map((column) => row[column]).join("\u0000")
      if (seen.has(key)) {
        say("Repeated rows dropped")
        return false
      }
      seen.add(key)
      return true
    })

    const variants = kept.filter(isVariantRow)
    if (
      variants.length === 1 &&
      !head["Option1 name"].trim() &&
      !variants[0]["Option1 value"].trim()
    ) {
      head["Option1 name"] = "Title"
      variants[0]["Option1 value"] = "Default Title"
    }
    const price = variants.find((row) => row.Price.trim())?.Price
    for (const row of variants) {
      if (!row.Price.trim() && price) {
        row.Price = price
        say(`${name}: a variant with no Price takes $${price}`)
      }
    }

    next.push(...kept)
  }
  rows = next

  const fixed = [...counts].map(([message, n]) =>
    n > 1 ? `${message} (${n}).` : `${message}.`,
  )
  return { rows, fixed }
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
   LF, a byte-order mark if a spreadsheet added one, semicolons or tabs for
   commas (Excel in much of Europe, a paste from Numbers), and a stray quote
   inside a cell taken as a quote rather than the start of one. */
function parseCsv(text: string, delimiter = ","): string[][] {
  const source = text.replace(/^\uFEFF/, "")
  const records: string[][] = []
  let record: string[] = []
  let field = ""
  let quoted = false
  for (let i = 0; i < source.length; i++) {
    const char = source[i]
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') {
        field += '"'
        i++
      } else if (char === '"') quoted = false
      else field += char
    } else if (char === '"' && !field.trim()) {
      field = ""
      quoted = true
    } else if (char === delimiter) {
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

/* A header cell as a column: Shopify's template name or an older export's,
   in any case, with stray spaces, a byte-order mark or a required-field
   asterisk forgiven. */
const BY_NAME = new Map(
  COLUMNS.map((column) => [column.toLowerCase(), column] as const),
)
function columnOf(name: string): Column | undefined {
  const key = name
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/\s*\*$/, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
  return BY_NAME.get(key) ?? CLASSIC[key]
}

/* A CSV back into rows: Shopify's template, a Shopify export (either
   generation of its column names), this studio's own download, or any of
   those after a spreadsheet has had it. Lines above the column names are
   skipped; a row with no URL handle is a new product when it has a Title
   and part of the product above when it doesn't; then tidy() makes it
   importable. Columns it doesn't know are dropped and named, and every fix
   is said, so nothing changes silently. */
export function fromCsv(text: string): {
  rows: Row[]
  dropped: string[]
  fixed: string[]
} {
  /* Comma, semicolon or tab: whichever reads the most column names, on the
     first of the top 20 lines that names a handle or a title. */
  const reads = [",", ";", "\t"].map((delimiter) => {
    const table = parseCsv(text, delimiter)
    const at = table
      .slice(0, 20)
      .findIndex((cells) =>
        cells.some((cell) =>
          ["URL handle", "Title"].includes(columnOf(cell) ?? ""),
        ),
      )
    const known = at === -1 ? 0 : table[at].filter(columnOf).length
    return { table, at, known }
  })
  const { table, at } = reads.reduce((best, read) =>
    read.known > best.known ? read : best,
  )
  if (!table.length) throw new StudioError("That file is empty.")
  if (at === -1)
    throw new StudioError(
      "That isn't a Shopify product sheet: it has no URL handle or Title column.",
    )
  const header = table[at]
  const taken = new Set<Column>()
  const mapped = header.map((name) => {
    const column = columnOf(name)
    if (!column || taken.has(column)) return undefined
    taken.add(column)
    return column
  })
  const dropped = header.filter((name, i) => !mapped[i] && name.trim())

  const fixed: string[] = []
  if (at > 0)
    fixed.push(
      `Skipped ${at} ${at === 1 ? "line" : "lines"} above the column names.`,
    )
  let handle = ""
  let attached = 0
  let stray = 0
  const rows: Row[] = []
  for (const record of table.slice(at + 1)) {
    const row = blankRow()
    mapped.forEach((column, i) => {
      if (column) row[column] = (record[i] ?? "").trim()
    })
    if (COLUMNS.every((column) => !row[column])) continue
    if (row["URL handle"]) handle = row["URL handle"]
    else if (row.Title) handle = slugOf(row.Title)
    else if (handle) attached++
    else {
      stray++
      continue
    }
    row["URL handle"] = handle
    rows.push(row)
  }
  if (attached)
    fixed.push(
      `${attached} ${attached === 1 ? "row" : "rows"} with no URL handle went with the product above.`,
    )
  if (stray)
    fixed.push(
      `${stray} ${stray === 1 ? "row" : "rows"} before the first product left out.`,
    )
  const tidied = tidy(rows)
  return { rows: tidied.rows, dropped, fixed: [...fixed, ...tidied.fixed] }
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
