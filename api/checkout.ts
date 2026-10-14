/* Stripe Checkout for every card payment on the site: the podcast fund, reading
 * deposits and shop orders.
 *
 * The site is a static SPA, so this is the one piece of server it has: it takes
 * an amount, a note and a purpose from a panel, opens a Checkout Session and
 * hands the hosted payment page's URL back. Stripe's secret key never reaches the
 * browser, and the amount is re-validated here -- whatever the client sends is
 * a suggestion, not a fact.
 *
 * A shop order names what it is buying (product, format, size). Once the
 * studio has saved a catalogue, the price, the shipping class and the line
 * item come from that catalogue, and the amount the browser sent is ignored;
 * an item that is hidden, sold out or gone is refused. Before the first save
 * the shop shows the products bundled with the app, and the amount is
 * checked against the floor and ceiling only, as it always was.
 *
 * It calls Stripe's REST API with fetch rather than the `stripe` SDK.
 *
 * Requires STRIPE_SECRET_KEY in the Vercel project's environment variables.
 * `pnpm dev` does not run this file -- use `vercel dev` to exercise it locally.
 */

import { readCatalog } from "./_lib/store.js"

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

/* What a shop order costs according to the studio's catalogue: the format's
   price and shipping class, and a line item naming exactly what was bought.
   Null when there is no saved catalogue yet (the bundled shop is showing);
   a sentence when the item cannot be bought. */
async function priceFromCatalog(
  picked: unknown,
): Promise<{ amount: number; name: string; mail: Mail } | null | string> {
  let catalog
  try {
    catalog = await readCatalog()
  } catch {
    return null
  }
  if (!catalog) return null

  const { id, format, size } = (picked ?? {}) as Record<string, unknown>
  const product = catalog.products.find((p) => p.id === id && p.live)
  const chosen = product?.formats.find((f) => f.id === format)
  if (!product || !chosen) return "That item isn't for sale any more."
  if (product.stock && product.stock.left <= 0) {
    return `${product.name} is sold out.`
  }
  if (chosen.sizes.length > 0) {
    const fits = chosen.sizes.find((s) => s.label === size)
    if (!fits) return "Pick a size first."
    if (fits.soldOut) return `${size} is sold out.`
  }

  const parts = [product.formats.length > 1 && chosen.label, size]
    .filter(Boolean)
    .join(", ")
  return {
    amount: chosen.price,
    name: parts ? `${product.name} — ${parts}` : product.name,
    mail: chosen.mail,
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
    product?: unknown
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
  let name: string = PURPOSES[purpose].name
  const { submitType } = PURPOSES[purpose]

  let amount = Number(payload.amount)
  let mailFromCatalog: Mail | undefined
  if (purpose === "shop") {
    const priced = await priceFromCatalog(payload.product)
    if (typeof priced === "string") return badRequest(priced)
    if (priced) {
      amount = priced.amount
      name = priced.name
      mailFromCatalog = priced.mail
    }
  }
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
  const note =
    typeof payload.note === "string"
      ? payload.note
          .replace(/[\u0000-\u001f\u007f]/g, " ")
          .trim()
          .slice(0, NOTE_MAX_LENGTH)
      : ""

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
    const mail: Mail =
      mailFromCatalog ??
      (typeof payload.mail === "string" && payload.mail in SHIPPING_RATES
        ? (payload.mail as Mail)
        : "parcel")
    const rate = "shipping_options[0][shipping_rate_data]"
    params.set(`${rate}[type]`, "fixed_amount")
    params.set(`${rate}[display_name]`, "Shipping")
    params.set(`${rate}[fixed_amount][amount]`, String(SHIPPING_RATES[mail]))
    params.set(`${rate}[fixed_amount][currency]`, "usd")
    params.set("metadata[mail]", mail)

    /* What was bought, by id, so the orders the studio will list can be
       matched back to products. */
    const { id, format, size } = (payload.product ?? {}) as Record<
      string,
      unknown
    >
    for (const [key, value] of Object.entries({ id, format, size })) {
      if (typeof value === "string" && value) {
        params.set(`metadata[product_${key}]`, value.slice(0, 60))
      }
    }
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
