import type { Ref } from "react"

import { VISIBLE_TABS } from "../content/tabs"
import type { Tab } from "../content/tabs"

import TabItem from "../ui/controls/TabItem"

/* The tab strip under the profile card. App owns which tab is active and
   holds the ref, so a cross-tab hand-off can scroll the strip back into view. */
export default function TabStrip({
  active,
  onSelect,
  ref,
}: {
  active: Tab
  onSelect: (tab: Tab) => void
  ref?: Ref<HTMLElement>
}) {
  return (
    <nav
      ref={ref}
      className="surface hide-scrollbar flex scroll-mt-4 gap-cluster overflow-x-auto rounded-lg bg-card/50 p-strip"
    >
      {VISIBLE_TABS.map(({ label }) => (
        <TabItem
          key={label}
          label={label}
          active={active === label}
          onSelect={() => onSelect(label)}
        />
      ))}
    </nav>
  )
}
