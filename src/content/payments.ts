import { VENMO_HANDLE } from "./site"

/* The two ways money can arrive. Venmo is a hand-off to an app the visitor
   already has; Stripe is a card checkout that this site's one serverless
   function opens. Same amount and note feed both.

   Card is the rail the paying panels are built around -- it is the only one
   that returns the payer to the site, mails a receipt and can collect an
   address. Venmo hangs off a link under the button (VenmoLink), so nothing
   here needs a label or an icon any more. */
export type Rail = "venmo" | "card"

export function venmoPayUrl(amount: number, note: string) {
  const params = new URLSearchParams({
    txn: "pay",
    amount: amount.toFixed(2),
    note: note.trim() || "Still Alive podcast",
  })
  return `https://venmo.com/${VENMO_HANDLE}?${params}`
}

/* The fine print under a paying panel's button. The Venmo half of it is on
   the link itself, which names the handle. */
export const CARD_HINT = "Card payments are processed by Stripe."
