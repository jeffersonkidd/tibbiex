/* The amber progress bar: the crawling hatch over a hot ramp, from
   styles/treatments/meter.css. The rehearsal panel measures a set with it and
   the fund measures money, so it takes a percentage and a name for screen
   readers and knows nothing else. Height is fixed here; place it with a
   wrapper, not a className.

   `preview` is a second, pale bar under the fill: where the value would be
   after something not yet done -- the fund shows where the chosen amount
   would take it. */
const clamp = (n: number) => Math.max(0, Math.min(100, n))

export default function Meter({
  value,
  label,
  preview,
}: {
  value: number
  label: string
  preview?: number
}) {
  const percent = clamp(Math.round(value))

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="meter-track h-2.5"
    >
      {preview !== undefined && (
        <div className="meter-ghost" style={{ width: `${clamp(preview)}%` }} />
      )}
      <div className="meter-fill" style={{ width: `${percent}%` }} />
    </div>
  )
}
