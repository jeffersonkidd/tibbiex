import type { Supporter } from "../../content/fund"

/* One line of the fund's Top Contributors feed. `rank` is the position in
   TOP_CONTRIBUTORS, not a field on the supporter. */
export default function SupporterRow({
  supporter,
  rank,
}: {
  supporter: Supporter
  rank: number
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container-highest/40 p-2 body-xs">
      <span className="label-mono w-4 shrink-0 text-on-surface-variant">
        {rank}
      </span>
      <p className="min-w-0 flex-1 truncate">
        <span className="body-xs-bold">{supporter.name}</span>
        <span className="ml-1.5 text-on-surface-variant">
          “{supporter.msg}”
        </span>
      </p>
      <span className="body-xs-bold shrink-0 text-tertiary">
        ${supporter.amount}
      </span>
    </div>
  )
}
