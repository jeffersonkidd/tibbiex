/* The profile avatar, changeable from the studio without a deploy.

     GET     where the current avatar is: a redirect to it (what the profile
             card's <img> asks for), or JSON with ?format=json (what the
             studio asks for). 404 while none has been uploaded, and the card
             falls back to the portrait bundled with the app.
     POST    publish a new one: the studio's crop, already squared and
             shrunk in the browser (WebP, or PNG where the browser cannot
             encode WebP), as the raw request body.
     DELETE  go back to the bundled portrait.

   Writes need the studio passcode in the `x-studio-passcode` header, checked
   against STUDIO_PASSCODE. It is the studio's first secret and the only gate
   it has, so make it long -- there is no rate limit behind it.

   Files live in Vercel Blob under avatar/, one per upload with a random
   suffix, so a new face is a new URL and no cache anywhere can serve the old
   one. After a successful upload the older files are deleted.

   Requires a Blob store connected to the project (which sets
   BLOB_READ_WRITE_TOKEN) and STUDIO_PASSCODE. `pnpm dev` does not run this
   file -- use `vercel dev` to exercise it. */
import { del, list, put } from "@vercel/blob"

import { authorised, readImage, refused } from "./_lib/studio.js"

const PREFIX = "avatar/"

/* The studio sends a 720px square, well under this; anything bigger did not
   come from the studio. */
const MAX_BYTES = 3 * 1024 * 1024

/* The redirect and the 404 are cached at Vercel's edge for a minute, so the
   profile card costs visitors one cached hop and a new avatar is live within
   a minute of upload. */
const EDGE_CACHE = "public, max-age=0, s-maxage=60, stale-while-revalidate=600"

async function current() {
  const { blobs } = await list({ prefix: PREFIX })
  return blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))
}

function unavailable() {
  return Response.json(
    { error: "Avatar storage isn't configured yet." },
    { status: 503 },
  )
}

export async function GET(request: Request) {
  const asJson = new URL(request.url).searchParams.get("format") === "json"
  /* Unconfigured storage reads as "no custom avatar" to the site, so the
     card shows the bundled portrait rather than a broken image. */
  const latest = (await current().catch(() => []))[0]

  if (asJson) {
    return Response.json(
      latest
        ? { url: latest.url, uploadedAt: latest.uploadedAt }
        : { url: null },
      { headers: { "Cache-Control": "no-store" } },
    )
  }
  if (!latest) {
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": EDGE_CACHE },
    })
  }
  return new Response(null, {
    status: 302,
    headers: { Location: latest.url, "Cache-Control": EDGE_CACHE },
  })
}

export async function POST(request: Request) {
  if (!authorised(request)) return refused()

  const image = await readImage(request, MAX_BYTES)
  if (image instanceof Response) return image

  try {
    const blob = await put(
      `${PREFIX}face.${image.ext}`,
      Buffer.from(image.body),
      { access: "public", addRandomSuffix: true, contentType: image.type },
    )
    const stale = (await current()).filter((b) => b.url !== blob.url)
    if (stale.length) await del(stale.map((b) => b.url))
    return Response.json({ url: blob.url })
  } catch {
    return unavailable()
  }
}

export async function DELETE(request: Request) {
  if (!authorised(request)) return refused()
  try {
    const blobs = await current()
    if (blobs.length) await del(blobs.map((b) => b.url))
    return Response.json({ url: null })
  } catch {
    return unavailable()
  }
}
