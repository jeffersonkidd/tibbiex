import { createContext, useContext, useEffect, useState } from "react"

import type { Catalog, Product } from "../../api/_lib/catalog.js"
import { BUNDLED_SHOP, buildShop } from "../content/shop"
import type { Shop, ShopItem } from "../content/shop"

/* The shop the visitor sees: the catalogue the studio saved (api/products.ts)
   once one exists, the products bundled with the app until then. App reads
   it once with useLiveShop() and hands it down through ShopContext; every
   block that shows products reads it with useShop().

   The last catalogue seen is kept in this browser, so a returning visitor
   opens on it rather than on the bundled products and a deleted piece does
   not flash back for a moment. */

const CACHE_KEY = "tibbiex:catalog"

/* A studio product as the shop's ShopItem: the cover is the first photo,
   the gallery is all of them, and a band shelf becomes the item's band. */
export function toShopItem(product: Product): ShopItem {
  const formatPhotos = Object.fromEntries(
    product.formats
      .filter((format) => format.photo)
      .map((format) => [format.id, format.photo as string]),
  )
  return {
    id: product.id,
    item: product.name,
    image: product.photos[0],
    gallery: product.photos,
    alt: product.alt || undefined,
    aspect: product.aspect,
    blurb: product.blurb || undefined,
    band: product.shelf === "art" ? undefined : product.shelf,
    formatPhotos,
    stock: product.stock,
    formats: product.formats.map((format) => ({
      id: format.id,
      label: format.label,
      price: format.price,
      mail: format.mail,
      sizes: format.sizes.length
        ? format.sizes.map((size) => ({
            label: size.label,
            ...(size.soldOut && { soldOut: true as const }),
          }))
        : undefined,
      includes: format.details.length ? format.details : undefined,
    })),
  }
}

export function shopFromCatalog(catalog: Catalog): Shop {
  const live = catalog.products.filter((product) => product.live)
  return buildShop(
    live.filter((p) => p.shelf !== "art").map(toShopItem),
    live.filter((p) => p.shelf === "art").map(toShopItem),
  )
}

function cached(): Shop {
  try {
    const saved = localStorage.getItem(CACHE_KEY)
    if (saved) return shopFromCatalog(JSON.parse(saved) as Catalog)
  } catch {
    /* Blocked storage or an old shape: start from the bundled shop. */
  }
  return BUNDLED_SHOP
}

export function useLiveShop(): Shop {
  const [shop, setShop] = useState<Shop>(cached)

  useEffect(() => {
    fetch("/api/products")
      .then((response) => (response.ok ? response.json() : null))
      .then((catalog: Catalog | null) => {
        if (!catalog?.products) return
        setShop(shopFromCatalog(catalog))
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(catalog))
        } catch {
          /* Not cached; the next visit fetches it again. */
        }
      })
      /* Under `pnpm dev` there is no endpoint (the dev server answers with
         the page, which is not JSON): the bundled shop stays. */
      .catch(() => {})
  }, [])

  return shop
}

export const ShopContext = createContext<Shop>(BUNDLED_SHOP)

export function useShop() {
  return useContext(ShopContext)
}
