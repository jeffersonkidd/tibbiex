import chatBanner from "../assets/illustrations/shop/sessions/chat.svg"
import lessonsBanner from "../assets/illustrations/shop/sessions/lessons.svg"
import tarotBanner from "../assets/illustrations/shop/sessions/tarot.svg"
import { READINGS } from "./readings"
import { CHATS, LESSONS } from "./sessions"
import type { SessionTier } from "./sessions"
import { SHOP_SHELVES } from "./shop"
import type { ShopShelf } from "./shop"
import type { ServiceCategory } from "./taxonomy"

/* The top of everything she sells, one level above the shop's shelves:
   Products, the things that ship, and Services, the time she gives. Not
   shown anywhere as such -- the Buy tab holds both, Products as Bands and
   Art and Services as Sessions -- but it is the frame the rest sits in, so
   a new kind of thing for sale is placed here first.

   Built from the lists it gathers rather than restating them: Services
   owns the Sessions shelf, Products is every other shelf in SHOP_SHELVES,
   and a service's tiers are its
   own list, READINGS for the tarot and CHATS and LESSONS for the rest. Add a shelf or a tier there and it is
   here too. */
export type OfferingId = "products" | "services"

/* One thing sold as someone's time: its banner on the Sessions shelf (drawn
   by scripts/draw-illustrations.py), and everything its menu says -- the
   session menu is one modal for every service, laid out from this. */
export type Service = {
  id: "chat" | "tarot" | "lessons"
  /* Its leaf of the category tree, under Services › Sessions
     (content/taxonomy.ts). */
  category: ServiceCategory
  title: string
  /* Its tab under Sessions on the Buy tab. */
  short: string
  /* The menu's small line over the title. */
  eyebrow: string
  /* The menu's line under the title: what the session is. */
  sub: string
  /* The fine print over the button: how the deposit and the booking work. */
  terms: string
  /* What one slot is called, for the payment note: "60-minute reading". */
  noun: string
  /* Which line item Stripe shows (PURPOSES in api/checkout.ts). */
  purpose: "chat" | "reading" | "lesson"
  tiers: SessionTier[]
  banner: string
  staged?: true
}

/* The shelf the services are shown on, under Buy. */
export const SERVICES_SHELF = "sessions" satisfies ShopShelf

export type Offering =
  | {
      id: "products"
      title: string
      shelves: Exclude<ShopShelf, typeof SERVICES_SHELF>[]
    }
  | {
      id: "services"
      title: string
      services: Service[]
    }

/* Every session's deposit is settled the same way. */
const BOOKING_TERMS =
  "The deposit holds the slot; we settle the time by DM and I call you when it comes round. In person instead if you are local."

/* Named, like the shop's named items, so the Home tab's tarot row can open
   its menu directly. */
export const TAROT_SESSION: Service = {
  id: "tarot",
  category: "tarot",
  title: "1-on-1 Tarot Readings",
  short: "Tarot",
  eyebrow: "Readings",
  sub: "Twenty-two cards, cut in the dark, read live over FaceTime. Pick how long you want the table open.",
  terms: `${BOOKING_TERMS} No gods, no gatekeeping — the deck has no authority over you.`,
  noun: "reading",
  purpose: "reading",
  tiers: READINGS,
  banner: tarotBanner,
}

/* What Sessions shows, in order. */
export const SERVICES: Service[] = [
  {
    id: "chat",
    category: "chats",
    title: "1-on-1 Video Chats",
    short: "Chats",
    eyebrow: "Chats",
    sub: "Just talk, live over FaceTime: the band years, the road, the art, or whatever you have been meaning to ask. Pick how long you want the line open.",
    terms: BOOKING_TERMS,
    noun: "chat",
    purpose: "chat",
    tiers: CHATS,
    banner: chatBanner,
    staged: true,
  },
  TAROT_SESSION,
  {
    id: "lessons",
    category: "lessons",
    title: "1-on-1 Lessons",
    short: "Lessons",
    eyebrow: "Lessons",
    sub: "One on one over FaceTime, built around whatever you bring. Pick how long you want the lesson.",
    terms: BOOKING_TERMS,
    noun: "lesson",
    purpose: "lesson",
    tiers: LESSONS,
    banner: lessonsBanner,
    staged: true,
  },
]

export const OFFERINGS: Offering[] = [
  {
    id: "products",
    title: "Products",
    shelves: SHOP_SHELVES.flatMap(({ id }) =>
      id === SERVICES_SHELF ? [] : [id],
    ),
  },
  { id: "services", title: "Services", services: SERVICES },
]
