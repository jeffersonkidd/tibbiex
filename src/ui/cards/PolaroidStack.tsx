import { ArrowRight } from "lucide-react"

export type Polaroid = { src: string; alt: string; caption: string }

/* A few instant prints tossed on the page, overlapping and tilted, with a
   label under them. The whole stack is one button: the prints are a way in,
   not a gallery, so there is nothing to pick between them. The paper and the
   tilt are in treatments/polaroid.css. */
export default function PolaroidStack({
  photos,
  label,
  onOpen,
}: {
  photos: Polaroid[]
  label: string
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="polaroid-stack group flex w-full flex-col items-center gap-part py-2"
    >
      <span className="flex justify-center">
        {photos.map((photo, i) => (
          <span
            key={photo.src}
            className="polaroid w-36 sm:w-44"
            style={
              {
                "--tilt": `${i % 2 ? 5 : -6}deg`,
                marginLeft: i ? "-0.75rem" : undefined,
                marginTop: i % 2 ? "1rem" : undefined,
              } as React.CSSProperties
            }
          >
            <img
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              decoding="async"
              className="polaroid-photo"
            />
            <span className="polaroid-caption">{photo.caption}</span>
          </span>
        ))}
      </span>
      <span className="flex items-center gap-glyph label-mono text-muted-foreground transition-colors group-hover:text-foreground">
        {label}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  )
}
