import type { Supporter } from "../data"

/* One line of the tip jar's Top Contributors feed. `rank` is the position in
   TOP_CONTRIBUTORS, not a field on the supporter. */
export default function SupporterRow({
  supporter,
  rank,
}: {
  supporter: Supporter
  rank: number
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 p-2 text-xs">
      <span className="mono-label w-4 shrink-0 text-muted-foreground">
        {rank}
      </span>
      <p className="min-w-0 flex-1 truncate">
        <span className="font-bold">{supporter.name}</span>
        <span className="ml-1.5 text-muted-foreground">“{supporter.msg}”</span>
      </p>
      <span className="shrink-0 font-bold text-accent-strong">
        ${supporter.amount}
      </span>
    </div>
  )
}
