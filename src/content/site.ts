/* Site-wide facts every other content file may lean on: the address, the
   inbox and the Venmo handle. This file imports nothing, so it can sit under
   any of them. */

/* The address the QR module path in `SiteQrCode` encodes. Regenerate that
   path if this ever changes, or the code points at the old site. */
export const SITE_URL = "https://tibbiex.studio"

/* The official address, as shown to visitors -- the booking form's fallback
   line and the footer. It is also where api/contact.ts sends, but the
   function cannot import this file, so that copy has to change with it. */
export const CONTACT_EMAIL = "contact@tibbiex.studio"

/* The Venmo account both money rails and the social row point at. */
export const VENMO_HANDLE = "TibbieSkyeX"
