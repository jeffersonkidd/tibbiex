import { useEffect, useState } from "react"
import { Check, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { READINGS } from "../content/readings"
import type { Reading } from "../content/readings"
import { CARD_HINT } from "../content/payments"
import { VENMO_HANDLE } from "../content/site"
import { castMagicFrom } from "../lib/magic-dust"
import { payVia } from "../lib/payments"
import BrandButton from "../ui/controls/BrandButton"
import VenmoLink from "../ui/controls/VenmoLink"
import Overlay from "../ui/overlays/Overlay"
import OverlayBody from "../ui/overlays/OverlayBody"

/* The menu. One tier is always selected -- the hour, since it is the one most
   people want -- so the button at the bottom always has something to say. Like
   the fund, this panel only composes a hand-off: it takes no money itself. The
   button hands the deposit to Stripe; the link under it hands the same deposit
   to Venmo. */
export default function ReadingMenu({ onClose }: { onClose: () => void }) {
  const [pickedId, setPickedId] = useState("hour")
  const [sending, setSending] = useState(false)
  const picked =
    READINGS.find((reading) => reading.id === pickedId) ?? READINGS[0]

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  function pick(id: string, e: React.MouseEvent<HTMLElement>) {
    castMagicFrom(e)
    setPickedId(id)
  }

  const deposit = {
    amount: picked.price,
    note: `${picked.minutes}-minute reading`,
    purpose: "reading",
  } as const

  /* The same hand-off the fund makes, carrying the tier as the note. */
  async function hold(e: React.MouseEvent<HTMLElement>) {
    castMagicFrom(e)
    /* Navigating away, so the button keeps saying so. */
    setSending(true)
    try {
      await payVia("card", deposit)
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
    payVia("venmo", deposit)
    toast.success("Venmo is open — the slot is yours once it lands.")
  }

  return (
    <Overlay onClose={onClose} size="lg">
      {/* Three cards plus their lists clear a short phone viewport, and Overlay
          clips its children rather than scrolling them. So this panel does its
          own scrolling. */}
      <OverlayBody
        eyebrow="Readings"
        title="1-on-1 Tarot Readings"
        sub={
          "Twenty-two cards, cut in the dark, read live over FaceTime. Pick how long you want the table open."
        }
        className="arcana-veil max-h-[85vh] overflow-y-auto"
      >
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {READINGS.map((reading, i) => (
            <PriceCard
              key={reading.id}
              reading={reading}
              index={i}
              selected={reading.id === picked.id}
              onPick={(e) => pick(reading.id, e)}
            />
          ))}
        </div>

        <p className="mt-5 text-xs leading-snug text-muted-foreground">
          The deposit holds the slot; we settle the time by DM and I call you
          when it comes round. In person instead if you are local. No gods, no
          gatekeeping — the deck has no authority over you.
        </p>

        <BrandButton className="mt-4" onClick={hold} disabled={sending}>
          <Sparkles size={18} />
          {sending
            ? "Opening Stripe…"
            : `Hold ${picked.minutes} minutes — $${picked.price}`}
        </BrandButton>

        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          {CARD_HINT}
        </p>

        <div className="mt-2">
          <VenmoLink handle={VENMO_HANDLE} onClick={payWithVenmo} />
        </div>
      </OverlayBody>
    </Overlay>
  )
}

/* One tier. It is a button because picking it drives the CTA below, and it
   keeps the spread's deal-in animation: the cards still land one after the
   other, staggered by the --deal index set here. */
function PriceCard({
  reading,
  index,
  selected,
  onPick,
}: {
  reading: Reading
  index: number
  selected: boolean
  onPick: (e: React.MouseEvent<HTMLElement>) => void
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={selected}
      data-state={selected ? "on" : "off"}
      style={{ "--deal": index } as React.CSSProperties}
      aria-label={`${reading.label}, ${reading.minutes} minutes, $${reading.price}`}
      className="price-card"
    >
      <div className="price-frame" />
      {reading.featured && <span className="price-flag">Most asked for</span>}
      <span className="mono-label price-duration">{reading.minutes} min</span>
      <span className="price-name">{reading.label}</span>
      <span className="price-amount">
        ${reading.price}
        <span className="price-unit">flat</span>
      </span>
      <p className="price-blurb">{reading.blurb}</p>
      <ul className="price-includes">
        {reading.includes.map((line) => (
          <li key={line}>
            <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
            {line}
          </li>
        ))}
      </ul>
    </button>
  )
}
