import { Overlay, OverlayBody, Button, SiteQrCode } from "tibbiex-ui"
import { Copy } from "lucide-react"

/* The modal shell: backdrop, panel, close button; content goes in
   OverlayBody. Overlay is position: fixed and fills its containing block; in a design that
   is the viewport. A preview card contains fixed children in a box with no
   height of its own, so this stage gives the modal room to fill. */
export const ShareModal = () => (
  <div className="h-[36rem]">
    <Overlay onClose={() => {}} size="xs">
      <OverlayBody title="Share" sub="tibbiex.studio" className="text-center">
        <div className="mt-5 flex justify-center">
          <SiteQrCode />
        </div>
        <div className="mt-5">
          <Button tone="secondary" icon={Copy}>
            Copy Link
          </Button>
        </div>
      </OverlayBody>
    </Overlay>
  </div>
)
