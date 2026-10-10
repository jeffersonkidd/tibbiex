import { LinkRow } from "tibbiex-ui"
import { Heart, MessageSquare, ShoppingBag, Spade } from "lucide-react"

export const OpensInApp = () => (
  <div className="w-[34rem]">
    <LinkRow
      link={{
        icon: Spade,
        title: "1-on-1 Tarot Readings",
        meta: "Over FaceTime — 30, 60 or 90 minutes",
        href: "#",
      }}
      onOpen={() => {}}
    />
  </div>
)

export const External = () => (
  <div className="w-[34rem]">
    <LinkRow
      link={{
        icon: Heart,
        title: "Support on Patreon",
        meta: "Demos, tabs & studio diaries",
        href: "#",
        external: true,
      }}
    />
  </div>
)

export const Column = () => (
  <div className="w-[34rem] space-y-stack">
    <LinkRow
      link={{
        icon: ShoppingBag,
        title: "Youth Anthems Bundle",
        meta: "LP, tee & patch — ships in the US",
        href: "#",
      }}
      onOpen={() => {}}
    />
    <LinkRow
      link={{
        icon: MessageSquare,
        title: "Booking & Session Work",
        meta: "Bass, vocals, tours",
        href: "#",
      }}
      onOpen={() => {}}
    />
  </div>
)
