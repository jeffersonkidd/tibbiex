import { markStaged } from "./staged"

/* "Still Alive", the podcast the fund pays for. The goal and the running
   total are typed in by hand -- nothing reads them back from Venmo or Stripe
   -- so they are only as true as the last edit. The numbers below are
   invented to see the meter laid out; replace them before this goes live. */
export const FUND = {
  title: "Fund “Still Alive”",
  blurb: "Interviews with the East Coast punks who kept it going.",
  badge: "Podcast fund",
  goal: 2000,
  raised: 1240,
  backers: 38,
  presets: [10, 25, 50, 100],
  /* The preset selected when the panel opens. */
  suggested: 25,
  perk: "Receipt, and first listen when episodes drop.",
  staged: true as const,
}

/* PLACEHOLDER DATA — these five are invented, to see the feed laid out. Replace
   them with what actually arrives on either rail (Venmo's activity feed, or
   Stripe's payments with their note metadata) before this goes in front of
   anyone, and empty the array back out in the meantime if it ships first: the
   feed hides itself when there is nothing real to show. */
export type Supporter = {
  name: string
  msg: string
  amount: number
  staged?: true
}

export const SUPPORTERS: Supporter[] = markStaged([
  { name: "Sewer Tony", msg: "for the Reagan Youth episode", amount: 100 },
  { name: "Gary", msg: "keep the mics on", amount: 75 },
  { name: "Deb Void", msg: "still alive, still loud", amount: 50 },
  { name: "Ratface", msg: "gas money to the next one", amount: 25 },
  { name: "Kat Static", msg: "from the old Trenton crowd", amount: 10 },
])

/* The feed ranks by amount rather than by arrival: entries carry no timestamp,
   so "recent" would only ever mean "wherever it sits in the array above", while
   the amount is real data. Sorted on a copy -- sort() mutates, and SUPPORTERS is
   the source every other reading of the list would come from. */
export const TOP_CONTRIBUTORS = [...SUPPORTERS]
  .sort((a, b) => b.amount - a.amount)
  .slice(0, 5)
