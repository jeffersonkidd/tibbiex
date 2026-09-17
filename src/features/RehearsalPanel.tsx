import { ChevronRight, Disc } from "lucide-react"

import { REAGAN_YOUTH_LP } from "../content/music"
import ReaganYouthMark from "../graphics/marks/ReaganYouthMark"
import Meter from "../components/Meter"

/* Rehearsal status -- also the way into the record it is about. */
export default function RehearsalPanel({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="surface group block w-full rounded-lg p-5 text-left transition-colors hover:border-accent"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ReaganYouthMark />
          <div>
            <div className="text-base font-bold">
              Practicing with Reagan Youth
            </div>
            <p className="mono-label mt-1 text-muted-foreground">
              The next generation — L.E.S.
            </p>
          </div>
        </div>
        <span className="mono-label shrink-0 text-muted-foreground">80%</span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Three nights a week in a Lower East Side basement, running the set end
        to end. Carrying the songs forward, not covering them.
      </p>
      <div className="mt-3">
        <Meter value={80} label="Set rehearsed" />
      </div>
      <span className="mono-label mt-3 flex items-center gap-1.5 text-accent-strong">
        <Disc size={12} /> Hear “{REAGAN_YOUTH_LP.track}”
        <ChevronRight
          size={12}
          className="transition-transform group-hover:translate-x-1"
        />
      </span>
    </button>
  )
}
