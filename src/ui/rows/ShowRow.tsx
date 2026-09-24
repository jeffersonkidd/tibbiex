import { Calendar, MapPin, Ticket } from "lucide-react"

import type { Show } from "../../content/shows"
import Button from "../controls/Button"

/* One entry in the Tour tab. Only "Tickets" gets the CTA; every other status
   ("Sold Out", "Festival"…) is printed in the amber badge, which is why the
   Figma "Show Row" set has two variants, Tickets and Badge, rather than one per
   status. */
export default function ShowRow({ show }: { show: Show }) {
  return (
    <div className="surface rounded-lg p-panel">
      <div className="flex items-start justify-between">
        <div>
          <div className="body-large-bold">{show.venue}</div>
          <div className="body-small mt-1 flex items-center gap-glyph text-muted-foreground">
            <Calendar className="h-4 w-4" /> {show.date}
          </div>
          <div className="body-small mt-1 flex items-center gap-glyph text-muted-foreground">
            <MapPin className="h-4 w-4" /> {show.city}
          </div>
        </div>
        {show.status === "Tickets" ? (
          <Button shape="inline" icon={Ticket}>
            Tickets
          </Button>
        ) : (
          <span className="rounded-full bg-accent-tint px-3 py-1 body-xs-bold text-accent">
            {show.status}
          </span>
        )}
      </div>
    </div>
  )
}
