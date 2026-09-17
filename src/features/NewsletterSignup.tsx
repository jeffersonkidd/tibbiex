import { useState } from "react"
import { Check, Mail } from "lucide-react"
import { toast } from "sonner"

import { NEWSLETTER, signupMailtoUrl } from "../content/newsletter"
import { isEmail } from "../lib/email"
import BrandButton from "../components/controls/BrandButton"
import Chip from "../components/controls/Chip"
import EmailField from "../components/controls/EmailField"
import PanelHeader from "../components/PanelHeader"

/* "Get told first" -- the sign-up at the foot of the Home tab, from the
   component reference in .files/tibbiex-components.html. Two steps: the
   address, then (optionally) what to hear about.

   No mailing list is connected yet, so the last step hands a ready-written
   message to the visitor's mail client, the same hand-off the booking form
   uses. The copy says so -- the visitor is on the list once that mail is sent,
   not when they click Join. */
export default function NewsletterSignup() {
  const [step, setStep] = useState<"email" | "topics" | "sent">("email")
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [topics, setTopics] = useState<string[]>([])

  function join(e: React.FormEvent) {
    e.preventDefault()
    if (!isEmail(email)) {
      setError("Enter an email first.")
      return
    }
    setStep("topics")
  }

  function toggle(topic: string) {
    setTopics((current) =>
      current.includes(topic)
        ? current.filter((t) => t !== topic)
        : [...current, topic],
    )
  }

  function send() {
    window.location.href = signupMailtoUrl(email, topics)
    toast.success("Opening your mail app.")
    setStep("sent")
  }

  if (step === "sent") {
    return (
      <section className="surface rounded-lg p-5" aria-live="polite">
        <PanelHeader
          icon={Check}
          title="Almost on the list"
          sub="Hit send in your mail app and you’re in."
        />
      </section>
    )
  }

  if (step === "topics") {
    return (
      <section className="surface rounded-lg p-5" aria-live="polite">
        <PanelHeader
          icon={Mail}
          title="What do you want to hear about?"
          sub={`Signing up ${email.trim()}. Optional — change it any time.`}
        />
        <div
          role="group"
          aria-label="Topics"
          className="mt-4 grid grid-cols-2 gap-2"
        >
          {NEWSLETTER.topics.map((topic) => (
            <Chip
              key={topic}
              pressed={topics.includes(topic)}
              onClick={() => toggle(topic)}
            >
              {topic}
            </Chip>
          ))}
        </div>
        <BrandButton className="mt-4" onClick={send}>
          <Mail className="h-4 w-4" />
          {topics.length ? "Send sign-up" : "Send sign-up — everything"}
        </BrandButton>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Opens your mail app with the sign-up written for you.
        </p>
      </section>
    )
  }

  return (
    <section className="surface rounded-lg p-5">
      <PanelHeader icon={Mail} title={NEWSLETTER.title} sub={NEWSLETTER.blurb} />
      <form onSubmit={join} noValidate className="mt-4 flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <EmailField
            value={email}
            onChange={(value) => {
              setEmail(value)
              setError(null)
            }}
            error={error}
            size="sm"
          />
        </div>
        {/* BrandButton is a full-width block, so it gets a sized wrapper
            rather than a competing width utility. */}
        <div className="w-20 shrink-0">
          <BrandButton type="submit">Join</BrandButton>
        </div>
      </form>
      <p className="mt-2 text-xs text-muted-foreground">{NEWSLETTER.cadence}</p>
    </section>
  )
}
