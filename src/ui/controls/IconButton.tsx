import type { ComponentType } from "react"

/* A control in the header bar, mirroring the Figma "Icon Button" set.
   Bordered and card-filled rather than brand red: the header is chrome, not a
   call to action.

   `label` is optional and hidden below the sm breakpoint, so the button is a
   square glyph on a phone and grows a word on a wider screen. `name` is what
   the screen reader hears either way. */
export default function IconButton({
  icon: Icon,
  name,
  label,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>
  name: string
  label?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={name}
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-md border border-border bg-card p-2.5 text-xs font-medium text-foreground transition-all hover:bg-muted"
    >
      <Icon className="h-4 w-4" />
      {label && <span className="hidden sm:inline">{label}</span>}
    </button>
  )
}
