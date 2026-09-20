import { useEffect, useState } from "react"
import { BellRing, ShoppingBag } from "lucide-react"
import { toast } from "sonner"

import { restockMailtoUrl } from "../content/newsletter"
import { CARD_HINT } from "../content/payments"
import { VENMO_HANDLE } from "../content/site"
import { formatPrice } from "../content/shop"
import type { ShopItem } from "../content/shop"
import { isEmail } from "../lib/email"
import { payVia } from "../lib/payments"
import BrandButton from "../ui/controls/BrandButton"
import Chip from "../ui/controls/Chip"
import EmailField from "../ui/controls/EmailField"
import VenmoLink from "../ui/controls/VenmoLink"
import DetailList from "../ui/DetailList"
import Overlay from "../ui/overlays/Overlay"
import OverlayBody from "../ui/overlays/OverlayBody"

/* One item from the shop, opened from its card or from the Home tab's offer
   row -- from the component reference in .files/tibbiex-components.html.
   Gallery, run count, sizes, what's in the box, then the buy button. Every
   section is optional and drops out when the item has no data for it, so a
   plain patch and the numbered bundle share this one modal.

   The button goes to Stripe, which collects the shipping address -- which is
   why it is the button and Venmo is only the link under it: a Venmo order
   arrives with no address, so that line says to send one by DM. Under it all,
   a restock alert for a run that is gone or a size that sold out. */
export default function ProductModal({
  item,
  onClose,
}: {
  item: ShopItem
  onClose: () => void
}) {
  const photos = item.gallery?.length ? item.gallery : [item.image]
  const sizes = item.sizes ?? []
  const soldOut = item.stock?.left === 0

  const [photo, setPhoto] = useState(0)
  const [size, setSize] = useState<string | null>(null)
  const [sizeError, setSizeError] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  /* Both ways out need a size on an item that has them. */
  function sizeMissing() {
    if (sizes.length > 0 && !size) {
      setSizeError(true)
      return true
    }
    return false
  }

  const order = {
    amount: item.price,
    note: size ? `${item.item} — ${size}` : item.item,
    purpose: "shop",
  } as const

  async function buy() {
    if (sizeMissing()) return

    /* Navigating away, so the button keeps saying so. */
    setSending(true)
    try {
      await payVia("card", order)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not reach Stripe.",
      )
      setSending(false)
    }
  }

  /* No await ahead of payVia here: the Venmo tab has to open inside the click
     or the browser blocks it. */
  function payWithVenmo() {
    if (sizeMissing()) return
    payVia("venmo", order)
    toast.success("Venmo is open — DM your shipping address to finish.")
  }

  return (
    <Overlay onClose={onClose}>
      <div className="max-h-[90vh] overflow-y-auto">
        <img
          src={photos[photo]}
          alt={item.item}
          className="h-64 w-full bg-muted object-cover"
        />
        {photos.length > 1 && (
          <div
            className="flex gap-2 px-6 pt-3"
            role="group"
            aria-label="Photos"
          >
            {photos.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Photo ${i + 1} of ${photos.length}`}
                aria-pressed={photo === i}
                onClick={() => setPhoto(i)}
                className={`h-12 w-12 overflow-hidden rounded-sm border transition-colors ${
                  photo === i
                    ? "border-foreground/60"
                    : "border-border opacity-60 hover:opacity-100"
                }`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <OverlayBody title={item.item}>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-2xl font-bold text-accent-strong">
              {formatPrice(item.price)}
            </span>
            {item.stock && (
              <span className="mono-label text-muted-foreground">
                {soldOut
                  ? `All ${item.stock.of} gone`
                  : `${item.stock.left} of ${item.stock.of} left`}
              </span>
            )}
          </div>

          {!soldOut && (
            <>
              {sizes.length > 0 && (
                <fieldset className="mt-5">
                  <legend className="mono-label mb-2 text-muted-foreground">
                    Tee size
                  </legend>
                  <div className="grid grid-cols-4 gap-2">
                    {sizes.map(({ label, soldOut: gone }) => (
                      <Chip
                        key={label}
                        pressed={size === label}
                        disabled={gone}
                        label={gone ? `${label}, sold out` : label}
                        onClick={() => {
                          setSize(label)
                          setSizeError(false)
                        }}
                      >
                        {label}
                      </Chip>
                    ))}
                  </div>
                  {sizeError && (
                    <p role="alert" className="mt-1.5 text-xs text-primary">
                      Pick a size first.
                    </p>
                  )}
                </fieldset>
              )}

              <BrandButton className="mt-5" onClick={buy} disabled={sending}>
                <ShoppingBag className="h-4 w-4" />
                {sending
                  ? "Opening Stripe…"
                  : `Buy${size ? ` ${size}` : ""} — ${formatPrice(item.price)}`}
              </BrandButton>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                {CARD_HINT} Stripe asks where to ship.
                {item.ships && (
                  <>
                    <br />
                    {item.ships}
                  </>
                )}
              </p>

              <div className="mt-2">
                <VenmoLink handle={VENMO_HANDLE} onClick={payWithVenmo} />
                <p className="mt-1 text-center text-[11px] text-muted-foreground">
                  Venmo takes no address — DM yours after.
                </p>
              </div>
            </>
          )}

          {item.includes && (
            <div className="mt-5">
              <span className="mono-label mb-2 block text-muted-foreground">
                What you get
              </span>
              <DetailList items={item.includes} />
            </div>
          )}

          <RestockAlert item={item} size={size} soldOut={soldOut} />
        </OverlayBody>
      </div>
    </Overlay>
  )
}

/* "Tell me when it's back." Like the sign-up, there is no list behind it yet,
   so it writes the request into the visitor's mail client. */
function RestockAlert({
  item,
  size,
  soldOut,
}: {
  item: ShopItem
  size: string | null
  soldOut: boolean
}) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const anySizeGone = item.sizes?.some((s) => s.soldOut)

  /* Only worth offering when something is, or could be, gone. */
  if (!soldOut && !item.stock && !anySizeGone) return null

  function notify(e: React.FormEvent) {
    e.preventDefault()
    if (!isEmail(email)) {
      setError("Enter an email first.")
      return
    }
    window.location.href = restockMailtoUrl(email, item.item, size ?? undefined)
    toast.success("Opening your mail app.")
    setSent(true)
  }

  return (
    <form
      onSubmit={notify}
      noValidate
      className="mt-5 border-t border-border pt-4"
    >
      <p className="text-sm text-muted-foreground">
        {soldOut
          ? "This run is gone. Get told if there’s another."
          : "Sold out, or your size is gone? Get told when it’s back."}
      </p>
      {sent ? (
        <p className="mono-label mt-3 text-accent-strong" aria-live="polite">
          Hit send in your mail app and you’re on the list.
        </p>
      ) : (
        <div className="mt-3 flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <EmailField
              value={email}
              onChange={(value) => {
                setEmail(value)
                setError(null)
              }}
              error={error}
              size="sm"
            />
          </div>
          <button
            type="submit"
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-muted"
          >
            <BellRing className="h-4 w-4" /> Notify me
          </button>
        </div>
      )}
    </form>
  )
}
