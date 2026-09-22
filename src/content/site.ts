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

/* The R2 bucket the photographs are served from, on its own subdomain of the
   apex. Content that a visitor sees but that is not part of the design lives
   there rather than in src/assets/ -- it changes on its own schedule, and a
   new photo should not need a deploy to go up.

   Keys carry a content hash (portfolio/gash/promo.d4c42f53.jpg), so an object
   is safe to cache forever and a replaced photo is a new key, not a stale one.
   Cutting a new file therefore means editing the URL here too; that is the
   trade for not running an image pipeline. */
export const MEDIA_URL = "https://media.tibbiex.studio"
