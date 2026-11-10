import type { CSSProperties, MouseEvent } from "react"

import type { LinkEntry, PrintHold } from "../../content/links"
import { castMagicFrom } from "../../lib/magic-dust"

/* One Home-tab row, drawn as a taped-up instant print. The look, both
   layouts and the hover are in styles/treatments/link-row.css; a row sits
   in a `.link-rows` run, which spaces the cards so each cutout has room to
   climb out of its photo.

   A row with `onOpen` opens something in this view and renders as a
   <button>; without it the row is an <a> to `href`. Both throw sparks from
   the pointer. A row with no `print` yet shows its icon in an empty window. */
export default function LinkRow({
  link,
  onOpen,
}: {
  link: LinkEntry
  onOpen?: () => void
}) {
  const { icon: Icon, title, meta, eyebrow, blurb, print, href } = link

  const knobs = print && {
    "--tilt": `${print.tilt}deg`,
    "--tilt-m": `${print.tiltPhone}deg`,
    "--lean": `${print.lean}deg`,
    ...(print.rise && {
      "--rise-d": print.rise[0],
      "--rise-m": print.rise[1],
    }),
  }

  const face = (
    <>
      <div className="link-print">
        <div className="link-window">
          {print ? (
            <div className="link-figure">
              <img src={print.src} alt="" loading="lazy" decoding="async" />
            </div>
          ) : (
            <Icon className="link-glyph" aria-hidden />
          )}
          {print && <span className="dymo">{print.label}</span>}
          {print?.price && (
            <span className="link-burst" aria-hidden>
              <span>
                <small>{print.price.lead}</small>
                <b>{print.price.amount}</b>
              </span>
            </span>
          )}
        </div>
        <div className="link-strip">
          <span className="scrawl">{print?.caption ?? title}</span>
        </div>
        <Hold kind={print?.hold ?? "tape"} />
      </div>

      <div className="link-text">
        {eyebrow && <div className="link-eyebrow label-mono">{eyebrow}</div>}
        <p className="link-title">{title}</p>
        <div className="link-meta label-mono">
          {meta}
          {print?.price && (
            <span className="sr-only">
              , {print.price.lead} {print.price.amount}
            </span>
          )}
        </div>
        {blurb && <p className="link-blurb body-base">{blurb}</p>}
      </div>

      {/* The hand-drawn arrow. */}
      <svg
        className="link-go"
        viewBox="0 0 30 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M2 12.5c6-1.6 13-1 24-1.8" />
        <path d="M19 4.5c2.6 2 4.7 4 7.4 6.3-2.6 2-5 4.2-7.6 6.6" />
      </svg>
    </>
  )

  const style = knobs as CSSProperties | undefined

  if (!onOpen) {
    return (
      <a href={href} onClick={castMagicFrom} className="link-row" style={style}>
        {face}
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        castMagicFrom(e)
        onOpen()
      }}
      className="link-row"
      style={style}
    >
      {face}
    </button>
  )
}

/* What holds the print to the page. */
function Hold({ kind }: { kind: PrintHold }) {
  if (kind === "pin") {
    return (
      <svg className="link-pin" viewBox="0 0 80 22" fill="none" aria-hidden>
        <g stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
          <circle cx="9" cy="11" r="5.2" />
          <path d="M13.5 8.2 L62 6" />
          <path d="M13.8 14 L66 10.2" />
        </g>
        <path
          className="link-pin-clasp"
          d="M58 3.2h11.5a4.2 4.2 0 0 1 4.2 4.2v.6a4.2 4.2 0 0 1-4.2 4.2H58z"
          strokeWidth="1"
        />
      </svg>
    )
  }
  if (kind === "staples") {
    return (
      <>
        <span className="link-staple" data-at="a" />
        <span className="link-staple" data-at="b" />
      </>
    )
  }
  const [first, second] = kind === "tape" ? ["tl", "br"] : ["tr", "bl"]
  return (
    <>
      <span className="link-tape" data-at={first} />
      <span className="link-tape" data-at={second} />
    </>
  )
}
