import type { ComponentType, ReactNode } from "react"

/* The top of a Home panel: an amber sigil box, a title with a line under it,
   and an optional badge on the right. The fund and the sign-up share it, so a
   stack of panels reads as one set. */
export default function PanelHeader({
  icon: Icon,
  title,
  sub,
  badge,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  sub: ReactNode
  badge?: string
}) {
  return (
    /* The title claims the row and the badge wraps under it on a narrow
       phone, rather than squeezing the title into three lines. */
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 flex-[1_1_14rem] items-center gap-3">
        <div className="rounded-md border border-accent-soft bg-accent-tint p-2 text-accent-strong">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base">{title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
        </div>
      </div>
      {badge && (
        <span className="mono-label shrink-0 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-accent-strong">
          {badge}
        </span>
      )}
    </div>
  )
}
