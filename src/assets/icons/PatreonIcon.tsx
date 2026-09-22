/* lucide-react ships no Patreon glyph -- it froze its brand set at the
   seventeen it inherited from Feather -- so this is a hand-drawn one in the
   same idiom as the rest: 24x24 viewBox, currentColor stroke, 2px round-joined
   strokes and a `size` prop, so it drops into a row beside the lucide icons
   without reading as a different weight. The shape is one closed path that
   loops back on itself into a rough P -- the bar and the circle of Patreon's
   mark drawn in a single unbroken line rather than as two separate pieces. */
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
      <path d="M13.48 13.56C17.19 12.25 19.79 12.5 20.85 9.31C21.9 4.53 17.44 3.8 11.59 4.04C3.92 4.07 2.96 7.94 4.81 11.85C6.66 15.75 5.42 19.66 8.51 20.96C13.44 21.61 10.32 14.67 13.48 13.56Z" />
    </svg>
  )
}
