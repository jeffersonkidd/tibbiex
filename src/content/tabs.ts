// Flip `enabled` to hide a tab from the strip. The Tab union still includes
// every label, so the tab's data and its panel below stay compiled and
// typechecked while it is off — turning it back on is a one-word change.
export const TABS = [
  { label: "Home", enabled: true },
  { label: "Music", enabled: false },
  { label: "Portfolio", enabled: false },
  { label: "Tour", enabled: false },
  { label: "Buy", enabled: true },
] as const

export type Tab = (typeof TABS)[number]["label"]

export const VISIBLE_TABS = TABS.filter((tab) => tab.enabled)

/* For anything outside the strip that leads into a tab -- a cross-link, a
   checklist entry -- so it goes dark with the tab instead of pointing at
   nothing. Typed on Tab, so renaming a label breaks the call, not the link. */
export function isTabEnabled(label: Tab) {
  return TABS.some((tab) => tab.label === label && tab.enabled)
}
