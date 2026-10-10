import { Pill } from "tibbiex-ui"
import { Guitar, Mic } from "lucide-react"

export const Credits = () => (
  <div className="flex flex-wrap gap-cluster">
    <Pill icon={Guitar}>Bass</Pill>
    <Pill icon={Mic}>Vocals</Pill>
  </div>
)

/* Without an icon it is a panel header's badge. */
export const Badge = () => <Pill>62% there</Pill>
