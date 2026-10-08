import type { ComponentType, ReactNode } from "react"

import Pill from "./Pill"

/* The top of a Home panel: an amber sigil box, a title with a line under it,
   and an optional badge on the right, which is a Pill with no icon. The fund
   and the sign-up share it, so a stack of panels reads as one set.

   `lit` is the header's half of the featured highlight (featured.css): the
   sigil box pulses and, where a plain panel carries a badge, a turning spark
   sits instead -- a "!" in the marker face, since lucide has no bare
   exclamation mark. The panel itself wears `.featured`. */
export default function PanelHeader({
  icon: Icon,
  title,
  sub,
  badge,
  lit = false,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  sub: ReactNode
  badge?: string
  lit?: boolean
}) {
  return (
    /* The title claims the row and the badge wraps under it on a narrow
       phone, rather than squeezing the title into three lines. */
    <div className="flex flex-wrap items-start justify-between gap-part">
      {/* The sigil is as tall as the title block on one line -- the heading-l
          line (32) plus the sub line under it (2 + 16) -- and pins to the top
          when a narrow phone wraps the title. */}
      <div className="flex min-w-0 flex-[1_1_14rem] items-start gap-part">
        <div
          className={`flex size-12.5 shrink-0 items-center justify-center rounded-md border border-accent-soft bg-accent-tint text-accent ${
            lit ? "featured-sigil" : ""
          }`}
        >
          <Icon className="size-7" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="heading-l">{title}</h2>
          <p className="body-xs mt-0.5 text-muted-foreground">{sub}</p>
        </div>
      </div>
      {badge ? (
        <div className="flex shrink-0">
          <Pill>{badge}</Pill>
        </div>
      ) : (
        lit && (
          <span
            aria-hidden
            className="featured-spark heading-l shrink-0 px-1 text-accent"
          >
            !
          </span>
        )
      )}
    </div>
  )
}
