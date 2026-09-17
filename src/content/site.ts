/* Site-wide facts every other content file may lean on: the address, the
   inbox, the Venmo handle and the mail hand-off. This file imports nothing, so
   it can sit under any of them. */

/* The address the QR module path in `SiteQrCode` encodes. Regenerate that
   path if this ever changes, or the code points at the old site. */
export const SITE_URL = "https://tibbiex.studio"

/* The official address. Every mention of it on the site reads this const, so
   changing it here changes the icon row, the booking hand-off and the fallback
   line together. */
export const CONTACT_EMAIL = "contact@tibbiex.studio"

/* The booking form composes a message and hands it to the visitor's mail
   client, the same shape as the Venmo rail: this site never sends the mail
   itself. Built with encodeURIComponent rather than URLSearchParams, which
   encodes a space as "+" -- correct for a query string, but several mail
   clients render it literally in the body. */
export function bookingMailtoUrl(name: string, from: string, message: string) {
  const sender = name.trim()
  const subject = sender ? `Booking — ${sender}` : "Booking enquiry"
  const signoff = [sender || "Someone", from.trim() && `<${from.trim()}>`]
    .filter(Boolean)
    .join(" ")
  const body = `${message.trim()}\n\n— ${signoff}`
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/* The Venmo account both money rails and the social row point at. */
export const VENMO_HANDLE = "TibbieSkyeX"
