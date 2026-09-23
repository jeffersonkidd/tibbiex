import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import { toast } from "sonner"

import { READINGS } from "../../content/readings"
import { CARD_HINT } from "../../content/payments"
import { VENMO_HANDLE } from "../../content/site"
import { castMagicFrom } from "../../lib/magic-dust"
import { payVia } from "../../lib/payments"
import PriceCard from "../../ui/cards/PriceCard"
import Button from "../../ui/controls/Button"
import VenmoLink from "../../ui/controls/VenmoLink"
import Overlay from "../../ui/overlays/Overlay"
import OverlayBody from "../../ui/overlays/OverlayBody"

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
      <OverlayBody
        eyebrow="Readings"
        title="1-on-1 Tarot Readings"
        sub={
          "Twenty-two cards, cut in the dark, read live over FaceTime. Pick how long you want the table open."
        }
        className="arcana-veil"
      >
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {READINGS.map((reading, i) => (
            <PriceCard
              key={reading.id}
              index={i}
              eyebrow={`${reading.minutes} min`}
              name={reading.label}
              amount={`$${reading.price}`}
              unit="flat"
              blurb={reading.blurb}
              includes={reading.includes}
              flag={reading.featured ? "Most asked for" : undefined}
              pressed={reading.id === picked.id}
              onClick={(e) => pick(reading.id, e)}
              label={`${reading.label}, ${reading.minutes} minutes, $${reading.price}`}
            />
          ))}
        </div>

        <p className="mt-5 text-xs leading-snug text-muted-foreground">
          The deposit holds the slot; we settle the time by DM and I call you
          when it comes round. In person instead if you are local. No gods, no
          gatekeeping — the deck has no authority over you.
        </p>

        <Button
          className="mt-4"
          icon={Sparkles}
          onClick={hold}
          disabled={sending}
        >
          {sending
            ? "Opening Stripe…"
            : `Hold ${picked.minutes} minutes — $${picked.price}`}
        </Button>

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
