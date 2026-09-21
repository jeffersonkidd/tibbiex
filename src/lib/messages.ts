/* Client half of the two message endpoints. The site used to hand every form
   to the visitor's mail client; these post them instead, and the panels show
   what happened.

   Shaped like lib/payments.ts on purpose: errors come back as a thrown
   message the caller can put in a toast, because a form has no useful way to
   recover -- only to say so. */

export type ContactPurpose = "booking" | "restock"

export type Message = {
  purpose: ContactPurpose
  email: string
  name?: string
  /* What it is about: the item and size on a restock, nothing on a booking. */
  subject?: string
  message?: string
  /* The honeypot field's value. Empty from a person, filled by a bot; the
     endpoint answers a filled one the way success looks. */
  website?: string
}

/* Both endpoints answer the same way, and both are absent from the static dev
   server, which is the everyday `pnpm dev` case rather than a fault. */
async function post(path: string, body: unknown) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (response.status === 404) {
    throw new Error("Messages only send on the deployed site.")
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error ?? "Could not send that.")
  }
  return data
}

export function sendMessage(message: Message) {
  return post("/api/contact", message)
}

export function subscribe(email: string, topics: string[], website = "") {
  return post("/api/subscribe", { email, topics, website })
}
