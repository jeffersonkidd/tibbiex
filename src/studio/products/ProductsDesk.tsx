import { useEffect, useMemo, useState } from "react"
import type { MouseEvent } from "react"
import {
  ArrowDown,
  ArrowUp,
  CloudUpload,
  EyeOff,
  KeyRound,
  Package,
  PackagePlus,
  RotateCcw,
} from "lucide-react"
import { toast } from "sonner"

import { PORTFOLIO } from "../../content/portfolio"
import { formatPrice } from "../../content/shop"
import { castMagicFrom } from "../../lib/magic-dust"
import type { CatalogItem } from "../../lib/catalog"
import Button from "../../ui/controls/Button"
import Field from "../../ui/controls/Field"
import PanelHeader from "../../ui/display/PanelHeader"
import { ago } from "../links/ledger"
import { StudioError, usePasscode } from "../passcode"
import ProductEditor from "./ProductEditor"
import {
  fetchDesk,
  keepDraft,
  newItem,
  problems,
  publish,
  same,
  savedDraft,
  tidy,
} from "./products"
import type { Desk } from "./products"

/* The shelves as the Buy tab groups them: each band in portfolio order,
   then Art. Order within a shelf is the order on the site. */
function shelvesOf(items: CatalogItem[]) {
  const shelves = [
    ...PORTFOLIO.map((entry) => ({
      key: entry.id,
      title: entry.band,
      match: (item: CatalogItem) =>
        item.shelf === "bands" && item.band === entry.id,
    })),
    {
      key: "art",
      title: "Art",
      match: (item: CatalogItem) => item.shelf === "art",
    },
  ]
  const placed = new Set<string>()
  const groups = shelves.map((shelf) => {
    const entries = items.filter(shelf.match)
    entries.forEach((item) => placed.add(item.id))
    return { key: shelf.key, title: shelf.title, items: entries }
  })
  /* A band no longer in the portfolio: still listed, so it can be moved. */
  const stray = items.filter((item) => !placed.has(item.id))
  if (stray.length)
    groups.push({ key: "elsewhere", title: "No shelf", items: stray })
  return groups
}

const priceRange = (item: CatalogItem) => {
  const prices = item.formats.map((format) => format.price)
  if (!prices.length) return "No price yet"
  const low = Math.min(...prices)
  return prices.length > 1 && Math.max(...prices) !== low
    ? `from ${formatPrice(low)}`
    : formatPrice(low)
}

/* Module 03. The shop's back room: every product on its shelf, a tap to open
   one, and one publish that puts the whole catalogue live. Edits pile up as
   a draft -- kept in this browser, so nothing is lost to a closed tab -- and
   reach the site only when published, within a minute. */
export default function ProductsDesk() {
  const [desk, setDesk] = useState<Desk | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const gate = usePasscode()

  useEffect(() => {
    fetchDesk().then((loaded) => {
      const draft = savedDraft(loaded.base)
      if (draft && !same(draft, loaded.items)) {
        setDesk({ ...loaded, items: draft })
        toast("Picked up your unpublished edits.")
      } else {
        setDesk(loaded)
      }
    })
  }, [])

  /* Every edit is kept as a draft the moment it is made. */
  useEffect(() => {
    if (!desk) return
    keepDraft(desk.base, same(desk.items, desk.published) ? null : desk.items)
  }, [desk])

  const changes = useMemo(() => {
    if (!desk) return 0
    const before = new Map(desk.published.map((item) => [item.id, item]))
    const after = new Set(desk.items.map((item) => item.id))
    let count = desk.published.filter((item) => !after.has(item.id)).length
    for (const item of desk.items) {
      if (!same(before.get(item.id), item)) count++
    }
    const reordered =
      count === 0 &&
      !same(
        desk.items.map((item) => item.id),
        desk.published.map((item) => item.id),
      )
    return count || (reordered ? 1 : 0)
  }, [desk])

  if (!desk) {
    return (
      <section className="surface rounded-lg p-panel">
        <p className="label-mono text-muted-foreground">Opening the shop…</p>
      </section>
    )
  }

  const blocked = desk.items.filter((item) => problems(item).length > 0)
  const firstPublish = desk.base === null

  function patch(id: string, update: (item: CatalogItem) => CatalogItem) {
    setDesk(
      (current) =>
        current && {
          ...current,
          items: current.items.map((item) =>
            item.id === id ? update(item) : item,
          ),
        },
    )
  }

  function add() {
    const item = newItem()
    setDesk(
      (current) => current && { ...current, items: [...current.items, item] },
    )
    setEditing(item.id)
    window.scrollTo({ top: 0 })
  }

  function remove(id: string) {
    setDesk(
      (current) =>
        current && {
          ...current,
          items: current.items.filter((item) => item.id !== id),
        },
    )
    setEditing(null)
    toast("Deleted from the draft. Publish to take it off the site.")
  }

  /* Swap with the neighbour on the same shelf, which is what moves it on
     the site; items on other shelves in between are left where they are. */
  function nudge(id: string, direction: -1 | 1) {
    setDesk((current) => {
      if (!current) return current
      const group = shelvesOf(current.items).find((g) =>
        g.items.some((item) => item.id === id),
      )!
      const at = group.items.findIndex((item) => item.id === id)
      const other = group.items[at + direction]
      if (!other) return current
      const items = [...current.items]
      const a = items.findIndex((item) => item.id === id)
      const b = items.findIndex((item) => item.id === other.id)
      ;[items[a], items[b]] = [items[b], items[a]]
      return { ...current, items }
    })
  }

  function discard() {
    setDesk((current) => current && { ...current, items: current.published })
    setEditing(null)
    toast("Back to what's live.")
  }

  async function goLive(e: MouseEvent<HTMLButtonElement>) {
    if (!desk) return
    if (blocked.length) {
      setEditing(blocked[0].id)
      toast.error(`${blocked[0].item || "A new product"} isn't finished yet.`)
      return
    }
    setBusy(true)
    const items = desk.items.map(tidy)
    try {
      await gate.run(async (passcode) => {
        const next = await publish(passcode, desk.base, items)
        castMagicFrom(e)
        setDesk(next)
        keepDraft(next.base, null)
        toast.success("The shop is updated. Visitors see it within a minute.")
      })
    } catch (error) {
      toast.error(
        error instanceof StudioError ? error.message : "Something went wrong.",
      )
    } finally {
      setBusy(false)
    }
  }

  const current = editing
    ? desk.items.find((item) => item.id === editing)
    : undefined
  const dirty = changes > 0 || firstPublish

  return (
    <div className={dirty || gate.asking ? "pb-36" : undefined}>
      {current ? (
        <ProductEditor
          key={current.id}
          item={current}
          isNew={!desk.published.some((item) => item.id === current.id)}
          onChange={(update) => patch(current.id, update)}
          onRemove={() => remove(current.id)}
          onClose={() => setEditing(null)}
          run={gate.run}
        />
      ) : (
        <section aria-label="Products" className="surface rounded-lg p-panel">
          <PanelHeader
            icon={Package}
            eyebrow="Module 03"
            title="Products"
            sub="Your shop. Add a piece, change a price, sell out a size."
          />

          <p className="label-mono mt-panel text-muted-foreground">
            {firstPublish
              ? "Built-in shop · publish once to run it from here"
              : `Live · published ${desk.publishedAt ? ago(+new Date(desk.publishedAt)) : ""}`}
          </p>

          <div className="mt-part space-y-panel">
            {shelvesOf(desk.items)
              .filter((group) => group.items.length > 0)
              .map((group) => (
                <div key={group.key}>
                  <h3 className="label-mono mb-1.5 text-accent">
                    {group.title}
                  </h3>
                  <ul className="space-y-1.5">
                    {group.items.map((item, index) => (
                      <ProductRow
                        key={item.id}
                        item={item}
                        changed={
                          !same(
                            desk.published.find((p) => p.id === item.id),
                            item,
                          )
                        }
                        first={index === 0}
                        last={index === group.items.length - 1}
                        onOpen={() => {
                          setEditing(item.id)
                          window.scrollTo({ top: 0 })
                        }}
                        onMove={(direction) => nudge(item.id, direction)}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            {desk.items.length === 0 && (
              <p className="body-small text-muted-foreground">
                Nothing in the shop yet. Add your first piece.
              </p>
            )}
          </div>

          <div className="mt-panel">
            <Button icon={PackagePlus} onClick={add}>
              Add a product
            </Button>
          </div>
        </section>
      )}

      {(dirty || gate.asking) && (
        <div className="studio-dock fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4 sm:px-6">
          <div className="surface w-full max-w-[568px] space-y-cluster rounded-lg p-card">
            {gate.asking ? (
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
                  className={`body-xs ${gate.error ? "text-primary-bright" : "text-muted-foreground"}`}
                >
                  {gate.error ||
                    "Asked once on this device, so only you can change the shop."}{" "}
                  <button
                    type="button"
                    onClick={gate.cancel}
                    className="underline underline-offset-2"
                  >
                    Not now
                  </button>
                </p>
              </form>
            ) : (
              <>
                <div className="flex items-center justify-between gap-part">
                  <span className="label-mono text-muted-foreground">
                    {firstPublish && changes === 0
                      ? "Not published yet"
                      : `${changes} ${changes === 1 ? "change" : "changes"} not on the site yet`}
                  </span>
                  {changes > 0 && (
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
                <Button icon={CloudUpload} onClick={goLive} disabled={busy}>
                  {busy ? "Publishing…" : "Publish to the shop"}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ProductRow({
  item,
  changed,
  first,
  last,
  onOpen,
  onMove,
}: {
  item: CatalogItem
  changed: boolean
  first: boolean
  last: boolean
  onOpen: () => void
  onMove: (direction: -1 | 1) => void
}) {
  const issues = problems(item)
  const soldOut = item.stock?.left === 0
  const facts = [
    priceRange(item),
    item.formats.length > 1 && `${item.formats.length} formats`,
    item.stock && !soldOut && `${item.stock.left} of ${item.stock.of} left`,
  ].filter(Boolean)

  return (
    <li className="flex items-stretch gap-1.5">
      <button
        type="button"
        onClick={onOpen}
        className={`studio-row group flex min-w-0 flex-1 items-center gap-part rounded-md border border-border bg-card/60 p-2 text-left transition-colors hover:border-accent ${
          item.hidden ? "is-hidden" : ""
        }`}
      >
        <span className="size-14 shrink-0 overflow-hidden rounded-sm border border-border bg-muted">
          {item.image && (
            <img
              src={item.image}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-glyph">
            <span className="body-small-bold truncate">
              {item.item || "Untitled"}
            </span>
            {changed && (
              <span
                className="studio-dot studio-dot-wired shrink-0"
                title="Changed since it was published"
              />
            )}
          </span>
          <span className="label-mono mt-0.5 block truncate text-muted-foreground">
            {facts.join(" · ")}
          </span>
          {(item.hidden || soldOut || issues.length > 0) && (
            <span className="mt-1 flex flex-wrap gap-glyph">
              {item.hidden && (
                <Tag>
                  <EyeOff className="size-3" /> Hidden
                </Tag>
              )}
              {soldOut && <Tag>Sold out</Tag>}
              {issues.length > 0 && <Tag alert>{issues[0]}</Tag>}
            </span>
          )}
        </span>
      </button>
      <span className="flex flex-col gap-1">
        <MoveKey
          label={`Move ${item.item || "it"} up`}
          disabled={first}
          onClick={() => onMove(-1)}
        >
          <ArrowUp className="size-3.5" />
        </MoveKey>
        <MoveKey
          label={`Move ${item.item || "it"} down`}
          disabled={last}
          onClick={() => onMove(1)}
        >
          <ArrowDown className="size-3.5" />
        </MoveKey>
      </span>
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
      className={`label-mono inline-flex items-center gap-1 rounded-xs border px-1.5 py-0.5 ${
        alert
          ? "border-primary/50 text-primary-bright"
          : "border-border text-muted-foreground"
      }`}
    >
      {children}
    </span>
  )
}

function MoveKey({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex w-8 flex-1 items-center justify-center rounded-md border border-border bg-card/60 text-muted-foreground transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  )
}
