import { useState } from "react"
import { Mic, Send } from "lucide-react"
import { toast } from "sonner"

import { FUND, TOP_CONTRIBUTORS } from "../content/fund"
import { CARD_HINT } from "../content/payments"
import { VENMO_HANDLE } from "../content/site"
import { payVia } from "../lib/payments"
import BrandButton from "../ui/controls/BrandButton"
import Chip from "../ui/controls/Chip"
import Field from "../ui/controls/Field"
import VenmoLink from "../ui/controls/VenmoLink"
import Meter from "../ui/Meter"
import PanelHeader from "../ui/PanelHeader"
import SupporterRow from "../ui/rows/SupporterRow"

const dollars = (n: number) => `$${n.toLocaleString("en-US")}`

/* Fund "Still Alive" -- the podcast fund on the Home tab, from the component
   reference in .files/tibbiex-components.html. How far along it is (the amber
   meter the rehearsal panel uses), one amount, one note, out to Stripe. It
   composes a hand-off and never touches the money.

   Nobody is asked for an email here: Stripe Checkout collects one on its own
   page for every card payment, and prefilling it from a field of ours only
   renders it read-only over there, so a typo could not be corrected. */
export default function FundPanel() {
  const [amount, setAmount] = useState(FUND.suggested)
  const [note, setNote] = useState("")
  const [sending, setSending] = useState(false)

  const progress = (FUND.raised / FUND.goal) * 100

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    /* Navigating away, so the button keeps saying so. */
    setSending(true)
    try {
      await payVia("card", { amount, note, purpose: "fund" })
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
    payVia("venmo", { amount, note, purpose: "fund" })
    toast.success("Venmo is open — thank you, seriously.")
  }

  return (
    <section className="surface rounded-lg p-5">
      <PanelHeader
        icon={Mic}
        title={FUND.title}
        sub={FUND.blurb}
        badge={FUND.badge}
      />

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <span className="text-lg font-bold">{dollars(FUND.raised)}</span>
        <span className="text-xs text-muted-foreground">
          of {dollars(FUND.goal)} · {FUND.backers} backers
        </span>
      </div>
      <div className="mt-2">
        <Meter
          value={progress}
          label={`${dollars(FUND.raised)} of ${dollars(FUND.goal)} raised`}
        />
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
        <div
          role="group"
          aria-label="Amount"
          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {FUND.presets.map((preset) => (
            <Chip
              key={preset}
              pressed={amount === preset}
              onClick={() => setAmount(preset)}
            >
              {dollars(preset)}
            </Chip>
          ))}
        </div>

        <Field
          type="text"
          placeholder="Say something… (shows in the feed)"
          label="Message"
          value={note}
          onChange={setNote}
          required={false}
          size="sm"
        />

        <BrandButton type="submit" disabled={sending}>
          <Send className="h-4 w-4" />
          {sending ? "Opening Stripe…" : `Contribute ${dollars(amount)}`}
        </BrandButton>

        <p className="text-center text-[11px] text-muted-foreground">
          {CARD_HINT}
        </p>

        <VenmoLink handle={VENMO_HANDLE} onClick={payWithVenmo} />
      </form>

      {TOP_CONTRIBUTORS.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <span className="mono-label block text-muted-foreground">
            Top Contributors
          </span>
          <div className="hide-scrollbar mt-2 max-h-32 space-y-1.5 overflow-y-auto">
            {TOP_CONTRIBUTORS.map((sup, i) => (
              <SupporterRow
                key={`${sup.name}-${sup.msg}`}
                supporter={sup}
                rank={i + 1}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
