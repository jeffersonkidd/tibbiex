import { useEffect, useState } from "react"
import { BellRing, ShoppingBag } from "lucide-react"
import { toast } from "sonner"

import { CARD_HINT } from "../../content/payments"
import { VENMO_HANDLE } from "../../content/site"
import { formatPrice } from "../../content/shop"
import type { ShopItem } from "../../content/shop"
import { isEmail } from "../../lib/email"
import { sendMessage } from "../../lib/messages"
import { payVia } from "../../lib/payments"
import Button from "../../ui/controls/Button"
import Chip from "../../ui/controls/Chip"
import EmailField from "../../ui/controls/EmailField"
import Honeypot from "../../ui/controls/Honeypot"
import VenmoLink from "../../ui/controls/VenmoLink"
import DetailList from "../../ui/display/DetailList"
import Separator from "../../ui/display/Separator"
import Overlay from "../../ui/overlays/Overlay"
import OverlayBody from "../../ui/overlays/OverlayBody"

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
      <img
        src={photos[photo]}
        alt={item.item}
        className="h-64 w-full bg-muted object-cover"
      />
      {photos.length > 1 && (
        <div
          className="flex gap-cluster px-modal pt-3"
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
        <div className="mt-2 flex items-baseline gap-part">
          <span className="text-2xl font-bold text-accent">
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
                <div className="grid grid-cols-4 gap-cluster">
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

            <Button
              className="mt-5"
              icon={ShoppingBag}
              onClick={buy}
              disabled={sending}
            >
              {sending
                ? "Opening Stripe…"
                : `Buy${size ? ` ${size}` : ""} — ${formatPrice(item.price)}`}
            </Button>
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
          <>
            <Separator space="md" />
            <span className="mono-label mb-2 block text-muted-foreground">
              What you get
            </span>
            <DetailList items={item.includes} />
          </>
        )}

        <RestockAlert item={item} size={size} soldOut={soldOut} />
      </OverlayBody>
    </Overlay>
  )
}

/* "Tell me when it's back." Posts to api/contact.ts as a restock request --
   the item and size ride along as the subject -- so it arrives in the inbox
   whether or not the visitor has a mail app. It is a one-off note, not a list
   subscription, which is why it does not touch the audience. */
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
  const [sending, setSending] = useState(false)
  const [trap, setTrap] = useState("")
  const anySizeGone = item.sizes?.some((s) => s.soldOut)

  /* Only worth offering when something is, or could be, gone. */
  if (!soldOut && !item.stock && !anySizeGone) return null

  async function notify(e: React.FormEvent) {
    e.preventDefault()
    if (!isEmail(email)) {
      setError("Enter an email first.")
      return
    }

    setSending(true)
    try {
      await sendMessage({
        purpose: "restock",
        email,
        subject: size ? `${item.item} (${size})` : item.item,
        website: trap,
      })
      setSent(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send that.")
      setSending(false)
    }
  }

  return (
    <>
      <Separator space="md" />

      <form onSubmit={notify} noValidate>
        <p className="text-sm text-muted-foreground">
          {soldOut
            ? "This run is gone. Get told if there’s another."
            : "Sold out, or your size is gone? Get told when it’s back."}
        </p>
        {sent ? (
          <p className="mono-label mt-3 text-accent" aria-live="polite">
            Asked for. You’ll hear when it’s back.
          </p>
        ) : (
          <div className="mt-3 flex items-start gap-cluster">
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
            <div className="shrink-0">
              <Button
                tone="secondary"
                type="submit"
                icon={BellRing}
                disabled={sending}
              >
                {sending ? "Sending…" : "Notify me"}
              </Button>
            </div>
            <Honeypot onChange={setTrap} />
          </div>
        )}
      </form>
    </>
  )
}
