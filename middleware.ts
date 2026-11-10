/* A password over a whole deployment, for hiding a branch while it is being
   built. It does nothing unless PREVIEW_PASSWORD is set, and that variable
   is only ever set in the Vercel project's Preview environment, scoped to one
   branch, so production and every other branch pass straight through.

   Basic Auth, so the browser asks once and then resends the password with
   every request to the deployment, including the page's own /api calls. Any
   username is accepted; only the password is checked. */

import { next } from "@vercel/functions"
import { createHash, timingSafeEqual } from "node:crypto"

export const config = { runtime: "nodejs" }

/* Compared as digests so the check takes the same time whatever was sent,
   the way the studio passcode is checked in api/products.ts. */
function matches(given: string, expected: string) {
  const digest = (text: string) => createHash("sha256").update(text).digest()
  return timingSafeEqual(digest(given), digest(expected))
}

function passwordFrom(request: Request) {
  const header = request.headers.get("authorization") ?? ""
  const [scheme, encoded] = header.split(" ")
  if (scheme !== "Basic" || !encoded) return null
  const decoded = Buffer.from(encoded, "base64").toString("utf8")
  const colon = decoded.indexOf(":")
  return colon === -1 ? null : decoded.slice(colon + 1)
}

export default function middleware(request: Request) {
  const expected = process.env.PREVIEW_PASSWORD
  if (!expected) return next()

  const given = passwordFrom(request)
  if (given !== null && matches(given, expected)) return next()

  return new Response("This preview is password protected.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Tibbie X preview", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  })
}
