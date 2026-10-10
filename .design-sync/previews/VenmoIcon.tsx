import { VenmoIcon } from "tibbiex-ui"

export const Sizes = () => (
  <div className="flex items-center gap-part text-foreground">
    <VenmoIcon size={16} />
    <VenmoIcon size={24} />
    <VenmoIcon size={32} />
  </div>
)

export const Accent = () => (
  <div className="text-accent">
    <VenmoIcon size={32} />
  </div>
)
