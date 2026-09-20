import type { ComponentType, ReactNode } from "react"

/* The two small labels in the Figma library. `role` is the Role Pill: an
   amber credit -- what someone plays, on the profile and on a portfolio
   section. `tag` is the Tag Pill: muted context, not a credit. */
const PILL_VARIANTS = {
  role: "bg-accent-tint px-2.5 py-1 text-accent-strong",
  tag: "bg-muted px-3 py-1.5 text-muted-foreground",
}

export default function Pill({
  icon: Icon,
  children,
  variant,
}: {
  icon?: ComponentType<{ size?: number; "aria-hidden"?: boolean }>
  children: ReactNode
  variant: keyof typeof PILL_VARIANTS
}) {
  return (
    <span
      className={`mono-label inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border ${PILL_VARIANTS[variant]}`}
    >
      {Icon && <Icon size={12} aria-hidden />}
      {children}
    </span>
  )
}
