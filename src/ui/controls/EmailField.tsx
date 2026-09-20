import { useId } from "react"

import Field from "./Field"

/* An email input with its error underneath. The error is announced and tied
   to the input, and it clears as soon as the visitor types again -- the
   caller owns both the value and the error, so it decides when to check. */
export default function EmailField({
  value,
  onChange,
  error,
  label = "Email",
  size = "md",
}: {
  value: string
  onChange: (value: string) => void
  error: string | null
  label?: string
  size?: "md" | "sm"
}) {
  const errorId = useId()

  return (
    <div>
      <Field
        type="email"
        placeholder="name@email.com"
        label={label}
        value={value}
        onChange={onChange}
        required={false}
        inputMode="email"
        autoComplete="email"
        invalid={Boolean(error)}
        describedBy={error ? errorId : undefined}
        size={size}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-primary">
          {error}
        </p>
      )}
    </div>
  )
}
