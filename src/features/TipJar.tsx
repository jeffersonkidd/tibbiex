import { useEffect, useState } from "react"
import { Mic, Send } from "lucide-react"
import { toast } from "sonner"

import {
  RAILS,
  TIP_PRESETS,
  TOP_CONTRIBUTORS,
  VENMO_HANDLE,
  venmoPayUrl,
} from "../data"
import type { Rail } from "../data"
import { stripeCheckoutUrl } from "../lib/payments"
import BrandButton from "../components/BrandButton"
import Field from "../components/Field"

/* Tip jar under the link rows. One amount and one note, two ways out: Venmo
   hands off to the app with both in the query string, while Card posts them to
   api/checkout.ts and follows the Stripe Checkout Session it opens. Neither
   path touches money in this component -- it only composes the hand-off. The
   rail toggle and the preset chips both reuse .brand-surface, the treatment
   the active tab uses, so "selected" reads the same way across the page. */
export default function TipJar() {
  const [rail, setRail] = useState<Rail>("venmo")
  const [preset, setPreset] = useState(TIP_PRESETS[1])
  const [custom, setCustom] = useState("")
  const [note, setNote] = useState("")
  const [sending, setSending] = useState(false)

  const amount = custom ? Number(custom) : preset
  const validAmount = Number.isFinite(amount) && amount > 0

  /* Stripe sends the payer back here with a flag on the URL. Say thank you,
     then strip the flag so a refresh does not repeat the toast. */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const outcome = params.get("tip")
    if (!outcome) return

    if (outcome === "thanks") {
      toast.success("Payment received — thank you, seriously.")
    } else if (outcome === "cancelled") {
      toast("Payment cancelled. No hard feelings.")
    }

    params.delete("tip")
    const query = params.toString()
    window.history.replaceState(
      {},
      "",
      window.location.pathname + (query ? `?${query}` : ""),
    )
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validAmount) {
      toast.error("Enter an amount above $0.")
      return
    }

    if (rail === "venmo") {
      window.open(venmoPayUrl(amount, note), "_blank", "noopener,noreferrer")
      toast.success("Venmo is open — thank you, seriously.")
      return
    }

    setSending(true)
    try {
      /* A full navigation rather than a new tab: Stripe's hosted page returns
         the payer to the success_url, and that round trip only works in the
         tab that left. */
      window.location.href = await stripeCheckoutUrl(amount, note)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not reach Stripe.",
      )
      setSending(false)
    }
  }

  return (
    <section className="surface rounded-lg p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-md border border-accent-soft bg-accent-tint p-2 text-accent-strong">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base">Fund “Still Alive”</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tibbie X interviews the East Coast punks who kept it going
            </p>
          </div>
        </div>
        <span className="mono-label shrink-0 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-accent-strong">
          Podcast Fund
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        {/* Which rail the money travels on. Outlined rather than brand red:
            inside these panels the only red belongs to the submit button, so a
            selected rail or preset reads as a lighter outline instead. */}
        <div className="flex gap-2 rounded-md border border-border bg-input-background p-1">
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

        <div className="grid grid-cols-4 gap-2">
          {TIP_PRESETS.map((amt) => {
            const selected = preset === amt && !custom
            return (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setPreset(amt)
                  setCustom("")
                }}
                className={`rounded-md border py-2 text-sm font-bold transition-all ${
                  selected
                    ? "brand-pop border-foreground/40 bg-muted text-foreground"
                    : "border-border bg-input-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                ${amt}
              </button>
            )
          })}
        </div>

        {/* Field carries w-full, so the row's widths live on wrappers rather
            than in Field's className -- two width utilities on one element let
            the stylesheet's order decide the winner, which put the amount at
            full width and pushed the note field out of the card. */}
        <div className="flex gap-2">
          <div className="w-28 shrink-0">
            <Field
              type="number"
              placeholder="Custom $"
              value={custom}
              onChange={setCustom}
              required={false}
              min="1"
              step="1"
              inputMode="decimal"
              className="px-3 py-2.5"
            />
          </div>
          <div className="min-w-0 flex-1">
            <Field
              type="text"
              placeholder="Say something…"
              value={note}
              onChange={setNote}
              required={false}
              className="px-3 py-2.5"
            />
          </div>
        </div>

        <BrandButton type="submit" disabled={sending}>
          <Send className="h-4 w-4" />
          {sending
            ? "Opening Stripe…"
            : `Send Support${validAmount ? ` $${amount}` : ""}`}
        </BrandButton>

        <p className="text-center text-[11px] text-muted-foreground">
          {rail === "venmo"
            ? `Opens Venmo to pay @${VENMO_HANDLE} directly.`
            : "Card payments are processed by Stripe."}
        </p>
      </form>

      {TOP_CONTRIBUTORS.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <span className="mono-label block text-muted-foreground">
            Top Contributors
          </span>
          <div className="hide-scrollbar mt-2 max-h-32 space-y-1.5 overflow-y-auto">
            {TOP_CONTRIBUTORS.map((sup, i) => (
              <div
                key={`${sup.name}-${sup.msg}`}
                className="flex items-center gap-2 rounded-md border border-border bg-muted/40 p-2 text-xs"
              >
                <span className="mono-label w-4 shrink-0 text-muted-foreground">
                  {i + 1}
                </span>
                <p className="min-w-0 flex-1 truncate">
                  <span className="font-bold">{sup.name}</span>
                  <span className="ml-1.5 text-muted-foreground">
                    “{sup.msg}”
                  </span>
                </p>
                <span className="shrink-0 font-bold text-accent-strong">
                  ${sup.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}