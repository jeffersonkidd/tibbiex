import { useEffect, useState } from "react"
import { BellRing, ShoppingBag } from "lucide-react"
import { toast } from "sonner"

import { CARD_HINT, SHIPPING } from "../../content/payments"
import { VENMO_HANDLE } from "../../content/site"
import { formatPrice, formatsOf } from "../../content/shop"
import type { ShopFormat, ShopItem } from "../../content/shop"
import { isEmail } from "../../lib/email"
import { sendMessage } from "../../lib/messages"
import { payVia } from "../../lib/payments"
import type { Order } from "../../lib/payments"
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
   Gallery, run count, format, sizes, what's in the box, then the buy button.
   Every section is optional and drops out when the item has no data for it,
   so a plain patch, the numbered bundle and a piece of art sold as sticker,
   patch or tee share this one modal.

   An item with several formats opens on the first, so there is always a
   price, a spec and a button that says what it buys; picking another format
   clears the size, since the two tees do not share a size run, and turns the
   gallery to that format's photo when the item names one. It opens on the
   artwork, not the first format's photo.

   The button goes to Stripe, which collects the address and adds shipping --
   which is why it is the button and Venmo is only the link under it: a Venmo
   order arrives with no address, so shipping rides on the amount and the
   buyer DMs one. Under it all, a restock alert
   for a run that is gone or a size that sold out. */
export default function ProductModal({
  item,
  onClose,
}: {
  item: ShopItem
  onClose: () => void
}) {
  const photos = item.gallery?.length ? item.gallery : [item.image]
  const formats = formatsOf(item)
  const choosing = formats.length > 1
  const soldOut = item.stock?.left === 0

  const [photo, setPhoto] = useState(0)
  const [format, setFormat] = useState<ShopFormat>(formats[0])
  const [size, setSize] = useState<string | null>(null)
  const [sizeError, setSizeError] = useState(false)
  const [sending, setSending] = useState(false)

  const sizes = format.sizes ?? []
  const shipping = SHIPPING.rates[format.mail ?? "parcel"]

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  /* Both ways out need a size on a format that has them. */
  function sizeMissing() {
    if (sizes.length > 0 && !size) {
      setSizeError(true)
      return true
    }
    return false
  }

  /* What was picked, in words: "Men's tee, L", or just "L" on an item that
     is its own only format. It names the order in Stripe and on Venmo, and
     the restock request. */
  const picked = [choosing && format.label, size].filter(Boolean).join(", ")

  const order: Order = {
    amount: format.price,
    note: picked ? `${item.item} — ${picked}` : item.item,
    purpose: "shop",
    mail: format.mail ?? "parcel",
  }

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
     or the browser blocks it. Stripe adds shipping on its own page; Venmo has
     none, so it rides on the amount. */
  function payWithVenmo() {
    if (sizeMissing()) return
    payVia("venmo", {
      ...order,
      amount: order.amount + shipping,
      note: `${order.note} + shipping`,
    })
    toast.success("Venmo is open — DM your shipping address to finish.")
  }

  return (
    <Overlay onClose={onClose}>
      {/* Square, because shop photos are, and art must not lose its edges:
          the old 256px strip cut the lower Vampire Cat's head off. */}
      <img
        src={photos[photo]}
        alt={item.alt ?? item.item}
        className="aspect-square w-full bg-muted object-cover"
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
        <div className="mt-2 flex flex-wrap items-baseline gap-x-part gap-y-1">
          <span className="numeric-amount text-accent">
            {formatPrice(format.price)}
          </span>
          <span className="label-mono text-muted-foreground">
            + {formatPrice(shipping)} shipping
          </span>
          {item.stock && (
            <span className="label-mono text-muted-foreground">
              {soldOut
                ? `All ${item.stock.of} gone`
                : `${item.stock.left} of ${item.stock.of} left`}
            </span>
          )}
        </div>
        {item.blurb && (
          <p className="body-small mt-3 text-muted-foreground">{item.blurb}</p>
        )}

        {!soldOut && (
          <>
            {choosing && (
              <fieldset className="mt-5">
                <legend className="label-mono mb-2 text-muted-foreground">
                  Format
                </legend>
                <div className="grid grid-cols-2 gap-cluster">
                  {formats.map((entry) => (
                    <Chip
                      key={entry.id}
                      pressed={format.id === entry.id}
                      onClick={() => {
                        setFormat(entry)
                        const shown = item.formatPhotos?.[entry.id]
                        if (shown && photos.includes(shown))
                          setPhoto(photos.indexOf(shown))
                        setSize(null)
                        setSizeError(false)
                      }}
                    >
                      {entry.label}{" "}
                      <span className="text-accent">
                        {formatPrice(entry.price)}
                      </span>
                    </Chip>
                  ))}
                </div>
              </fieldset>
            )}

            {sizes.length > 0 && (
              <fieldset className="mt-5">
                <legend className="label-mono mb-2 text-muted-foreground">
                  Size
                </legend>
                {/* As many columns as fit at chip width: four sizes read as
                    one row, a six-size run still does on a phone. */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(3rem,1fr))] gap-cluster">
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
                  <p role="alert" className="body-xs mt-1.5 text-primary">
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
                : `Buy${picked ? ` ${picked}` : ""} — ${formatPrice(format.price)}`}
            </Button>
            <p className="body-xs mt-2 text-center text-muted-foreground">
              {CARD_HINT} US shipping only.
              {item.ships && (
                <>
                  <br />
                  {item.ships}
                </>
              )}
            </p>

            <div className="mt-2">
              <VenmoLink handle={VENMO_HANDLE} onClick={payWithVenmo} />
              <p className="body-xs mt-1 text-center text-muted-foreground">
                Includes shipping. DM your address after.
              </p>
            </div>
          </>
        )}

        {format.includes && (
          <>
            <Separator space="md" />
            <span className="label-mono mb-2 block text-muted-foreground">
              What you get
            </span>
            <DetailList items={format.includes} />
          </>
        )}

        <RestockAlert item={item} picked={picked} soldOut={soldOut} />
      </OverlayBody>
    </Overlay>
  )
}

/* "Tell me when it's back." Posts to api/contact.ts as a restock request --
   the item and what was picked ride along as the subject -- so it arrives in the inbox
   whether or not the visitor has a mail app. It is a one-off note, not a list
   subscription, which is why it does not touch the audience. */
function RestockAlert({
  item,
  picked,
  soldOut,
}: {
  item: ShopItem
  picked: string
  soldOut: boolean
}) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [trap, setTrap] = useState("")
  const anySizeGone = formatsOf(item).some((format) =>
    format.sizes?.some((s) => s.soldOut),
  )

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
        subject: picked ? `${item.item} (${picked})` : item.item,
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
        <p className="body-small text-muted-foreground">
          {soldOut
            ? "This run is gone. Get told if there’s another."
            : "Sold out, or your size is gone? Get told when it’s back."}
        </p>
        {sent ? (
          <p className="label-mono mt-3 text-accent" aria-live="polite">
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
