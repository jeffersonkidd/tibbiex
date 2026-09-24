/* One segment of the main tab strip, mirroring the Figma "Tab Item" set.
   Active borrows .brand-surface from the CTA, so the selected tab and the
   buttons read as the same kind of thing -- the only place besides a CTA
   where brand red appears. Inactive is quiet until hovered.

   min-w keeps a short label from collapsing while flex-1 shares the rest of
   the strip out evenly, which is what lets five tabs sit on a phone without
   the strip scrolling. */
export default function TabItem({
  label,
  active,
  onSelect,
}: {
  label: string
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={onSelect}
      className={`min-w-[80px] flex-1 rounded-md py-2.5 body-small-bold transition-all ${
        active
          ? "brand-surface brand-pop bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  )
}
