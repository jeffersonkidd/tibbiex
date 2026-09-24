import { useState } from "react"
import { Mic, Send } from "lucide-react"
import { toast } from "sonner"

import { FUND, TOP_CONTRIBUTORS } from "../../content/fund"
import { CARD_HINT } from "../../content/payments"
import { VENMO_HANDLE } from "../../content/site"
import { payVia } from "../../lib/payments"
import Button from "../../ui/controls/Button"
import Chip from "../../ui/controls/Chip"
import Field from "../../ui/controls/Field"
import VenmoLink from "../../ui/controls/VenmoLink"
import Separator from "../../ui/display/Separator"
import Meter from "../../ui/display/Meter"
import PanelHeader from "../../ui/display/PanelHeader"
import SupporterRow from "../../ui/rows/SupporterRow"

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
    <section className="surface rounded-lg p-panel">
      <PanelHeader
        icon={Mic}
        title={FUND.title}
        sub={FUND.blurb}
        badge={FUND.badge}
      />

      <div className="mt-4 flex items-baseline justify-between gap-part">
        <span className="body-large-bold">{dollars(FUND.raised)}</span>
        <span className="body-xs text-muted-foreground">
          of {dollars(FUND.goal)} · {FUND.backers} backers
        </span>
      </div>
      <div className="mt-2">
        <Meter
          value={progress}
          label={`${dollars(FUND.raised)} of ${dollars(FUND.goal)} raised`}
        />
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-part">
        <div
          role="group"
          aria-label="Amount"
          className="grid grid-cols-2 gap-cluster sm:grid-cols-4"
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

        <Button type="submit" icon={Send} disabled={sending}>
          {sending ? "Opening Stripe…" : `Contribute ${dollars(amount)}`}
        </Button>

        <p className="body-xs text-center text-muted-foreground">{CARD_HINT}</p>

        <VenmoLink handle={VENMO_HANDLE} onClick={payWithVenmo} />
      </form>

      {TOP_CONTRIBUTORS.length > 0 && (
        <>
          <Separator space="sm" />
          <span className="label-mono block text-muted-foreground">
            Top Contributors
          </span>
          <div className="mt-2 space-y-1.5">
            {TOP_CONTRIBUTORS.map((sup, i) => (
              <SupporterRow
                key={`${sup.name}-${sup.msg}`}
                supporter={sup}
                rank={i + 1}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
