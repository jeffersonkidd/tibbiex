import { ArrowRight } from "lucide-react"

export type Polaroid = { src: string; alt: string; caption: string }

/* Instant prints tossed on the page in pairs, each pair overlapping and
   tilted, with one label under them all. The pairs sit side by side from
   `sm` up and one above the other on a phone, where two pairs across would
   leave each print too narrow for its caption. The whole stack is one
   button: the prints are a way in, not a gallery, so there is nothing to
   pick between them. The paper and the tilt are in treatments/polaroid.css. */
export default function PolaroidStack({
  pairs,
  label,
  onOpen,
}: {
  pairs: Polaroid[][]
  label: string
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="polaroid-stack group flex w-full flex-col items-center gap-part py-2 sm:pt-6"
    >
      <span className="flex flex-col items-center gap-stack sm:flex-row sm:justify-center sm:gap-8">
        {pairs.map((pair) => (
          <span key={pair[0].src} className="polaroid-pair flex justify-center">
            {pair.map((photo, i) => (
              <span
                key={photo.src}
                className="polaroid w-36"
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
        ))}
      </span>
      <span className="flex items-center gap-glyph label-mono text-muted-foreground transition-colors group-hover:text-foreground">
        {label}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  )
}
