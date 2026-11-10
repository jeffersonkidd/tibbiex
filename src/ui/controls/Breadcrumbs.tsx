import { ChevronRight } from "lucide-react"

/* Where the visitor is, as a trail of steps back: each crumb but the last is
   a button that goes back to it, and the last is where they are. Content-
   blind; the trail arrives as props. */
export default function Breadcrumbs({
  trail,
}: {
  trail: { label: string; onOpen?: () => void }[]
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="label-mono flex flex-wrap items-center gap-x-glyph gap-y-1 text-on-surface-variant">
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1
          return (
            <li key={crumb.label} className="flex items-center gap-glyph">
              {last || !crumb.onOpen ? (
                <span
                  aria-current={last ? "page" : undefined}
                  className={last ? "text-on-surface" : undefined}
                >
                  {crumb.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={crumb.onOpen}
                  className="uppercase transition-colors hover:text-tertiary"
                >
                  {crumb.label}
                </button>
              )}
              {!last && <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
