/* ---------------------------------------------------------------------------
   The tiers of the sessions sold on the Sessions shelf, beside the tarot's
   (READINGS, in readings.ts): 1-on-1 video chats and 1-on-1 lessons. Like
   the readings, each is a list of fixed-length slots at a flat price, and
   the session menu only lays them out, so what a session costs or includes
   is a data edit here.

   Both are placeholders end to end -- the lengths, prices and wording are
   invented -- so their services in offerings.ts carry `staged: true` until
   they are confirmed.
--------------------------------------------------------------------------- */
export type SessionTier = {
  id: string
  label: string
  minutes: number
  price: number
  blurb: string
  includes: string[]
  featured?: boolean
}

export const CHATS: SessionTier[] = [
  {
    id: "quick",
    label: "Quick Hello",
    minutes: 15,
    price: 20,
    blurb: "Say hi, ask the one thing.",
    includes: ["FaceTime call"],
  },
  {
    id: "half",
    label: "Half Hour",
    minutes: 30,
    price: 35,
    blurb: "Room to get into it.",
    includes: ["FaceTime call", "Send your questions ahead"],
    featured: true,
  },
  {
    id: "hour",
    label: "Full Hour",
    minutes: 60,
    price: 60,
    blurb: "The long talk, no rush.",
    includes: ["FaceTime call", "Send your questions ahead"],
  },
]

export const LESSONS: SessionTier[] = [
  {
    id: "half",
    label: "Half Hour",
    minutes: 30,
    price: 40,
    blurb: "One thing, worked through.",
    includes: ["FaceTime lesson", "Notes to keep"],
  },
  {
    id: "hour",
    label: "Full Hour",
    minutes: 60,
    price: 70,
    blurb: "A whole lesson, start to finish.",
    includes: ["FaceTime lesson", "Notes to keep", "Something to practise"],
    featured: true,
  },
  {
    id: "long",
    label: "Hour and a Half",
    minutes: 90,
    price: 100,
    blurb: "Time to practise it while I watch.",
    includes: ["FaceTime lesson", "Notes to keep", "Something to practise"],
  },
]
