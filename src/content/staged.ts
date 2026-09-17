/* Content-status convention. Anything shown to a visitor that is a stand-in --
   stock art, invented numbers, provisional prices, wording nobody has signed
   off -- carries `staged: true` so it is placeholder in the type system, not
   only in a comment above it. status.ts collects every flag into a go-live
   checklist and warns in the dev console, so a placeholder cannot quietly
   harden into truth across a run of quick fixes. `markStaged` tags a whole set
   at once, for the lists that are placeholder end to end. */
export const markStaged = <T>(items: T[]): (T & { staged: true })[] =>
  items.map((item) => ({ ...item, staged: true }))
