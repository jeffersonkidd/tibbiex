import VenmoIcon from "../../assets/icons/VenmoIcon"

/* The second way out of a paying panel, under its button. Venmo is a quiet
   link rather than half a toggle: the card rail is the one that returns the
   payer to the site, mails a receipt and can collect an address, so it owns
   the form and Venmo sits beside it for whoever prefers it.

   It is a <button>, not an <a>: the panel builds the pay URL from the amount
   and note it holds. The handle arrives as a prop -- this control knows
   nothing about whose Venmo it is. */
export default function VenmoLink({
  handle,
  onClick,
}: {
  handle: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-auto flex items-center gap-glyph body-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
    >
      <VenmoIcon size={12} />
      or pay @{handle} on Venmo
    </button>
  )
}
