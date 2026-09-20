import { QrCode, Share2 } from "lucide-react"

import { copyLink } from "../lib/share"

/* The control bar above the profile: the address, the QR code and the share
   button. */
export default function SiteHeader({ onShowQr }: { onShowQr: () => void }) {
  return (
    <header className="surface mb-8 flex items-center justify-between rounded-lg p-3">
      <span className="mono-label px-2 text-muted-foreground">
        Tibbie X Studio
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          aria-label="Show QR code"
          onClick={onShowQr}
          className="rounded-md border border-border bg-card p-2.5 text-foreground transition-all hover:bg-muted"
        >
          <QrCode className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Share bio link"
          onClick={copyLink}
          className="flex items-center gap-1.5 rounded-md border border-border bg-card p-2.5 text-xs font-medium text-foreground transition-all hover:bg-muted"
        >
          <Share2 className="h-4 w-4" />{" "}
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </header>
  )
}
