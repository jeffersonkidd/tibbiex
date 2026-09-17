export const SHOWS = [
  {
    id: "s1",
    venue: "924 Gilman",
    date: "Oct 31, 2026",
    city: "Berkeley, CA",
    status: "Tickets",
  },
  {
    id: "s2",
    venue: "The Bowery Electric",
    date: "Nov 15, 2026",
    city: "New York, NY",
    status: "Sold Out",
  },
  {
    id: "s3",
    venue: "Riot Fest",
    date: "Dec 5, 2026",
    city: "Chicago, IL",
    status: "Festival",
  },
]

export type Show = typeof SHOWS[number]
