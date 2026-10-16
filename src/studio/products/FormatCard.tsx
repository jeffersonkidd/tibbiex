import { useState } from "react"
import { Plus, Trash2, X } from "lucide-react"

import { formatPrice } from "../../content/shop"
import type { CatalogFormat } from "../../lib/catalog"
import Field from "../../ui/controls/Field"
import { MAIL_CLASSES, SIZE_RUNS, shippingFor } from "./products"

/* One way a piece is sold -- a sticker, a patch, a tee -- with its own price,
   the postage it travels at, its size run and what is in the box. A size is
   a tap to mark it sold out (it stays listed, struck through, as on the
   site) and an x to drop it. */
export default function FormatCard({
  format,
  gallery,
  onChange,
  onRemove,
}: {
  format: CatalogFormat
  gallery: string[]
  onChange: (next: CatalogFormat) => void
  onRemove: () => void
}) {
  const [newSize, setNewSize] = useState("")
  const sizes = format.sizes ?? []
  const includes = format.includes ?? []
  const set = (patch: Partial<CatalogFormat>) =>
    onChange({ ...format, ...patch })

  function addSize() {
    const label = newSize.trim().toUpperCase().slice(0, 12)
    if (!label || sizes.some((size) => size.label === label)) return
    set({ sizes: [...sizes, { label }] })
    setNewSize("")
  }

  return (
    <div className="studio-format space-y-part rounded-md border border-outline-variant bg-surface-container-low/60 p-card">
      <div className="flex items-start gap-cluster">
        <div className="min-w-0 flex-1">
          <Field
            type="text"
            label="Format name"
            placeholder="Format name, e.g. Sticker"
            value={format.label}
            onChange={(label) => set({ label })}
            invalid={!format.label.trim()}
            required={false}
            size="sm"
          />
        </div>
        <label className="studio-price flex w-28 shrink-0 items-center rounded-md border border-outline-variant bg-surface-container-lowest/80 pl-3 focus-within:border-tertiary">
          <span className="body-small-bold text-tertiary">$</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={1000}
            step={1}
            aria-label="Price in dollars"
            value={Number.isFinite(format.price) ? format.price : ""}
            onChange={(e) => set({ price: Math.round(Number(e.target.value)) })}
            className="w-full min-w-0 bg-transparent px-2 py-2.5 body-small-bold text-on-surface outline-none"
          />
        </label>
        <button
          type="button"
          aria-label={`Remove ${format.label || "this format"}`}
          title="Remove this format"
          onClick={onRemove}
          className="flex size-10 shrink-0 items-center justify-center rounded-md border border-outline-variant text-on-surface-variant transition-colors hover:border-error hover:text-error"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <fieldset>
        <legend className="label-mono mb-1.5 text-on-surface-variant">
          Ships as
        </legend>
        <div className="grid grid-cols-3 gap-cluster">
          {MAIL_CLASSES.map((mail) => (
            <button
              key={mail.id}
              type="button"
              aria-pressed={format.mail === mail.id}
              title={`For ${mail.hint}`}
              onClick={() => set({ mail: mail.id })}
              className={`studio-toggle rounded-md border px-2 py-2 body-xs-bold ${
                format.mail === mail.id ? "is-on" : ""
              }`}
            >
              {mail.label}{" "}
              <span className="text-tertiary">
                +{formatPrice(shippingFor(mail.id))}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label-mono mb-1.5 text-on-surface-variant">
          Sizes{" "}
          {sizes.length > 0 && (
            <span className="normal-case">· tap one to mark it sold out</span>
          )}
        </legend>
        <div className="flex flex-wrap gap-glyph">
          {sizes.map((size, index) => (
            <span
              key={size.label}
              className={`studio-size inline-flex items-stretch overflow-hidden rounded-md border ${
                size.soldOut ? "is-gone" : ""
              }`}
            >
              <button
                type="button"
                aria-pressed={Boolean(size.soldOut)}
                aria-label={`${size.label}${size.soldOut ? ", sold out" : ""}`}
                onClick={() =>
                  set({
                    sizes: sizes.map((s, i) =>
                      i === index
                        ? s.soldOut
                          ? { label: s.label }
                          : { label: s.label, soldOut: true }
                        : s,
                    ),
                  })
                }
                className="px-2.5 py-1.5 body-xs-bold"
              >
                {size.label}
              </button>
              <button
                type="button"
                aria-label={`Drop size ${size.label}`}
                onClick={() =>
                  set({ sizes: sizes.filter((_, i) => i !== index) })
                }
                className="border-l border-inherit px-1.5 opacity-60 hover:opacity-100"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          <form
            className="inline-flex"
            onSubmit={(e) => {
              e.preventDefault()
              addSize()
            }}
          >
            <input
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              placeholder="Add size"
              aria-label="Add a size"
              maxLength={12}
              className="w-20 rounded-l-md border border-outline-variant bg-surface-container-lowest/80 px-2 py-1.5 body-xs text-on-surface outline-none placeholder:text-on-surface-variant focus:border-tertiary"
            />
            <button
              type="submit"
              aria-label="Add this size"
              className="rounded-r-md border border-l-0 border-outline-variant bg-surface-container-low px-2 text-on-surface-variant hover:text-tertiary"
            >
              <Plus className="size-3.5" />
            </button>
          </form>
        </div>
        {sizes.length === 0 && (
          <p className="body-xs mt-1.5 text-on-surface-variant">
            No sizes: it's one-size. Or start from a run:{" "}
            {SIZE_RUNS.map((run, i) => (
              <span key={run.label}>
                {i > 0 && " · "}
                <button
                  type="button"
                  onClick={() =>
                    set({ sizes: run.sizes.map((label) => ({ label })) })
                  }
                  className="text-tertiary underline underline-offset-2"
                >
                  {run.label} ({run.sizes[0]}–{run.sizes.at(-1)})
                </button>
              </span>
            ))}
          </p>
        )}
      </fieldset>

      {gallery.length > 1 && (
        <fieldset>
          <legend className="label-mono mb-1.5 text-on-surface-variant">
            Photo when picked
          </legend>
          <div className="flex flex-wrap gap-glyph">
            {gallery.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-pressed={format.photo === src}
                aria-label={`Photo ${i + 1}`}
                onClick={() =>
                  set({ photo: format.photo === src ? undefined : src })
                }
                className={`size-11 overflow-hidden rounded-sm border transition ${
                  format.photo === src
                    ? "border-tertiary ring-1 ring-tertiary"
                    : "border-outline-variant opacity-50 hover:opacity-100"
                }`}
              >
                <img src={src} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="label-mono mb-1.5 text-on-surface-variant">
          What you get
        </legend>
        <div className="space-y-1.5">
          {includes.map((entry, index) => (
            <div key={index} className="flex gap-glyph">
              <input
                value={entry.label}
                placeholder="Size"
                aria-label="Detail name"
                maxLength={40}
                onChange={(e) =>
                  set({
                    includes: includes.map((d, i) =>
                      i === index ? { ...d, label: e.target.value } : d,
                    ),
                  })
                }
                className="w-28 shrink-0 rounded-md border border-outline-variant bg-surface-container-lowest/80 px-2 py-1.5 body-xs text-on-surface outline-none focus:border-tertiary"
              />
              <input
                value={entry.detail}
                placeholder="4 × 6 in"
                aria-label="Detail"
                maxLength={80}
                onChange={(e) =>
                  set({
                    includes: includes.map((d, i) =>
                      i === index ? { ...d, detail: e.target.value } : d,
                    ),
                  })
                }
                className="min-w-0 flex-1 rounded-md border border-outline-variant bg-surface-container-lowest/80 px-2 py-1.5 body-xs text-on-surface outline-none focus:border-tertiary"
              />
              <button
                type="button"
                aria-label="Remove this detail"
                onClick={() =>
                  set({ includes: includes.filter((_, i) => i !== index) })
                }
                className="px-1.5 text-on-surface-variant hover:text-error"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          {includes.length < 8 && (
            <button
              type="button"
              onClick={() =>
                set({ includes: [...includes, { label: "", detail: "" }] })
              }
              className="label-mono flex items-center gap-1 text-on-surface-variant hover:text-tertiary"
            >
              <Plus className="size-3" /> Add a detail
            </button>
          )}
        </div>
      </fieldset>
    </div>
  )
}
