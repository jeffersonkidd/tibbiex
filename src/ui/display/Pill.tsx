import type { ComponentType, ReactNode } from "react"

/* The amber credit on the profile card and on a portfolio section -- what
   someone plays -- and, without an icon, the badge on a panel header. The one label that is not a control: a span with nothing to
   press, which is why this sits at the ui root rather than in ui/controls.

   It carried a second `tag` variant, muted context rather than a credit, worn
   only by the row of tags at the foot of the profile card. That row is gone,
   so the variant went with it and there is no kind of pill to choose. */
export default function Pill({
  icon: Icon,
  children,
}: {
  icon?: ComponentType<{ size?: number; "aria-hidden"?: boolean }>
  children: ReactNode
}) {
  return (
    <span className="label-mono inline-flex items-center gap-glyph whitespace-nowrap rounded-full border border-border bg-accent-tint px-2.5 py-1 text-accent">
      {Icon && <Icon size={12} aria-hidden />}
      {children}
    </span>
  )
}
