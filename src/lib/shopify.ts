import { PORTFOLIO } from "../content/portfolio"
import type { BandId } from "../content/portfolio"
import { STANDARD_FORMATS } from "../content/shop"
import type { ShopFormat, ShopItem, Size } from "../content/shop"
import { SHOPIFY_DOMAIN } from "../content/site"
import { FITS, categoryOfType } from "../content/taxonomy"
import type { Fit } from "../content/taxonomy"

/* The shop's source of truth is the Shopify store. This is the site's half
   of it: read the catalogue off the Storefront API, gather it back into the
   designs the site shows, and hand a buyer to Shopify's checkout.

   The Storefront token is a *public* token -- Shopify issues it to run in a
   browser, and it can read published products and build a cart, nothing
   more -- so it ships in the bundle as VITE_SHOPIFY_STOREFRONT_TOKEN, from
   the Headless channel in the Shopify admin. Without it the site shows the
   catalogue bundled with the app and nothing can be bought. */

const API_VERSION = "2026-07"
const TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN as
  string | undefined

export const shopifyConfigured = Boolean(TOKEN)

async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  if (!TOKEN) throw new Error("The shop isn't connected yet.")
  const response = await fetch(
    `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    },
  )
  const body = (await response.json().catch(() => ({}))) as {
    data?: T
    errors?: { message: string }[]
  }
  if (!response.ok || !body.data) {
    throw new Error(body.errors?.[0]?.message ?? "Couldn't reach the shop.")
  }
  return body.data
}

/* --- Reading the catalogue ----------------------------------------------- */

type Image = {
  url: string
  altText: string | null
  width: number | null
  height: number | null
}

export type StorefrontProduct = {
  id: string
  handle: string
  title: string
  description: string
  productType: string
  vendor: string
  tags: string[]
  images: { nodes: Image[] }
  variants: {
    nodes: {
      id: string
      title: string
      availableForSale: boolean
      price: { amount: string }
    }[]
  }
}

export type StorefrontCollection = {
  handle: string
  title: string
  description: string
  image: Image | null
}

const IMAGE = "url altText width height"

/* Oldest first, so a design keeps the place it was first stocked in. */
const CATALOG_QUERY = `
  query Catalog($after: String) {
    products(first: 100, after: $after, sortKey: CREATED_AT) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id handle title description productType vendor tags
        images(first: 12) { nodes { ${IMAGE} } }
        variants(first: 50) {
          nodes { id title availableForSale price { amount } }
        }
      }
    }
    collections(first: 100) {
      nodes { handle title description image { ${IMAGE} } }
    }
  }
`

type CatalogPage = {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
    nodes: StorefrontProduct[]
  }
  collections: { nodes: StorefrontCollection[] }
}

export async function fetchShopify(): Promise<ShopItem[]> {
  const products: StorefrontProduct[] = []
  let collections: StorefrontCollection[] = []
  let after: string | null = null
  /* Ten pages is a thousand products: a guard, not a limit she will meet. */
  for (let page = 0; page < 10; page++) {
    const data: CatalogPage = await storefront<CatalogPage>(CATALOG_QUERY, {
      after,
    })
    products.push(...data.products.nodes)
    if (page === 0) collections = data.collections.nodes
    if (!data.products.pageInfo.hasNextPage) break
    after = data.products.pageInfo.endCursor
  }
  return designsFrom(products, collections)
}

/* The value of a `facet:value` tag, if the product carries one. */
function tagValue(tags: string[], facet: string) {
  const prefix = `${facet}:`
  const found = tags.find((tag) => tag.trim().toLowerCase().startsWith(prefix))
  return found?.trim().slice(prefix.length).trim().toLowerCase() || undefined
}

/* What the words of every title in a design share: "Vampire Cats Sticker"
   and "Vampire Cats Patch" are "Vampire Cats". The fallback for a design
   with no collection to name it. */
function sharedName(titles: string[]) {
  const words = titles.map((title) => title.trim().split(/\s+/))
  const shared: string[] = []
  for (let i = 0; i < words[0].length; i++) {
    const word = words[0][i]
    if (words.some((w) => w[i]?.toLowerCase() !== word.toLowerCase())) break
    shared.push(word)
  }
  return shared.length && titles.length > 1 ? shared.join(" ") : titles[0]
}

function aspectOf(image: Image): ShopItem["aspect"] {
  if (!image.width || !image.height) return undefined
  const ratio = image.width / image.height
  return ratio > 1.15 ? "landscape" : ratio < 0.87 ? "portrait" : "square"
}

/* One Shopify product as one format. A product the shop knows the shape of
   -- a Sticker, a Patch, a T-Shirt with a `fit:` tag -- takes the standard
   format's id, label and details; anything else is filed by its Type and
   named after it. Variants beyond one are its sizes, named by their title. */
function formatOf(product: StorefrontProduct): ShopFormat {
  const category = categoryOfType(product.productType)
  const fitTag = tagValue(product.tags, "fit")
  const fit = FITS.find((entry) => entry.id === fitTag)?.id as Fit | undefined
  const standard = STANDARD_FORMATS.find(
    (format) =>
      format.category === category &&
      (category !== "tees" || (format.fit ?? "mens") === (fit ?? "mens")),
  )
  const variants = product.variants.nodes
  const price = Number(variants[0]?.price.amount ?? 0)
  const base: ShopFormat = {
    id: standard?.id ?? product.handle,
    label: standard?.label ?? (product.productType.trim() || product.title),
    price,
    ...(category && { category }),
    ...(fit && category === "tees" && { fit }),
    ...(standard?.includes && { includes: standard.includes }),
  }
  if (variants.length > 1) {
    const sizes: Size[] = variants.map((variant) => ({
      label: variant.title,
      variantId: variant.id,
      ...(!variant.availableForSale && { soldOut: true as const }),
    }))
    return { ...base, sizes }
  }
  const only = variants[0]
  return {
    ...base,
    ...(only && { variantId: only.id }),
    ...((!only || !only.availableForSale) && { soldOut: true as const }),
  }
}

/* Shopify's products, gathered into the designs the site shows. Products
   sharing a `design:` tag are one design; a product without one is a
   design of its own. A collection whose handle is the design's tag names
   it, describes it and gives it its cover; without one, the shared words
   of the titles name it, the first product's description describes it, and
   its second photo -- the artwork, by the import sheet's convention, after
   the format's own mockup -- is the cover. */
export function designsFrom(
  products: StorefrontProduct[],
  collections: StorefrontCollection[],
): ShopItem[] {
  const groups = new Map<string, StorefrontProduct[]>()
  for (const product of products) {
    const design = tagValue(product.tags, "design") ?? product.handle
    groups.set(design, [...(groups.get(design) ?? []), product])
  }

  const formatOrder = (format: ShopFormat) => {
    const at = STANDARD_FORMATS.findIndex((entry) => entry.id === format.id)
    return at === -1 ? STANDARD_FORMATS.length : at
  }

  return [...groups].map(([design, members]) => {
    const first = members[0]
    const collection = collections.find((entry) => entry.handle === design)
    const formats = members
      .map((product) => ({ product, format: formatOf(product) }))
      .sort((a, b) => formatOrder(a.format) - formatOrder(b.format))

    /* Two products can land on one standard id (two men's tees in different
       colours, say); the second keeps its handle so neither is lost. */
    const seen = new Set<string>()
    for (const entry of formats) {
      if (seen.has(entry.format.id)) entry.format.id = entry.product.handle
      seen.add(entry.format.id)
    }

    const cover =
      collection?.image ??
      first.images.nodes[1] ??
      first.images.nodes[0] ??
      undefined
    const formatPhotos = Object.fromEntries(
      formats.flatMap(({ product, format }) => {
        const photo = product.images.nodes[0]?.url
        return photo && photo !== cover?.url ? [[format.id, photo]] : []
      }),
    )
    const gallery = [
      ...(cover ? [cover.url] : []),
      ...Object.values(formatPhotos),
    ]

    const band = tagValue(first.tags, "band")
    const line = tagValue(first.tags, "line")
    const run = Number(tagValue(first.tags, "run"))
    const known = PORTFOLIO.some((entry) => entry.id === band)

    const item: ShopItem = {
      id: design,
      item:
        collection?.title ??
        sharedName(members.map((product) => product.title)),
      image: cover?.url ?? "",
      alt: cover?.altText ?? undefined,
      aspect: cover ? aspectOf(cover) : undefined,
      blurb: (collection?.description || first.description).trim() || undefined,
      /* An unknown band is carried as-is: it matches no portfolio entry, so
         the item drops off the Bands strip rather than breaking it. */
      band: band as BandId | undefined,
      shelf: line === "art" || (!line && !known) ? "art" : "bands",
      gallery,
      formatPhotos,
      formats: formats.map(({ format }) => format),
      ...(Number.isInteger(run) && run > 0 && { stock: { of: run } }),
    }
    return item
  })
}

/* --- Checkout ------------------------------------------------------------ */

type CartCreate = {
  cartCreate: {
    cart: { checkoutUrl: string } | null
    userErrors: { message: string }[]
  }
}

const CART_MUTATION = `
  mutation Checkout($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart { checkoutUrl }
      userErrors { message }
    }
  }
`

/* A one-line cart for the variant picked, and the address of Shopify's
   checkout for it. Shopify prices it, adds shipping and tax, takes the
   address and the payment, and counts the stock down -- the site only
   names the variant. The caller does a full navigation, not a new tab. */
export async function shopifyCheckoutUrl(variantId: string) {
  const data = await storefront<CartCreate>(CART_MUTATION, {
    lines: [{ merchandiseId: variantId, quantity: 1 }],
  })
  const { cart, userErrors } = data.cartCreate
  if (!cart) {
    throw new Error(userErrors[0]?.message ?? "Couldn't start checkout.")
  }
  return cart.checkoutUrl
}
