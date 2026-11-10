import { useEffect, useState } from "react"
import { GraduationCap, MessageCircle, Spade } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { toast } from "sonner"

import type { Service } from "../../content/offerings"
import { CARD_HINT } from "../../content/payments"
import { VENMO_HANDLE } from "../../content/site"
import { castMagicFrom } from "../../lib/magic-dust"
import { payVia } from "../../lib/payments"
import PriceCard from "../../ui/cards/PriceCard"
import Button from "../../ui/controls/Button"
import VenmoLink from "../../ui/controls/VenmoLink"
import Overlay from "../../ui/overlays/Overlay"
import OverlayBody from "../../ui/overlays/OverlayBody"

/* The glyph on each session's button. */
const ICONS: Record<Service["id"], LucideIcon> = {
  chat: MessageCircle,
  tarot: Spade,
  lessons: GraduationCap,
}

/* One menu for every session on the Sessions shelf -- chats, tarot readings,
   lessons -- laid out from the service it is opened on. One tier is always
   selected -- the featured one, since it is the one most people want -- so
   the button at the bottom always has something to say. Like the fund, this
   panel only composes a hand-off: it takes no money itself. The button hands
   the deposit to Stripe; the link under it hands the same deposit to Venmo.
   The tarot keeps its amber veil, which is that corner of the app's alone. */
export default function SessionMenu({
  service,
  onClose,
}: {
  service: Service
  onClose: () => void
}) {
  const { tiers } = service
  const [pickedId, setPickedId] = useState(
    () => (tiers.find((tier) => tier.featured) ?? tiers[0]).id,
  )
  const [sending, setSending] = useState(false)
  const picked = tiers.find((tier) => tier.id === pickedId) ?? tiers[0]

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
    note: `${picked.minutes}-minute ${service.noun}`,
    purpose: service.purpose,
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
        eyebrow={service.eyebrow}
        title={service.title}
        sub={service.sub}
        className={service.id === "tarot" ? "arcana-veil" : undefined}
      >
        <div className="mt-6 grid grid-cols-1 gap-part sm:grid-cols-3 sm:gap-stack">
          {tiers.map((tier, i) => (
            <PriceCard
              key={tier.id}
              index={i}
              eyebrow={`${tier.minutes} min`}
              name={tier.label}
              amount={`$${tier.price}`}
              unit="flat"
              blurb={tier.blurb}
              includes={tier.includes}
              flag={tier.featured ? "Most asked for" : undefined}
              pressed={tier.id === picked.id}
              onClick={(e) => pick(tier.id, e)}
              label={`${tier.label}, ${tier.minutes} minutes, $${tier.price}`}
            />
          ))}
        </div>

        <p className="body-xs mt-5 text-on-surface-variant">{service.terms}</p>

        <Button
          className="mt-4"
          icon={ICONS[service.id]}
          onClick={hold}
          disabled={sending}
        >
          {sending
            ? "Opening Stripe…"
            : `Hold ${picked.minutes} minutes — $${picked.price}`}
        </Button>

        <p className="body-xs mt-2 text-center text-on-surface-variant">
          {CARD_HINT}
        </p>

        <div className="mt-2">
          <VenmoLink handle={VENMO_HANDLE} onClick={payWithVenmo} />
        </div>
      </OverlayBody>
    </Overlay>
  )
}
