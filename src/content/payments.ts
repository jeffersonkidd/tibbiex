import { VENMO_HANDLE } from "./site"

/* The two ways money can arrive. Venmo is a hand-off to an app the visitor
   already has; Stripe is a card checkout that this site's one serverless
   function opens. Same amount and note feed both.

   Card is the rail the paying panels are built around -- it is the only one
   that returns the payer to the site, mails a receipt and can collect an
   address. Venmo hangs off a link under the button (VenmoLink), so nothing
   here needs a label or an icon any more. */
export type Rail = "venmo" | "card"

/* The /u/ is load-bearing on a phone. Venmo's universal-link association
   (venmo.com/.well-known/apple-app-site-association) lists /u/*, and a bare
   venmo.com/<handle> is not on it -- it 302s to account.venmo.com, whose own
   association covers nothing but /go/*. So the bare path opens the web page
   and the app never comes up, which is why the profile card's Venmo key
   (SOCIALS in content/profile.ts, already /u/) worked and these did not.
   Both have to stay on /u/; the txn params ride along it unchanged. */
export function venmoPayUrl(amount: number, note: string) {
  const params = new URLSearchParams({
    txn: "pay",
    amount: amount.toFixed(2),
    note: note.trim() || "Still Alive podcast",
  })
  return `https://venmo.com/u/${VENMO_HANDLE}?${params}`
}

/* The fine print under a paying panel's button. The Venmo half of it is on
   the link itself, which names the handle. */
export const CARD_HINT = "Card payments are processed by Stripe."

/* How a shop order travels, in USPS's own classes: a letter (a sticker), a
   flat -- a large envelope, for something too thick to post as a letter (a
   patch) -- or a parcel (a tee, a record). Each shop format names one. */
export type Mail = "letter" | "flat" | "parcel"

/* Every shop price is plus flat US shipping, in whole dollars, at the rates
   the client set: $2 a sticker, $3 a patch, $8 a tee. The site ships
   domestically only. api/checkout.ts keeps its own copy in SHIPPING_RATES,
   which is what Stripe charges: change both. */
export const SHIPPING: { rates: Record<Mail, number>; staged?: true } = {
  rates: { letter: 2, flat: 3, parcel: 8 },
}
