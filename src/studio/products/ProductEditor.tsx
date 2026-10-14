import { useRef, useState } from "react"
import type { ReactNode } from "react"
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { ASPECTS, LIMITS } from "../../../api/_lib/catalog.js"
import type {
  CatalogFormat,
  Mail,
  Product,
  Shelf,
} from "../../../api/_lib/catalog.js"
import { SHIPPING } from "../../content/payments"
import { PORTFOLIO } from "../../content/portfolio"
import { toShopItem } from "../../lib/catalog"
import Button from "../../ui/controls/Button"
import Chip from "../../ui/controls/Chip"
import Field, { FIELD_TREATMENT } from "../../ui/controls/Field"
import ShopCard from "../../ui/cards/ShopCard"
import { PRESETS, formatId, uploadPhoto } from "./products"

const SHELF_CHOICES: { id: Shelf; label: string }[] = [
  { id: "art", label: "Art" },
  ...PORTFOLIO.map((entry) => ({ id: entry.id, label: entry.band })),
]

const MAIL_CHOICES: { id: Mail; label: string }[] = [
  { id: "letter", label: "Letter" },
  { id: "flat", label: "Flat" },
  { id: "parcel", label: "Parcel" },
]

const ASPECT_LABEL = { square: "Square", portrait: "Tall", landscape: "Wide" }

/* One product, edited in place. Everything here changes a draft; nothing
   reaches the shop until Save, which hands the draft back to the module to
   store with the rest of the catalogue. Photos are the exception -- they
   upload as soon as they are picked, because a product's photos are URLs. */
export default function ProductEditor({
  initial,
  isNew,
  passcode,
  needPasscode,
  saving,
  onSave,
  onDelete,
  onClose,
}: {
  initial: Product
  isNew: boolean
  passcode: string
  /* Asks for the passcode; resolves false when there is none to use. */
  needPasscode: () => boolean
  saving: boolean
  onSave: (product: Product) => void
  onDelete: () => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState(initial)
  const [uploading, setUploading] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial)

  const set = (patch: Partial<Product>) => setDraft((d) => ({ ...d, ...patch }))
  const setFormat = (id: string, patch: Partial<CatalogFormat>) =>
    setDraft((d) => ({
      ...d,
      formats: d.formats.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }))

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return
    if (!needPasscode()) return
    const room = LIMITS.photos - draft.photos.length
    const picked = Array.from(files).slice(0, room)
    if (picked.length < files.length) {
      toast(`A product holds up to ${LIMITS.photos} photos.`)
    }
    setUploading((n) => n + picked.length)
    await Promise.all(
      picked.map(async (file) => {
        try {
          const url = await uploadPhoto(passcode, file)
          setDraft((d) => ({ ...d, photos: [...d.photos, url] }))
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Upload failed.")
        } finally {
          setUploading((n) => n - 1)
        }
      }),
    )
  }

  function removePhoto(url: string) {
    setDraft((d) => ({
      ...d,
      photos: d.photos.filter((p) => p !== url),
      /* A format pointing at the removed photo goes back to the cover. */
      formats: d.formats.map((f) =>
        f.photo === url ? { ...f, photo: undefined } : f,
      ),
    }))
  }

  function makeCover(url: string) {
    setDraft((d) => ({
      ...d,
      photos: [url, ...d.photos.filter((p) => p !== url)],
    }))
  }

  function addFormat(make: () => Omit<CatalogFormat, "id">) {
    setDraft((d) => {
      const format = make()
      return {
        ...d,
        formats: [...d.formats, { ...format, id: formatId(d, format.label) }],
      }
    })
  }

  const preview =
    draft.photos.length && draft.formats.length ? toShopItem(draft) : null

  return (
    <div className="space-y-stack pb-24">
      <div className="flex items-center gap-part">
        <Button
          tone="secondary"
          shape="icon"
          name="All products"
          icon={ArrowLeft}
          onClick={onClose}
        />
        <h2 className="heading-l min-w-0 flex-1 truncate">
          {draft.name || (isNew ? "New product" : "Untitled")}
        </h2>
      </div>

      <Section
        title="Photos"
        hint="The first one is the cover. Tap a photo to make it the cover."
      >
        <div className="hide-scrollbar -mx-1 flex gap-cluster overflow-x-auto px-1 pb-1">
          {draft.photos.map((url, i) => (
            <div key={url} className="relative shrink-0">
              <button
                type="button"
                onClick={() => makeCover(url)}
                aria-label={
                  i === 0 ? "Cover photo" : `Make photo ${i + 1} the cover`
                }
                className={`block size-24 overflow-hidden rounded-md border ${
                  i === 0 ? "border-accent" : "border-border"
                }`}
              >
                <img src={url} alt="" className="size-full object-cover" />
              </button>
              {i === 0 && (
                <span className="label-mono-xs absolute bottom-1 left-1 flex items-center gap-0.5 rounded-xs bg-accent px-1 py-0.5 text-accent-foreground">
                  <Star className="size-2.5" aria-hidden /> Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => removePhoto(url)}
                aria-label={`Remove photo ${i + 1}`}
                className="absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          {Array.from({ length: uploading }, (_, i) => (
            <div
              key={`up-${i}`}
              className="flex size-24 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground"
            >
              <Loader2 className="size-5 animate-spin" aria-label="Uploading" />
            </div>
          ))}
          {draft.photos.length + uploading < LIMITS.photos && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex size-24 shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border-strong text-muted-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <ImagePlus className="size-5" />
              <span className="body-xs-bold">Add</span>
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            addPhotos(e.target.files)
            e.target.value = ""
          }}
        />
        <Label text="Card shape">
          <div className="grid grid-cols-3 gap-cluster">
            {ASPECTS.map((aspect) => (
              <Chip
                key={aspect}
                pressed={draft.aspect === aspect}
                onClick={() => set({ aspect })}
              >
                {ASPECT_LABEL[aspect]}
              </Chip>
            ))}
          </div>
        </Label>
      </Section>

      <Section title="About it">
        <Label text="Name">
          <Field
            type="text"
            placeholder="Vampire Cats"
            label="Name"
            value={draft.name}
            onChange={(name) => set({ name })}
            required={false}
          />
        </Label>
        <Label text="Shelf">
          <div className="grid grid-cols-2 gap-cluster">
            {SHELF_CHOICES.map((shelf) => (
              <Chip
                key={shelf.id}
                pressed={draft.shelf === shelf.id}
                onClick={() => set({ shelf: shelf.id })}
              >
                {shelf.label}
              </Chip>
            ))}
          </div>
        </Label>
        <Label text="Description" hint="A line or two under the price.">
          <TextBox
            value={draft.blurb}
            onChange={(blurb) => set({ blurb })}
            placeholder="What it is, who made it, what makes it worth having."
            label="Description"
          />
        </Label>
        <Label
          text="What the cover shows"
          hint="Read aloud to people who can't see the photo."
        >
          <TextBox
            value={draft.alt}
            onChange={(alt) => set({ alt })}
            placeholder="Two red cats in spiked collars, fangs out…"
            label="What the cover shows"
            rows={2}
          />
        </Label>
      </Section>

      <Section
        title="What's for sale"
        hint="Each way you sell it: a sticker, a patch, a tee. Prices are whole dollars, before shipping."
      >
        {draft.formats.map((format) => (
          <FormatCard
            key={format.id}
            format={format}
            photos={draft.photos}
            onChange={(patch) => setFormat(format.id, patch)}
            onRemove={() =>
              set({ formats: draft.formats.filter((f) => f.id !== format.id) })
            }
          />
        ))}
        {draft.formats.length < LIMITS.formats && (
          <div>
            <p className="label-mono mb-2 text-muted-foreground">
              Add a format
            </p>
            <div className="flex flex-wrap gap-cluster">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => addFormat(preset.make)}
                  className="flex items-center gap-1 rounded-md border border-border bg-input-background px-3 py-2 body-xs-bold text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  <Plus className="size-3.5" aria-hidden /> {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section title="In the shop">
        <Label text="Showing">
          <div className="grid grid-cols-2 gap-cluster">
            <Chip pressed={draft.live} onClick={() => set({ live: true })}>
              Live
            </Chip>
            <Chip pressed={!draft.live} onClick={() => set({ live: false })}>
              Hidden
            </Chip>
          </div>
        </Label>
        <Label
          text="Limited run"
          hint="A numbered or limited batch. At zero left it shows as sold out."
        >
          <div className="grid grid-cols-2 gap-cluster">
            <Chip
              pressed={!draft.stock}
              onClick={() => set({ stock: undefined })}
            >
              No limit
            </Chip>
            <Chip
              pressed={Boolean(draft.stock)}
              onClick={() =>
                !draft.stock && set({ stock: { left: 20, of: 20 } })
              }
            >
              Limited
            </Chip>
          </div>
          {draft.stock && (
            <div className="mt-cluster grid grid-cols-2 gap-cluster">
              <NumberBox
                label="Left"
                value={draft.stock.left}
                onChange={(left) => set({ stock: { ...draft.stock!, left } })}
              />
              <NumberBox
                label="Made"
                value={draft.stock.of}
                onChange={(of) => set({ stock: { ...draft.stock!, of } })}
              />
            </div>
          )}
        </Label>
      </Section>

      <Section
        title="How fans see it"
        hint={draft.live ? undefined : "Hidden: only you can see this."}
      >
        {preview ? (
          <div
            className={`mx-auto w-full max-w-[280px] ${draft.live ? "" : "opacity-60"}`}
          >
            <ShopCard item={preview} onOpen={() => {}} />
          </div>
        ) : (
          <p className="body-small text-muted-foreground">
            Add a photo and a format to see the card.
          </p>
        )}
      </Section>

      {!isNew && (
        <div className="flex justify-center">
          <Button
            tone="secondary"
            shape="inline"
            icon={Trash2}
            onClick={() =>
              confirmDelete ? onDelete() : setConfirmDelete(true)
            }
          >
            {confirmDelete
              ? "Tap again to delete it for good"
              : "Delete product"}
          </Button>
        </div>
      )}

      {/* The save bar rides the bottom of the screen, where a thumb is. */}
      <div className="studio-savebar fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pt-3">
        <div className="flex w-full max-w-[568px] gap-cluster">
          <div className="flex-1">
            <Button tone="secondary" onClick={onClose}>
              {dirty ? "Discard" : "Close"}
            </Button>
          </div>
          <div className="flex-[2]">
            <Button
              onClick={() => onSave(draft)}
              disabled={saving || uploading > 0 || (!dirty && !isNew)}
            >
              {saving
                ? "Saving…"
                : uploading
                  ? "Uploading…"
                  : draft.live
                    ? "Save to the shop"
                    : "Save hidden"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* One way the product is sold. */
function FormatCard({
  format,
  photos,
  onChange,
  onRemove,
}: {
  format: CatalogFormat
  photos: string[]
  onChange: (patch: Partial<CatalogFormat>) => void
  onRemove: () => void
}) {
  /* The sizes as typed, so commas and spaces survive while typing. */
  const [sizesText, setSizesText] = useState(
    format.sizes.map((s) => s.label).join(", "),
  )

  function typeSizes(text: string) {
    setSizesText(text)
    const labels = text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    const was = new Map(format.sizes.map((s) => [s.label, s]))
    onChange({
      sizes: labels
        .slice(0, LIMITS.sizes)
        .map((label) => was.get(label) ?? { label }),
    })
  }

  return (
    <div className="space-y-part rounded-md border border-border bg-input-background/60 p-card">
      <div className="flex items-start gap-cluster">
        <div className="min-w-0 flex-1">
          <Field
            type="text"
            placeholder="Format name"
            label="Format name"
            value={format.label}
            onChange={(label) => onChange({ label })}
            required={false}
            size="sm"
          />
        </div>
        <div className="w-24 shrink-0">
          <NumberBox
            label="Price"
            prefix="$"
            value={format.price}
            onChange={(price) => onChange({ price })}
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${format.label || "this format"}`}
          className="mt-2 shrink-0 p-1 text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <Label text="Ships as">
        <div className="grid grid-cols-3 gap-cluster">
          {MAIL_CHOICES.map((mail) => (
            <Chip
              key={mail.id}
              pressed={format.mail === mail.id}
              onClick={() => onChange({ mail: mail.id })}
            >
              {mail.label}{" "}
              <span className="text-accent">${SHIPPING.rates[mail.id]}</span>
            </Chip>
          ))}
        </div>
      </Label>

      <Label
        text="Sizes"
        hint="Separate sizes with commas: S, M, L. Tap a size to mark it sold out."
      >
        <Field
          type="text"
          placeholder="One size (type sizes to add them)"
          label="Sizes"
          value={sizesText}
          onChange={typeSizes}
          required={false}
          size="sm"
        />
        {format.sizes.length > 0 && (
          <div className="mt-cluster flex flex-wrap gap-1.5">
            {format.sizes.map((size) => (
              <button
                key={size.label}
                type="button"
                aria-pressed={!size.soldOut}
                onClick={() =>
                  onChange({
                    sizes: format.sizes.map((s) =>
                      s.label === size.label
                        ? {
                            label: s.label,
                            ...(!s.soldOut && { soldOut: true }),
                          }
                        : s,
                    ),
                  })
                }
                className={`min-w-10 rounded-md border px-2 py-1.5 body-xs-bold transition-colors ${
                  size.soldOut
                    ? "border-border/50 text-muted-foreground/50 line-through"
                    : "border-foreground/40 bg-muted text-foreground"
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        )}
      </Label>

      <Label text="Details" hint="Size, material, print -- shown as a list.">
        <div className="space-y-1.5">
          {format.details.map((detail, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-24 shrink-0">
                <Field
                  type="text"
                  placeholder="Size"
                  label="Detail name"
                  value={detail.label}
                  onChange={(label) =>
                    onChange({
                      details: format.details.map((d, j) =>
                        j === i ? { ...d, label } : d,
                      ),
                    })
                  }
                  required={false}
                  size="sm"
                />
              </div>
              <div className="min-w-0 flex-1">
                <Field
                  type="text"
                  placeholder="4 × 6 in"
                  label="Detail"
                  value={detail.detail}
                  onChange={(text) =>
                    onChange({
                      details: format.details.map((d, j) =>
                        j === i ? { ...d, detail: text } : d,
                      ),
                    })
                  }
                  required={false}
                  size="sm"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    details: format.details.filter((_, j) => j !== i),
                  })
                }
                aria-label="Remove detail"
                className="shrink-0 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
          {format.details.length < LIMITS.details && (
            <button
              type="button"
              onClick={() =>
                onChange({
                  details: [...format.details, { label: "", detail: "" }],
                })
              }
              className="label-mono flex items-center gap-1 py-1 text-muted-foreground hover:text-accent"
            >
              <Plus className="size-3" aria-hidden /> Add a detail
            </button>
          )}
        </div>
      </Label>

      {photos.length > 1 && (
        <Label
          text="Photo for this format"
          hint="Shown when a fan picks it. Tap again to use the cover."
        >
          <div className="hide-scrollbar flex gap-1.5 overflow-x-auto">
            {photos.map((url, i) => (
              <button
                key={url}
                type="button"
                aria-label={`Photo ${i + 1}`}
                aria-pressed={format.photo === url}
                onClick={() =>
                  onChange({ photo: format.photo === url ? undefined : url })
                }
                className={`size-12 shrink-0 overflow-hidden rounded-sm border-2 ${
                  format.photo === url
                    ? "border-accent"
                    : "border-transparent opacity-60"
                }`}
              >
                <img src={url} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        </Label>
      )}
    </div>
  )
}

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <section className="surface space-y-part rounded-lg p-panel">
      <div>
        <h3 className="heading-s">{title}</h3>
        {hint && <p className="body-xs mt-1 text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

function Label({
  text,
  hint,
  children,
}: {
  text: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <p className="label-mono mb-1.5 text-muted-foreground">{text}</p>
      {children}
      {hint && <p className="body-xs mt-1.5 text-muted-foreground">{hint}</p>}
    </div>
  )
}

/* The shared field treatment on a controlled textarea; ui/TextArea is the
   uncontrolled one the booking form reads through FormData. */
function TextBox({
  value,
  onChange,
  placeholder,
  label,
  rows = 3,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label: string
  rows?: number
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      placeholder={placeholder}
      aria-label={label}
      onChange={(e) => onChange(e.target.value)}
      className={`${FIELD_TREATMENT} resize-none border-border px-3 py-2.5`}
    />
  )
}

/* A whole number, typed on the number pad. Empty reads as 0 until filled.
   The text is its own state so a cleared box stays empty while typing. */
function NumberBox({
  label,
  value,
  onChange,
  prefix,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  prefix?: string
}) {
  const [text, setText] = useState(String(value))
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      {prefix && (
        <span className="body-small pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder={label}
        value={text}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 6)
          setText(digits)
          onChange(Number(digits) || 0)
        }}
        className={`${FIELD_TREATMENT} border-border py-2.5 ${prefix ? "pr-3 pl-7" : "px-3"}`}
      />
    </label>
  )
}
