import { castMagicFrom } from "../../lib/magic-dust"

/* A way into one shelf of the shop: its picture, which carries the shelf's
   name lettered on it, as a button. Lifts on hover like a print picked up,
   and throws sparks when pressed. The name arrives as `label` too, for the
   screen reader, since the lettering is part of the image. `width` and
   `height` are the picture's own, so the button keeps its shape while it
   loads.

   Nothing is drawn round the picture -- no border, fill or clipping -- so
   a torn edge or a strip of tape that runs past the paper stays whole; the
   shadow and the hover glow follow the picture's own outline. */
export default function ShelfTile({
  image,
  label,
  width,
  height,
  onOpen,
}: {
  image: string
  label: string
  width: number
  height: number
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        castMagicFrom(e)
        onOpen()
      }}
      className="group block w-full rounded-lg transition-transform duration-300 hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary"
    >
      <img
        src={image}
        alt={label}
        width={width}
        height={height}
        decoding="async"
        className="h-auto w-full drop-shadow-[0_12px_12px_var(--color-shadow)] transition-[filter] duration-300 group-hover:drop-shadow-[0_0_10px_var(--color-tertiary)] group-focus-visible:drop-shadow-[0_0_10px_var(--color-tertiary)]"
      />
    </button>
  )
}
