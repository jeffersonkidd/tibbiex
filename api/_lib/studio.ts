/* What every studio endpoint shares: the passcode check and the image
   checks. A leading underscore keeps this folder from becoming routes. */
import { createHash, timingSafeEqual } from "node:crypto"

/* Writes need the studio passcode in the `x-studio-passcode` header, checked
   against STUDIO_PASSCODE. Compared as digests so the check takes the same
   time whatever was sent. There is no rate limit behind it, so the passcode
   has to be long. */
export function authorised(request: Request) {
  const expected = process.env.STUDIO_PASSCODE
  const given = request.headers.get("x-studio-passcode")
  if (!expected || !given) return false
  const digest = (text: string) => createHash("sha256").update(text).digest()
  return timingSafeEqual(digest(given), digest(expected))
}

export function refused() {
  return Response.json({ error: "That passcode isn't right." }, { status: 401 })
}

function ascii(bytes: Uint8Array, from: number, to: number) {
  return String.fromCharCode(...bytes.subarray(from, to))
}

/* The image types the studio uploads, each with its file extension and the
   bytes it starts with, so a body has to be what its header says. The
   studio shrinks every photo in the browser to WebP, or PNG where the
   browser cannot encode WebP. */
const IMAGE_FORMATS: Record<
  string,
  { ext: string; is: (b: Uint8Array) => boolean }
> = {
  "image/webp": {
    ext: "webp",
    is: (b) => ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP",
  },
  "image/png": { ext: "png", is: (b) => ascii(b, 1, 4) === "PNG" },
}

/* Reads an uploaded image off the request, or says what is wrong with it.
   Under Vercel's 4.5 MB request-body cap. */
export async function readImage(
  request: Request,
  maxBytes: number,
): Promise<{ body: Uint8Array; type: string; ext: string } | Response> {
  const type = request.headers.get("content-type") ?? ""
  const format = IMAGE_FORMATS[type]
  if (!format) {
    return Response.json(
      { error: "Expected a WebP or PNG image." },
      { status: 415 },
    )
  }
  const body = new Uint8Array(await request.arrayBuffer())
  if (body.length < 12 || body.length > maxBytes || !format.is(body)) {
    return Response.json(
      { error: "That image is too large or not what it says it is." },
      { status: 400 },
    )
  }
  return { body, type, ext: format.ext }
}
