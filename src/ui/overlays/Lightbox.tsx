import { useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import type { Photo } from "../../content/portfolio"
import Separator from "../Separator"
import Overlay from "./Overlay"

export type LightboxState = {
  photos: Photo[]
  index: number
}

/* The expanded view. Key handling lives here rather than in Overlay so the
   booking and QR modals keep their click-only dismissal, and the arrows wrap
   at both ends so the set never dead-ends. */
export default function Lightbox({
  state,
  onChange,
  onClose,
}: {
  state: LightboxState
  onChange: (next: LightboxState) => void
  onClose: () => void
}) {
  const { photos, index } = state
  const photo = photos[index]

  function step(delta: number) {
    onChange({
      photos,
      index: (index + delta + photos.length) % photos.length,
    })
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") step(1)
      if (e.key === "ArrowLeft") step(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  return (
    <Overlay onClose={onClose} size="lg">
      {/* object-contain, not cover: a lightbox that crops the photo defeats
          the point of opening it. No height cap either -- a tall photo makes
          a tall modal and the backdrop scrolls it, the same as everywhere
          else. */}
      <img
        src={photo.src}
        alt={photo.alt}
        className="w-full bg-muted object-contain"
      />

      <Separator />

      <div className="flex items-center gap-3 p-4">
        {photos.length > 1 && (
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => step(-1)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-xs text-muted-foreground">{photo.alt}</p>
          {photos.length > 1 && (
            <span className="mono-label mt-0.5 block text-accent">
              {index + 1} / {photos.length}
            </span>
          )}
        </div>

        {photos.length > 1 && (
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => step(1)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </Overlay>
  )
}
