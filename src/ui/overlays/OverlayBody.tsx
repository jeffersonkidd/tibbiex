import type { ReactNode } from "react"

/* The inside of a modal: padding, an optional amber eyebrow, the title and an
   optional line under it. Every modal opened from the page starts this way, so
   the heading scale and spacing live here once. `className` is for treatments
   that don't compete with the padding -- the reading menu's veil. Not for a
   height or an overflow: a modal grows and the backdrop scrolls it. */
export default function OverlayBody({
  title,
  eyebrow,
  sub,
  children,
  className = "",
}: {
  title: string
  eyebrow?: string
  sub?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`p-modal ${className}`}>
      {eyebrow && <span className="mono-label text-accent">{eyebrow}</span>}
      {/* pr-6 keeps a long title from running under Overlay's close button,
          which covers the corner's last 48px; a centred title is padded on
          both sides so it stays centred. */}
      <h2
        className={`pr-6 text-2xl in-[.text-center]:pl-6 ${eyebrow ? "mt-1" : ""}`}
      >
        {title}
      </h2>
      {sub && <div className="mt-1 text-sm text-muted-foreground">{sub}</div>}
      {children}
    </div>
  )
}
