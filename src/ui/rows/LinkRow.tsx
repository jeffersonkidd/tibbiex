import { ChevronRight, ExternalLink } from "lucide-react"

import type { LinkEntry } from "../../content/links"
import { castMagicFrom } from "../../lib/magic-dust"

const ROW =
  "surface group block w-full transform rounded-lg p-panel text-left transition-all duration-300 hover:scale-[1.01] hover:border-accent"

/* One Home-tab row. Mirrors the Figma "Link Row" set, whose Type variant is
   derived here from the entry: `external` is External, anything else Default.
   A row with `onOpen` opens something in this view and renders as a <button>;
   without it the row is an <a> to `href`. Both throw sparks from the pointer.
   No row is lit any more -- the amber highlight belongs to whichever block is
   featured (see featured.css), and that is the sign-up above them. */
export default function LinkRow({
  link,
  onOpen,
}: {
  link: LinkEntry
  onOpen?: () => void
}) {
  const { icon: Icon, title, meta, external, href } = link

  const face = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="rounded-md bg-muted p-3 text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-base font-bold">{title}</div>
          <p className="mono-label mt-1 text-muted-foreground">{meta}</p>
        </div>
      </div>
      {external ? (
        <ExternalLink className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent" />
      ) : (
        <ChevronRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent" />
      )}
    </div>
  )

  if (!onOpen) {
    return (
      <a href={href} onClick={castMagicFrom} className={ROW}>
        {face}
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        castMagicFrom(e)
        onOpen()
      }}
      className={ROW}
    >
      {face}
    </button>
  )
}
