/* The studio's door: does this passcode open it?

     POST    204 when the `x-studio-passcode` header matches DASHBOARD_PASSWORD,
             401 when it does not, 503 while DASHBOARD_PASSWORD is unset.

   It changes nothing and hands out nothing -- no cookie, no token. The login
   screen at /dashboard asks it once, then keeps the passcode in the browser the
   way the modules always have, and every write (api/avatar.ts,
   api/products.ts) still checks the passcode itself. So this is the door's
   answer, not the lock: getting past the screen without it would open a back
   office that cannot change anything.

   A wrong answer is held back for a moment, which turns guessing into a slow
   job; the real defence is a long passcode, since there is no rate limit
   across requests. `pnpm dev` does not run this file -- use `vercel dev`. */
import { createHash, timingSafeEqual } from "node:crypto"

const WRONG_DELAY_MS = 800

/* Compared as digests so the check takes the same time whatever was sent. */
function matches(given: string, expected: string) {
  const digest = (text: string) => createHash("sha256").update(text).digest()
  return timingSafeEqual(digest(given), digest(expected))
}

export async function POST(request: Request) {
  const expected = process.env.DASHBOARD_PASSWORD
  if (!expected) {
    return Response.json(
      { error: "The studio passcode isn't set up yet." },
      { status: 503 },
    )
  }

  const given = request.headers.get("x-studio-passcode") ?? ""
  if (given && matches(given, expected)) {
    return new Response(null, {
      status: 204,
      headers: { "Cache-Control": "no-store" },
    })
  }

  await new Promise((resolve) => setTimeout(resolve, WRONG_DELAY_MS))
  return Response.json(
    { error: "That passcode isn't right." },
    { status: 401, headers: { "Cache-Control": "no-store" } },
  )
}
