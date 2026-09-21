import { FIELD_SIZES, FIELD_TREATMENT } from "./Field"

/* The multi-line field, mirroring the Figma "Textarea" set. It wears Field's
   treatment rather than its own copy of it -- the border, fill and focus
   colour are the same declaration, so changing the inputs changes this too.

   resize-none: the booking overlay sizes itself around the form, and a field
   the visitor can drag would push the send button off a short screen. Height
   is `rows`, not a class, for the same reason Field's padding is a `size`. */
export default function TextArea({
  placeholder,
  name,
  label,
  rows = 4,
  required = true,
  size = "md",
}: {
  placeholder: string
  name?: string
  /* Accessible name when the placeholder is the only visible label. */
  label?: string
  rows?: number
  required?: boolean
  size?: keyof typeof FIELD_SIZES
}) {
  return (
    <textarea
      required={required}
      rows={rows}
      name={name}
      placeholder={placeholder}
      aria-label={label}
      className={`${FIELD_TREATMENT} resize-none border-border ${FIELD_SIZES[size]}`}
    />
  )
}
