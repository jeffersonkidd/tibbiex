/* A field no visitor can see or tab into, named after something a bot filling
   a form blind will want to complete. Anything that arrives in it came from a
   script, and the endpoints treat such a request as a no-op that reports
   success -- told it failed, a bot tries again with the field empty.

   Off-screen rather than `display: none` or `hidden`: the simplest bots skip
   fields the browser would not render. */
export default function Honeypot({
  onChange,
}: {
  /* Forms that post a FormData read the field by name and need nothing here;
     the ones holding their own state pass a setter. */
  onChange?: (value: string) => void
}) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0">
      <label>
        Website
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
          onChange={(e) => onChange?.(e.target.value)}
        />
      </label>
    </div>
  )
}
