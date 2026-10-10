import { TikTokIcon } from "tibbiex-ui"

export const Sizes = () => (
  <div className="flex items-center gap-part text-foreground">
    <TikTokIcon size={16} />
    <TikTokIcon size={24} />
    <TikTokIcon size={32} />
  </div>
)

export const Accent = () => (
  <div className="text-accent">
    <TikTokIcon size={32} />
  </div>
)
