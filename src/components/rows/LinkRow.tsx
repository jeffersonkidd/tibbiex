import { ChevronRight, ExternalLink, Sparkles } from "lucide-react"

import type { LinkEntry } from "../../content/links"
import { castMagicFrom } from "../../lib/magic-dust"

const ROW =
  "surface group block w-full transform rounded-lg p-4 text-left transition-all duration-300 hover:scale-[1.01] hover:border-accent"

/* One Home-tab row. Mirrors the Figma "Link Row" set, whose Type variant is
   derived here from the entry: `action: "tarot"` is Tarot, `external` is
   External, anything else Default. A row with `onOpen` opens something in this
   view and renders as a <button>; without it the row is an <a> to `href`. Both
   throw sparks from the pointer. The tarot row is the one that gets colour: an
   amber sigil box and a sparkle in place of the chevron, since amber is what
   the magic is drawn in everywhere else. */
export default function LinkRow({
  link,
  onOpen,
}: {
  link: LinkEntry
  onOpen?: () => void
}) {
  const { icon: Icon, title, meta, external, action, href } = link
  const tarot = action === "tarot"
  const className = tarot ? `${ROW} arcana-row` : ROW

  const face = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div
          className={`rounded-md p-3 transition-colors ${
            tarot
              ? "arcana-sigil bg-accent-tint text-accent"
              : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-base font-bold">{title}</div>
          <p className="mono-label mt-1 text-muted-foreground">{meta}</p>
        </div>
      </div>
      {tarot ? (
        <Sparkles className="arcana-spark h-5 w-5 text-accent" />
      ) : external ? (
        <ExternalLink className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent-strong" />
      ) : (
        <ChevronRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent-strong" />
      )}
    </div>
  )

  if (!onOpen) {
    return (
      <a href={href} onClick={castMagicFrom} className={className}>
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
      className={className}
    >
      {face}
    </button>
  )
}
