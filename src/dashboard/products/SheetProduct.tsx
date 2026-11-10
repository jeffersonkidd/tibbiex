import { useState } from "react"
import { ChevronLeft, Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"

import { PRODUCT_CATEGORIES } from "../../content/taxonomy"
import Button from "../../ui/controls/Button"
import Field from "../../ui/controls/Field"
import TextArea from "../../ui/controls/TextArea"
import type { Write } from "../passcode"
import PhotoShelf from "./PhotoShelf"
import {
  OPTION_NAMES,
  OPTION_VALUES,
  addVariant,
  first,
  photosOf,
  problems,
  removeVariant,
  setCell,
  setField,
  setHandle,
  setPhotos,
  siteNotes,
  variantRows,
} from "./sheet"
import type { Column, Product, Row } from "./sheet"

/* The Types the site knows how to file, with the Shopify category each one
   goes under (content/taxonomy.ts). Picking one fills both columns. */
const KNOWN_TYPES = PRODUCT_CATEGORIES.flatMap((entry) =>
  entry.shopify ? [{ id: entry.id, ...entry.shopify }] : [],
)

/* One product of the import sheet, field by field. Every label is the
   column's own name in Shopify's CSV, so what she fills in here is what she
   will see in the file and in Shopify's importer. Columns not shown here --
   barcodes, cost, Google Shopping, packed sizes -- are all in the Sheet
   view. Edits apply to the draft as they are made. */
export default function SheetProduct({
  rows,
  product,
  onChange,
  onRemove,
  onClose,
  run,
}: {
  rows: Row[]
  product: Product
  onChange: (rows: Row[]) => void
  onRemove: () => void
  onClose: () => void
  run: (write: Write) => Promise<void>
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const head = first(rows, product)
  const field = (column: Column) => (value: string) =>
    onChange(setField(rows, product, column, value))
  const photos = photosOf(rows, product)
  const variants = variantRows(rows, product)
  const options = OPTION_NAMES.map((column, n) => ({
    column,
    value: OPTION_VALUES[n],
    name: head[column],
  })).filter((option, n) => n === 0 || option.name.trim())
  const issues = problems(rows, product)
  const notes = siteNotes(rows, product)
  const known = KNOWN_TYPES.find((entry) => entry.type === head.Type.trim())
  const taken = new Set(
    rows
      .filter((_, i) => !product.rows.includes(i))
      .map((row) => row["URL handle"]),
  )

  return (
    <section aria-label="Edit product" className="space-y-stack">
      <div className="flex items-center justify-between gap-part">
        <Button
          tone="secondary"
          shape="inline"
          icon={ChevronLeft}
          onClick={onClose}
        >
          All products
        </Button>
        <span className="label-mono text-on-surface-variant">
          {head.Status || "No status"}
        </span>
      </div>

      <Panel
        title="Photos"
        hint="Product image URL, in Image position order. A format's own photo first, then the design's artwork."
      >
        <PhotoShelf
          gallery={photos.map((photo) => photo.url)}
          onChange={(urls) =>
            onChange(
              setPhotos(
                rows,
                product,
                urls.map((url) => ({
                  url,
                  alt: photos.find((photo) => photo.url === url)?.alt ?? "",
                })),
              ),
            )
          }
          run={run}
        />
        {photos.length > 0 && (
          <div className="mt-part space-y-cluster">
            {photos.map((photo, i) => (
              <Cell key={photo.url} name={`Image alt text · photo ${i + 1}`}>
                <Field
                  type="text"
                  label={`Image alt text, photo ${i + 1}`}
                  placeholder="What the photo shows, for anyone who can't see it"
                  value={photo.alt}
                  onChange={(alt) =>
                    onChange(
                      setPhotos(
                        rows,
                        product,
                        photos.map((p, j) => (j === i ? { ...p, alt } : p)),
                      ),
                    )
                  }
                  required={false}
                  size="sm"
                />
              </Cell>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="The product">
        <div className="space-y-cluster">
          <Cell name="Title">
            <Field
              type="text"
              label="Title"
              placeholder="e.g. Vampire Cats Sticker"
              value={head.Title}
              onChange={field("Title")}
              invalid={!head.Title.trim()}
              required={false}
            />
          </Cell>
          <Cell
            name="URL handle"
            hint="The product's address in Shopify, and how rows are grouped. Lowercase, hyphens."
          >
            <Field
              type="text"
              label="URL handle"
              placeholder="vampire-cats-sticker"
              value={product.handle}
              onChange={(value) => {
                const handle = value.toLowerCase().replace(/\s+/g, "-")
                /* Rows are grouped by handle, so taking another product's
                   would fold the two together. */
                if (taken.has(handle)) {
                  toast.error(`Another product already uses “${handle}”.`)
                  return
                }
                onChange(setHandle(rows, product, handle))
              }}
              required={false}
              size="sm"
            />
          </Cell>
          <Cell name="Description">
            <TextArea
              label="Description"
              placeholder="A line or two about it. The site shows it under the price."
              rows={3}
              value={head.Description}
              onChange={field("Description")}
              required={false}
            />
          </Cell>
          <Cell
            name="Vendor"
            hint="Who it's by: the band, or Tibbie X for her own art."
          >
            <Field
              type="text"
              label="Vendor"
              placeholder="e.g. Reagan Youth"
              value={head.Vendor}
              onChange={field("Vendor")}
              required={false}
              size="sm"
            />
          </Cell>
          <Cell
            name="Type"
            hint="Picking one also fills in Product category, Shopify's own tree."
          >
            <div className="flex flex-wrap gap-glyph">
              {KNOWN_TYPES.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  aria-pressed={known?.id === entry.id}
                  onClick={() =>
                    onChange(
                      setField(
                        setField(rows, product, "Type", entry.type),
                        product,
                        "Product category",
                        entry.category,
                      ),
                    )
                  }
                  className={`studio-toggle inline-flex items-center rounded-md border px-3 py-2 body-xs-bold ${
                    known?.id === entry.id ? "is-on" : ""
                  }`}
                >
                  {entry.type}
                </button>
              ))}
            </div>
            {!known && head.Type.trim() && (
              <p className="body-xs mt-1 text-on-surface-variant">
                Type is “{head.Type}”.
              </p>
            )}
          </Cell>
          <Cell name="Product category">
            <p className="body-xs text-on-surface-variant">
              {head["Product category"] || "None"}
            </p>
          </Cell>
          <Cell
            name="Tags"
            hint="Comma-separated. design: gathers a design's formats into one piece on the site; band:, fit:, line: and run: file it."
          >
            <Field
              type="text"
              label="Tags"
              placeholder="design:vampire-cats, line:art, fit:womens"
              value={head.Tags}
              onChange={field("Tags")}
              required={false}
              size="sm"
            />
          </Cell>
        </div>
      </Panel>

      <Panel
        title="Variants"
        hint="One row each in the sheet. A product with no sizes has one: Option1 name Title, value Default Title."
      >
        <div className="space-y-cluster">
          {options.map((option, n) => (
            <Cell key={option.column} name={option.column}>
              <Field
                type="text"
                label={option.column}
                placeholder={n === 0 ? "Size, or Title for none" : "e.g. Color"}
                value={option.name}
                onChange={field(option.column)}
                required={false}
                size="sm"
              />
            </Cell>
          ))}
        </div>

        <div className="mt-part space-y-cluster">
          {variants.map((index, i) => (
            <VariantCard
              key={index}
              number={i + 1}
              row={rows[index]}
              options={options}
              onSet={(patch) =>
                onChange(
                  Object.entries(patch).reduce(
                    (next, [column, value]) =>
                      setCell(next, index, column as Column, value ?? ""),
                    rows,
                  ),
                )
              }
              onRemove={
                variants.length > 1
                  ? () => onChange(removeVariant(rows, product, index))
                  : undefined
              }
            />
          ))}
        </div>
        <div className="mt-part">
          <button
            type="button"
            onClick={() => onChange(addVariant(rows, product))}
            className="studio-toggle inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 body-xs-bold"
          >
            <Plus className="size-3" /> Add a variant
          </button>
        </div>
      </Panel>

      <Panel title="In Shopify">
        <Cell name="Status">
          <Toggles
            options={["Active", "Draft", "Archived"]}
            value={head.Status.trim().toLowerCase()}
            onPick={field("Status")}
          />
        </Cell>
        <div className="mt-part">
          <Cell
            name="Published on online store"
            hint="FALSE keeps it off the site even when Active."
          >
            <Toggles
              options={["TRUE", "FALSE"]}
              value={head["Published on online store"].trim().toLowerCase()}
              onPick={field("Published on online store")}
            />
          </Cell>
        </div>
        <div className="mt-part space-y-cluster">
          <Cell name="SEO title">
            <Field
              type="text"
              label="SEO title"
              placeholder="Optional. The Title is used without one."
              value={head["SEO title"]}
              onChange={field("SEO title")}
              required={false}
              size="sm"
            />
          </Cell>
          <Cell name="SEO description">
            <TextArea
              label="SEO description"
              placeholder="Optional. 320 characters at most."
              rows={2}
              value={head["SEO description"]}
              onChange={field("SEO description")}
              maxLength={320}
              required={false}
            />
          </Cell>
        </div>
      </Panel>

      {issues.length > 0 && (
        <div
          role="status"
          className="rounded-md border border-error/50 bg-error-container p-card"
        >
          <p className="label-mono mb-1 text-on-error-container">
            Before it can be imported
          </p>
          <ul className="body-xs list-inside list-disc space-y-0.5 text-on-error-container">
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
      {notes.length > 0 && (
        <div className="rounded-md border border-outline-variant p-card">
          <p className="label-mono mb-1 text-on-surface-variant">On the site</p>
          <ul className="body-xs list-inside list-disc space-y-0.5 text-on-surface-variant">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-center pt-1">
        <Button
          tone="secondary"
          shape="inline"
          icon={Trash2}
          onClick={() => (confirmDelete ? onRemove() : setConfirmDelete(true))}
        >
          {confirmDelete
            ? "Tap again to take it out of the sheet"
            : "Take it out of the sheet"}
        </Button>
      </div>
    </section>
  )
}

/* One variant row: its option values, then what it sells for and how many
   there are. A blank Inventory quantity leaves the variant untracked, which
   Shopify sells without counting. */
function VariantCard({
  number,
  row,
  options,
  onSet,
  onRemove,
}: {
  number: number
  row: Row
  options: { column: string; value: Column; name: string }[]
  onSet: (patch: Partial<Row>) => void
  onRemove?: () => void
}) {
  return (
    <div className="rounded-md border border-outline-variant bg-surface-container-low/60 p-card">
      <div className="mb-cluster flex items-center justify-between gap-part">
        <span className="label-mono text-tertiary">Variant {number}</span>
        {onRemove && (
          <button
            type="button"
            aria-label={`Remove variant ${number}`}
            title="Remove this variant"
            onClick={onRemove}
            className="flex size-7 items-center justify-center rounded-sm border border-outline-variant text-on-surface-variant transition-colors hover:border-tertiary hover:text-tertiary"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-cluster">
        {options.map((option) => (
          <Cell key={option.value} name={option.value}>
            <Field
              type="text"
              label={option.value}
              placeholder={option.name || "Value"}
              value={row[option.value]}
              onChange={(value) => onSet({ [option.value]: value })}
              required={false}
              size="sm"
            />
          </Cell>
        ))}
        <Cell name="SKU">
          <Field
            type="text"
            label="SKU"
            placeholder="Optional"
            value={row.SKU}
            onChange={(value) => onSet({ SKU: value })}
            required={false}
            size="sm"
          />
        </Cell>
        <Cell name="Price">
          <Field
            type="text"
            inputMode="decimal"
            label="Price"
            placeholder="35.00"
            value={row.Price}
            onChange={(value) => onSet({ Price: value })}
            required={false}
            size="sm"
          />
        </Cell>
        <Cell name="Compare-at price">
          <Field
            type="text"
            inputMode="decimal"
            label="Compare-at price"
            placeholder="Optional"
            value={row["Compare-at price"]}
            onChange={(value) => onSet({ "Compare-at price": value })}
            required={false}
            size="sm"
          />
        </Cell>
        <Cell name="Inventory quantity">
          <Field
            type="text"
            inputMode="decimal"
            label="Inventory quantity"
            placeholder="Blank: not counted"
            value={row["Inventory quantity"]}
            onChange={(value) =>
              onSet({
                "Inventory quantity": value,
                "Inventory tracker": value.trim() ? "shopify" : "",
              })
            }
            required={false}
            size="sm"
          />
        </Cell>
      </div>
    </div>
  )
}

function Cell({
  name,
  hint,
  children,
}: {
  name: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <span className="label-mono mb-1 block normal-case text-on-surface-variant">
        {name}
      </span>
      {children}
      {hint && <p className="body-xs mt-1 text-on-surface-variant">{hint}</p>}
    </div>
  )
}

function Panel({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="surface rounded-lg p-panel">
      <h3 className="heading-l">{title}</h3>
      {hint && <p className="body-xs mt-0.5 text-on-surface-variant">{hint}</p>}
      <div className="mt-part">{children}</div>
    </div>
  )
}

/* Shopify's own spellings, so the sheet says exactly what the importer
   reads; the current value matches whatever its case. */
function Toggles({
  options,
  value,
  onPick,
}: {
  options: string[]
  value: string
  onPick: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-glyph">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option.toLowerCase()}
          onClick={() => onPick(option)}
          className={`studio-toggle inline-flex items-center rounded-md border px-3 py-2 body-xs-bold ${
            value === option.toLowerCase() ? "is-on" : ""
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
