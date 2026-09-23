import { Share2 } from "lucide-react"

import Button from "../ui/controls/Button"

/* The control bar above the profile: the address and the one Share button,
   which opens the Scan & Share modal. The label shows at every width -- with a
   single control there is room, and a bare glyph would leave phones guessing. */
export default function Header({ onShare }: { onShare: () => void }) {
  return (
    <header className="surface flex items-center justify-between rounded-lg p-3">
      <span className="mono-label px-2 text-muted-foreground">
        Tibbie X Studio
      </span>
      <Button tone="secondary" shape="inline" icon={Share2} onClick={onShare}>
        Share
      </Button>
    </header>
  )
}
