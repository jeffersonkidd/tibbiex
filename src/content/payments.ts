import { CreditCard } from "lucide-react"

import VenmoIcon from "../graphics/icons/VenmoIcon"
import { VENMO_HANDLE } from "./site"

/* The two ways money can arrive. Venmo is a hand-off to an app the visitor
   already has; Stripe is a card checkout that this site's one serverless
   function opens. Same amount and note feed both. */
export const RAILS = [
  { id: "venmo", label: "Venmo", icon: VenmoIcon },
  { id: "card", label: "Card", icon: CreditCard },
] as const

export type Rail = (typeof RAILS)[number]["id"]

export function venmoPayUrl(amount: number, note: string) {
  const params = new URLSearchParams({
    txn: "pay",
    amount: amount.toFixed(2),
    note: note.trim() || "Still Alive podcast",
  })
  return `https://venmo.com/${VENMO_HANDLE}?${params}`
}

/* The fine print under a paying panel's button, per rail. */
export function railHint(rail: Rail) {
  return rail === "venmo"
    ? `Opens Venmo to pay @${VENMO_HANDLE} directly.`
    : "Card payments are processed by Stripe."
}
