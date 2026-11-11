import { useState } from "react"
import type { ReactNode } from "react"
import { Check, Mail } from "lucide-react"
import { toast } from "sonner"

import { NEWSLETTER } from "../../content/newsletter"
import { isEmail } from "../../lib/email"
import { subscribe } from "../../lib/messages"
import Button from "../../ui/controls/Button"
import Chip from "../../ui/controls/Chip"
import EmailField from "../../ui/controls/EmailField"
import Honeypot from "../../ui/controls/Honeypot"
import PanelHeader from "../../ui/display/PanelHeader"
import Overlay from "../../ui/overlays/Overlay"

/* "Join my Newsletter" -- once a panel at the head of the Home tab, now a
   modal: App opens it the first time a visitor taps a link row or a shop
   banner (lib/newsletter-prompt.ts), and carries on to what they tapped
   when it closes. Two steps: the address, then (optionally) what to hear
   about. The header keeps the featured amber while there is something to
   do; the confirmation drops it.

   The last step posts to api/subscribe.ts, which writes the address into the
   Resend audience and sends a confirmation. Until that lands the visitor is
   not on the list, so the button says what it is doing and a failure comes
   back as a toast with the address still in the field. */
export default function NewsletterModal({ onClose }: { onClose: () => void }) {
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
      <Shell onClose={onClose}>
        <PanelHeader
          icon={Check}
          title="You’re on the list"
          sub="Check your inbox — there’s a note confirming it."
        />
        <Button className="mt-4" tone="secondary" onClick={onClose}>
          Carry on
        </Button>
      </Shell>
    )
  }

  if (step === "topics") {
    return (
      <Shell onClose={onClose}>
        <PanelHeader
          lit
          spark={NEWSLETTER.spark}
          icon={Mail}
          title="What do you want to hear about?"
          sub={`Signing up ${email.trim()}. Optional — change it any time.`}
        />
        <div
          role="group"
          aria-label="Topics"
          className="mt-4 grid grid-cols-2 gap-cluster"
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
        <Button className="mt-4" icon={Mail} onClick={send} disabled={joining}>
          {joining
            ? "Adding you…"
            : topics.length
              ? "Join the list"
              : "Join the list — everything"}
        </Button>
        <p className="body-xs mt-2 text-center text-on-surface-variant">
          One confirmation email, then about one a month.
        </p>
      </Shell>
    )
  }

  return (
    <Shell onClose={onClose}>
      <PanelHeader
        lit
        spark={NEWSLETTER.spark}
        icon={Mail}
        title={NEWSLETTER.title}
        sub={NEWSLETTER.blurb}
      />
      <form
        onSubmit={join}
        noValidate
        className="mt-4 flex items-start gap-cluster"
      >
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
        {/* A block button is full width, so it gets a sized wrapper rather
            than a competing width utility. */}
        <div className="w-20 shrink-0">
          <Button type="submit">Join</Button>
        </div>
      </form>
      {/* Quieter than the blurb above it: fine print, not a claim. */}
      {NEWSLETTER.cadence.enabled && (
        <p className="body-xs mt-2 text-on-surface-variant/60">
          {NEWSLETTER.cadence.text}
        </p>
      )}
      <button
        type="button"
        onClick={onClose}
        className="body-small mt-4 w-full text-center text-on-surface-variant underline-offset-4 hover:text-on-surface hover:underline"
      >
        Not now
      </button>
    </Shell>
  )
}

/* Every step sits in the same modal, and says when it changes. */
function Shell({
  onClose,
  children,
}: {
  onClose: () => void
  children: ReactNode
}) {
  return (
    <Overlay onClose={onClose}>
      <section className="p-modal [&>:first-child]:pr-10" aria-live="polite">
        {children}
      </section>
    </Overlay>
  )
}
