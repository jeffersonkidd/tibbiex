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
 * Requires STRIPE_SECRET_KEY in the Vercel project's environment variables.
 * `pnpm dev` does not run this file -- use `vercel dev` to exercise it locally.
 */

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

/* Shop orders ship "US and international"; Stripe needs the list spelled out. */
const SHIPPING_COUNTRIES = [
  "US",
  "CA",
  "MX",
  "GB",
  "IE",
  "FR",
  "DE",
  "NL",
  "BE",
  "LU",
  "ES",
  "PT",
  "IT",
  "AT",
  "CH",
  "DK",
  "SE",
  "NO",
  "FI",
  "PL",
  "CZ",
  "AU",
  "NZ",
  "JP",
]

/* Flat shipping on every shop order, in cents, by how it travels: a sticker
   or patch goes as a letter, a tee as a parcel. Checkout cannot filter fixed
   rates by the address it collects, so both are offered and the payer picks
   theirs -- the address on the order is there to check it against. A copy of
   SHIPPING in src/content/payments.ts, which shows these to the visitor and
   cannot be imported here: change both. */
const SHIPPING_RATES = {
  letter: { us: 300, world: 600 },
  parcel: { us: 600, world: 1800 },
} as const

type Mail = keyof typeof SHIPPING_RATES

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 })
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

  const amount = Number(payload.amount)
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
    SHIPPING_COUNTRIES.forEach((country, i) =>
      params.set(
        `shipping_address_collection[allowed_countries][${i}]`,
        country,
      ),
    )

    /* A missing or unknown kind of mail is charged as a parcel, the dearer
       of the two, so a doctored request cannot ship a tee at letter rate by
       omission. */
    const mail: Mail =
      typeof payload.mail === "string" && payload.mail in SHIPPING_RATES
        ? (payload.mail as Mail)
        : "parcel"
    const rates = SHIPPING_RATES[mail]
    const options = [
      { name: "US shipping", cents: rates.us },
      { name: "International shipping", cents: rates.world },
    ]
    options.forEach(({ name, cents }, i) => {
      const key = `shipping_options[${i}][shipping_rate_data]`
      params.set(`${key}[type]`, "fixed_amount")
      params.set(`${key}[display_name]`, name)
      params.set(`${key}[fixed_amount][amount]`, String(cents))
      params.set(`${key}[fixed_amount][currency]`, "usd")
    })
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
