import {
  Calendar,
  Disc,
  Facebook,
  Instagram,
  MapPin,
  Mic,
  Music,
  UserPlus,
  Volume2,
  Youtube,
} from "lucide-react"

import PatreonIcon from "../assets/icons/PatreonIcon"
import TikTokIcon from "../assets/icons/TikTokIcon"
import VenmoIcon from "../assets/icons/VenmoIcon"
import { VENMO_HANDLE } from "./site"

/* Everything the profile card says. The card is the Figma "Profile Card"
   (Tibbie X - DSP, node 4307:25191); it lays this out and holds none of it. */

const TIKTOK_URL = "https://www.tiktok.com/@tibbieskyex"

export const PROFILE = {
  name: "Tibbie",
  quote: "Give me chaos or give me death.",
  /* What she does on stage -- the amber pills under the wordmark. */
  roles: [
    { icon: Music, label: "Bass" },
    { icon: Volume2, label: "Vocals" },
    { icon: UserPlus, label: "Crowds" },
  ],
  bands: [
    "Reagan Youth",
    "Leftover Crack",
    "Kissy Kamikaze",
    "GASH",
    "X-Possibles",
  ],
  /* The green badge on the banner and the dot on the avatar. There is no feed
     telling the site she is live, so this is a claim someone has to keep true:
     set it to null when she is not, and the badge and dot both go. */
  live: { label: "Live on TikTok", href: TIKTOK_URL, staged: true } as {
    label: string
    href: string
    staged?: true
  } | null,
}

/* The square buttons in the card's quick bar. Every handle here is also in the
   Person's `sameAs` in index.html -- structured data has to be backed by links
   a visitor can see, so add or remove them in both places. Email is not a
   button: the Contact button beside them opens the booking form, which carries
   the address. */
export const SOCIALS = [
  {
    icon: Instagram,
    label: "Instagram — @tibbie_x",
    href: "https://www.instagram.com/tibbie_x",
  },
  { icon: TikTokIcon, label: "TikTok — @tibbieskyex", href: TIKTOK_URL },
  {
    icon: Youtube,
    label: "YouTube — @tibbieskyex",
    href: "https://www.youtube.com/@tibbieskyex",
  },
  {
    icon: PatreonIcon,
    label: "Patreon — Tibbie_X",
    href: "https://www.patreon.com/Tibbie_X",
  },
  {
    icon: Facebook,
    label: "Facebook — Tibbie.X",
    href: "https://www.facebook.com/Tibbie.X",
  },
  {
    icon: VenmoIcon,
    label: `Venmo — @${VENMO_HANDLE}`,
    href: `https://venmo.com/u/${VENMO_HANDLE}`,
  },
]

/* Context, not credits: the muted pills at the foot of the card. */
export const TAGS = [
  { icon: MapPin, label: "NYC" },
  { icon: Mic, label: "Tour Junkie" },
  { icon: Calendar, label: "Tarot" },
  { icon: Disc, label: "Punk Historian" },
]
