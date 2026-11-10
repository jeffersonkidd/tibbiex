/// <reference types="vite/client" />

interface ImportMetaEnv {
  /* The Shopify Storefront API's public token (lib/shopify.ts). Public by
     design: it ships in the bundle. Unset, the shop runs on the catalogue
     bundled with the app and nothing can be bought. */
  readonly VITE_SHOPIFY_STOREFRONT_TOKEN?: string
}
