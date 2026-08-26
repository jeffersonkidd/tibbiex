/* Stripe Checkout for the tip jar.
 *
 * The site is a static SPA, so this is the one piece of server it has: it takes
 * an amount and a note from the widget, opens a Checkout Session and hands the
 * hosted payment page's URL back. Stripe's secret key never reaches the
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

  let payload: { amount?: unknown; note?: unknown }
  try {
    payload = await request.json()
  } catch {
    return badRequest("Expected a JSON body.")
  }

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
    submit_type: "donate",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(cents),
    "line_items[0][price_data][product_data][name]": "Support Tibbie X",
    success_url: `${origin}/?tip=thanks`,
    cancel_url: `${origin}/?tip=cancelled`,
    "metadata[source]": "tip-jar",
    "metadata[note]": note,
    /* Mirrored onto the PaymentIntent so the note survives on the charge
       itself, which is what a webhook-driven supporter feed would read. */
    "payment_intent_data[metadata][note]": note,
  })

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
