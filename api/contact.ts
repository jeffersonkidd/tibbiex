/* The site's one inbound message endpoint: the booking form and the restock
 * alert both land here.
 *
 * Both used to compose a `mailto:` and hand it to the visitor's own mail
 * client, which meant nothing arrived unless they had one configured and
 * remembered to press send. This sends the mail itself, through Resend.
 *
 * Like api/checkout.ts it calls the provider's REST API with fetch rather than
 * the `resend` SDK, which keeps the project at zero new dependencies, and it
 * re-validates everything the client sends -- a public endpoint that sends
 * mail is a spam relay if it trusts its input.
 *
 * Requires RESEND_API_KEY and MAIL_FROM. `pnpm dev` does not run this file --
 * use `vercel dev` to exercise it locally.
 */

const RESEND_API = "https://api.resend.com/emails"

/* Where the mail goes. Mirrors CONTACT_EMAIL in src/content/site.ts, which the
   function cannot import: that module is part of the app bundle. Change both
   together. */
const CONTACT_EMAIL = "contact@tibbiex.studio"

/* Every kind of message this endpoint will send, keyed by the purpose the
   client names -- so a request can pick a kind but never write the subject or
   decide the recipient. */
const PURPOSES = {
  booking: { subject: "Booking enquiry", lead: "Booking / contact form" },
  restock: { subject: "Restock alert", lead: "Restock request" },
} as const

type Purpose = keyof typeof PURPOSES

const NAME_MAX_LENGTH = 100
const SUBJECT_MAX_LENGTH = 120
const MESSAGE_MAX_LENGTH = 4000

/* Loose on purpose: this only keeps garbage out of the send. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 })
}

/* A header takes one line. Anything that could start a second one -- a
   newline, or the encoded forms of it -- is how a reply-to becomes a Bcc. */
function headerSafe(value: string, max: number) {
  return value
    .replace(/[\r\n\u2028\u2029\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, max)
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY
  /* What the site sends *as*: a full "Name <address>", and an address that
     only sends. Mail to the apex is Cloudflare's to route, so sending as the
     contact address -- which also receives -- invites a loop. */
  const from = process.env.MAIL_FROM
  if (!apiKey || !from) {
    return Response.json(
      { error: "Messages aren't configured yet." },
      { status: 503 },
    )
  }

  let payload: {
    purpose?: unknown
    name?: unknown
    email?: unknown
    message?: unknown
    subject?: unknown
    /* The honeypot: a field no visitor sees, so anything in it is a bot. */
    website?: unknown
  }
  try {
    payload = await request.json()
  } catch {
    return badRequest("Expected a JSON body.")
  }

  /* Answer a filled honeypot the way a successful send looks. A bot told it
     failed tries again with the field cleared. */
  if (typeof payload.website === "string" && payload.website.trim()) {
    return Response.json({ sent: true })
  }

  const purpose: Purpose =
    typeof payload.purpose === "string" && payload.purpose in PURPOSES
      ? (payload.purpose as Purpose)
      : "booking"
  const { subject, lead } = PURPOSES[purpose]

  const sender =
    typeof payload.email === "string" ? payload.email.trim() : undefined
  if (!sender || !EMAIL_PATTERN.test(sender)) {
    return badRequest("That email address doesn't look right.")
  }

  const name = headerSafe(
    typeof payload.name === "string" ? payload.name : "",
    NAME_MAX_LENGTH,
  )
  /* What the request is about -- the item and size for a restock, nothing for
     a booking. The client names it; it never names the recipient. */
  const about = headerSafe(
    typeof payload.subject === "string" ? payload.subject : "",
    SUBJECT_MAX_LENGTH,
  )
  const message =
    typeof payload.message === "string"
      ? payload.message
          .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ")
          .trim()
          .slice(0, MESSAGE_MAX_LENGTH)
      : ""

  if (purpose === "booking" && !message) {
    return badRequest("Write a message first.")
  }

  const heading = [subject, name || about].filter(Boolean).join(" — ")
  const body = [
    lead,
    name && `From: ${name}`,
    `Email: ${sender}`,
    about && `About: ${about}`,
    message && `\n${message}`,
  ]
    .filter(Boolean)
    .join("\n")

  const response = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [CONTACT_EMAIL],
      /* So hitting reply in the inbox answers the visitor, not the site. */
      reply_to: sender,
      subject: heading,
      text: body,
      html: `<pre style="font: 14px/1.5 ui-monospace, monospace; white-space: pre-wrap">${escapeHtml(body)}</pre>`,
    }),
  })

  if (!response.ok) {
    /* Resend's message can name the account or the key, so it goes to the
       function log and the browser gets something generic. */
    console.error("Resend send failed", await response.text())
    return Response.json({ error: "Could not send that." }, { status: 502 })
  }

  return Response.json({ sent: true })
}
