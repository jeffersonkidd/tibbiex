import gashPromo from "../assets/imagery/gash/promo.jpg"
import gashLive from "../assets/imagery/gash/live.jpg"
import gashFlyer from "../assets/imagery/gash/flyer.jpg"
import gashArt from "../assets/imagery/gash/artwork.jpg"
import gashLogo from "../assets/imagery/gash/logo.jpg"

import { markStaged } from "./staged"

/* One id per band/project. It is the join between a portfolio section and the
   items it sells, so a typo is a type error rather than an empty shelf at
   runtime. Anything not tied to one band is tagged "general". */
export type BandId = "leftover-crack" | "reagan-youth" | "gash"

// Portfolio entries: one section per band/project. Dates and credits below are
// placeholders — confirm them before this goes live.
/* Intrinsic pixel dimensions travel with each photo so the masonry columns
   reserve the right space before the image loads -- without them the whole
   stack reflows as each one arrives. They must match the w/h in the URL. */
export type Photo = {
  src: string
  alt: string
  width: number
  height: number
  /* A stand-in image, not a real photo of this band -- see content-status. */
  staged?: true
}

export type PortfolioEntry = {
  id: BandId
  band: string
  role: string
  years: string
  blurb: string
  highlights: { label: string; detail: string }[]
  photos: Photo[]
}

export const PORTFOLIO: PortfolioEntry[] = [
  {
    id: "leftover-crack",
    band: "Leftover Crack",
    role: "Bass",
    years: "2015 — present",
    blurb:
      "Holding down low end for the crust-punk institution — squat shows, festival stages, and everything in between.",
    highlights: [
      { label: "Releases", detail: "Constructs of the State (2015)" },
      { label: "Live", detail: "924 Gilman · Riot Fest" },
      { label: "Touring", detail: "US · EU" },
    ],
    photos: [
      {
        src: "https://images.unsplash.com/photo-1549213783-8284d0336c4f?q=80&w=600&h=450&auto=format&fit=crop",
        alt: "Leftover Crack on a festival stage",
        width: 600,
        height: 450,
      },
      {
        src: "https://images.unsplash.com/photo-1415886541506-6efc5e4b1786?q=80&w=600&h=780&auto=format&fit=crop",
        alt: "Crowd surge during the set",
        width: 600,
        height: 780,
      },
      {
        src: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=600&h=600&auto=format&fit=crop",
        alt: "Records stacked on a table",
        width: 600,
        height: 600,
      },
      {
        src: "https://images.unsplash.com/photo-1462965326201-d02e4f455804?q=80&w=600&h=820&auto=format&fit=crop",
        alt: "Bass rig backstage before doors",
        width: 600,
        height: 820,
      },
      {
        src: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600&h=420&auto=format&fit=crop",
        alt: "House lights up on an emptying room",
        width: 600,
        height: 420,
      },
      {
        src: "https://images.unsplash.com/photo-1508973379184-7517410fb0bc?q=80&w=600&h=760&auto=format&fit=crop",
        alt: "Guitar neck and hands mid-chord",
        width: 600,
        height: 760,
      },
    ],
  },
  {
    id: "reagan-youth",
    band: "Reagan Youth",
    role: "Bass",
    years: "2018 — present",
    blurb:
      "Low end for the Queens band that helped write the New York hardcore canon, still playing the early catalogue at full volume.",
    highlights: [
      { label: "Live", detail: "NYC clubs · punk festivals" },
      { label: "Touring", detail: "US · EU" },
      { label: "Set", detail: "Early catalogue, full volume" },
    ],
    /* Placeholder gallery: these are stand-ins pulled from the same stock pool
       as the other sections, not Reagan Youth photos. Swap them for real ones
       before this goes live, and update alt text and dimensions to match.
       markStaged flags the whole set until real photos land. */
    photos: markStaged([
      {
        src: "https://images.unsplash.com/photo-1538356111053-748a48e1acb8?q=80&w=600&h=600&auto=format&fit=crop",
        alt: "Vinyl pressings stacked on the table by the door",
        width: 600,
        height: 600,
      },
      {
        src: "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?q=80&w=600&h=780&auto=format&fit=crop",
        alt: "Patches sewn across a battle jacket",
        width: 600,
        height: 780,
      },
      {
        src: "https://images.unsplash.com/photo-1519508234239-44619d854291?q=80&w=600&h=450&auto=format&fit=crop",
        alt: "Picks and spare strings in an open gig bag",
        width: 600,
        height: 450,
      },
    ]),
  },
  {
    id: "gash",
    band: "Gash",
    role: "Bass · Vocals",
    years: "2019 — present",
    blurb:
      "Bass and co-vocals in the NYC four-piece — fast, ugly, and built for basement rooms.",
    highlights: [
      { label: "Releases", detail: 'Demo tape · split 7"' },
      { label: "Live", detail: "East coast DIY circuit" },
      { label: "Writing", detail: "Co-writes the full set" },
    ],
    photos: [
      {
        src: gashPromo,
        alt: "Gash promo shot — the band's vocalist on a red-lit stage beneath the logo",
        width: 960,
        height: 960,
      },
      {
        src: gashLive,
        alt: "Black-and-white live shot of Gash mid-set, guitarist behind the vocalist",
        width: 905,
        height: 905,
      },
      {
        src: gashFlyer,
        alt: "Show flyer: Gash with Ballroom Zombies, Danse de Sade and Thorazine at North Star Bar",
        width: 685,
        height: 960,
      },
      {
        src: gashArt,
        alt: "Gash artwork — a screamed face in red and black beside the band logo",
        width: 960,
        height: 540,
      },
      {
        src: gashLogo,
        alt: "The Gash logo in white brushstrokes on black",
        width: 777,
        height: 777,
      },
    ],
  },
]
