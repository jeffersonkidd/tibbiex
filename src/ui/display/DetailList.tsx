/* Label-and-value lines: a portfolio section's highlights, a product's
   "What you get". The label is the mono caption, the value reads as the
   fact. The hairline over it is the call site's Separator, not this. */
export default function DetailList({
  items,
}: {
  items: { label: string; detail: string }[]
}) {
  return (
    <dl className="space-y-cluster">
      {items.map(({ label, detail }) => (
        <div key={label} className="flex items-baseline justify-between gap-4">
          <dt className="label-mono shrink-0 text-muted-foreground">{label}</dt>
          <dd className="body-small text-right">{detail}</dd>
        </div>
      ))}
    </dl>
  )
}
