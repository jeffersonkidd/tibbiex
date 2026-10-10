import { useEffect, useRef, useState } from "react"
import { Toaster, toast } from "sonner"
import { ImageUp, Send } from "lucide-react"

import { PORTRAIT_MAX_BYTES, submitPortrait } from "./lib/messages"

import Button from "./ui/controls/Button"
import Honeypot from "./ui/controls/Honeypot"
import TextArea from "./ui/controls/TextArea"
import PanelHeader from "./ui/display/PanelHeader"

import Header from "./site/Header"
import ProfileCard from "./site/ProfileCard"

/* The page at /preview: a second page shell beside App, where the client can
   try a new profile picture on the real header and profile card, then send
   it. Sending mails the original file to CONTACT_EMAIL through
   api/portrait.ts; nothing on the site changes until it is cut and switched
   in by hand. The page is unlisted and marked noindex, and it has its own
   entry (preview/index.html) so none of it ships to visitors.

   The picture never leaves the browser until Send: the preview is an object
   URL. A file the browser cannot draw -- a HEIC photo in Chrome -- is caught
   here, since the card would only show a broken image. */
export default function PortraitPreview() {
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const picker = useRef<HTMLInputElement>(null)

  /* Each object URL is released when the next one replaces it. */
  useEffect(() => {
    return () => {
      if (photo) URL.revokeObjectURL(photo.url)
    }
  }, [photo])

  function choose(file: File | undefined) {
    if (!file) return
    setProblem(null)
    if (!file.type.startsWith("image/")) {
      setProblem("That file isn't a picture.")
      return
    }
    if (file.size > PORTRAIT_MAX_BYTES) {
      setProblem(
        "That picture is over 4 MB. Save a smaller copy (a screenshot of it works) and try again.",
      )
      return
    }
    const url = URL.createObjectURL(file)
    const probe = new Image()
    probe.onload = () => {
      setSent(false)
      setPhoto({ file, url })
    }
    probe.onerror = () => {
      URL.revokeObjectURL(url)
      setProblem(
        "This browser can't show that file. Save it as a JPEG or PNG and try again.",
      )
    }
    probe.src = url
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!photo) return
    const entries = new FormData(e.currentTarget)
    const field = (key: string) => String(entries.get(key) ?? "")

    setSending(true)
    try {
      await submitPortrait(photo.file, field("note"), field("website"))
      setSent(true)
      toast.success("Sent. It goes live once it's been switched over.")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not send that.",
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex min-h-screen justify-center pb-20 font-sans text-foreground selection:bg-accent-soft">
      <Toaster position="top-center" richColors />

      <div className="w-full min-w-0 max-w-2xl space-y-stack px-4 pt-6 sm:px-6">
        <section className="surface rounded-lg p-panel">
          <PanelHeader
            icon={ImageUp}
            title="Try a new profile picture"
            sub="See it on the card first. Nothing changes on the site until you send it and it's switched over."
          />

          <ul className="body-xs mt-5 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Square works best, with the face in the middle.</li>
            <li>At least 320 pixels on the short side, and under 4 MB.</li>
            <li>
              A cut-out PNG lets the white ring show behind you; a normal photo
              fills the circle.
            </li>
          </ul>

          <input
            ref={picker}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
              choose(e.target.files?.[0])
              /* So choosing the same file again still fires. */
              e.target.value = ""
            }}
          />
          <div className="mt-5">
            <Button
              tone={photo ? "secondary" : "brand"}
              icon={ImageUp}
              onClick={() => picker.current?.click()}
            >
              {photo ? "Choose a different picture" : "Choose a picture"}
            </Button>
          </div>
          {problem && (
            <p role="alert" className="body-small mt-3 text-primary">
              {problem}
            </p>
          )}
        </section>

        <p className="label-mono px-2 text-muted-foreground">
          {photo ? "Your picture on the site" : "The site as it is now"}
        </p>

        {/* The real header and card, display-only: `inert` keeps the Share
            and Contact buttons from doing anything here. */}
        <div inert className="space-y-stack">
          <Header onShare={() => {}} />
          <ProfileCard onContact={() => {}} portrait={photo?.url} />
        </div>

        {photo && (
          <section className="surface rounded-lg p-panel">
            {sent ? (
              <p className="body-base">
                Sent. It goes live once it's been switched over. You can try
                another picture above.
              </p>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-part">
                <h2 className="heading-l">Like it?</h2>
                <TextArea
                  name="note"
                  rows={3}
                  required={false}
                  placeholder="Anything to add? (optional)"
                  label="Note"
                />
                <Honeypot />
                <Button type="submit" icon={Send} disabled={sending}>
                  {sending ? "Sending…" : "Send this picture"}
                </Button>
              </form>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
