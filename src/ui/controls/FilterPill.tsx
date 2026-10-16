export default function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 whitespace-nowrap rounded-md px-3 py-2 body-small-bold transition-all ${
        active
          ? "brand-pop bg-secondary-container text-on-secondary-container"
          : "text-on-surface-variant hover:bg-surface-container-highest/50 hover:text-on-surface"
      }`}
    >
      {label}
    </button>
  )
}
