import { ChevronRight, ExternalLink, Sparkles } from "lucide-react"

import type { LinkEntry } from "../data"

/* The shared class string for a Home-tab row. It is a const rather than a
   repeated literal because the row is an <a> for outbound links and a <button>
   for the tarot -- two elements that have to look identical. */
export const LINK_ROW =
  "card-surface group block transform rounded-lg p-4 transition-all duration-300 hover:scale-[1.01] hover:border-accent"

/* The inside of a link row, identical for both element types. The tarot row is
   the one that gets colour: an amber sigil box and a sparkle in place of the
   chevron, since amber is what the magic is drawn in everywhere else. */
export default function LinkFace({ link }: { link: LinkEntry }) {
  const { icon: Icon, title, meta, external, action } = link
  const magic = action === "tarot"

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div
          className={`rounded-md p-3 transition-colors ${
            magic
              ? "arcana-sigil bg-accent-tint text-accent"
              : "bg-muted text-muted-foreground group-hover:bg-brand group-hover:text-on-brand"
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-base font-bold">{title}</div>
          <p className="mono-label mt-1 text-muted-foreground">{meta}</p>
        </div>
      </div>
      {magic ? (
        <Sparkles className="arcana-spark h-5 w-5 text-accent" />
      ) : external ? (
        <ExternalLink className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent-strong" />
      ) : (
        <ChevronRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-accent-strong" />
      )}
    </div>
  )
}
