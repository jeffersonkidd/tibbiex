/* The amber progress bar: the crawling hatch over a hot ramp, from
   styles/treatments/meter.css. The rehearsal panel measures a set with it and
   the fund measures money, so it takes a percentage and a name for screen
   readers and knows nothing else. Height is fixed here; place it with a
   wrapper, not a className. */
export default function Meter({ value, label }: { value: number; label: string }) {
  const percent = Math.max(0, Math.min(100, Math.round(value)))

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="meter-track h-2.5"
    >
      <div className="meter-fill" style={{ width: `${percent}%` }} />
    </div>
  )
}
