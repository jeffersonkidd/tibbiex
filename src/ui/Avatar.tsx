/* The round portrait with its lit halo, from the Figma "Avatar" set
   (Tibbie X - DSP, 4307:25132). Content-blind: the photo, its alt text and
   whether she is live all arrive as props.

   The halo is four coloured shadows and a dark inset, in styles/treatments/
   avatar.css. The live dot is positioned here rather than there because it is
   markup, not treatment -- it needs a title for the hover tooltip.

   Figma's set has a second variant, Property 1=Default, a placeholder with an
   AVATAR wordmark for mocking a card with no photo. Nothing in the app needs
   it: PROFILE always carries a portrait. */
export default function Avatar({
  src,
  alt,
  live,
}: {
  src: string
  alt: string
  /* The label for the live dot, or null when she is not live. */
  live?: string | null
}) {
  return (
    <div className="relative">
      <img
        src={src}
        alt={alt}
        className="avatar h-36 w-36 object-cover sm:h-40 sm:w-40"
      />
      {live && (
        <span
          className="absolute bottom-2 right-6 h-4 w-4 rounded-full border border-foreground/80 bg-live sm:right-7"
          title={live}
        />
      )}
    </div>
  )
}
