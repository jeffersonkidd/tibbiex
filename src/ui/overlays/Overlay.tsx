import { useEffect } from "react"
import type { ReactNode } from "react"
import { X } from "lucide-react"

const OVERLAY_WIDTHS = {
  xs: "max-w-xs",
  md: "max-w-md",
  lg: "max-w-3xl",
}

/* A modal is as tall as what is in it -- no panel scrolls inside itself. When
   the dialog outgrows the viewport the backdrop scrolls instead, carrying the
   whole thing, so nothing is ever parked behind a hidden inner scrollbar.

   The dialog centres with `m-auto` rather than the backdrop's `items-center`:
   a flex item centred that way has its overflowing top edge cut off and
   unreachable, while auto margins collapse to the space available and let it
   scroll into view. */
export default function Overlay({
  children,
  onClose,
  size = "md",
}: {
  children: ReactNode
  onClose: () => void
  size?: "xs" | "md" | "lg"
}) {
  /* Hold the page still underneath. Every modal on the site comes through
     here and only one is ever open, so the lock is a plain mount/unmount
     rather than a counter.

     `overflow: hidden` alone is not enough: iOS Safari scrolls the body
     anyway, so the body is pinned with `position: fixed` and its scroll
     offset held in `top`, then handed back on the way out -- without that
     last step, closing a modal would drop the visitor at the top of the
     page. Nothing compensates for a vanishing scrollbar because none
     vanishes: `html { overflow-y: scroll }` in background.css keeps the
     gutter reserved at every page height, so the layout cannot jump. */
  useEffect(() => {
    const { body } = document
    const scrollY = window.scrollY
    const previous = body.style.cssText

    body.style.overflow = "hidden"
    body.style.position = "fixed"
    body.style.top = `-${scrollY}px`
    body.style.width = "100%"

    return () => {
      body.style.cssText = previous
      window.scrollTo(0, scrollY)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[#08080a]/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div className="flex min-h-full justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          className={
            "relative m-auto w-full overflow-hidden rounded-xl border border-border bg-popover shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] backdrop-blur-2xl " +
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
    </div>
  )
}
