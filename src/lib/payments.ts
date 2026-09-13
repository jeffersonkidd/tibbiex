/* Client half of the tip jar's card rail. Asks the serverless function
   (api/checkout.ts) for a Stripe Checkout Session and returns the hosted page's
   URL. Errors come back as a thrown message the widget can put in a toast -- the
   caller has no useful way to recover, only to say so. */
export async function stripeCheckoutUrl(amount: number, note: string) {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, note }),
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