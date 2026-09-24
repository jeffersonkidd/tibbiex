import { Check } from "lucide-react"

/* One priced tier in a row of them: an eyebrow, a name, an amount and what it
   includes. The whole card is the button that picks it -- the same toggle Chip
   is at a smaller size -- so whatever sits below the row, a CTA or a summary
   line, reads the choice from the same state.

   Everything here is a prop, so the card is not the reading menu's: any row of
   priced choices can wear it. It does keep amber wherever it goes, because the
   accent is what tells a row of choices apart from the red CTA that acts on
   them. `index` staggers the deal-in animation so a grid lands card after card
   rather than all at once. */
export default function PriceCard({
  name,
  amount,
  eyebrow,
  unit,
  blurb,
  includes,
  flag,
  index = 0,
  pressed,
  onClick,
  label,
}: {
  name: string
  amount: string
  eyebrow?: string
  unit?: string
  blurb?: string
  includes?: string[]
  flag?: string
  index?: number
  pressed: boolean
  onClick: (e: React.MouseEvent<HTMLElement>) => void
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      data-state={pressed ? "on" : "off"}
      style={{ "--deal": index } as React.CSSProperties}
      aria-label={label ?? [name, eyebrow, amount].filter(Boolean).join(", ")}
      className="price-card"
    >
      <div className="price-frame" />
      {flag && <span className="price-flag">{flag}</span>}
      {eyebrow && <span className="label-mono price-eyebrow">{eyebrow}</span>}
      <span className="price-name">{name}</span>
      <span className="price-amount">
        {amount}
        {unit && <span className="price-unit">{unit}</span>}
      </span>
      {blurb && <p className="price-blurb">{blurb}</p>}
      {includes && includes.length > 0 && (
        <ul className="price-includes">
          {includes.map((line) => (
            <li key={line}>
              <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
              {line}
            </li>
          ))}
        </ul>
      )}
    </button>
  )
}
