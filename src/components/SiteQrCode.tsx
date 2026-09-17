import { SITE_URL } from "../content/site"

/* Scannable QR for the bio link, replacing the decorative lucide QrCode glyph
   that used to sit in the modal -- that one encoded nothing. The module path
   is pre-computed (byte mode, ECC level M, version 2, 25x25) so nothing has to
   be generated at runtime and the app takes on no QR dependency. The viewBox
   carries the mandatory 4-module quiet zone, and the light background travels
   with the symbol: QR readers need dark-on-light, and the modal panel it sits
   on is dark. Regenerate the path if SITE_URL ever changes. */
export default function SiteQrCode({ size = 148 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="-4 -4 33 33"
      shapeRendering="crispEdges"
      role="img"
      aria-label={`QR code linking to ${SITE_URL}`}
    >
      <rect x="-4" y="-4" width="33" height="33" fill="#FFFDF7" />
      <path
        d="M0 0h7v1h-7zM8 0h2v1h-2zM13 0h1v1h-1zM18 0h7v1h-7zM0 1h1v1h-1zM6 1h1v1h-1zM9 1h1v1h-1zM14 1h1v1h-1zM16 1h1v1h-1zM18 1h1v1h-1zM24 1h1v1h-1zM0 2h1v1h-1zM2 2h3v1h-3zM6 2h1v1h-1zM8 2h1v1h-1zM10 2h2v1h-2zM13 2h2v1h-2zM16 2h1v1h-1zM18 2h1v1h-1zM20 2h3v1h-3zM24 2h1v1h-1zM0 3h1v1h-1zM2 3h3v1h-3zM6 3h1v1h-1zM10 3h1v1h-1zM12 3h3v1h-3zM16 3h1v1h-1zM18 3h1v1h-1zM20 3h3v1h-3zM24 3h1v1h-1zM0 4h1v1h-1zM2 4h3v1h-3zM6 4h1v1h-1zM9 4h1v1h-1zM12 4h2v1h-2zM18 4h1v1h-1zM20 4h3v1h-3zM24 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM8 5h1v1h-1zM11 5h1v1h-1zM14 5h1v1h-1zM18 5h1v1h-1zM24 5h1v1h-1zM0 6h7v1h-7zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM14 6h1v1h-1zM16 6h1v1h-1zM18 6h7v1h-7zM11 7h1v1h-1zM14 7h3v1h-3zM0 8h1v1h-1zM2 8h1v1h-1zM6 8h2v1h-2zM9 8h4v1h-4zM16 8h1v1h-1zM19 8h1v1h-1zM22 8h1v1h-1zM24 8h1v1h-1zM0 9h1v1h-1zM2 9h1v1h-1zM8 9h4v1h-4zM15 9h1v1h-1zM18 9h2v1h-2zM21 9h1v1h-1zM23 9h2v1h-2zM1 10h3v1h-3zM5 10h2v1h-2zM9 10h5v1h-5zM15 10h3v1h-3zM19 10h4v1h-4zM24 10h1v1h-1zM0 11h1v1h-1zM2 11h2v1h-2zM10 11h2v1h-2zM17 11h1v1h-1zM19 11h1v1h-1zM21 11h1v1h-1zM1 12h3v1h-3zM6 12h4v1h-4zM11 12h1v1h-1zM18 12h1v1h-1zM24 12h1v1h-1zM2 13h3v1h-3zM7 13h2v1h-2zM13 13h1v1h-1zM15 13h2v1h-2zM18 13h2v1h-2zM23 13h2v1h-2zM0 14h4v1h-4zM5 14h2v1h-2zM8 14h2v1h-2zM11 14h1v1h-1zM13 14h3v1h-3zM17 14h2v1h-2zM21 14h2v1h-2zM24 14h1v1h-1zM3 15h1v1h-1zM8 15h2v1h-2zM14 15h1v1h-1zM16 15h1v1h-1zM18 15h4v1h-4zM0 16h2v1h-2zM3 16h4v1h-4zM10 16h3v1h-3zM15 16h6v1h-6zM23 16h1v1h-1zM8 17h1v1h-1zM10 17h1v1h-1zM12 17h2v1h-2zM16 17h1v1h-1zM20 17h1v1h-1zM24 17h1v1h-1zM0 18h7v1h-7zM8 18h3v1h-3zM12 18h1v1h-1zM16 18h1v1h-1zM18 18h1v1h-1zM20 18h1v1h-1zM24 18h1v1h-1zM0 19h1v1h-1zM6 19h1v1h-1zM10 19h3v1h-3zM14 19h3v1h-3zM20 19h1v1h-1zM24 19h1v1h-1zM0 20h1v1h-1zM2 20h3v1h-3zM6 20h1v1h-1zM9 20h1v1h-1zM13 20h8v1h-8zM24 20h1v1h-1zM0 21h1v1h-1zM2 21h3v1h-3zM6 21h1v1h-1zM9 21h2v1h-2zM13 21h1v1h-1zM15 21h1v1h-1zM17 21h1v1h-1zM20 21h1v1h-1zM22 21h2v1h-2zM0 22h1v1h-1zM2 22h3v1h-3zM6 22h1v1h-1zM8 22h1v1h-1zM10 22h2v1h-2zM15 22h1v1h-1zM17 22h1v1h-1zM19 22h3v1h-3zM23 22h2v1h-2zM0 23h1v1h-1zM6 23h1v1h-1zM10 23h1v1h-1zM13 23h1v1h-1zM16 23h1v1h-1zM19 23h2v1h-2zM0 24h7v1h-7zM8 24h1v1h-1zM10 24h4v1h-4zM16 24h2v1h-2zM21 24h1v1h-1zM24 24h1v1h-1z"
        fill="#0B0B0D"
      />
    </svg>
  )
}
