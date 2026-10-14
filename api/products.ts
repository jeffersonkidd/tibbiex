/* The shop's products, editable from the studio without a deploy.

     GET   the catalogue as JSON, cached at the edge for 15 seconds (the
           shop asks for it on load). ?fresh skips the cache (the studio
           asks that way, so it never edits a stale copy). 404 while the
           studio has never saved one, and the shop shows the products
           bundled with the app.
     PUT   save the whole catalogue: the studio sends every product on each
           save, checked and cleaned by cleanCatalog before it is stored.
     POST  upload one product photo (the studio shrinks it to WebP first)
           and get back its URL to put in a product.

   Writes need the studio passcode (see _lib/studio.ts). Storage is Vercel
   Blob (see _lib/store.ts). Requires a connected Blob store and
   STUDIO_PASSCODE. `pnpm dev` does not run this file. */
import { cleanCatalog } from "./_lib/catalog.js"
import { readCatalog, writeCatalog, writePhoto } from "./_lib/store.js"
import { authorised, readImage, refused } from "./_lib/studio.js"

/* The studio sends photos at 1600px on the long side, well under this. */
const MAX_PHOTO_BYTES = 4 * 1024 * 1024

function unavailable() {
  return Response.json(
    { error: "Product storage isn't configured yet." },
    { status: 503 },
  )
}

export async function GET(request: Request) {
  const fresh = new URL(request.url).searchParams.has("fresh")
  const cache = fresh
    ? "no-store"
    : "public, max-age=0, s-maxage=15, stale-while-revalidate=300"

  /* Unconfigured or unreachable storage reads as "nothing saved yet", so
     the shop falls back to the bundled products instead of emptying. */
  const catalog = await readCatalog().catch(() => null)
  if (!catalog) {
    return Response.json(
      { products: null },
      { status: 404, headers: { "Cache-Control": cache } },
    )
  }
  return Response.json(catalog, { headers: { "Cache-Control": cache } })
}

export async function PUT(request: Request) {
  if (!authorised(request)) return refused()

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: "Expected a JSON body." }, { status: 400 })
  }
  const catalog = cleanCatalog(payload)
  if (typeof catalog === "string") {
    return Response.json({ error: catalog }, { status: 400 })
  }

  try {
    await writeCatalog(catalog)
    return Response.json(catalog)
  } catch {
    return unavailable()
  }
}

export async function POST(request: Request) {
  if (!authorised(request)) return refused()
  const image = await readImage(request, MAX_PHOTO_BYTES)
  if (image instanceof Response) return image
  try {
    return Response.json({
      url: await writePhoto(image.body, image.type, image.ext),
    })
  } catch {
    return unavailable()
  }
}
