import { RAILS } from "../../content/payments"
import type { Rail } from "../../content/payments"

/* Which rail the money travels on -- Venmo or card. Outlined rather than brand
   red: inside a paying panel the only red belongs to the submit button, so the
   selected rail reads as a lighter outline instead. Every panel that takes
   money uses this one control, so "selected" looks the same everywhere. */
export default function RailToggle({
  rail,
  onChange,
}: {
  rail: Rail
  onChange: (rail: Rail) => void
}) {
  return (
    <div
      role="group"
      aria-label="Pay with"
      className="flex gap-2 rounded-md border border-border bg-input-background p-1"
    >
      {RAILS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-pressed={rail === id}
          onClick={() => onChange(id)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-sm border py-2 text-xs font-bold transition-all ${
            rail === id
              ? "brand-pop border-foreground/40 bg-muted text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon size={14} /> {label}
        </button>
      ))}
    </div>
  )
}
