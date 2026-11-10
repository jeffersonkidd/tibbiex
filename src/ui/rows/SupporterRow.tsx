import type { Supporter } from "../../content/fund"

/* One line of the fund's Top Contributors feed, written on a strip of tape
   (.tape-strip in treatments/polaroid.css, which also lays a run of them
   at their angles). `rank` is the position in TOP_CONTRIBUTORS, not a field
   on the supporter. On a phone the message wraps under the name; from md
   up it is one line, cut short if it has to be. */
export default function SupporterRow({
  supporter,
  rank,
}: {
  supporter: Supporter
  rank: number
}) {
  return (
    <div className="tape-strip flex-wrap gap-y-0 body-small md:flex-nowrap">
      <span className="heading-s">{rank}</span>
      <span className="body-small-bold whitespace-nowrap">
        {supporter.name}
      </span>
      <span className="order-3 basis-full text-inverse-on-surface/80 md:order-none md:min-w-0 md:flex-1 md:basis-auto md:truncate">
        “{supporter.msg}”
      </span>
      <span className="body-small-bold ml-auto text-tertiary tabular-nums md:ml-0">
        ${supporter.amount}
      </span>
    </div>
  )
}
