import { Copy } from "lucide-react"

import { copyLink } from "../lib/share"
import Overlay from "../components/overlays/Overlay"
import OverlayBody from "../components/overlays/OverlayBody"
import SiteQrCode from "../components/SiteQrCode"

/* Scan & Share: the pre-computed QR for SITE_URL, plus copy-the-link. */
export default function ShareModal({ onClose }: { onClose: () => void }) {
  return (
    <Overlay onClose={onClose} size="xs">
      <OverlayBody title="Scan & Share" className="text-center">
        <div className="mx-auto mt-5 w-fit rounded-md border border-border bg-muted p-4">
          <SiteQrCode size={148} />
        </div>
        <button
          type="button"
          onClick={copyLink}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-border py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted"
        >
          <Copy size={16} /> Copy Link
        </button>
      </OverlayBody>
    </Overlay>
  )
}
