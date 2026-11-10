import { useMemo, useSyncExternalStore } from "react"

import { BUNDLED_SHOP, arrangeShop } from "../content/shop"
import type { Shop, ShopItem } from "../content/shop"
import { fetchShopify, shopifyConfigured } from "./shopify"

/* The live shop. Shopify is the source of truth, so the site reads it at
   runtime:

     1. the last catalogue this browser saw, from localStorage, so a returning
        visitor never sees a product since taken down;
     2. otherwise the catalogue bundled with the app (content/shop.ts);
     3. then the Storefront API (lib/shopify.ts), swapped in when it answers.

   Without the Storefront token there is no third step: the bundled
   catalogue is all there is, and it has no variant ids, so nothing on it can
   be bought.

   A small external store rather than context: one fetch for the whole page,
   started from main.tsx before React renders, and any component that shows
   the shop subscribes with useShop(). */

/* Bumped whenever the cached shape changes, so an old cache is ignored. v1
   was the studio's own catalogue, before Shopify. */
const CACHE_KEY = "tibbiex:shop:v2"

function cached(): ShopItem[] | null {
  if (!shopifyConfigured) return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const items = JSON.parse(raw) as ShopItem[]
    return Array.isArray(items) ? items : null
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

/* Ask Shopify for the catalogue, once. Any failure keeps what is showing. */
export function loadShop() {
  if (started || !shopifyConfigured) return
  started = true
  fetchShopify()
    .then((next) => {
      remember(next)
      set(next)
    })
    .catch(() => {
      /* Offline, or the store unreachable: keep what is showing. */
    })
}

function remember(entries: ShopItem[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entries))
  } catch {
    /* Private window or full storage: the next visit starts bundled. */
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
