import {
  Heart,
  MessageSquare,
  Music,
  ShoppingBag,
  Spade,
  Youtube,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import gashOnstage from "../assets/illustrations/link-rows/gash-onstage.svg"
import leftoverCrackMerch from "../assets/illustrations/link-rows/leftover-crack-merch.svg"
import reaganYouthMerch from "../assets/illustrations/link-rows/reagan-youth-merch.svg"
import tarotSpread from "../assets/illustrations/link-rows/tarot-spread.svg"
import type { BandId } from "./portfolio"
import { READINGS } from "./readings"

/* How a print is held to the page: duct tape at the top-left and
   bottom-right corners, tape the other way round, a safety pin, or two
   staples. */
export type PrintHold = "tape" | "tape-flipped" | "pin" | "staples"

/* The picture on a row, drawn as an instant print by ui/rows/LinkRow. */
export type LinkPrint = {
  /* A cutout: a transparent picture whose bottom sits on the photo
     window's floor and whose top climbs out over its edge. Portrait, about
     4:5, the subject filling the bottom of the canvas. Decorative -- the
     row's title says what it is. */
  src: string
  /* The label-maker tag on the photo (phone). */
  label: string
  /* Scrawled in marker on the print's strip (desktop). */
  caption: string
  hold: PrintHold
  /* Lean of the desktop print and the phone card, and how far the cutout
     tips on hover, in degrees. */
  tilt: number
  tiltPhone: number
  lean: number
  /* How tall the cutout stands against the window, desktop and phone, when
     it is not 1.24 and 1.2. */
  rise?: [number, number]
  /* The amber starburst on the photo's corner. */
  price?: { lead: string; amount: string }
  /* The picture is a placeholder. */
  staged?: true
}

export type LinkEntry = {
  /* What the print's window shows while a row has no `print` yet. */
  icon: LucideIcon
  title: string
  meta: string
  /* Desktop only: the amber line over the title, and a sentence under the
     meta, so a row beside its print is not just a title. */
  eyebrow?: string
  blurb?: string
  print?: LinkPrint
  href: string
  external?: true
  /* Opens something in this view instead of navigating away. */
  action?: "tarot" | "offer" | "booking"
  /* The band whose merch the row sells. The row opens the Buy tab's first
     screen, and goes dark with the Buy tab or when the band has nothing for
     sale. */
  shop?: BandId
  enabled?: boolean
  staged?: true
}

const cheapestReading = Math.min(...READINGS.map((reading) => reading.price))

/* The first tab. Rows are outbound links, except those carrying `action`
   or `shop`: such a row is a button that opens something inside the app
   instead of navigating away -- the Buy tab (its first screen, or Sessions
   for tarot), the featured merch offer or the booking form.

   Every picture is a placeholder drawing (src/assets/illustrations/
   link-rows/, SVG): a faceless cartoon of her and drawn props, with no
   photograph of her in any of them. Flagged staged until real photos
   replace them.

   `enabled: false` takes a row off the page while leaving its data here to
   switch back on. Unlike TABS, the flag is opt-out -- a row without it shows --
   so a new link cannot go missing by forgetting to add one. */
export const LINKS: LinkEntry[] = [
  {
    icon: Spade,
    title: "1-on-1 Tarot Readings",
    meta: "Over FaceTime · 30, 60 or 90 min",
    eyebrow: "Tarot",
    blurb:
      "One question cut clean, or the whole board front to back. Booked by the half hour.",
    print: {
      src: tarotSpread,
      label: "Tarot",
      caption: "tarot ✶",
      hold: "tape",
      tilt: -5,
      tiltPhone: -1.4,
      lean: -3,
      price: { lead: "from", amount: `$${cheapestReading}` },
      staged: true,
    },
    href: "#",
    action: "tarot",
  },
  {
    icon: ShoppingBag,
    title: "Reagan Youth Merch",
    meta: "Stickers, patches & tees",
    eyebrow: "Merch · Reagan Youth",
    blurb:
      "Queens anarcho-punk since 1980. Printed in the studio, shipped in the US.",
    print: {
      src: reaganYouthMerch,
      label: "Merch",
      caption: "reagan youth",
      hold: "pin",
      tilt: 3,
      tiltPhone: 1.1,
      lean: 3,
      staged: true,
    },
    href: "#",
    shop: "reagan-youth",
  },
  {
    icon: ShoppingBag,
    title: "Leftover Crack Merch",
    meta: "Stickers, patches & tees",
    eyebrow: "Merch · Leftover Crack",
    blurb:
      "Crust and ska-punk out of C-Squat. Printed in the studio, shipped in the US.",
    print: {
      src: leftoverCrackMerch,
      label: "Merch",
      caption: "LöC",
      hold: "tape-flipped",
      tilt: -3,
      tiltPhone: -0.8,
      lean: -3,
      staged: true,
    },
    href: "#",
    shop: "leftover-crack",
  },
  {
    icon: ShoppingBag,
    title: "GASH Merch",
    meta: "Tees",
    eyebrow: "Merch · GASH",
    blurb:
      "The band she fronted from 2012. Printed in the studio, shipped in the US.",
    print: {
      src: gashOnstage,
      label: "Merch",
      caption: "gash!!",
      hold: "staples",
      tilt: 4,
      tiltPhone: 1.4,
      lean: 2,
      rise: [1.16, 1.12],
      staged: true,
    },
    href: "#",
    shop: "gash",
  },
  {
    icon: Music,
    title: "Listen on Spotify",
    meta: "Leftover Crack · SFH",
    href: "#",
    enabled: false,
  },
  {
    icon: Youtube,
    title: "Live Videos",
    meta: "Shows, squats & riots",
    href: "#",
    enabled: false,
  },
  {
    icon: Heart,
    title: "Support the Scene",
    meta: "Mutual aid links",
    href: "#",
    external: true,
    enabled: false,
  },
  {
    icon: ShoppingBag,
    title: "Youth Anthems Bundle",
    meta: "Reissue LP + logo tee, $50 — 20 numbered",
    href: "#",
    action: "offer",
    /* Improvised bundle -- see YOUTH_ANTHEMS_BUNDLE in shop.ts. Off until a
       real bundle replaces it. */
    staged: true,
    enabled: false,
  },
  {
    icon: MessageSquare,
    title: "Book / Contact",
    meta: "Shows, sessions & readings",
    href: "#",
    action: "booking",
    /* Off: the profile card's contact button opens the same form. */
    enabled: false,
  },
]

export const VISIBLE_LINKS = LINKS.filter((link) => link.enabled !== false)
