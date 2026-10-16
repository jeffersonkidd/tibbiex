import { useState } from "react"
import { Check, Copy } from "lucide-react"
import type { MouseEvent } from "react"

import { BASE_URL, TAG_PARTS, slug } from "../../lib/utm"
import type { Tag, TagPart } from "../../lib/utm"
import Button from "../../ui/controls/Button"

/* What each tag means, in the words the owner would use. Each line names the
   column it lands in, so the report and the link can be read side by side. */
const MEANING: Record<TagPart, string> = {
  source: "Which app sent them. Analytics files it under Source.",
  medium: "What kind of link it is: social, email or a referral.",
  campaign: "Where on the profile it sits. Analytics calls it the Campaign.",
}

/* The link as a ticket: the address printed in the mono face with each tag
   inked in its own colour, a legend that names every colour, and the copy
   button. Pointing at a tag in the address lights its legend line and the
   reverse, so the URL reads as three answers rather than one string.

   A copy re-keys the stamp, which lands "COPIED" across the ticket and lifts
   after a beat (studio.css). The address stays plain selectable text, so a
   long-press copy still works where the clipboard API does not. */
export default function LinkTicket({
  tag,
  url,
  copies,
  ready,
  onCopy,
}: {
  tag: Tag
  url: string
  /* How many times this ticket has been copied; each one stamps again. */
  copies: number
  ready: boolean
  onCopy: (e: MouseEvent<HTMLButtonElement>) => void
}) {
  const [lit, setLit] = useState<TagPart | null>(null)

  return (
    <div className="studio-ticket surface relative rounded-lg p-panel">
      <div className="flex items-center justify-between gap-part">
        <p className="label-mono text-on-surface-variant">Your link</p>
        <p className="label-mono text-on-surface-variant">{url.length} chars</p>
      </div>

      <p
        id="studio-link"
        className="studio-url mt-part break-all rounded-md border border-outline-variant bg-surface-container-lowest/80 p-card"
      >
        <span className="text-on-surface">{BASE_URL}</span>
        <span className="studio-url-joint">?</span>
        {TAG_PARTS.map((part, i) => (
          <span key={part}>
            {i > 0 && <span className="studio-url-joint">&amp;</span>}
            <span className="studio-url-joint">utm_{part}=</span>
            <span
              /* Re-keyed on value, so a new value inks in fresh. */
              key={tag[part]}
              data-part={part}
              data-lit={lit === part || undefined}
              onPointerEnter={() => setLit(part)}
              onPointerLeave={() => setLit(null)}
              className="studio-url-value"
            >
              {slug(tag[part]) || "…"}
            </span>
          </span>
        ))}
      </p>

      <ul className="mt-part space-y-1.5">
        {TAG_PARTS.map((part) => (
          <li
            key={part}
            data-part={part}
            data-lit={lit === part || undefined}
            onPointerEnter={() => setLit(part)}
            onPointerLeave={() => setLit(null)}
            className="studio-legend flex items-baseline gap-cluster rounded-md px-2 py-1"
          >
            <span aria-hidden className="studio-legend-dot" />
            <span className="label-mono w-20 shrink-0">{part}</span>
            <span className="body-xs text-on-surface-variant">
              {MEANING[part]}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-panel">
        <Button
          icon={copies > 0 ? Check : Copy}
          onClick={onCopy}
          disabled={!ready}
        >
          {copies > 0 ? "Copied. Copy again" : "Copy link"}
          <kbd className="studio-kbd ml-1 hidden sm:inline">C</kbd>
        </Button>
      </div>

      {copies > 0 && (
        <span key={copies} aria-hidden className="studio-stamp">
          Copied
        </span>
      )}
      <p aria-live="polite" className="sr-only">
        {/* The count makes a second copy a new message, so it is read again. */}
        {copies > 0 ? `Link copied to the clipboard (${copies}).` : ""}
      </p>
    </div>
  )
}
