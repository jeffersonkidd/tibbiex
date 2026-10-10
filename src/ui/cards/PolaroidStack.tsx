export type Polaroid<Id extends string = string> = {
  id: Id
  src: string
  alt: string
  caption: string
}

/* Instant prints tossed on the page, in rows of two: each row's pair
   overlaps and tilts, and each print is its own button, handing back its
   `id`. The label under them all names what they lead into. The paper, the
   tape and the tilt are in treatments/polaroid.css. */
export default function PolaroidStack<Id extends string>({
  rows,
  label,
  onOpen,
}: {
  rows: Polaroid<Id>[][]
  label: string
  onOpen: (id: Id) => void
}) {
  return (
    <div className="flex flex-col items-center gap-12 py-2 sm:pt-6">
      {rows.map((row) => (
        <div key={row[0].id} className="flex justify-center">
          {row.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => onOpen(photo.id)}
              className="polaroid w-36 sm:w-56"
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
            </button>
          ))}
        </div>
      ))}
      <span className="label-mono text-muted-foreground">{label}</span>
    </div>
  )
}
