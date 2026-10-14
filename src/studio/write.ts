/* What every studio module does to change the live site: send a write with
   the studio passcode, remember the passcode once it works, forget it when it
   is refused, and turn the endpoint's answer into a sentence the owner can
   act on. Plus the one image job they share -- encoding a canvas small. */

const PASSCODE_KEY = "tibbiex:studio:passcode"

export function savedPasscode() {
  try {
    return localStorage.getItem(PASSCODE_KEY) ?? ""
  } catch {
    return ""
  }
}

function savePasscode(passcode: string | null) {
  try {
    if (passcode) localStorage.setItem(PASSCODE_KEY, passcode)
    else localStorage.removeItem(PASSCODE_KEY)
  } catch {
    /* Private window: it just asks again next time. */
  }
}

/* What a failed write says, and whether the passcode was the reason. */
export class StudioError extends Error {
  constructor(
    message: string,
    readonly badPasscode = false,
  ) {
    super(message)
  }
}

/* One write to a studio endpoint. A Blob body goes as itself (an image); any
   other body goes as JSON. Resolves to the endpoint's JSON answer. */
export async function studioWrite<T>(
  url: string,
  method: "POST" | "PUT" | "DELETE",
  passcode: string,
  body?: Blob | object,
): Promise<T> {
  const isFile = body instanceof Blob
  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers: {
        "x-studio-passcode": passcode,
        ...(body && {
          "Content-Type": isFile ? body.type : "application/json",
        }),
      },
      body: body && (isFile ? body : JSON.stringify(body)),
    })
  } catch {
    throw new StudioError("Couldn't reach the site. Check the connection.")
  }

  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string
  }
  if (response.status === 401) {
    savePasscode(null)
    throw new StudioError(data.error ?? "That passcode isn't right.", true)
  }
  if (!response.ok) {
    /* No JSON error at all is the dev server or a preview without the
       functions: the page it answered with is not an endpoint. */
    throw new StudioError(
      data.error ??
        "Changes only save on the deployed site, not on this preview.",
    )
  }
  savePasscode(passcode)
  return data
}

/* A canvas as a small image: WebP where the browser can encode it, PNG
   otherwise, which keeps a cut-out's transparency either way. */
export async function encodeCanvas(canvas: HTMLCanvasElement): Promise<Blob> {
  const encode = (type: string, quality?: number) =>
    new Promise<Blob | null>((done) => canvas.toBlob(done, type, quality))
  const webp = await encode("image/webp", 0.88)
  if (webp?.type === "image/webp") return webp
  const png = await encode("image/png")
  if (!png) throw new StudioError("Couldn't prepare that image.")
  return png
}
