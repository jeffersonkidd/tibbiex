/* The Reagan Youth mark on the rehearsal panel, set in the zine display face
   rather than pulled from an image. The band's own logo is hand-drawn artwork
   nobody has published under a licence this repo could use, and hotlinking a
   merch shop's copy would break the first time they reorganise their assets.
   Drop the real file in src/graphics/marks/ and swap the two spans for an <img> if you
   have a copy you are entitled to use. */
export default function ReaganYouthMark() {
  return (
    <div
      aria-label="Reagan Youth"
      className="ry-mark grid shrink-0 place-items-center rounded-md border border-border bg-muted/60 px-2 py-1.5 text-center leading-none"
    >
      <span className="ry-mark-top">REAGAN</span>
      <span className="ry-mark-bottom">YOUTH</span>
    </div>
  )
}