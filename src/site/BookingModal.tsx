import { useState } from "react"
import { toast } from "sonner"

import { CONTACT_EMAIL } from "../content/site"
import { sendMessage } from "../lib/messages"
import BrandButton from "../ui/controls/BrandButton"
import Field from "../ui/controls/Field"
import Honeypot from "../ui/controls/Honeypot"
import Overlay from "../ui/overlays/Overlay"
import OverlayBody from "../ui/overlays/OverlayBody"

/* Book / Contact. The form posts to api/contact.ts, which sends the message
   through Resend with the visitor's address as reply-to. It used to compose a
   mailto: and hand it to their own mail client, which delivered nothing at all
   on a phone with no mail app configured.

   The modal stays open until the send lands, so a failure has somewhere to be
   said and the typing is still there to retry with. */
export default function BookingModal({ onClose }: { onClose: () => void }) {
  const [sending, setSending] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const entries = new FormData(e.currentTarget)
    const field = (key: string) => String(entries.get(key) ?? "")

    setSending(true)
    try {
      await sendMessage({
        purpose: "booking",
        name: field("name"),
        email: field("email"),
        message: field("message"),
        website: field("website"),
      })
      onClose()
      toast.success("Message sent — she'll get back to you.")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not send that.",
      )
      setSending(false)
    }
  }

  return (
    <Overlay onClose={onClose}>
      <form onSubmit={submit}>
        <OverlayBody
          title="Book / Contact"
          sub="For booking, press, or hate mail."
        >
          <div className="mt-5 flex flex-col gap-3">
            <Field placeholder="Name" type="text" name="name" label="Name" />
            <Field
              placeholder="Email"
              type="email"
              name="email"
              label="Email"
            />
            <textarea
              required
              rows={4}
              name="message"
              placeholder="Message"
              aria-label="Message"
              className="w-full resize-none rounded-md border border-border bg-input-background px-4 py-3 text-base text-foreground outline-none sm:text-sm transition-colors placeholder:text-muted-foreground focus:border-accent"
            />
            <Honeypot />
            <BrandButton type="submit" className="mt-1" disabled={sending}>
              {sending ? "Sending…" : "Send Message"}
            </BrandButton>
          </div>
          {/* The address is shown, not linked. A mailto: directly under the
              submit button is a trap on a phone: a tap landing slightly low
              opens a mail client for a form that already sends. It stays
              selectable for anyone who would rather write themselves. */}
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Or write to <span className="text-foreground">{CONTACT_EMAIL}</span>
          </p>
        </OverlayBody>
      </form>
    </Overlay>
  )
}
