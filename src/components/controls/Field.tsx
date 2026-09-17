// The shared input treatment. The booking form uses it uncontrolled and
// required, reading the values back by `name` through FormData; the fund and
// shop panels pass value/onChange and opt out of required, so every form keeps
// the same border, fill and focus colour. Padding is a `size`, not a className:
// a second padding utility on the element would let the stylesheet's order,
// not the markup, decide which one wins.
const FIELD_SIZES = {
  md: "px-4 py-3",
  sm: "px-3 py-2.5",
}

export default function Field({
  placeholder,
  type,
  name,
  value,
  onChange,
  required = true,
  min,
  step,
  inputMode,
  autoComplete,
  invalid = false,
  describedBy,
  label,
  size = "md",
}: {
  placeholder: string
  type: string
  name?: string
  value?: string
  onChange?: (value: string) => void
  required?: boolean
  min?: string
  step?: string
  inputMode?: "decimal" | "text" | "email"
  autoComplete?: string
  invalid?: boolean
  describedBy?: string
  /* Accessible name when the placeholder is the only visible label. */
  label?: string
  size?: keyof typeof FIELD_SIZES
}) {
  return (
    <input
      required={required}
      type={type}
      name={name}
      placeholder={placeholder}
      aria-label={label}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      min={min}
      step={step}
      inputMode={inputMode}
      autoComplete={autoComplete}
      className={`w-full rounded-md border bg-input-background text-base text-foreground outline-none sm:text-sm transition-colors placeholder:text-muted-foreground focus:border-accent ${
        invalid ? "border-brand" : "border-border"
      } ${FIELD_SIZES[size]}`}
    />
  )
}
