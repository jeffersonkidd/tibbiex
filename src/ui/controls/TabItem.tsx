/* One segment of the main tab strip, mirroring the Figma "Tab Item" set.
   Active wears M3's secondary-container, the same fill as the secondary
   buttons, so the selected tab reads as chosen without competing with the
   primary CTA. Inactive is quiet until hovered.

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
          ? "brand-pop bg-secondary-container text-on-secondary-container"
          : "text-on-surface-variant hover:bg-surface-container-highest/50 hover:text-on-surface"
      }`}
    >
      {label}
    </button>
  )
}
