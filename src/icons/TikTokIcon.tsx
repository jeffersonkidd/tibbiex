/* lucide-react ships no TikTok glyph -- it froze its brand set at the
   seventeen it inherited from Feather -- so this is a hand-drawn one in the
   same idiom as the rest: 24x24 viewBox, currentColor stroke, 2px round-joined
   strokes and a `size` prop, so it drops into a row beside the lucide icons
   without reading as a different weight.

   TikTok's mark is a filled note; drawn as an outline at this weight the solid
   version turns to mush, so this is the note's silhouette instead -- the head,
   the stem, and the flag curling off the top -- which stays legible down to
   16px where a traced fill would not. */
export default function TikTokIcon({
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
      <circle cx="8.5" cy="16" r="4.5" />
      <path d="M13 16V3.5" />
      <path d="M13 3.5c.6 2.9 3 5.1 6 5.4" />
    </svg>
  )
}
