import { useState } from "react"
import { Check, Mail } from "lucide-react"
import { toast } from "sonner"

import { NEWSLETTER } from "../../content/newsletter"
import { isEmail } from "../../lib/email"
import { subscribe } from "../../lib/messages"
import BrandButton from "../../ui/controls/BrandButton"
import Chip from "../../ui/controls/Chip"
import EmailField from "../../ui/controls/EmailField"
import Honeypot from "../../ui/controls/Honeypot"
import PanelHeader from "../../ui/display/PanelHeader"

/* "Get told first" -- the sign-up at the head of the Home tab, from the
   component reference in .files/tibbiex-components.html. Two steps: the
   address, then (optionally) what to hear about.

   It is the featured block, so it wears the amber lighting from featured.css
   while there is still something to do; the confirmation drops it, since a
   finished thing is not what the eye should be pulled to.

   The last step posts to api/subscribe.ts, which writes the address into the
   Resend audience and sends a confirmation. Until that lands the visitor is
   not on the list, so the button says what it is doing and a failure comes
   back as a toast with the address still in the field. */
export default function NewsletterSignup() {
  const [step, setStep] = useState<"email" | "topics" | "sent">("email")
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [topics, setTopics] = useState<string[]>([])
  const [joining, setJoining] = useState(false)
  const [trap, setTrap] = useState("")

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

  async function send() {
    setJoining(true)
    try {
      await subscribe(email, topics, trap)
      setStep("sent")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add you.")
      setJoining(false)
    }
  }

  if (step === "sent") {
    return (
      <section className="surface rounded-lg p-5" aria-live="polite">
        <PanelHeader
          icon={Check}
          title="You’re on the list"
          sub="Check your inbox — there’s a note confirming it."
        />
      </section>
    )
  }

  if (step === "topics") {
    return (
      <section className="surface featured rounded-lg p-5" aria-live="polite">
        <PanelHeader
          lit
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
        <BrandButton className="mt-4" onClick={send} disabled={joining}>
          <Mail className="h-4 w-4" />
          {joining
            ? "Adding you…"
            : topics.length
              ? "Join the list"
              : "Join the list — everything"}
        </BrandButton>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          One confirmation email, then about one a month.
        </p>
      </section>
    )
  }

  return (
    <section className="surface featured rounded-lg p-5">
      <PanelHeader
        lit
        icon={Mail}
        title={NEWSLETTER.title}
        sub={NEWSLETTER.blurb}
      />
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
        <Honeypot onChange={setTrap} />
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
