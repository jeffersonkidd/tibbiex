// Flip `enabled` to hide a tab from the strip. The Tab union still includes
// every label, so the tab's data and its panel below stay compiled and
// typechecked while it is off — turning it back on is a one-word change.
export const TABS = [
  { label: "Home", enabled: true },
  { label: "Music", enabled: true },
  { label: "Portfolio", enabled: true },
  { label: "Tour", enabled: true },
  { label: "Buy", enabled: true },
] as const

export type Tab = (typeof TABS)[number]["label"]

export const VISIBLE_TABS = TABS.filter((tab) => tab.enabled)
