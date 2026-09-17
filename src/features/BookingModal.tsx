import { toast } from "sonner"

import { CONTACT_EMAIL, bookingMailtoUrl } from "../content/site"
import BrandButton from "../components/controls/BrandButton"
import Field from "../components/controls/Field"
import Overlay from "../components/overlays/Overlay"
import OverlayBody from "../components/overlays/OverlayBody"

/* Book / Contact. There is no contact endpoint: the form composes a mailto:
   and hands it to the visitor's own mail client. */
export default function BookingModal({ onClose }: { onClose: () => void }) {
  return (
    <Overlay onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          /* Read before onClose unmounts the form. */
          const entries = new FormData(e.currentTarget)
          const field = (key: string) => String(entries.get(key) ?? "")
          const mailto = bookingMailtoUrl(
            field("name"),
            field("email"),
            field("message"),
          )
          onClose()
          /* Hands off to the mail client; the page itself stays put. */
          window.location.href = mailto
          toast.success("Opening your mail app.")
        }}
      >
        <OverlayBody title="Book / Contact" sub="For booking, press, or hate mail.">
          <div className="mt-5 flex flex-col gap-3">
            <Field placeholder="Name" type="text" name="name" label="Name" />
            <Field placeholder="Email" type="email" name="email" label="Email" />
            <textarea
              required
              rows={4}
              name="message"
              placeholder="Message"
              aria-label="Message"
              className="w-full resize-none rounded-md border border-border bg-input-background px-4 py-3 text-base text-foreground outline-none sm:text-sm transition-colors placeholder:text-muted-foreground focus:border-accent"
            />
            <BrandButton type="submit" className="mt-1">
              Send Message
            </BrandButton>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Or write to{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-foreground underline underline-offset-2 transition-colors hover:text-accent-strong"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </OverlayBody>
      </form>
    </Overlay>
  )
}
