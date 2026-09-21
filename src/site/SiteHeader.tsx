import { QrCode, Share2 } from "lucide-react"

import { copyLink } from "../lib/share"
import IconButton from "../ui/controls/IconButton"

/* The control bar above the profile: the address, the QR code and the share
   button. Both controls are the same IconButton -- the share one carries a
   label, which appears from the sm breakpoint up. */
export default function SiteHeader({ onShowQr }: { onShowQr: () => void }) {
  return (
    <header className="surface mb-8 flex items-center justify-between rounded-lg p-3">
      <span className="mono-label px-2 text-muted-foreground">
        Tibbie X Studio
      </span>
      <div className="flex gap-2">
        <IconButton icon={QrCode} name="Show QR code" onClick={onShowQr} />
        <IconButton
          icon={Share2}
          name="Share bio link"
          label="Share"
          onClick={copyLink}
        />
      </div>
    </header>
  )
}
