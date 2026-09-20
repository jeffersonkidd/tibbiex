import {
  Heart,
  MessageSquare,
  Music,
  ShoppingBag,
  Sparkles,
  Youtube,
} from "lucide-react"

/* The first tab. Rows are outbound links, except those carrying `action`: such
   a row is a button that opens something inside the app instead of navigating
   away -- the reading menu, the featured merch offer and the booking form.
   The offer row opens YOUTH_ANTHEMS_BUNDLE in the product modal; its wording
   is as provisional as the bundle itself.

   `enabled: false` takes a row off the page while leaving its data here to
   switch back on. Unlike TABS, the flag is opt-out -- a row without it shows --
   so a new link cannot go missing by forgetting to add one. */
export const LINKS = [
  {
    icon: Sparkles,
    title: "1-on-1 Tarot Readings",
    meta: "Over FaceTime — 30, 60 or 90 minutes",
    href: "#",
    action: "tarot",
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
    /* Improvised bundle -- see YOUTH_ANTHEMS_BUNDLE in shop.ts. */
    staged: true,
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

export type LinkEntry = (typeof LINKS)[number]

export const VISIBLE_LINKS = LINKS.filter((link) => link.enabled !== false)
