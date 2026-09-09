import type { ReactNode } from "react"
import { X } from "lucide-react"

const OVERLAY_WIDTHS = {
  xs: "max-w-xs",
  md: "max-w-md",
  lg: "max-w-3xl",
}

export default function Overlay({
  children,
  onClose,
  size = "md",
}: {
  children: ReactNode
  onClose: () => void
  size?: "xs" | "md" | "lg"
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#08080a]/85 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={
          "relative w-full overflow-hidden rounded-xl border border-border bg-popover shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] backdrop-blur-2xl " +
          OVERLAY_WIDTHS[size]
        }
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-border bg-card/80 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  )
}
