/* Bluesky's butterfly, outlined in the TikTokIcon idiom (24x24, currentColor
   stroke, 2px round joins) since lucide has no Bluesky glyph. Two upper wings
   meeting at the body, two smaller lower ones -- the silhouette, not a trace,
   so it holds up at 16px. */
export default function BlueskyIcon({
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
      <path d="M12 11C10 7 6 4 3.5 4.5 2 5 2.5 9 3.5 11c1 2 3.5 2.5 5.5 2" />
      <path d="M12 11c2-4 6-7 8.5-6.5 1.5.5 1 4.5 0 6.5-1 2-3.5 2.5-5.5 2" />
      <path d="M9 13c-2.5 1-3.5 3.5-2 5s3.5.5 5-3.5c1.5 4 3.5 5 5 3.5s.5-4-2-5" />
    </svg>
  )
}
