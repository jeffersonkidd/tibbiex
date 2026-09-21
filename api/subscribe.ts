/* The newsletter sign-up: puts the address into the Resend audience and tells
 * the visitor it landed.
 *
 * This is the one endpoint that writes somewhere durable. api/contact.ts sends
 * a message and forgets it; this adds a contact to a list that outlives the
 * request, which is what the sign-up's copy has always claimed happens.
 *
 * Requires RESEND_API_KEY, MAIL_FROM and RESEND_AUDIENCE_ID. `pnpm dev` does
 * not run this file -- use `vercel dev` to exercise it.
 */

const RESEND_CONTACTS_API = "https://api.resend.com/audiences"
const RESEND_EMAILS_API = "https://api.resend.com/emails"

/* Where a reply goes. MAIL_FROM only sends -- nothing receives there -- so a
   subscriber answering the confirmation would be talking to a wall without
   this. Mirrors CONTACT_EMAIL in src/content/site.ts, which the function
   cannot import: that module is part of the app bundle. Change both
   together. */
const CONTACT_EMAIL = "contact@tibbiex.studio"

/* Mirrors NEWSLETTER.topics in src/content/newsletter.ts, which this function
   cannot import. An unknown topic is dropped rather than rejected -- the list
   is a preference, not a credential. Keep the two in step. */
const TOPICS = ["Show dates", "Numbered drops", "Readings", "Podcast"]

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.MAIL_FROM
  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!apiKey || !from || !audienceId) {
    return Response.json(
      { error: "The list isn't configured yet." },
      { status: 503 },
    )
  }

  let payload: { email?: unknown; topics?: unknown; website?: unknown }
  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: "Expected a JSON body." }, { status: 400 })
  }

  /* The honeypot, answered the way success looks. */
  if (typeof payload.website === "string" && payload.website.trim()) {
    return Response.json({ subscribed: true })
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : ""
  if (!EMAIL_PATTERN.test(email)) {
    return Response.json(
      { error: "That email address doesn't look right." },
      { status: 400 },
    )
  }

  const asked = Array.isArray(payload.topics) ? payload.topics : []
  const picked = TOPICS.filter((topic) => asked.includes(topic))
  /* Picking nothing means everything -- the same thing the button says. */
  const wants = picked.length ? picked : TOPICS

  const contact = await fetch(`${RESEND_CONTACTS_API}/${audienceId}/contacts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    /* Resend has no custom fields on a contact, so the topics ride in the
       name. Signing up twice updates the existing contact rather than
       failing, which is why a second sign-up can change the choice. */
    body: JSON.stringify({
      email,
      first_name: wants.join(", "),
      unsubscribed: false,
    }),
  })

  if (!contact.ok) {
    console.error("Resend contact failed", await contact.text())
    return Response.json(
      { error: "Could not add you to the list." },
      { status: 502 },
    )
  }

  /* The confirmation is a courtesy, not the sign-up: they are on the list
     either way, so a failure here is logged and swallowed rather than told to
     someone who has already succeeded. */
  const welcome = await fetch(RESEND_EMAILS_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      reply_to: CONTACT_EMAIL,
      subject: "You're on the list",
      text: [
        "You'll hear about: " + wants.join(", ") + ".",
        "",
        "About once a month. Numbered runs go in a day and show dates land here before anywhere else.",
        "",
        "— Tibbie X",
        "",
        "Leave whenever: reply and say so — it goes straight to her.",
      ].join("\n"),
    }),
  })

  if (!welcome.ok) {
    console.error("Resend welcome failed", await welcome.text())
  }

  return Response.json({ subscribed: true })
}
