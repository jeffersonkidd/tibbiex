import { PatreonIcon } from "tibbiex-ui"

export const Sizes = () => (
  <div className="flex items-center gap-part text-foreground">
    <PatreonIcon size={16} />
    <PatreonIcon size={24} />
    <PatreonIcon size={32} />
  </div>
)

export const Accent = () => (
  <div className="text-accent">
    <PatreonIcon size={32} />
  </div>
)
