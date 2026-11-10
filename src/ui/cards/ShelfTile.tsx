import { castMagicFrom } from "../../lib/magic-dust"

/* A way into one shelf of the shop: its picture, which carries the shelf's
   name lettered on it, as a button. Lifts on hover like a print picked up,
   and throws sparks when pressed. The name arrives as `label` too, for the
   screen reader, since the lettering is part of the image. `width` and
   `height` are the picture's own, so the button keeps its shape while it
   loads: the shelves are square, the bands' strips 3:1. */
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
      className="group block w-full overflow-hidden rounded-lg border border-outline-variant shadow-[0_14px_24px_-12px_var(--color-shadow)] transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-tertiary focus-visible:-translate-y-1 focus-visible:border-tertiary"
    >
      <img
        src={image}
        alt={label}
        width={width}
        height={height}
        decoding="async"
        className="h-auto w-full"
      />
    </button>
  )
}
