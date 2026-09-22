/* The hairline between two parts of a panel: the highlights under a
   portfolio blurb, the contributor list under the fund form, the photo grid,
   the social keys under the wordmark. It was `border-t border-border` typed
   out at each of those, which meant the rule's colour lived in six places.

   `space` is the air it opens on both sides, and it defaults to none: inside
   a flex or grid stack the container's `gap` already spaces it, and a margin
   on top of that would double the gap. Reach for a step only in normal flow,
   where the rule has to open its own room.

   `w-full` is hardcoded because an `hr` is a zero-width flex item under
   `items-start` -- do not pass a width alongside it. */

const SEPARATOR_SPACE = {
  none: "",
  sm: "my-4",
  md: "my-5",
  lg: "my-6",
}

export default function Separator({
  space = "none",
}: {
  space?: keyof typeof SEPARATOR_SPACE
}) {
  return <hr className={`w-full border-border ${SEPARATOR_SPACE[space]}`} />
}
