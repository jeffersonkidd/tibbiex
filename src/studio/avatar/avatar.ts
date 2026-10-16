import { AVATAR_URL } from "../../content/site"
import { StudioError, savePasscode } from "../passcode"

export { StudioError, savedPasscode } from "../passcode"

/* The studio's side of api/avatar.ts: read what is live, publish a crop, go
   back to the original. Plus the two jobs around a publish that happen in
   the browser -- squaring the crop into a small image, and remembering the
   passcode. */

export type Live = { url: string | null; uploadedAt?: string }

/* The output square. The card draws the avatar at 160px; 720 covers that at
   4x with room to spare, and keeps the upload a few hundred KB. */
const OUT = 720

/* Where the image sits inside the round window: its zoom over "just covers
   the window", and its centre's offset from the window's centre, in window
   pixels. */
export type Crop = { zoom: number; x: number; y: number }

export async function fetchLive(): Promise<Live> {
  try {
    const response = await fetch(`${AVATAR_URL}?format=json`)
    if (!response.ok) return { url: null }
    return (await response.json()) as Live
  } catch {
    /* Under `pnpm dev` there is no endpoint: the original is what's live. */
    return { url: null }
  }
}

async function write(
  method: "POST" | "DELETE",
  passcode: string,
  body?: Blob,
): Promise<Live> {
  let response: Response
  try {
    response = await fetch(AVATAR_URL, {
      method,
      headers: {
        "x-studio-passcode": passcode,
        ...(body && { "Content-Type": body.type }),
      },
      body,
    })
  } catch {
    throw new StudioError("Couldn't reach the site. Check the connection.")
  }

  const data = (await response.json().catch(() => ({}))) as {
    url?: string | null
    error?: string
  }
  if (response.status === 401) {
    savePasscode(null)
    throw new StudioError(data.error ?? "That passcode isn't right.", true)
  }
  if (!response.ok) {
    throw new StudioError(
      data.error ??
        "The avatar only changes on the deployed site, not on this preview.",
    )
  }
  savePasscode(passcode)
  return { url: data.url ?? null, uploadedAt: new Date().toISOString() }
}

export const publish = (passcode: string, image: Blob) =>
  write("POST", passcode, image)

export const restore = (passcode: string) => write("DELETE", passcode)

/* Draw what the window shows into an OUT-square image. WebP where the
   browser can encode it; PNG otherwise, which keeps a cut-out's
   transparency either way. */
export async function renderCrop(
  image: HTMLImageElement,
  crop: Crop,
  windowSize: number,
): Promise<Blob> {
  const canvas = document.createElement("canvas")
  canvas.width = OUT
  canvas.height = OUT
  const ctx = canvas.getContext("2d")!
  ctx.imageSmoothingQuality = "high"

  const k = OUT / windowSize
  const { w, h } = drawnSize(image, crop.zoom, windowSize)
  ctx.drawImage(
    image,
    (windowSize / 2 + crop.x - w / 2) * k,
    (windowSize / 2 + crop.y - h / 2) * k,
    w * k,
    h * k,
  )

  const encode = (type: string, quality?: number) =>
    new Promise<Blob | null>((done) => canvas.toBlob(done, type, quality))
  const webp = await encode("image/webp", 0.9)
  if (webp?.type === "image/webp") return webp
  const png = await encode("image/png")
  if (!png) throw new StudioError("Couldn't prepare that image.")
  return png
}

/* The image's size in the window at a zoom: at 1 its short side exactly
   spans the window, so the window is always covered. */
export function drawnSize(
  image: HTMLImageElement,
  zoom: number,
  windowSize: number,
) {
  const base = windowSize / Math.min(image.naturalWidth, image.naturalHeight)
  return {
    w: image.naturalWidth * base * zoom,
    h: image.naturalHeight * base * zoom,
  }
}

/* Keep the offset inside the range where the image still covers the
   window, so no edge of the photo can be dragged into view. */
export function clampCrop(
  image: HTMLImageElement,
  crop: Crop,
  windowSize: number,
): Crop {
  const { w, h } = drawnSize(image, crop.zoom, windowSize)
  const maxX = (w - windowSize) / 2
  const maxY = (h - windowSize) / 2
  return {
    zoom: crop.zoom,
    x: Math.max(-maxX, Math.min(maxX, crop.x)),
    y: Math.max(-maxY, Math.min(maxY, crop.y)),
  }
}
