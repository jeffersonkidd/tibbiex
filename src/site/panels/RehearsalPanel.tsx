import { ChevronRight, Disc } from "lucide-react"

import { REAGAN_YOUTH_LP } from "../../content/music"
import ReaganYouthMark from "../../assets/marks/ReaganYouthMark"
import Meter from "../../ui/display/Meter"

/* Rehearsal status -- also the way into the record it is about. */
export default function RehearsalPanel({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="surface group block w-full rounded-lg p-panel text-left transition-colors hover:border-accent"
    >
      <div className="flex items-start justify-between gap-part">
        <div className="flex items-center gap-part">
          <ReaganYouthMark />
          <div>
            <div className="body-base-bold">Practicing with Reagan Youth</div>
            <p className="label-mono mt-1 text-muted-foreground">
              The next generation — L.E.S.
            </p>
          </div>
        </div>
        <span className="label-mono shrink-0 text-muted-foreground">80%</span>
      </div>
      <p className="body-xs mt-3 text-muted-foreground">
        Three nights a week in a Lower East Side basement, running the set end
        to end. Carrying the songs forward, not covering them.
      </p>
      <div className="mt-3">
        <Meter value={80} label="Set rehearsed" />
      </div>
      <span className="label-mono mt-3 flex items-center gap-glyph text-accent">
        <Disc size={12} /> Hear “{REAGAN_YOUTH_LP.track}”
        <ChevronRight
          size={12}
          className="transition-transform group-hover:translate-x-1"
        />
      </span>
    </button>
  )
}
