/* The go-live checklist, derived from the data rather than kept by hand.

   Every placeholder in src/content/ carries `staged: true` (see the note there).
   This module is the one place that reads those flags back: it walks the
   content and lists what is still a stand-in, so the checklist cannot drift
   from the data the way a hand-maintained TODO would. `warnStagedContent` prints
   it once in the dev console; nothing here renders, so production is untouched.

   When a section is confirmed, drop its `staged` flag at the source and it
   falls off this list automatically. When the list is empty, the site is
   telling the truth end to end. */
import { FUND, SUPPORTERS } from "./fund"
import { LINKS } from "./links"
import { DISCOGRAPHY } from "./music"
import { PORTFOLIO } from "./portfolio"
import { PROFILE } from "./profile"

export type StagedEntry = {
  /* Where it lives, so the checklist reads as a place to go fix it. */
  area: string
  /* Which item, in the words the visitor would see. */
  label: string
}

export function collectStaged(): StagedEntry[] {
  const entries: StagedEntry[] = []

  for (const album of DISCOGRAPHY) {
    if (album.staged) {
      entries.push({
        area: "Discography",
        label: `${album.band} — ${album.album}`,
      })
    }
  }

  for (const section of PORTFOLIO) {
    for (const photo of section.photos) {
      if (photo.staged) {
        entries.push({ area: `Portfolio · ${section.band}`, label: photo.alt })
      }
    }
  }

  for (const link of LINKS) {
    if ("staged" in link && link.staged) {
      entries.push({ area: "Links", label: link.title })
    }
  }

  for (const supporter of SUPPORTERS) {
    if (supporter.staged) {
      entries.push({ area: "Supporters", label: supporter.name })
    }
  }

  if (PROFILE.live?.staged) {
    entries.push({
      area: "Profile",
      label: `"${PROFILE.live.label}" badge — nothing checks she is live`,
    })
  }

  if (FUND.staged) {
    entries.push({
      area: "Fund",
      label: `Goal, total and backers ($${FUND.raised} of $${FUND.goal})`,
    })
  }

  return entries
}

/* Shop items are placeholder too, but the whole catalogue is stand-in and
   already announced as such at its definition, so it is summarised as one line
   rather than eight. Imported lazily inside the warning to keep this module's
   top-level imports to the sets it walks item by item. */
export function warnStagedContent() {
  if (!import.meta.env.DEV) return

  const staged = collectStaged()
  if (staged.length === 0) return

  const byArea = staged.reduce<Record<string, string[]>>((groups, entry) => {
    ;(groups[entry.area] ??= []).push(entry.label)
    return groups
  }, {})

  console.groupCollapsed(
    `%c[content-status]%c ${staged.length} placeholder item(s) are shown as real — confirm before go-live`,
    "font-weight:bold;color:#FF5433",
    "color:inherit",
  )
  for (const [area, labels] of Object.entries(byArea)) {
    console.info(`${area}:`)
    for (const label of labels) console.info(`  • ${label}`)
  }
  console.info(
    "The Buy catalogue is placeholder end to end (stock art, provisional prices).",
  )
  console.groupEnd()
}
