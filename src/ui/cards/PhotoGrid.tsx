import type { Photo } from "../../content/portfolio"

import Separator from "../display/Separator"

/* Masonry with no library and no measuring pass: CSS multi-column flows the
   photos down each column in turn, and `break-inside-avoid` stops one being
   split across a column boundary. The trade is a ragged bottom edge, which
   suits the zine treatment better than a locked grid would. */
export default function PhotoGrid({
  photos,
  onOpen,
}: {
  photos: Photo[]
  onOpen: (index: number) => void
}) {
  if (photos.length === 0) return null

  return (
    <>
      <Separator space="md" />
      <span className="mono-label text-muted-foreground">Photos</span>

      <div className="mt-3 columns-2 gap-2 sm:columns-3">
        {photos.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => onOpen(index)}
            aria-label={`Open photo: ${photo.alt}`}
            className="group mb-2 block w-full break-inside-avoid overflow-hidden rounded-md border border-border transition-colors hover:border-accent"
          >
            <img
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              decoding="async"
              className="h-auto w-full transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>
    </>
  )
}
