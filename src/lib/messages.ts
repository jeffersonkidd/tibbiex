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

/* The largest picture api/portrait.ts accepts -- under Vercel's 4.5 MB
   request cap. Mirrors MAX_BYTES there; change both together. */
export const PORTRAIT_MAX_BYTES = 4 * 1024 * 1024

/* Every endpoint answers the same way, and all are absent from the static dev
   server, which is the everyday `pnpm dev` case rather than a fault. A
   FormData body goes as it is, so the browser writes the multipart boundary;
   anything else goes as JSON. */
async function post(path: string, body: unknown) {
  const response = await fetch(
    path,
    body instanceof FormData
      ? { method: "POST", body }
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
  )

  if (response.status === 404) {
    throw new Error("Messages only send on the deployed site.")
  }
  /* Vercel turns away an oversized body before the function sees it. */
  if (response.status === 413) {
    throw new Error("That picture is over 4 MB.")
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

/* The preview page's send: the original file, untouched, so it can be cut
   for the site by hand. */
export function submitPortrait(photo: File, note: string, website = "") {
  const form = new FormData()
  form.set("photo", photo)
  form.set("note", note)
  form.set("website", website)
  return post("/api/portrait", form)
}
