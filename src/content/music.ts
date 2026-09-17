export type Album = {
  id: string
  album: string
  band: string
  year: string
  role: string
  image: string
  /* The one song called out for this record. Optional -- only the rehearsal
     panel's target carries it today, and the modal hides the line without it. */
  track?: string
  /* Placeholder art or unconfirmed wording -- see the content-status note. */
  staged?: true
}

/* The rehearsal panel's destination, named so the panel can reach it without
   re-finding it in the list. `role` deliberately does not claim a credit on the
   1984 recording -- this is the live set with the current lineup. Confirm the
   wording, and the featured song, before this goes live. */
export const REAGAN_YOUTH_LP: Album = {
  id: "d0",
  album: "Youth Anthems for the New Order",
  band: "Reagan Youth",
  year: "1984",
  role: "Live — current lineup",
  track: "Degenerated",
  image:
    "https://images.unsplash.com/photo-1526394931762-90052e97b376?q=80&w=400&auto=format&fit=crop",
  staged: true,
}

export const DISCOGRAPHY: Album[] = [
  REAGAN_YOUTH_LP,
  {
    id: "d1",
    album: "Constructs of the State",
    band: "Leftover Crack",
    year: "2015",
    role: "Bass, Vocals",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "d2",
    album: "Never Rest in Peace",
    band: "Star Fucking Hipsters",
    year: "2009",
    role: "Guest Vocals",
    image:
      "https://images.unsplash.com/photo-1493225457224-ca2eb444624f?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "d3",
    album: "Fuck World Trade",
    band: "Leftover Crack",
    year: "2004",
    role: "Bass",
    image:
      "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=400&auto=format&fit=crop",
  },
]
