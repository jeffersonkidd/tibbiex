import { useEffect, useMemo, useRef, useState } from "react"
import type { MouseEvent } from "react"
import {
  CloudUpload,
  Download,
  FileUp,
  KeyRound,
  Package,
  PackagePlus,
  RotateCcw,
} from "lucide-react"
import { toast } from "sonner"

import { formatPrice } from "../../content/shop"
import { castMagicFrom } from "../../lib/magic-dust"
import Button from "../../ui/controls/Button"
import Field from "../../ui/controls/Field"
import PanelHeader from "../../ui/display/PanelHeader"
import { ago } from "../links/ledger"
import { readTag } from "../../content/taxonomy"
import { StudioError, usePasscode } from "../passcode"
import SheetGrid from "./SheetGrid"
import SheetProduct from "./SheetProduct"
import {
  addProduct,
  fetchDesk,
  first,
  fromCsv,
  keepDraft,
  offlineDesk,
  photosOf,
  problems,
  productsOf,
  removeProduct,
  same,
  saveSheet,
  savedDraft,
  tidy,
  toCsv,
  variantRows,
} from "./sheet"
import type { Desk, Product, Row } from "./sheet"

/* The products of a sheet under their designs, by the `design:` tag, in
   sheet order; anything without one is listed last on its own. */
function byDesign(rows: Row[]) {
  const groups = new Map<string, Product[]>()
  for (const product of productsOf(rows)) {
    const key = readTag(first(rows, product).Tags.split(/[,;]/), "design") ?? ""
    groups.set(key, [...(groups.get(key) ?? []), product])
  }
  return [...groups].sort(([a], [b]) => (a ? 0 : 1) - (b ? 0 : 1))
}

/* How many products differ from what was saved: changed, added or gone. */
function countChanges(saved: Row[], rows: Row[]) {
  const shape = (source: Row[]) =>
    new Map(
      productsOf(source).map((product) => [
        product.handle,
        product.rows.map((index) => source[index]),
      ]),
    )
  const before = shape(saved)
  const after = shape(rows)
  let count = 0
  for (const handle of new Set([...before.keys(), ...after.keys()])) {
    if (!same(before.get(handle), after.get(handle))) count++
  }
  return count || (same(saved, rows) ? 0 : 1)
}

function download(rows: Row[]) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `tibbiex-products-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* Module 03. Shopify runs the shop; this is how products get into it. The
   sheet is Shopify's own product CSV, kept here so it can be filled in on a
   phone, saved between visits and checked before it goes: edit it product
   by product or as the whole grid, download it, and import it in Shopify
   under Products → Import. A Shopify export can be uploaded back in, so the
   sheet can start again from what the store holds. Edits pile up as a
   draft in this browser until they are saved. */
export default function SheetDesk() {
  const [desk, setDesk] = useState<Desk | null>(null)
  const [offline, setOffline] = useState(false)
  /* The product open, by the index of its first row: that index survives
     renaming its handle, which a handle would not. */
  const [editing, setEditing] = useState<number | null>(null)
  const [view, setView] = useState<"products" | "sheet">("products")
  const [busy, setBusy] = useState(false)
  const [upload, setUpload] = useState<{
    name: string
    rows: Row[]
    dropped: string[]
    fixed: string[]
  } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const gate = usePasscode()

  /* Reading the sheet needs the passcode too: it holds cost prices and
     stock counts the public site never shows. */
  useEffect(() => {
    gate
      .run(async (passcode) => {
        const loaded = await fetchDesk(passcode)
        const draft = savedDraft(loaded.base)
        if (draft && !same(draft, loaded.rows)) {
          setDesk({ ...loaded, rows: draft })
          toast("Picked up your unsaved edits.")
        } else {
          setDesk(loaded)
        }
      })
      .catch((error) => {
        setOffline(true)
        setDesk(offlineDesk())
        toast.error(
          error instanceof StudioError
            ? error.message
            : "Couldn't open the saved sheet.",
        )
      })
    /* Once, on opening the module. */
  }, [])

  /* Every edit is kept as a draft the moment it is made. */
  useEffect(() => {
    if (!desk) return
    keepDraft(desk.base, same(desk.rows, desk.saved) ? null : desk.rows)
  }, [desk])

  const changes = useMemo(
    () => (desk ? countChanges(desk.saved, desk.rows) : 0),
    [desk],
  )

  if (!desk) {
    return (
      <section className="surface rounded-lg p-panel">
        <p className="label-mono text-on-surface-variant">
          {gate.asking ? "The sheet needs the passcode." : "Opening the sheet…"}
        </p>
        {gate.asking && <PasscodeDock gate={gate} />}
      </section>
    )
  }

  const products = productsOf(desk.rows)
  const blocked = products.filter(
    (product) => problems(desk.rows, product).length > 0,
  )
  const firstSave = desk.base === null
  const dirty = changes > 0 || firstSave

  function setRows(rows: Row[]) {
    setDesk((current) => current && { ...current, rows })
  }

  function add() {
    if (!desk) return
    const next = addProduct(desk.rows)
    setRows(next.rows)
    setEditing(desk.rows.length)
    setView("products")
    window.scrollTo({ top: 0 })
  }

  function discard() {
    setDesk((current) => current && { ...current, rows: current.saved })
    setEditing(null)
    toast("Back to the saved sheet.")
  }

  /* Tidy first, so a price typed "$35" or a Type typed "tee" never stops
     a download; what tidy changed lands in the sheet, to save. */
  function exportCsv() {
    if (!desk) return
    const { rows, fixed } = tidy(desk.rows)
    if (fixed.length) {
      setRows(rows)
      setEditing(null)
    }
    const stuck = productsOf(rows).filter(
      (product) => problems(rows, product).length > 0,
    )
    if (stuck.length) {
      setEditing(stuck[0].rows[0])
      setView("products")
      toast.error(
        `${first(rows, stuck[0]).Title || stuck[0].handle} isn't ready to import yet.`,
      )
      return
    }
    download(rows)
    toast.success("Downloaded. In Shopify: Products → Import.")
    if (fixed.length)
      toast(`Tidied first: ${fixed.join(" ")} Save to keep the tidy sheet.`, {
        duration: 12_000,
      })
  }

  async function pick(file: File | undefined) {
    if (!file) return
    try {
      const parsed = fromCsv(await file.text())
      if (!parsed.rows.length) throw new StudioError("That sheet has no rows.")
      setUpload({ name: file.name, ...parsed })
    } catch (error) {
      toast.error(
        error instanceof StudioError
          ? error.message
          : "Couldn't read that file.",
      )
    }
  }

  async function save(e: MouseEvent<HTMLButtonElement>) {
    if (!desk) return
    setBusy(true)
    try {
      /* Saved tidy, so the store never holds what a download would fix
         (and the server would refuse a handle with capitals in it). */
      const { rows, fixed } = tidy(desk.rows)
      await gate.run(async (passcode) => {
        const next = await saveSheet(passcode, desk.base, rows)
        castMagicFrom(e)
        setDesk(next)
        if (fixed.length) setEditing(null)
        keepDraft(next.base, null)
        toast.success("Saved. Download the CSV when it's ready for Shopify.")
        if (fixed.length)
          toast(`Tidied as it saved: ${fixed.join(" ")}`, { duration: 12_000 })
      })
    } catch (error) {
      toast.error(
        error instanceof StudioError ? error.message : "Something went wrong.",
      )
    } finally {
      setBusy(false)
    }
  }

  const current =
    editing === null
      ? undefined
      : products.find((product) => product.rows[0] === editing)

  return (
    <div className={dirty || gate.asking ? "pb-36" : undefined}>
      {current ? (
        <SheetProduct
          key={editing}
          rows={desk.rows}
          product={current}
          onChange={setRows}
          onRemove={() => {
            setRows(removeProduct(desk.rows, current))
            setEditing(null)
            toast("Taken out of the sheet. Save to keep it that way.")
          }}
          onClose={() => setEditing(null)}
          run={gate.run}
        />
      ) : (
        <section aria-label="Products" className="surface rounded-lg p-panel">
          <PanelHeader
            icon={Package}
            eyebrow="Module 03"
            title="Products"
            sub="Shopify's import sheet. Fill it in here, download it, import it in Shopify."
          />

          <p className="label-mono mt-panel text-on-surface-variant">
            {offline
              ? "Not saved anywhere · this preview can't keep the sheet"
              : firstSave
                ? desk.seededFrom === "studio"
                  ? "Filled from the shop you ran here · save once to keep it"
                  : "Filled from the site's catalogue · save once to keep it"
                : `Saved ${desk.savedAt ? ago(+new Date(desk.savedAt)) : ""}`}
          </p>

          <div className="mt-part flex flex-wrap gap-cluster">
            <Button
              tone="secondary"
              shape="inline"
              icon={Download}
              onClick={exportCsv}
            >
              Download CSV
            </Button>
            <Button
              tone="secondary"
              shape="inline"
              icon={FileUp}
              onClick={() => fileRef.current?.click()}
            >
              Upload a CSV
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
              hidden
              onChange={(e) => {
                pick(e.target.files?.[0])
                e.target.value = ""
              }}
            />
          </div>

          {upload && (
            <div className="mt-part rounded-md border border-tertiary/50 p-card">
              <p className="body-small">
                Replace the whole sheet with{" "}
                <span className="body-small-bold">
                  {productsOf(upload.rows).length} products
                </span>{" "}
                from {upload.name}?
              </p>
              {upload.dropped.length > 0 && (
                <p className="body-xs mt-1 text-on-surface-variant">
                  These columns aren't in Shopify's template and will be left
                  out: {upload.dropped.join(", ")}.
                </p>
              )}
              {upload.fixed.length > 0 && (
                <div className="body-xs mt-1 text-on-surface-variant">
                  <p>Tidied on the way in:</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4">
                    {upload.fixed.map((fix) => (
                      <li key={fix}>{fix}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-cluster flex gap-cluster">
                <Button
                  shape="inline"
                  onClick={() => {
                    setRows(upload.rows)
                    setUpload(null)
                    setEditing(null)
                    toast("Sheet replaced. Save to keep it.")
                  }}
                >
                  Replace it
                </Button>
                <Button
                  tone="secondary"
                  shape="inline"
                  onClick={() => setUpload(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div
            className="mt-panel flex gap-glyph"
            role="group"
            aria-label="View"
          >
            {(
              [
                { id: "products", label: "Products" },
                { id: "sheet", label: "Sheet" },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={view === option.id}
                onClick={() => setView(option.id)}
                className={`studio-toggle inline-flex items-center rounded-md border px-3 py-2 body-xs-bold ${
                  view === option.id ? "is-on" : ""
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-part">
            {view === "sheet" ? (
              <SheetGrid rows={desk.rows} onChange={setRows} />
            ) : (
              <div className="space-y-panel">
                {byDesign(desk.rows).map(([design, members]) => (
                  <div key={design || "none"}>
                    <h3 className="label-mono mb-1.5 normal-case text-tertiary">
                      {design ? `design:${design}` : "No design: tag"}
                    </h3>
                    <ul className="space-y-1.5">
                      {members.map((product) => (
                        <ProductRow
                          key={product.rows[0]}
                          rows={desk.rows}
                          product={product}
                          changed={
                            !firstSave &&
                            !same(
                              desk.saved.filter(
                                (row) => row["URL handle"] === product.handle,
                              ),
                              product.rows.map((index) => desk.rows[index]),
                            )
                          }
                          onOpen={() => {
                            setEditing(product.rows[0])
                            window.scrollTo({ top: 0 })
                          }}
                        />
                      ))}
                    </ul>
                  </div>
                ))}
                {products.length === 0 && (
                  <p className="body-small text-on-surface-variant">
                    The sheet is empty. Add a product, or upload a CSV.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-panel">
            <Button icon={PackagePlus} onClick={add}>
              Add a product
            </Button>
          </div>
        </section>
      )}

      {(dirty || gate.asking) && !offline && (
        <div className="studio-dock fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4 sm:px-6">
          <div className="surface w-full max-w-[568px] space-y-cluster rounded-lg p-card">
            {gate.asking ? (
              <PasscodeDock gate={gate} />
            ) : (
              <>
                <div className="flex items-center justify-between gap-part">
                  <span className="label-mono text-on-surface-variant">
                    {firstSave
                      ? "Not saved yet"
                      : `${changes} ${changes === 1 ? "product" : "products"} changed, not saved`}
                  </span>
                  {changes > 0 && !firstSave && (
                    <Button
                      tone="secondary"
                      shape="inline"
                      icon={RotateCcw}
                      onClick={discard}
                      disabled={busy}
                    >
                      Discard
                    </Button>
                  )}
                </div>
                <Button icon={CloudUpload} onClick={save} disabled={busy}>
                  {busy ? "Saving…" : "Save the sheet"}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PasscodeDock({ gate }: { gate: ReturnType<typeof usePasscode> }) {
  return (
    <form
      className="space-y-1.5"
      onSubmit={async (e) => {
        e.preventDefault()
        try {
          await gate.unlock()
        } catch (error) {
          toast.error(
            error instanceof StudioError
              ? error.message
              : "Something went wrong.",
          )
        }
      }}
    >
      <div className="flex items-start gap-cluster">
        <div className="min-w-0 flex-1">
          <Field
            type="password"
            label="Studio passcode"
            placeholder="Studio passcode"
            autoComplete="current-password"
            value={gate.passcode}
            onChange={gate.setPasscode}
            invalid={Boolean(gate.error)}
            required={false}
            size="sm"
          />
        </div>
        <div className="shrink-0">
          <Button type="submit" icon={KeyRound}>
            Unlock
          </Button>
        </div>
      </div>
      <p
        className={`body-xs ${gate.error ? "text-error" : "text-on-surface-variant"}`}
      >
        {gate.error ||
          "Asked once on this device, so only you can change the sheet."}{" "}
        <button
          type="button"
          onClick={gate.cancel}
          className="underline underline-offset-2"
        >
          Not now
        </button>
      </p>
    </form>
  )
}

function ProductRow({
  rows,
  product,
  changed,
  onOpen,
}: {
  rows: Row[]
  product: Product
  changed: boolean
  onOpen: () => void
}) {
  const head = first(rows, product)
  const issues = problems(rows, product)
  const prices = variantRows(rows, product)
    .map((index) => Number(rows[index].Price))
    .filter((price) => Number.isFinite(price) && price > 0)
  const variants = variantRows(rows, product).length
  const low = prices.length ? Math.min(...prices) : undefined
  const facts = [
    head.Type || "No Type",
    low === undefined
      ? "No price yet"
      : prices.some((price) => price !== low)
        ? `from ${formatPrice(low)}`
        : formatPrice(low),
    variants > 1 && `${variants} variants`,
  ].filter(Boolean)
  const cover = photosOf(rows, product)[0]?.url
  const status = head.Status.trim().toLowerCase()
  const unpublished =
    head["Published on online store"].trim().toLowerCase() === "false"

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={`studio-row group flex w-full min-w-0 items-center gap-part rounded-md border border-outline-variant bg-surface-container-low/60 p-2 text-left transition-colors hover:border-tertiary ${
          status !== "active" || unpublished ? "is-hidden" : ""
        }`}
      >
        <span className="size-14 shrink-0 overflow-hidden rounded-sm border border-outline-variant bg-surface-container-highest">
          {cover && (
            <img
              src={cover}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-glyph">
            <span className="body-small-bold truncate">
              {head.Title || product.handle || "Untitled"}
            </span>
            {changed && (
              <span
                className="studio-dot studio-dot-wired shrink-0"
                title="Changed since the sheet was saved"
              />
            )}
          </span>
          <span className="label-mono mt-0.5 block truncate text-on-surface-variant">
            {facts.join(" · ")}
          </span>
          {(status !== "active" || unpublished || issues.length > 0) && (
            <span className="mt-1 flex flex-wrap gap-glyph">
              {status !== "active" && <Tag>{head.Status || "No status"}</Tag>}
              {status === "active" && unpublished && <Tag>Not published</Tag>}
              {issues.length > 0 && <Tag alert>{issues[0]}</Tag>}
            </span>
          )}
        </span>
      </button>
    </li>
  )
}

function Tag({
  children,
  alert = false,
}: {
  children: React.ReactNode
  alert?: boolean
}) {
  return (
    <span
      className={`label-mono inline-flex items-center gap-1 rounded-xs border px-1.5 py-0.5 normal-case ${
        alert
          ? "border-error/50 text-error"
          : "border-outline-variant text-on-surface-variant"
      }`}
    >
      {children}
    </span>
  )
}
