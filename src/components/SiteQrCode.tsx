import { SITE_URL } from "../data"

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
        d="M0 0h7v1h-7zM8 0h3v1h-3zM12 0h1v1h-1zM16 0h1v1h-1zM18 0h7v1h-7zM0 1h1v1h-1zM6 1h1v1h-1zM8 1h5v1h-5zM18 1h1v1h-1zM24 1h1v1h-1zM0 2h1v1h-1zM2 2h3v1h-3zM6 2h1v1h-1zM10 2h1v1h-1zM12 2h4v1h-4zM18 2h1v1h-1zM20 2h3v1h-3zM24 2h1v1h-1zM0 3h1v1h-1zM2 3h3v1h-3zM6 3h1v1h-1zM8 3h4v1h-4zM13 3h4v1h-4zM18 3h1v1h-1zM20 3h3v1h-3zM24 3h1v1h-1zM0 4h1v1h-1zM2 4h3v1h-3zM6 4h1v1h-1zM9 4h1v1h-1zM11 4h1v1h-1zM15 4h2v1h-2zM18 4h1v1h-1zM20 4h3v1h-3zM24 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM9 5h1v1h-1zM16 5h1v1h-1zM18 5h1v1h-1zM24 5h1v1h-1zM0 6h7v1h-7zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM14 6h1v1h-1zM16 6h1v1h-1zM18 6h7v1h-7zM8 7h2v1h-2zM12 7h1v1h-1zM14 7h3v1h-3zM0 8h1v1h-1zM2 8h2v1h-2zM5 8h3v1h-3zM10 8h1v1h-1zM12 8h1v1h-1zM14 8h3v1h-3zM18 8h1v1h-1zM21 8h1v1h-1zM23 8h2v1h-2zM2 9h2v1h-2zM8 9h5v1h-5zM19 9h1v1h-1zM23 9h1v1h-1zM1 10h1v1h-1zM6 10h1v1h-1zM10 10h2v1h-2zM13 10h2v1h-2zM17 10h2v1h-2zM20 10h1v1h-1zM1 11h1v1h-1zM5 11h1v1h-1zM8 11h1v1h-1zM11 11h4v1h-4zM16 11h2v1h-2zM21 11h2v1h-2zM0 12h2v1h-2zM3 12h1v1h-1zM5 12h3v1h-3zM9 12h6v1h-6zM16 12h5v1h-5zM22 12h3v1h-3zM1 13h4v1h-4zM8 13h1v1h-1zM10 13h2v1h-2zM14 13h7v1h-7zM24 13h1v1h-1zM1 14h2v1h-2zM4 14h4v1h-4zM9 14h2v1h-2zM13 14h2v1h-2zM20 14h1v1h-1zM22 14h2v1h-2zM0 15h1v1h-1zM3 15h2v1h-2zM7 15h2v1h-2zM10 15h1v1h-1zM12 15h1v1h-1zM14 15h3v1h-3zM19 15h2v1h-2zM24 15h1v1h-1zM2 16h2v1h-2zM5 16h3v1h-3zM9 16h1v1h-1zM11 16h3v1h-3zM16 16h9v1h-9zM8 17h5v1h-5zM16 17h1v1h-1zM20 17h1v1h-1zM22 17h1v1h-1zM24 17h1v1h-1zM0 18h7v1h-7zM8 18h1v1h-1zM10 18h1v1h-1zM12 18h1v1h-1zM14 18h1v1h-1zM16 18h1v1h-1zM18 18h1v1h-1zM20 18h1v1h-1zM22 18h3v1h-3zM0 19h1v1h-1zM6 19h1v1h-1zM8 19h2v1h-2zM11 19h1v1h-1zM14 19h3v1h-3zM20 19h1v1h-1zM23 19h2v1h-2zM0 20h1v1h-1zM2 20h3v1h-3zM6 20h1v1h-1zM9 20h1v1h-1zM12 20h1v1h-1zM16 20h6v1h-6zM24 20h1v1h-1zM0 21h1v1h-1zM2 21h3v1h-3zM6 21h1v1h-1zM8 21h1v1h-1zM10 21h2v1h-2zM13 21h1v1h-1zM17 21h2v1h-2zM20 21h5v1h-5zM0 22h1v1h-1zM2 22h3v1h-3zM6 22h1v1h-1zM8 22h1v1h-1zM10 22h4v1h-4zM16 22h3v1h-3zM20 22h1v1h-1zM22 22h2v1h-2zM0 23h1v1h-1zM6 23h1v1h-1zM9 23h1v1h-1zM13 23h1v1h-1zM20 23h1v1h-1zM22 23h1v1h-1zM0 24h7v1h-7zM8 24h2v1h-2zM12 24h3v1h-3zM19 24h6v1h-6z"
        fill="#0B0B0D"
      />
    </svg>
  )
}