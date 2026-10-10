import { FilterPill } from "tibbiex-ui"

const noop = () => {}

/* Pills sit in a sheer strip, as on the Buy tab. */
export const ShelfStrip = () => (
  <div className="surface flex w-[34rem] gap-cluster rounded-lg bg-card/50 p-strip">
    <FilterPill label="Bands" active onClick={noop} />
    <FilterPill label="Art" active={false} onClick={noop} />
  </div>
)

export const BandStrip = () => (
  <div className="surface flex w-[34rem] gap-cluster rounded-lg bg-card/50 p-strip">
    <FilterPill label="Leftover Crack" active={false} onClick={noop} />
    <FilterPill label="Reagan Youth" active onClick={noop} />
    <FilterPill label="GASH" active={false} onClick={noop} />
  </div>
)
