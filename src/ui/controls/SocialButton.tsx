import type { ComponentType } from "react"

/* One key in the row under the profile card, mirroring the Figma "Social
   Button" set. A bevelled square that goes brand red on hover -- the only
   non-CTA element on the page that does.

   The bevel is .social-key in styles/treatments/social-key.css. Figma also
   carries a Circle variant; the app has never rendered one. */
export default function SocialButton({
  icon: Icon,
  label,
  href,
}: {
  icon: ComponentType<{ size?: number }>
  /* Names the destination for both the tooltip and the screen reader, since
     the key shows nothing but a glyph. */
  label: string
  href: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      title={label}
      className="social-key"
    >
      <Icon size={20} />
    </a>
  )
}
