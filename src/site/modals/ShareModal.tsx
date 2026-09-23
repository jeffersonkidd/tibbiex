import { Copy, Share2 } from "lucide-react"

import { canShareNatively, copyLink, shareLink } from "../../lib/share"
import Button from "../../ui/controls/Button"
import Overlay from "../../ui/overlays/Overlay"
import OverlayBody from "../../ui/overlays/OverlayBody"
import SiteQrCode from "../../ui/display/SiteQrCode"

/* Scan & Share, the one place the site hands out its own address: the
   pre-computed QR for SITE_URL for someone standing beside you, the phone's
   share sheet where there is one, and copy-the-link everywhere. */
export default function ShareModal({ onClose }: { onClose: () => void }) {
  return (
    <Overlay onClose={onClose} size="xs">
      <OverlayBody title="Scan & Share" className="text-center">
        <div className="mx-auto mt-5 w-fit rounded-md border border-border bg-muted p-4">
          <SiteQrCode size={148} />
        </div>
        <div className="mt-5 space-y-cluster">
          {canShareNatively() && (
            <Button icon={Share2} onClick={shareLink}>
              Share
            </Button>
          )}
          <Button tone="secondary" icon={Copy} onClick={copyLink}>
            Copy Link
          </Button>
        </div>
      </OverlayBody>
    </Overlay>
  )
}
