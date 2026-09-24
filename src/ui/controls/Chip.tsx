import type { ReactNode } from "react"

/* A toggle in a grid of choices: an amount, a size, a topic. Selected reads as
   the same lighter outline the rail toggle uses, so red stays on the submit
   button. A disabled chip is a choice that exists but is gone (a sold-out
   size), struck through rather than hidden so the range still reads. */
export default function Chip({
  children,
  pressed,
  onClick,
  disabled = false,
  label,
}: {
  children: ReactNode
  pressed: boolean
  onClick: () => void
  disabled?: boolean
  label?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`w-full rounded-md border py-2 body-small-bold transition-all disabled:cursor-default disabled:border-border/50 disabled:bg-transparent disabled:text-muted-foreground/50 disabled:line-through ${
        pressed
          ? "brand-pop border-foreground bg-muted text-foreground"
          : "border-border bg-input-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}
