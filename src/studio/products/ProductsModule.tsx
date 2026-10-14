import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { ChevronDown, ChevronUp, Package, Plus } from "lucide-react"
import { toast } from "sonner"

import type { Product } from "../../../api/_lib/catalog.js"
import { PORTFOLIO } from "../../content/portfolio"
import Button from "../../ui/controls/Button"
import Field from "../../ui/controls/Field"
import PanelHeader from "../../ui/display/PanelHeader"
import { ago } from "../links/ledger"
import { StudioError, savedPasscode } from "../write"
import ProductEditor from "./ProductEditor"
import {
  loadCatalog,
  lowest,
  newProduct,
  saveCatalog,
  soldOut,
} from "./products"
import type { Loaded } from "./products"

const SHELF_NAME: Record<string, string> = {
  art: "Art",
  ...Object.fromEntries(PORTFOLIO.map((entry) => [entry.id, entry.band])),
}

/* Module 03. The whole shop, as a list she can run from a phone: every
   product with its shelf, its lowest price and whether fans can see it.
   Tapping one opens the editor; the arrows reorder the shop. Every change is
   saved straight to the catalogue (api/products.ts), and the shop picks it
   up within a minute. */
export default function ProductsModule() {
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [editing, setEditing] = useState<{
    product: Product
    isNew: boolean
  } | null>(null)
  const [saving, setSaving] = useState(false)
  const [passcode, setPasscode] = useState(savedPasscode)
  const [asking, setAsking] = useState(false)
  const [passcodeError, setPasscodeError] = useState("")

  useEffect(() => {
    loadCatalog().then(setLoaded)
  }, [])

  /* Called before anything that writes. Shows the passcode box when there
     is no passcode yet, and says why. */
  function needPasscode() {
    if (passcode) return true
    setAsking(true)
    toast("Enter the studio passcode first.")
    return false
  }

  /* Saves the whole list. Resolves true when it stuck. */
  async function save(products: Product[], done: string) {
    if (!needPasscode()) return false
    setSaving(true)
    try {
      const stored = await saveCatalog(passcode, products)
      setLoaded({
        products: stored.products,
        saved: true,
        savedAt: stored.savedAt,
      })
      setAsking(false)
      setPasscodeError("")
      toast.success(done)
      return true
    } catch (error) {
      if (error instanceof StudioError && error.badPasscode) {
        setPasscode("")
        setAsking(true)
        setPasscodeError(error.message)
      } else {
        toast.error(error instanceof Error ? error.message : "Couldn't save.")
      }
      return false
    } finally {
      setSaving(false)
    }
  }

  async function saveProduct(product: Product) {
    if (!loaded) return
    const exists = loaded.products.some((p) => p.id === product.id)
    const products = exists
      ? loaded.products.map((p) => (p.id === product.id ? product : p))
      : [product, ...loaded.products]
    const ok = await save(
      products,
      product.live
        ? `${product.name} is in the shop. Fans see it within a minute.`
        : `${product.name} saved, hidden from the shop.`,
    )
    if (ok) setEditing(null)
  }

  async function deleteProduct(id: string) {
    if (!loaded) return
    const name = loaded.products.find((p) => p.id === id)?.name ?? "It"
    const ok = await save(
      loaded.products.filter((p) => p.id !== id),
      `${name} is deleted.`,
    )
    if (ok) setEditing(null)
  }

  function move(index: number, by: -1 | 1) {
    if (!loaded) return
    const products = [...loaded.products]
    const [picked] = products.splice(index, 1)
    products.splice(index + by, 0, picked)
    save(products, "Shop order saved.")
  }

  const passcodeBox = asking && (
    <form
      className="surface space-y-1.5 rounded-lg p-panel"
      onSubmit={(e) => {
        e.preventDefault()
        if (passcode) {
          setAsking(false)
          setPasscodeError("")
        }
      }}
    >
      <p className="label-mono text-muted-foreground">Studio passcode</p>
      <div className="flex gap-cluster">
        <div className="min-w-0 flex-1">
          <Field
            type="password"
            label="Studio passcode"
            placeholder="Studio passcode"
            autoComplete="current-password"
            value={passcode}
            onChange={setPasscode}
            invalid={Boolean(passcodeError)}
            required={false}
            size="sm"
          />
        </div>
        <div className="shrink-0">
          <Button shape="inline" type="submit">
            Unlock
          </Button>
        </div>
      </div>
      <p
        className={`body-xs ${passcodeError ? "text-primary-bright" : "text-muted-foreground"}`}
      >
        {passcodeError || "Asked once on this device, then remembered."}
      </p>
    </form>
  )

  if (editing) {
    return (
      <div className="space-y-stack">
        {passcodeBox}
        <ProductEditor
          key={editing.product.id}
          initial={editing.product}
          isNew={editing.isNew}
          passcode={passcode}
          needPasscode={needPasscode}
          saving={saving}
          onSave={saveProduct}
          onDelete={() => deleteProduct(editing.product.id)}
          onClose={() => setEditing(null)}
        />
      </div>
    )
  }

  const products = loaded?.products ?? []
  const liveCount = products.filter((p) => p.live).length

  return (
    <section aria-label="Products" className="space-y-stack">
      <div className="surface rounded-lg p-panel">
        <PanelHeader
          icon={Package}
          eyebrow="Module 03"
          title="Products"
          sub="Everything in the shop. Add it, price it, sell it out, hide it."
        />
        <div className="mt-panel flex items-center justify-between gap-part">
          <p className="label-mono text-muted-foreground">
            {loaded ? (
              <>
                <span className="text-accent">{liveCount} live</span>
                {products.length > liveCount &&
                  ` · ${products.length - liveCount} hidden`}
              </>
            ) : (
              "Loading…"
            )}
          </p>
          <Button
            shape="inline"
            icon={Plus}
            onClick={() => setEditing({ product: newProduct(), isNew: true })}
            disabled={!loaded}
          >
            New product
          </Button>
        </div>
        {loaded && !loaded.saved && (
          <p className="body-xs mt-part rounded-md border border-accent-soft bg-accent-tint p-3 text-accent">
            These are the products built into the site. Your first save moves
            them all into the back office, and from then on this list is the
            shop.
          </p>
        )}
        {loaded?.savedAt && (
          <p className="label-mono mt-part text-muted-foreground/70">
            Last saved {ago(+new Date(loaded.savedAt))}
          </p>
        )}
      </div>

      {passcodeBox}

      <ul className="space-y-cluster">
        {products.map((product, i) => {
          const price = lowest(product)
          const gone = soldOut(product)
          return (
            <li
              key={product.id}
              className="surface flex items-center gap-part rounded-lg p-3"
            >
              <button
                type="button"
                onClick={() => setEditing({ product, isNew: false })}
                className="group flex min-w-0 flex-1 items-center gap-part text-left"
              >
                <span className="size-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                  {product.photos[0] && (
                    <img
                      src={product.photos[0]}
                      alt=""
                      loading="lazy"
                      className={`size-full object-cover ${product.live ? "" : "opacity-40 grayscale"}`}
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="body-small-bold block truncate group-hover:text-accent">
                    {product.name}
                  </span>
                  <span className="label-mono mt-1 block truncate text-muted-foreground">
                    {SHELF_NAME[product.shelf]} · {product.formats.length}{" "}
                    {product.formats.length === 1 ? "format" : "formats"}
                    {price !== null && ` · from $${price}`}
                  </span>
                  <span className="mt-1.5 flex gap-1.5">
                    <Badge tone={product.live ? "live" : "quiet"}>
                      {product.live ? "Live" : "Hidden"}
                    </Badge>
                    {gone && <Badge tone="alert">Sold out</Badge>}
                    {product.stock && !gone && (
                      <Badge tone="quiet">
                        {product.stock.left} of {product.stock.of} left
                      </Badge>
                    )}
                  </span>
                </span>
              </button>
              <div className="flex shrink-0 flex-col">
                <button
                  type="button"
                  aria-label={`Move ${product.name} up`}
                  disabled={i === 0 || saving}
                  onClick={() => move(i, -1)}
                  className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-25"
                >
                  <ChevronUp className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Move ${product.name} down`}
                  disabled={i === products.length - 1 || saving}
                  onClick={() => move(i, 1)}
                  className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-25"
                >
                  <ChevronDown className="size-4" />
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Badge({
  tone,
  children,
}: {
  tone: "live" | "quiet" | "alert"
  children: ReactNode
}) {
  const tones = {
    live: "border-accent-soft bg-accent-tint text-accent",
    quiet: "border-border text-muted-foreground",
    alert: "border-primary/50 text-primary-bright",
  }
  return (
    <span
      className={`label-mono-xs rounded-xs border px-1.5 py-1 ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
