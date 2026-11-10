import { useState } from "react"
import { CreditCard } from "lucide-react"
import { toast } from "sonner"

import { FUND, TOP_CONTRIBUTORS } from "../../content/fund"
import { CARD_HINT } from "../../content/payments"
import { payVia } from "../../lib/payments"
import Button from "../../ui/controls/Button"
import Chip from "../../ui/controls/Chip"
import Field from "../../ui/controls/Field"
import Meter from "../../ui/display/Meter"
import SupporterRow from "../../ui/rows/SupporterRow"

const dollars = (n: number) => `$${n.toLocaleString("en-US")}`

/* "Still Alive" Podcast -- the podcast fund on the Home tab, its picture a
   taped-up print (treatments/fund.css). Hovering or focusing Contribute
   picks the print up and previews on the meter how far the chosen amount
   would bring the fund. One amount, one note, out to Stripe: it composes a
   hand-off and never touches the money.

   Card only. The Venmo line under the button was taken off with the
   redesign; payVia("venmo", …) still works for a panel that wants it.

   Nobody is asked for an email here: Stripe Checkout collects one on its own
   page for every card payment, and prefilling it from a field of ours only
   renders it read-only over there, so a typo could not be corrected. */
export default function FundPanel() {
  const [amount, setAmount] = useState(FUND.suggested)
  const [note, setNote] = useState("")
  const [sending, setSending] = useState(false)
  const [previewing, setPreviewing] = useState(false)

  const now = Math.min(1, FUND.raised / FUND.goal)
  const next = Math.min(1, (FUND.raised + amount) / FUND.goal)

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

  return (
    <section
      aria-label={FUND.title}
      /* The same inset as the profile card's. */
      className={`fund-panel px-4 pt-4 pb-5 md:pt-5.5 md:pr-6 md:pb-6 md:pl-7 ${
        previewing ? "is-previewing" : ""
      }`}
    >
      <div className="fund-print">
        <div className="fund-window">
          <img src={FUND.print.src} alt="" loading="lazy" decoding="async" />
          <span className="dymo">{FUND.eyebrow}</span>
        </div>
        <div className="fund-caption">
          <span className="scrawl">{FUND.print.scrawl}</span>
          {/* The title is written on the print on a phone, and beside it
              from md up; only one of the two is ever displayed. */}
          <h2 className="fund-caption-title heading-l">{FUND.title}</h2>
        </div>
        <span className="fund-tape" data-at="tl" />
        <span className="fund-tape" data-at="tr" />
      </div>

      <div className="fund-body">
        <p className="fund-eyebrow label-mono">{FUND.eyebrow}</p>
        <h2 className="fund-title heading-l">{FUND.title}</h2>
        <p className="body-small text-on-surface-variant">{FUND.blurb}</p>

        <div className="mt-1 flex items-baseline justify-between gap-part">
          <span className="body-large-bold tabular-nums">
            {dollars(FUND.raised)}
          </span>
          <span className="body-xs text-on-surface-variant tabular-nums">
            of {dollars(FUND.goal)} · {FUND.backers} backers
          </span>
        </div>
        <Meter
          value={now * 100}
          preview={next * 100}
          label={`${dollars(FUND.raised)} of ${dollars(FUND.goal)} raised`}
        />

        <form onSubmit={handleSubmit} noValidate className="space-y-part">
          <div
            role="group"
            aria-label="Amount"
            className="grid grid-cols-4 gap-cluster"
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

          {FUND.noteField && (
            <Field
              type="text"
              placeholder="Say something… (shows in the feed)"
              label="Message"
              value={note}
              onChange={setNote}
              required={false}
              size="sm"
            />
          )}

          {/* Focus events bubble in React, so the wrapper hears the
              button's as well as the pointer's. */}
          <div
            onMouseEnter={() => setPreviewing(true)}
            onMouseLeave={() => setPreviewing(false)}
            onFocus={() => setPreviewing(true)}
            onBlur={() => setPreviewing(false)}
          >
            <Button type="submit" icon={CreditCard} disabled={sending}>
              {sending ? "Opening Stripe…" : `Contribute ${dollars(amount)}`}
            </Button>
          </div>

          {FUND.cardHint && (
            <p className="body-xs text-center text-on-surface-variant">
              {CARD_HINT}
            </p>
          )}
        </form>
      </div>

      {TOP_CONTRIBUTORS.length > 0 && (
        <div className="fund-contributors">
          <span className="label-mono text-on-surface-variant">
            Top contributors
          </span>
          {TOP_CONTRIBUTORS.map((sup, i) => (
            <SupporterRow
              key={`${sup.name}-${sup.msg}`}
              supporter={sup}
              rank={i + 1}
            />
          ))}
        </div>
      )}
    </section>
  )
}
