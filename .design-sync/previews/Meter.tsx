import { Meter } from "tibbiex-ui"

export const Funded = () => (
  <div className="w-96">
    <Meter value={62} label="Raised toward the van fund" />
  </div>
)

export const Range = () => (
  <div className="flex w-96 flex-col gap-part">
    <Meter value={15} label="15 percent" />
    <Meter value={62} label="62 percent" />
    <Meter value={100} label="Full" />
  </div>
)
