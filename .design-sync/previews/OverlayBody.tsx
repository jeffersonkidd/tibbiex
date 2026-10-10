import { OverlayBody, Field, TextArea, Button } from "tibbiex-ui"

/* The padded content of a modal: eyebrow, title, sub, then the body. Shown
   here on a popover surface; in use it sits inside Overlay. */
export const BookingForm = () => (
  <div className="w-[28rem] rounded-lg border border-border bg-popover">
    <OverlayBody
      eyebrow="Book / Contact"
      title="Booking & Session Work"
      sub="Bass, vocals, tours. Replies within a few days."
    >
      <div className="mt-5 flex flex-col gap-part">
        <Field placeholder="Name" type="text" label="Name" />
        <Field placeholder="Email" type="email" label="Email" />
        <TextArea placeholder="Message" label="Message" />
        <Button type="submit">Send Message</Button>
      </div>
    </OverlayBody>
  </div>
)

export const Centred = () => (
  <div className="w-80 rounded-lg border border-border bg-popover">
    <OverlayBody title="Share" sub="tibbiex.studio" className="text-center">
      <p className="body-small mt-4 text-muted-foreground">
        Scan it or copy the link.
      </p>
    </OverlayBody>
  </div>
)
