import { AtSign, Facebook, Globe, Instagram, Mail, Youtube } from "lucide-react"

import BlueskyIcon from "../assets/icons/BlueskyIcon"
import PatreonIcon from "../assets/icons/PatreonIcon"
import TikTokIcon from "../assets/icons/TikTokIcon"
import XIcon from "../assets/icons/XIcon"

/* The studio's Link Maker: every place the bio link gets pasted, and what to
   call each spot on a profile. The `source` and `medium` are what Google
   Analytics will show; the `where` steps are what the owner reads while
   pasting, so they are written for a phone in one hand. App menus move, so a
   step that has gone stale is a one-line edit here.

   The `id` doubles as the key the studio stores progress under -- renaming
   one forgets that profile's tick, so add a new id rather than reuse an old
   one. */
export type Channel = {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  source: string
  medium: string
  /* The path through the app's menus to the field the link goes in. */
  where: string[]
  /* Set when the app has no link field and the URL has to sit in the bio
     text itself, so the studio can say so. */
  inText?: true
}

export const CHANNELS: Channel[] = [
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    source: "instagram",
    medium: "social",
    where: ["Profile", "Edit profile", "Links", "Add external link"],
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: TikTokIcon,
    source: "tiktok",
    medium: "social",
    where: ["Profile", "Edit profile", "Website"],
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    source: "youtube",
    medium: "social",
    where: ["Your channel", "Customize channel", "Links", "Add link"],
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    source: "facebook",
    medium: "social",
    where: ["Profile", "Edit profile", "Links", "Add link"],
  },
  {
    id: "patreon",
    name: "Patreon",
    icon: PatreonIcon,
    source: "patreon",
    medium: "social",
    where: ["Your page", "Edit page", "Social links"],
  },
  {
    id: "threads",
    name: "Threads",
    icon: AtSign,
    source: "threads",
    medium: "social",
    where: ["Profile", "Edit profile", "Links", "Add link"],
  },
  {
    id: "bluesky",
    name: "Bluesky",
    icon: BlueskyIcon,
    source: "bluesky",
    medium: "social",
    where: ["Profile", "Edit profile", "Description"],
    inText: true,
  },
  {
    id: "x",
    name: "X",
    icon: XIcon,
    source: "x",
    medium: "social",
    where: ["Profile", "Edit profile", "Website"],
  },
  {
    id: "email",
    name: "Email",
    icon: Mail,
    source: "email-signature",
    medium: "email",
    where: ["Your mail app", "Settings", "Signature"],
    inText: true,
  },
]

/* The ninth tile: anywhere not listed. Its source is typed in, so it is not
   in CHANNELS and never counts toward "every profile wired". */
export const ELSEWHERE: Channel = {
  id: "elsewhere",
  name: "Elsewhere",
  icon: Globe,
  source: "",
  medium: "referral",
  where: [],
}

/* Where on a profile the link sits -- the campaign. "Bio" is the default
   because it is the one link that never expires; the others are for links
   dropped somewhere for a day. */
export const PLACEMENTS = [
  { id: "bio", label: "Bio" },
  { id: "story", label: "Story" },
  { id: "post", label: "Post" },
  { id: "dm", label: "DM" },
] as const
