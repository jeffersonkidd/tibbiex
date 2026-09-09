// The shared input treatment. The booking form uses it uncontrolled and
// required; the tip jar passes value/onChange and opts out of required, so
// both forms keep the same border, fill and focus colour.
export default function Field({
  placeholder,
  type,
  value,
  onChange,
  required = true,
  min,
  step,
  inputMode,
  className = "",
}: {
  placeholder: string
  type: string
  value?: string
  onChange?: (value: string) => void
  required?: boolean
  min?: string
  step?: string
  inputMode?: "decimal" | "text"
  className?: string
}) {
  return (
    <input
      required={required}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      min={min}
      step={step}
      inputMode={inputMode}
      className={`w-full rounded-md border border-border bg-input-background px-4 py-3 text-base text-foreground outline-none sm:text-sm transition-colors placeholder:text-muted-foreground focus:border-accent ${className}`}
    />
  )
}
