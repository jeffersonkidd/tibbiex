import { useState } from "react"
import { Mic, Send } from "lucide-react"
import { toast } from "sonner"

import { FUND, TOP_CONTRIBUTORS } from "../content/fund"
import { railHint } from "../content/payments"
import type { Rail } from "../content/payments"
import { isEmail } from "../lib/email"
import { payVia } from "../lib/payments"
import BrandButton from "../components/controls/BrandButton"
import Chip from "../components/controls/Chip"
import EmailField from "../components/controls/EmailField"
import Field from "../components/controls/Field"
import RailToggle from "../components/controls/RailToggle"
import Meter from "../components/Meter"
import PanelHeader from "../components/PanelHeader"
import SupporterRow from "../components/rows/SupporterRow"

const dollars = (n: number) => `$${n.toLocaleString("en-US")}`

/* Fund "Still Alive" -- the podcast fund on the Home tab, from the component
   reference in .files/tibbiex-components.html. How far along it is (the amber
   meter the rehearsal panel uses), one amount, one note, two rails out. It
   composes a hand-off and never touches the money.

   The email field only appears on the card rail, where Stripe sends the
   receipt to it. Venmo mails its own receipt, and a Venmo note is public by
   default, so on that rail there is nowhere honest to put an address. */
export default function FundPanel() {
  const [rail, setRail] = useState<Rail>("venmo")
  const [amount, setAmount] = useState(FUND.suggested)
  const [note, setNote] = useState("")
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const progress = (FUND.raised / FUND.goal) * 100

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rail === "card" && !isEmail(email)) {
      setEmailError("Enter an email for your receipt.")
      return
    }

    if (rail === "card") setSending(true)
    try {
      await payVia(rail, {
        amount,
        note,
        purpose: "fund",
        email: rail === "card" ? email : undefined,
      })
      /* The card rail is navigating away, so its button keeps saying so. */
      if (rail === "venmo") {
        toast.success("Venmo is open — thank you, seriously.")
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not reach Stripe.",
      )
      setSending(false)
    }
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

        <RailToggle rail={rail} onChange={setRail} />

        {rail === "card" && (
          <div>
            <EmailField
              value={email}
              onChange={(value) => {
                setEmail(value)
                setEmailError(null)
              }}
              error={emailError}
              label="Email for your receipt"
              size="sm"
            />
            {!emailError && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Stripe sends your receipt here.
              </p>
            )}
          </div>
        )}

        <BrandButton type="submit" disabled={sending}>
          <Send className="h-4 w-4" />
          {sending ? "Opening Stripe…" : `Contribute ${dollars(amount)}`}
        </BrandButton>

        <p className="text-center text-[11px] text-muted-foreground">
          {railHint(rail)}
        </p>
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
