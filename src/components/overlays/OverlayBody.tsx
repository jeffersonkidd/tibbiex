import type { ReactNode } from "react"

/* The inside of a modal: padding, an optional amber eyebrow, the title and an
   optional line under it. Every modal opened from the page starts this way, so
   the heading scale and spacing live here once. `className` is for treatments
   that don't compete with the padding -- the reading menu's veil and scroll. */
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
    <div className={`p-6 ${className}`}>
      {eyebrow && <span className="mono-label text-accent-strong">{eyebrow}</span>}
      <h2 className={`text-2xl ${eyebrow ? "mt-1" : ""}`}>{title}</h2>
      {sub && <div className="mt-1 text-sm text-muted-foreground">{sub}</div>}
      {children}
    </div>
  )
}
