import type { ComponentType, ReactNode } from "react"

/* The top of a Home panel: an amber sigil box beside a title, with an
   optional line under the title and an optional eyebrow above it in the mono
   label face and the accent. A panel whose line runs long leaves `sub` off
   and sets it as its own block under the header instead. The fund
   and the sign-up share it, so a stack of panels reads as one set. The
   eyebrow replaced a Pill badge on the right, which wrapped under the title
   on a phone.

   `lit` is the header's half of the featured highlight (featured.css): the
   sigil box pulses and a turning spark sits on the right -- a "!" in the
   marker face, since lucide has no bare exclamation mark. The panel itself
   wears `.featured`. */
export default function PanelHeader({
  icon: Icon,
  title,
  sub,
  eyebrow,
  lit = false,
  spark = lit,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  sub?: ReactNode
  eyebrow?: string
  lit?: boolean
  /* The "!" beside a lit title. On whenever the header is lit, unless the
     panel switches it off. */
  spark?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-part">
      {/* The sigil is as tall as the title block on one line -- the heading-l
          line (32) plus either the sub line under it (2 + 16) or the eyebrow
          over it (4 + 13) -- and pins to the top when a phone wraps the
          title. */}
      <div className="flex min-w-0 flex-1 items-start gap-part">
        <div
          className={`flex size-12.5 shrink-0 items-center justify-center rounded-md border border-accent-soft bg-accent-tint text-accent ${
            lit ? "featured-sigil" : ""
          }`}
        >
          <Icon className="size-7" />
        </div>
        <div className="min-w-0 flex-1">
          {eyebrow && <p className="label-mono mb-1 text-accent">{eyebrow}</p>}
          <h2 className="heading-l">{title}</h2>
          {sub && <p className="body-xs mt-0.5 text-muted-foreground">{sub}</p>}
        </div>
      </div>
      {spark && (
        <span
          aria-hidden
          className="featured-spark heading-l shrink-0 px-1 text-accent"
        >
          !
        </span>
      )}
    </div>
  )
}
