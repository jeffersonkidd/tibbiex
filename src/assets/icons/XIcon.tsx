/* lucide-react ships only the old bird for X, so this is the letter drawn in
   the same idiom as TikTokIcon: 24x24, currentColor stroke, 2px round joins.
   The real mark is a filled X with one heavy leg; at this weight two strokes
   with the heavy leg doubled read the same and sit level with lucide. */
export default function XIcon({
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
      <path d="M4 4l11.5 16H20L8.5 4z" />
      <path d="M20 4l-6.6 7.4M4 20l6.6-7.4" />
    </svg>
  )
}
