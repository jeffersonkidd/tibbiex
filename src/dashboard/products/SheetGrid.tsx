import { useState } from "react"

import { COLUMNS, productsOf, setCell } from "./sheet"
import type { Column, Row } from "./sheet"

/* The import sheet as Shopify will read it: one row per variant (and per
   extra photo), every column in the template's order. It scrolls sideways
   inside its panel, with the handle pinned on the left so a row always says
   whose it is. The handle itself is changed from the product's own page,
   because rows are grouped by it and a typo here would split a product.

   "Columns in use" hides the ones nothing in the sheet fills yet, which is
   most of Shopify's 61; "All columns" shows the rest, for the barcodes, the
   cost per item or the Google Shopping fields. */
export default function SheetGrid({
  rows,
  onChange,
}: {
  rows: Row[]
  onChange: (rows: Row[]) => void
}) {
  const [all, setAll] = useState(false)
  const columns = COLUMNS.filter(
    (column) =>
      column !== "URL handle" &&
      (all ||
        column === "Title" ||
        rows.some((row) => row[column].trim() !== "")),
  )
  /* A stripe per product, so a product's rows read as one block. */
  const shade = new Map<number, boolean>()
  productsOf(rows).forEach((product, n) =>
    product.rows.forEach((index) => shade.set(index, n % 2 === 1)),
  )

  return (
    <div>
      <div className="mb-cluster flex flex-wrap items-center justify-between gap-cluster">
        <span className="label-mono text-on-surface-variant">
          {rows.length} {rows.length === 1 ? "row" : "rows"} ·{" "}
          {columns.length + 1} of {COLUMNS.length} columns
        </span>
        <div className="flex gap-glyph">
          {[
            { id: false, label: "Columns in use" },
            { id: true, label: "All columns" },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={all === option.id}
              onClick={() => setAll(option.id)}
              className={`studio-toggle inline-flex items-center rounded-md border px-2.5 py-1.5 body-xs-bold ${
                all === option.id ? "is-on" : ""
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-outline-variant">
        <table className="border-collapse text-left">
          <thead>
            <tr>
              <Head sticky>URL handle</Head>
              {columns.map((column) => (
                <Head key={column}>{column}</Head>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className={
                  shade.get(index)
                    ? "bg-surface-container-low/60"
                    : "bg-surface-container-lowest/60"
                }
              >
                <td className="sticky left-0 z-10 border-r border-b border-outline-variant bg-surface-container px-2 py-1 body-xs-bold whitespace-nowrap">
                  {row["URL handle"]}
                </td>
                {columns.map((column) => (
                  <td
                    key={column}
                    className="border-b border-outline-variant p-0"
                  >
                    <input
                      type="text"
                      aria-label={`${column}, row ${index + 1}`}
                      value={row[column]}
                      onChange={(e) =>
                        onChange(setCell(rows, index, column, e.target.value))
                      }
                      className={`${width(column)} bg-transparent px-2 py-1.5 body-xs text-on-surface outline-none focus:bg-surface-container-highest`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* Wide where the text is long, narrow where it is a flag or a number. */
function width(column: Column) {
  if (
    column === "Description" ||
    column === "Product category" ||
    column.endsWith("URL") ||
    column.startsWith("SEO")
  )
    return "w-80"
  if (column === "Title" || column === "Tags" || column === "Image alt text")
    return "w-56"
  return "w-32"
}

function Head({
  children,
  sticky = false,
}: {
  children: React.ReactNode
  sticky?: boolean
}) {
  return (
    <th
      scope="col"
      className={`border-b border-outline-variant bg-surface-container px-2 py-1.5 label-mono font-normal normal-case whitespace-nowrap text-on-surface-variant ${
        sticky ? "sticky left-0 z-20 border-r" : ""
      }`}
    >
      {children}
    </th>
  )
}
