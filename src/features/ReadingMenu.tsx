import { useEffect, useState } from "react"
import { Check, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { READINGS, RAILS, VENMO_HANDLE, venmoPayUrl } from "../data"
import type { Rail, Reading } from "../data"
import { castMagicFrom } from "../lib/magic-dust"
import { stripeCheckoutUrl } from "../lib/payments"
import BrandButton from "../components/BrandButton"
import Overlay from "../components/Overlay"

/* The menu. One tier is always selected -- the hour, since it is the one most
   people want -- so the button at the bottom always has something to say. Like
   the tip jar, this panel only composes a hand-off: it takes no money itself,
   it hands the deposit to whichever rail the reader picked. */
export default function ReadingMenu({ onClose }: { onClose: () => void }) {
  const [pickedId, setPickedId] = useState("hour")
  const [rail, setRail] = useState<Rail>("venmo")
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

  /* The same two rails the tip jar runs on, carrying the tier as the note.
     Venmo opens in a new tab; Stripe takes the whole tab, because its return
     trip only lands where it left from. */
  async function hold(e: React.MouseEvent<HTMLElement>) {
    castMagicFrom(e)
    const note = `${picked.minutes}-minute reading`

    if (rail === "venmo") {
      window.open(
        venmoPayUrl(picked.price, note),
        "_blank",
        "noopener,noreferrer",
      )
      toast.success("Venmo is open — the slot is yours once it lands.")
      return
    }

    setSending(true)
    try {
      window.location.href = await stripeCheckoutUrl(picked.price, note)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not reach Stripe.",
      )
      setSending(false)
    }
  }

  return (
    <Overlay onClose={onClose} size="md">
      {/* Three cards plus their lists clear a short phone viewport, and Overlay
          clips its children rather than scrolling them. So this panel does its
          own scrolling. */}
      <div className="arcana-veil max-h-[85vh] overflow-y-auto p-6">
        <span className="mono-label text-accent-strong">Readings</span>
        <h2 className="mt-1 text-2xl font-bold">1-on-1 Tarot Readings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Twenty-two cards, cut in the dark, read live over FaceTime. Pick how
          long you want the table open.
        </p>

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

        {/* Which rail the deposit travels on -- the same segmented control the
            tip jar uses, outlined so the red below stays the only red here. */}
        <div className="mt-4 flex gap-2 rounded-md border border-border bg-input-background p-1">
          {RAILS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setRail(id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-sm border py-2 text-xs font-bold transition-all ${
                rail === id
                  ? "brand-pop border-foreground/40 bg-muted text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        <BrandButton className="mt-3" onClick={hold} disabled={sending}>
          <Sparkles size={18} />
          {sending
            ? "Opening Stripe…"
            : `Hold ${picked.minutes} minutes — $${picked.price}`}
        </BrandButton>

        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          {rail === "venmo"
            ? `Opens Venmo to pay @${VENMO_HANDLE} directly.`
            : "Card payments are processed by Stripe."}
        </p>
      </div>
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
