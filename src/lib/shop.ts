import { useMemo, useSyncExternalStore } from "react"

import { BUNDLED_SHOP, arrangeShop } from "../content/shop"
import type { Shop, ShopItem } from "../content/shop"
import { toShopItem } from "./catalog"
import type { CatalogItem, PublishedCatalog } from "./catalog"

/* The live shop. The catalogue is published from the studio, not built into
   the app, so the site reads it at runtime:

     1. the last catalogue this browser saw, from localStorage, so a returning
        visitor never sees a product she has since taken down;
     2. otherwise the catalogue bundled with the app (content/shop.ts);
     3. then /api/products, swapped in when it answers.

   A small external store rather than context: one fetch for the whole page,
   started from main.tsx before React renders, and any component that shows
   the shop subscribes with useShop(). */

export const SHOP_URL = "/api/products"

/* Bumped whenever the cached shape changes, so an old cache is ignored. */
const CACHE_KEY = "tibbiex:shop:v1"

function cached(): ShopItem[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const items = JSON.parse(raw) as CatalogItem[]
    return Array.isArray(items) ? items.map(toShopItem) : null
  } catch {
    return null
  }
}

let items: ShopItem[] = cached() ?? BUNDLED_SHOP
const listeners = new Set<() => void>()

function set(next: ShopItem[]) {
  items = next
  listeners.forEach((listener) => listener())
}

let started = false

/* Ask for the published catalogue, once. A 404 means nothing has been
   published, so the bundled one is the truth and any stale cache goes. Any
   other failure keeps what is showing. */
export function loadShop() {
  if (started) return
  started = true
  fetch(SHOP_URL, { headers: { Accept: "application/json" } })
    .then(async (response) => {
      if (response.status === 404) {
        forget()
        set(BUNDLED_SHOP)
        return
      }
      /* Under `pnpm dev` the path can come back as the app's own HTML. */
      const json = response.headers
        .get("content-type")
        ?.includes("application/json")
      if (!response.ok || !json) return
      const data = (await response.json()) as PublishedCatalog
      if (!Array.isArray(data.items)) return
      remember(data.items)
      set(data.items.map(toShopItem))
    })
    .catch(() => {
      /* Offline or unreachable: keep what is showing. */
    })
}

function remember(entries: CatalogItem[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entries))
  } catch {
    /* Private window or full storage: the next visit starts bundled. */
  }
}

function forget() {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    /* Nothing to forget. */
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/* The shop as the site shows it: shelves, polaroids and per-band lists,
   rebuilt only when the catalogue changes. */
export function useShop(): Shop {
  const current = useSyncExternalStore(
    subscribe,
    () => items,
    () => items,
  )
  return useMemo(() => arrangeShop(current), [current])
}
