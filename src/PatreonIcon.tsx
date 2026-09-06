/* lucide-react ships no Patreon glyph -- it froze its brand set at the
   seventeen it inherited from Feather -- so this is a hand-drawn one in the
   same idiom as the rest: 24x24 viewBox, currentColor stroke, 2px round-joined
   strokes and a `size` prop, so it drops into a row beside the lucide icons
   without reading as a different weight. The shape is Patreon's current mark:
   the full-height bar and the circle sitting high beside it. */
export default function PatreonIcon({
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
      <line x1="4" y1="3" x2="4" y2="21" />
      <circle cx="14.5" cy="9.5" r="5.5" />
    </svg>
  )
}
