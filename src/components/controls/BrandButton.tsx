import type { ReactNode, MouseEvent } from "react"

// The brand-red CTA, shared by the booking button, the ticket link and both
// modal actions. Shape and margins are the only things that vary between call
// sites, so those are props; the gradient/sheen/lift live in .brand-surface.
export default function BrandButton({
  children,
  variant = "block",
  type = "button",
  onClick,
  disabled = false,
  className = "",
}: {
  children: ReactNode
  variant?: "block" | "pill"
  type?: "button" | "submit"
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  className?: string
}) {
  const shape =
    variant === "pill"
      ? "gap-1.5 rounded-full px-4 py-2 text-xs"
      : "w-full gap-2 rounded-lg py-3 text-sm"

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`brand-surface brand-lift flex items-center justify-center bg-brand font-bold text-on-brand disabled:pointer-events-none disabled:opacity-60 ${shape} ${className}`}
    >
      {children}
    </button>
  )
}