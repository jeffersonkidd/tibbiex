import { useState } from "react"
import { ChevronLeft, Eye, EyeOff, ImageOff, Plus, Trash2 } from "lucide-react"

import { PORTFOLIO } from "../../content/portfolio"
import { toShopItem } from "../../lib/catalog"
import type { CatalogItem } from "../../lib/catalog"
import Button from "../../ui/controls/Button"
import Field from "../../ui/controls/Field"
import TextArea from "../../ui/controls/TextArea"
import ShopCard from "../../ui/cards/ShopCard"
import type { Write } from "../passcode"
import FormatCard from "./FormatCard"
import PhotoShelf from "./PhotoShelf"
import { FORMAT_PRESETS, newFormat, problems, tidy } from "./products"

/* Where a piece sits: one of the bands, or Art. */
const SHELVES = [
  ...PORTFOLIO.map((entry) => ({ id: entry.id, label: entry.band })),
  { id: "art", label: "Art" },
]

const ASPECTS = [
  { id: "square", label: "Square" },
  { id: "portrait", label: "Tall" },
  { id: "landscape", label: "Wide" },
] as const

/* One product, every field it has. Edits apply to the draft as they are
   made -- nothing here saves on its own -- and the card at the top is the
   site's own ShopCard drawn from the draft, so what she sees is what the
   Buy tab will show once it is published. */
export default function ProductEditor({
  item,
  isNew,
  onChange,
  onRemove,
  onClose,
  run,
}: {
  item: CatalogItem
  isNew: boolean
  onChange: (update: (item: CatalogItem) => CatalogItem) => void
  onRemove: () => void
  onClose: () => void
  run: (write: Write) => Promise<void>
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const set = (patch: Partial<CatalogItem>) =>
    onChange((current) => ({ ...current, ...patch }))
  const issues = problems(item)
  const shelf = item.shelf === "art" ? "art" : (item.band ?? "")
  const preview = item.gallery.length ? toShopItem(tidy(item)) : null
  const taken = item.formats.map((format) => format.id)

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
        <span className="label-mono text-muted-foreground">
          {isNew
            ? "New, not on the site yet"
            : item.hidden
              ? "Hidden"
              : "On the site"}
        </span>
      </div>

      <div className="studio-preview surface rounded-lg p-panel">
        <p className="label-mono mb-part text-muted-foreground">
          How it shows in the shop
        </p>
        <div className="mx-auto w-full max-w-64">
          {preview ? (
            <ShopCard item={preview} onOpen={() => {}} />
          ) : (
            <div className="surface flex aspect-square flex-col items-center justify-center gap-glyph rounded-lg text-muted-foreground">
              <ImageOff className="size-6" />
              <span className="body-xs">Add a photo to see the card</span>
            </div>
          )}
        </div>
      </div>

      <Panel title="Photos" hint="The first is the cover. Drop, paste or pick.">
        <PhotoShelf
          gallery={item.gallery}
          onChange={(gallery) =>
            onChange((current) => ({ ...current, gallery }))
          }
          run={run}
        />
        <fieldset className="mt-part">
          <legend className="label-mono mb-1.5 text-muted-foreground">
            Cover shape on the card
          </legend>
          <Toggles
            options={ASPECTS}
            value={item.aspect ?? "square"}
            onPick={(aspect) => set({ aspect })}
          />
        </fieldset>
      </Panel>

      <Panel title="The piece">
        <div className="space-y-cluster">
          <Field
            type="text"
            label="Name"
            placeholder="Name, e.g. Vampire Cats"
            value={item.item}
            onChange={(name) => set({ item: name })}
            invalid={!item.item.trim()}
            required={false}
          />
          <TextArea
            label="Description"
            placeholder="A line or two under the price. What is it, what's the story?"
            rows={3}
            value={item.blurb ?? ""}
            onChange={(blurb) => set({ blurb })}
            maxLength={400}
            required={false}
          />
          <TextArea
            label="Photo description"
            placeholder="What the cover shows, for anyone who can't see it."
            rows={2}
            value={item.alt ?? ""}
            onChange={(alt) => set({ alt })}
            maxLength={400}
            required={false}
          />
        </div>

        <fieldset className="mt-part">
          <legend className="label-mono mb-1.5 text-muted-foreground">
            Shelf
          </legend>
          <Toggles
            options={SHELVES}
            value={shelf}
            /* Moving onto Art drops the band; an art piece that already
               names one keeps it, since there it says whose mark is on it. */
            onPick={(id) =>
              id === "art"
                ? item.shelf !== "art" && set({ shelf: "art", band: undefined })
                : set({ shelf: "bands", band: id })
            }
          />
        </fieldset>
      </Panel>

      <Panel
        title="Formats and prices"
        hint="Each way it's sold. Prices are whole dollars, before shipping."
      >
        <div className="space-y-cluster">
          {item.formats.map((format, index) => (
            <FormatCard
              key={format.id}
              format={format}
              gallery={item.gallery}
              onChange={(next) =>
                onChange((current) => ({
                  ...current,
                  formats: current.formats.map((f, i) =>
                    i === index ? next : f,
                  ),
                }))
              }
              onRemove={() =>
                onChange((current) => ({
                  ...current,
                  formats: current.formats.filter((_, i) => i !== index),
                }))
              }
            />
          ))}
        </div>
        {item.formats.length < 8 && (
          <div className="mt-part">
            <p className="label-mono mb-1.5 text-muted-foreground">
              Add a format
            </p>
            <div className="flex flex-wrap gap-glyph">
              {FORMAT_PRESETS.filter(
                (preset) =>
                  preset.id === "custom" || !taken.includes(preset.id),
              ).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() =>
                    onChange((current) => ({
                      ...current,
                      formats: [
                        ...current.formats,
                        newFormat(
                          preset.id,
                          current.formats.map((f) => f.id),
                        ),
                      ],
                    }))
                  }
                  className="studio-toggle inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 body-xs-bold"
                >
                  <Plus className="size-3" /> {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </Panel>

      <Panel title="Run and shipping">
        <label className="flex items-center gap-part body-small">
          <input
            type="checkbox"
            checked={Boolean(item.stock)}
            onChange={(e) =>
              set({
                stock: e.target.checked ? { left: 20, of: 20 } : undefined,
              })
            }
            className="studio-check"
          />
          A numbered or limited run
        </label>
        {item.stock && (
          <div className="mt-part flex items-center gap-cluster body-small text-muted-foreground">
            <NumberBox
              label="How many are left"
              value={item.stock.left}
              onChange={(left) => set({ stock: { ...item.stock!, left } })}
            />
            <span>left of</span>
            <NumberBox
              label="How many were made"
              value={item.stock.of}
              onChange={(of) => set({ stock: { ...item.stock!, of } })}
            />
            {item.stock.left === 0 && (
              <span className="label-mono text-primary-bright">Sold out</span>
            )}
          </div>
        )}
        <div className="mt-part">
          <Field
            type="text"
            label="Shipping note"
            placeholder="Shipping note, e.g. Ships in 5 days (optional)"
            value={item.ships ?? ""}
            onChange={(ships) => set({ ships })}
            required={false}
            size="sm"
          />
        </div>
      </Panel>

      <Panel title="On the site">
        <Toggles
          options={[
            { id: "shown", label: "Showing", icon: Eye },
            { id: "hidden", label: "Hidden", icon: EyeOff },
          ]}
          value={item.hidden ? "hidden" : "shown"}
          onPick={(id) => set({ hidden: id === "hidden" ? true : undefined })}
        />
        <p className="body-xs mt-1.5 text-muted-foreground">
          Hidden keeps it here, off the shelves. New pieces start hidden so you
          can get them right first.
        </p>
      </Panel>

      {issues.length > 0 && (
        <div
          role="status"
          className="rounded-md border border-primary/50 bg-primary/10 p-card"
        >
          <p className="label-mono mb-1 text-primary-bright">
            Before it can go up
          </p>
          <ul className="body-xs list-inside list-disc space-y-0.5 text-foreground">
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
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
          {confirmDelete ? "Tap again to delete it" : "Delete this product"}
        </Button>
      </div>
    </section>
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
      {hint && <p className="body-xs mt-0.5 text-muted-foreground">{hint}</p>}
      <div className="mt-part">{children}</div>
    </div>
  )
}

function Toggles<Id extends string>({
  options,
  value,
  onPick,
}: {
  options: readonly {
    id: Id
    label: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  value: string
  onPick: (id: Id) => void
}) {
  return (
    <div className="flex flex-wrap gap-glyph">
      {options.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-pressed={value === id}
          onClick={() => onPick(id)}
          className={`studio-toggle inline-flex items-center gap-1.5 rounded-md border px-3 py-2 body-xs-bold ${
            value === id ? "is-on" : ""
          }`}
        >
          {Icon && <Icon className="size-3.5" />}
          {label}
        </button>
      ))}
    </div>
  )
}

function NumberBox({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      step={1}
      aria-label={label}
      value={Number.isFinite(value) ? value : ""}
      onChange={(e) => onChange(Math.round(Number(e.target.value)))}
      className="w-20 rounded-md border border-border bg-input-background px-2 py-2 body-small-bold text-foreground outline-none focus:border-accent"
    />
  )
}
