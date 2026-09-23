import type { ComponentType, MouseEvent, ReactNode } from "react"

const TONES = {
  // The red CTA; the gradient, sheen and lift live in .brand-surface.
  brand: "brand-surface brand-lift bg-primary text-primary-foreground",
  // Bordered and card-filled: chrome and lesser actions, never the one the
  // panel exists for.
  secondary:
    "border border-border bg-card text-foreground transition-colors hover:bg-muted",
}

const SHAPES = {
  block: "w-full gap-2 rounded-lg px-4 py-3 text-sm",
  inline: "gap-glyph rounded-md px-3 py-2 text-xs",
  icon: "gap-glyph rounded-md p-2.5 text-xs",
}

/* Every button on the page that is a button rather than a card or a row.
   Tone is what it means, shape is how much room it takes, and the two are
   independent -- though an icon-only brand button is rarely the right call,
   since a bare glyph makes a weak CTA. Every shape is square-cornered, as the
   rest of the site is; there is no round variant.

   A block is always full width; to size one, wrap it in a sized element rather
   than passing a width through `className`. The icon shape is a glyph whose
   `name` is what the screen reader hears; any children are a label that
   appears from the sm breakpoint up. */
export default function Button({
  tone = "brand",
  shape = "block",
  icon: Icon,
  name,
  children,
  type = "button",
  onClick,
  disabled = false,
  className = "",
}: {
  tone?: keyof typeof TONES
  icon?: ComponentType<{ className?: string }>
  type?: "button" | "submit"
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  className?: string
} & (
  | { shape?: "block" | "inline"; name?: never; children: ReactNode }
  | { shape: "icon"; name: string; children?: ReactNode }
)) {
  return (
    <button
      type={type}
      aria-label={name}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center font-bold disabled:pointer-events-none disabled:opacity-60 ${TONES[tone]} ${SHAPES[shape]} ${className}`}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {shape === "icon" && children ? (
        <span className="hidden sm:inline">{children}</span>
      ) : (
        children
      )}
    </button>
  )
}
