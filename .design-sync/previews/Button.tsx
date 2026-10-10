import { Button } from "tibbiex-ui"
import { Copy, Mail, MessageSquare, Share2, Spade, X } from "lucide-react"

/* The site column is max-w-2xl; a block button fills whatever holds it. */
export const BrandBlock = () => (
  <div className="w-80">
    <Button icon={MessageSquare}>Contact</Button>
  </div>
)

export const Tones = () => (
  <div className="flex w-80 flex-col gap-cluster">
    <Button icon={Share2}>Share</Button>
    <Button tone="secondary" icon={Copy}>
      Copy Link
    </Button>
  </div>
)

export const Inline = () => (
  <div className="flex items-center gap-cluster">
    <Button tone="secondary" shape="inline" icon={Share2}>
      Share
    </Button>
    <Button shape="inline" icon={Mail}>
      Join
    </Button>
  </div>
)

export const IconOnly = () => (
  <div className="flex items-center gap-cluster">
    <Button tone="secondary" shape="icon" icon={X} name="Close" />
    <Button tone="secondary" shape="icon" icon={Share2} name="Share" />
  </div>
)

export const Disabled = () => (
  <div className="w-80">
    <Button icon={Spade} disabled>
      Opening Stripe…
    </Button>
  </div>
)
