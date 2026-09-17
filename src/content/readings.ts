/* ---------------------------------------------------------------------------
   1-on-1 tarot readings, sold by the half hour. Three tiers, and like
   every other list in this file they live as data: the panel below only lays
   them out, so changing what a session costs or includes is a data edit.

   Amber, not brand red, stays the colour of this corner of the app.
--------------------------------------------------------------------------- */
export type Reading = {
  id: string
  label: string
  minutes: number
  price: number
  blurb: string
  includes: string[]
  featured?: boolean
}

export const READINGS: Reading[] = [
  {
    id: "half",
    label: "Half Hour",
    minutes: 30,
    price: 45,
    blurb: "One question, cut clean.",
    includes: ["Three-card spread", "Voice note recap"],
  },
  {
    id: "hour",
    label: "Full Hour",
    minutes: 60,
    price: 80,
    blurb: "The whole board, front to back.",
    includes: [
      "Celtic cross",
      "Voice note recap",
      "One follow-up card by text",
    ],
    featured: true,
  },
  {
    id: "long",
    label: "Hour and a Half",
    minutes: 90,
    price: 110,
    blurb: "Deep read, nobody watching the clock.",
    includes: ["Two spreads, your pick", "Voice note recap", "Written summary"],
  },
]
