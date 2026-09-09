/* lucide-react ships no Venmo glyph, so this is a hand-drawn one in the same
   idiom as the rest of the set: 24x24 viewBox, currentColor stroke, 2px
   round-joined strokes and a `size` prop, so it drops into the SOCIALS row
   beside the lucide icons without reading as a different weight. The shape is
   Venmo's app tile -- a rounded square around the angled V, its right arm
   curved the way the mark's is. */
export default function VenmoIcon({
  size = 24,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="4.5" />
      <path d="M8.3 7.9l3.3 8.4c2.4-2.6 3.9-5.7 4.1-8.4" />
    </svg>
  )
}
