/* The profile picture preview's send: a photo the client has tried on the
 * card at /preview, mailed to CONTACT_EMAIL as an attachment so it can be cut
 * and switched in by hand. Nothing here changes the site.
 *
 * Its own function rather than a purpose on api/contact.ts because it takes a
 * multipart upload, not JSON: base64 in a JSON body would cost a third of the
 * 4.5 MB request limit Vercel puts on a function. Like the other two it calls
 * Resend's REST API with fetch, and it checks the file's own bytes rather than
 * the type the browser claims -- a public endpoint that mails attachments
 * should only ever forward pictures.
 *
 * Requires RESEND_API_KEY and MAIL_FROM. `pnpm dev` does not run this file --
 * use `vercel dev` to exercise it locally.
 */

const RESEND_API = "https://api.resend.com/emails"

/* Mirrors CONTACT_EMAIL in src/content/site.ts, which the function cannot
   import: that module is part of the app bundle. Change both together. */
const CONTACT_EMAIL = "contact@tibbiex.studio"

/* Under Vercel's 4.5 MB request cap with room for the form around it. The
   page checks the same number before sending; keep them in step with
   PORTRAIT_MAX_BYTES in src/lib/messages.ts. */
const MAX_BYTES = 4 * 1024 * 1024
const NOTE_MAX_LENGTH = 2000

/* The ISO-media brands an iPhone or a converter writes for HEIC, HEIF and
   AVIF. They share one container, so the brand is what tells them apart. */
const FTYP_BRANDS: Record<string, string> = {
  heic: "heic",
  heix: "heic",
  heim: "heic",
  heis: "heic",
  hevc: "heic",
  mif1: "heif",
  msf1: "heif",
  avif: "avif",
}

/* The file's extension from its first bytes, or null if it is not a picture
   we forward. */
function sniff(bytes: Uint8Array) {
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...bytes.subarray(start, end))
  if (bytes[0] === 0x89 && ascii(1, 4) === "PNG") return "png"
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg"
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp"
  if (ascii(4, 8) === "ftyp") return FTYP_BRANDS[ascii(8, 12)] ?? null
  return null
}

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 })
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.MAIL_FROM
  if (!apiKey || !from) {
    return Response.json(
      { error: "Messages aren't configured yet." },
      { status: 503 },
    )
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return badRequest("Expected a form upload.")
  }

  /* The honeypot. Answer a filled one the way a successful send looks. */
  const website = form.get("website")
  if (typeof website === "string" && website.trim()) {
    return Response.json({ sent: true })
  }

  const photo = form.get("photo")
  if (!(photo instanceof File) || photo.size === 0) {
    return badRequest("Choose a picture first.")
  }
  if (photo.size > MAX_BYTES) {
    return Response.json(
      { error: "That picture is over 4 MB." },
      { status: 413 },
    )
  }

  const bytes = new Uint8Array(await photo.arrayBuffer())
  const extension = sniff(bytes)
  if (!extension) {
    return badRequest("That file isn't a picture we can use.")
  }

  const rawNote = form.get("note")
  const note =
    typeof rawNote === "string"
      ? rawNote
          .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ")
          .trim()
          .slice(0, NOTE_MAX_LENGTH)
      : ""

  /* The filename is ours, not the uploader's: theirs could carry anything. */
  const stamp = new Date().toISOString().slice(0, 10)
  const filename = `portrait-${stamp}.${extension}`
  const body = [
    "Profile picture submitted from the preview page.",
    `File: ${filename} (${(photo.size / 1024).toFixed(0)} KB)`,
    note && `\n${note}`,
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
      subject: "Profile picture submission",
      text: body,
      attachments: [
        { filename, content: Buffer.from(bytes).toString("base64") },
      ],
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
