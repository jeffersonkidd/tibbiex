import { useState } from "react"
import { UserRound } from "lucide-react"

/* The round portrait with its lit halo, from the Figma "Avatar" component
   in Tibbie X - UI. Content-blind: the photo, its alt text and
   whether she is live all arrive as props.

   The white ring and the amber glow are in styles/treatments/avatar.css. The
   live dot is positioned here rather than there because it is markup, not
   treatment -- it needs a title for the hover tooltip. It sits 14px up and
   14px in from the avatar's box corner, on the ring, as Figma draws it.

   It is one component there, not a variant set: `live` is an optional prop
   rather than a kind of avatar, so Figma carries it as the boolean property
   `Live` on the same dot this renders. The set used to hold a second variant,
   a placeholder with an AVATAR wordmark, which nothing in the app ever needed
   -- PROFILE always carries a portrait.

   Without a `src` it draws a placeholder instead: a person glyph on the muted
   fill, inside the same ring and glow, so the card keeps its shape while
   there is no photo to show.

   With a `fallbackSrc`, a `src` that fails to load -- a 404, or anything that
   is not an image -- quietly becomes the fallback. The profile card uses it to
   ask for the studio's uploaded avatar first and keep the bundled portrait
   behind it. */
export default function Avatar({
  src,
  fallbackSrc,
  alt,
  live,
}: {
  /* The portrait, or nothing for the placeholder. */
  src?: string
  fallbackSrc?: string
  alt: string
  /* The label for the live dot, or null when she is not live. */
  live?: string | null
}) {
  const [failed, setFailed] = useState(false)
  const shown = failed ? fallbackSrc : src

  return (
    <div className="relative">
      {shown ? (
        <img
          src={shown}
          alt={alt}
          onError={() => setFailed(true)}
          className="avatar h-36 w-36 object-cover sm:h-40 sm:w-40"
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="avatar flex h-36 w-36 sm:h-40 sm:w-40"
        >
          <span className="flex flex-1 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <UserRound className="size-16 sm:size-18" aria-hidden />
          </span>
        </div>
      )}
      {live && (
        <span
          className="absolute bottom-3.5 right-3.5 h-4 w-4 rounded-full border border-foreground bg-live"
          title={live}
        />
      )}
    </div>
  )
}
