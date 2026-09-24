import { Guitar } from "lucide-react"

import { PORTFOLIO } from "../content/portfolio"
import type { BandId, Photo } from "../content/portfolio"
import DetailList from "../ui/display/DetailList"
import Separator from "../ui/display/Separator"
import FilterPill from "../ui/controls/FilterPill"
import Pill from "../ui/display/Pill"
import PhotoGrid from "../ui/cards/PhotoGrid"
import ShopLink from "../ui/cards/ShopLink"

/* One section per band, narrowed by the strip at the top. Each section carries
   an `id` so the Buy tab's "View credits" link can scroll straight to it. */
export default function PortfolioTab({
  band,
  onBandChange,
  onOpenShop,
  onOpenPhoto,
}: {
  band: BandId
  onBandChange: (band: BandId) => void
  onOpenShop: (band: BandId) => void
  onOpenPhoto: (photos: Photo[], index: number) => void
}) {
  return (
    <>
      {/* Band strip -- the same filter treatment the Buy tab uses, and
          where a shop group's "View credits" link lands. */}
      <div className="surface hide-scrollbar flex gap-cluster overflow-x-auto rounded-lg bg-card/50 p-strip">
        {PORTFOLIO.map((entry) => (
          <FilterPill
            key={entry.id}
            label={entry.band}
            active={band === entry.id}
            onClick={() => onBandChange(entry.id)}
          />
        ))}
      </div>

      {PORTFOLIO.filter((entry) => entry.id === band).map((entry) => (
        <section
          key={entry.id}
          id={`portfolio-${entry.id}`}
          className="surface scroll-mt-4 rounded-lg p-panel"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-part gap-y-1">
            <h2 className="heading-xl">{entry.band}</h2>
            <span className="label-mono text-muted-foreground">
              {entry.years}
            </span>
          </div>

          <div className="mt-3">
            <Pill icon={Guitar}>{entry.role}</Pill>
          </div>

          <p className="body-small mt-3 text-muted-foreground">{entry.blurb}</p>

          <Separator space="sm" />
          <DetailList items={entry.highlights} />

          <ShopLink entry={entry} onOpen={onOpenShop} />

          <PhotoGrid
            photos={entry.photos}
            onOpen={(index) => onOpenPhoto(entry.photos, index)}
          />
        </section>
      ))}
    </>
  )
}
