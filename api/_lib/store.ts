/* Where the catalogue lives: Vercel Blob, one JSON file per save under
   catalog/, each with a random suffix so a new save is a new URL that no
   cache can confuse with the old one. The newest is the catalogue; the few
   before it are kept as a short history and the rest are deleted. */
import { del, list, put } from "@vercel/blob"

import type { Catalog } from "./catalog.js"

const PREFIX = "catalog/"
const KEEP = 10

async function saves() {
  const { blobs } = await list({ prefix: PREFIX })
  return blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))
}

/* The current catalogue, or null while the studio has never saved one (the
   shop then shows the products bundled with the app). Throws when storage
   is unreachable or not configured. */
export async function readCatalog(): Promise<Catalog | null> {
  const latest = (await saves())[0]
  if (!latest) return null
  const response = await fetch(latest.url)
  if (!response.ok) throw new Error(`Catalog read failed: ${response.status}`)
  return (await response.json()) as Catalog
}

export async function writeCatalog(catalog: Catalog) {
  const blob = await put(`${PREFIX}products.json`, JSON.stringify(catalog), {
    access: "public",
    addRandomSuffix: true,
    contentType: "application/json",
  })
  const old = (await saves()).filter((b) => b.url !== blob.url).slice(KEEP - 1)
  if (old.length) await del(old.map((b) => b.url))
}

export async function writePhoto(body: Uint8Array, type: string, ext: string) {
  const blob = await put(`products/photos/photo.${ext}`, Buffer.from(body), {
    access: "public",
    addRandomSuffix: true,
    contentType: type,
  })
  return blob.url
}
