import { useEffect } from "react"
import { toast } from "sonner"

import { venmoPayUrl } from "../content/payments"
import type { Rail } from "../content/payments"

/* What a payment is for. The server maps each one to the name, receipt
   wording and metadata Stripe shows, so a client can pick a purpose but never
   write the line item itself. Keep in step with PURPOSES in api/checkout.ts. */
export type CheckoutPurpose = "fund" | "reading" | "shop"

export type Order = {
  amount: number
  note: string
  purpose: CheckoutPurpose
  /* Prefills Stripe's receipt address. Venmo has nowhere to put it. */
  email?: string
}

/* Client half of the card rail. Asks the serverless function (api/checkout.ts)
   for a Stripe Checkout Session and returns the hosted page's URL. Errors come
   back as a thrown message the caller can put in a toast -- it has no useful
   way to recover, only to say so. */
export async function stripeCheckoutUrl(order: Order) {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  })

  /* A 404 here is the everyday case of running `pnpm dev`, which serves the
     static app without the function. */
  if (response.status === 404) {
    throw new Error("Card payments only run on the deployed site.")
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.url) {
    throw new Error(data.error ?? "Could not reach Stripe.")
  }
  return data.url as string
}

/* Sends one order down the chosen rail. Venmo opens in a new tab and returns
   straight away; the card rail takes the whole tab, because Stripe's return
   trip only lands in the tab that left. The site never touches the money --
   this only composes the hand-off. Throws when the card rail cannot start. */
export async function payVia(rail: Rail, order: Order) {
  if (rail === "venmo") {
    window.open(
      venmoPayUrl(order.amount, order.note),
      "_blank",
      "noopener,noreferrer",
    )
    return
  }
  window.location.href = await stripeCheckoutUrl(order)
}

/* Stripe sends the payer back with ?checkout=thanks|cancelled, whichever panel
   they paid from. Say so once, then strip the flag so a refresh does not repeat
   the toast. Mounted once, in App. */
export function useCheckoutReturn() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const outcome = params.get("checkout")
    if (!outcome) return

    if (outcome === "thanks") {
      toast.success("Payment received — thank you, seriously.")
    } else if (outcome === "cancelled") {
      toast("Payment cancelled. No hard feelings.")
    }

    params.delete("checkout")
    const query = params.toString()
    window.history.replaceState(
      {},
      "",
      window.location.pathname + (query ? `?${query}` : ""),
    )
  }, [])
}
