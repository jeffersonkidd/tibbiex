/* Stripe Checkout for every card payment on the site: the podcast fund, reading
 * deposits and shop orders.
 *
 * The site is a static SPA, so this is the one piece of server it has: it takes
 * an amount, a note and a purpose from a panel, opens a Checkout Session and
 * hands the hosted payment page's URL back. Stripe's secret key never reaches the
 * browser, and the amount is re-validated here -- whatever the client sends is
 * a suggestion, not a fact.
 *
 * It calls Stripe's REST API with fetch rather than the `stripe` SDK, which
 * keeps the project at zero new dependencies for one endpoint.
 *
 * A shop order names what it buys (item, format, size) and the price, shipping
 * and wording are read from the catalogue the studio published
 * (api/products.ts), so the amount on Stripe's page is the shop's, not the
 * browser's. Until a catalogue is published the shop runs on the one bundled
 * with the app, and an order falls back to the amount the client sends.
 *
 * Requires STRIPE_SECRET_KEY in the Vercel project's environment variables.
 * `pnpm dev` does not run this file -- use `vercel dev` to exercise it locally.
 */

import { list } from "@vercel/blob"

const STRIPE_API = "https://api.stripe.com/v1/checkout/sessions"

/* $1 floor keeps out fee-losing dust; the ceiling is a guard against a typo (or
   someone poking the endpoint) creating an absurd session. */
const MIN_CENTS = 100
const MAX_CENTS = 100_000

const NOTE_MAX_LENGTH = 200

/* Everything Stripe shows about a payment comes from here, keyed by the
   purpose the client names -- so a request can choose which kind of payment it
   is, but never write the line item. Keep in step with CheckoutPurpose in
   src/lib/payments.ts. */
const PURPOSES = {
  fund: { name: "Still Alive Podcast — Tibbie X", submitType: "donate" },
  reading: { name: "1-on-1 Tarot Reading — deposit", submitType: "book" },
  shop: { name: "Tibbie X Studio order", submitType: "pay" },
} as const

type Purpose = keyof typeof PURPOSES

/* Flat US shipping on every shop order, in cents: a sticker goes as a
   letter, a patch as a flat, a tee as a parcel. A copy of SHIPPING in
   src/content/payments.ts, which cannot be imported here: change both. */
const SHIPPING_RATES = { letter: 200, flat: 300, parcel: 800 } as const

type Mail = keyof typeof SHIPPING_RATES

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 })
}

/* The slice of the published catalogue a price needs. The full shape and its
   validation live in api/products.ts, which wrote the file. */
type CatalogFormat = {
  id: string
  label: string
  price: number
  mail: Mail
  sizes?: { label: string; soldOut?: true }[]
}
type CatalogItem = {
  id: string
  item: string
  formats: CatalogFormat[]
  stock?: { left: number; of: number }
  hidden?: true
}

/* The newest published catalogue, or null when none is (or Blob is not
   connected), which is the cue for the legacy client-priced path. */
async function liveCatalog(): Promise<CatalogItem[] | null> {
  try {
    const { blobs } = await list({ prefix: "shop/catalog/" })
    const newest = blobs.sort(
      (a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt),
    )[0]
    if (!newest) return null
    const response = await fetch(newest.url, { cache: "no-store" })
    if (!response.ok) return null
    return ((await response.json()) as { items: CatalogItem[] }).items
  } catch {
    return null
  }
}

const field = (value: unknown, max = 64) =>
  typeof value === "string" ? value.trim().slice(0, max) : ""

/* What a shop order buys, priced from the catalogue. A string is a refusal
   to show the buyer. */
function priceOrder(
  items: CatalogItem[],
  payload: { item?: unknown; format?: unknown; size?: unknown },
): { cents: number; mail: Mail; note: string } | string {
  const item = items.find((entry) => entry.id === field(payload.item))
  if (!item || item.hidden) return "That item isn't in the shop any more."
  if (item.stock?.left === 0) return "That run is sold out."

  const format =
    item.formats.find((entry) => entry.id === field(payload.format)) ??
    (item.formats.length === 1 ? item.formats[0] : undefined)
  if (!format) return "Pick a format first."

  let size = ""
  if (format.sizes?.length) {
    const picked = format.sizes.find((s) => s.label === field(payload.size, 12))
    if (!picked) return "Pick a size first."
    if (picked.soldOut) return "That size is sold out."
    size = picked.label
  }

  const picked = [item.formats.length > 1 && format.label, size]
    .filter(Boolean)
    .join(", ")
  return {
    cents: Math.round(format.price * 100),
    mail: format.mail in SHIPPING_RATES ? format.mail : "parcel",
    note: picked ? `${item.item} — ${picked}` : item.item,
  }
}

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return Response.json(
      { error: "Card payments aren't configured yet." },
      { status: 503 },
    )
  }

  let payload: {
    amount?: unknown
    note?: unknown
    purpose?: unknown
    mail?: unknown
    item?: unknown
    format?: unknown
    size?: unknown
  }
  try {
    payload = await request.json()
  } catch {
    return badRequest("Expected a JSON body.")
  }

  const purpose: Purpose =
    typeof payload.purpose === "string" && payload.purpose in PURPOSES
      ? (payload.purpose as Purpose)
      : "fund"
  const { name, submitType } = PURPOSES[purpose]

  /* A shop order the published catalogue knows about is priced by it; the
     amount, note and mail the client sent are ignored. */
  const catalog = purpose === "shop" ? await liveCatalog() : null
  const priced = catalog && priceOrder(catalog, payload)
  if (typeof priced === "string") return badRequest(priced)

  const amount = priced ? priced.cents / 100 : Number(payload.amount)
  if (!Number.isFinite(amount)) {
    return badRequest("Amount must be a number.")
  }

  /* Dollars in, cents out -- rounding here rather than trusting the client's
     arithmetic, since fractional cents make Stripe reject the session. */
  const cents = Math.round(amount * 100)
  if (cents < MIN_CENTS || cents > MAX_CENTS) {
    return badRequest(
      `Amount must be between $${MIN_CENTS / 100} and $${MAX_CENTS / 100}.`,
    )
  }

  /* The note is shown back in the Stripe dashboard and is the seed of the
     supporter feed, so strip control characters and cap the length. */
  const note = (
    priced ? priced.note : typeof payload.note === "string" ? payload.note : ""
  )
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, NOTE_MAX_LENGTH)

  /* Return URLs come from this deployment's own origin, never from the request
     body: a client-supplied success_url would turn the endpoint into an open
     redirect that borrows Stripe's credibility. */
  const origin = new URL(request.url).origin

  const params = new URLSearchParams({
    mode: "payment",
    submit_type: submitType,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(cents),
    "line_items[0][price_data][product_data][name]": name,
    success_url: `${origin}/?checkout=thanks`,
    cancel_url: `${origin}/?checkout=cancelled`,
    "metadata[source]": purpose,
    "metadata[note]": note,
    /* Mirrored onto the PaymentIntent so the note survives on the charge
       itself, which is what a webhook-driven supporter feed would read. */
    "payment_intent_data[metadata][note]": note,
  })

  /* No customer_email: Checkout asks for one on its own page, and prefilling
     it from the client would render that field read-only, so a typo could not
     be corrected there. */
  if (purpose === "shop") {
    /* US only. */
    params.set("shipping_address_collection[allowed_countries][0]", "US")

    /* Unknown or missing mail is charged as a parcel, the dearer rate. */
    const mail: Mail = priced
      ? priced.mail
      : typeof payload.mail === "string" && payload.mail in SHIPPING_RATES
        ? (payload.mail as Mail)
        : "parcel"
    const rate = "shipping_options[0][shipping_rate_data]"
    params.set(`${rate}[type]`, "fixed_amount")
    params.set(`${rate}[display_name]`, "Shipping")
    params.set(`${rate}[fixed_amount][amount]`, String(SHIPPING_RATES[mail]))
    params.set(`${rate}[fixed_amount][currency]`, "usd")
    params.set("metadata[mail]", mail)
  }

  const stripeResponse = await fetch(STRIPE_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  })

  const session = await stripeResponse.json()

  if (!stripeResponse.ok || !session.url) {
    /* Stripe's own message can name the account or the key, so it goes to the
       function log and the browser gets something generic. */
    console.error("Stripe session failed", session?.error ?? session)
    return Response.json(
      { error: "Stripe could not start that payment." },
      { status: 502 },
    )
  }

  return Response.json({ url: session.url })
}
