import { MessageSquare, Radio } from "lucide-react"

import profilePic from "../assets/imagery/tibbie-portrait.png"
import bannerPic from "../assets/imagery/tibbie-onstage.jpg"
import tagPic from "../assets/marks/tibbiex-tag.png"
import { PROFILE, VISIBLE_SOCIALS } from "../content/profile"
import type { BandId } from "../content/portfolio"
import { SHOP_GROUPS } from "../content/shop"
import Button from "../ui/controls/Button"
import Avatar from "../ui/display/Avatar"
import SocialButton from "../ui/controls/SocialButton"
import Pill from "../ui/display/Pill"
import Separator from "../ui/display/Separator"

/* The card at the top of the page, built from the Figma "Profile Card"
   (Tibbie X - DSP, 4545:73). The live photo runs behind the top of the
   card and everything else sits over it: the live badge while she is live,
   the avatar, the painted tag, what she plays and who with, then the social keys and the
   contact button. Every word of it comes from content/profile.ts.

   A band with a shelf in the Buy tab is a button that opens it; `onOpenShop`
   is left out while the Buy tab is off, and every band reads as text.

   `portrait` stands a different picture in the avatar, for the preview page
   alone; the site never passes it. */
export default function ProfileCard({
  onContact,
  onOpenShop,
  portrait = profilePic,
}: {
  onContact: () => void
  onOpenShop?: (band: BandId) => void
  portrait?: string
}) {
  const { live } = PROFILE
  const shelved = (band?: BandId) =>
    band && SHOP_GROUPS.some((group) => group.id === band) ? band : undefined

  return (
    <section className="surface relative overflow-hidden rounded-lg">
      <div className="profile-banner">
        <img
          src={bannerPic}
          alt=""
          /* The LCP element. It is imported through JS, so it is not in the
             HTML for the preload scanner to find -- this at least moves it to
             the front of the queue once the bundle resolves it. */
          fetchPriority="high"
          className="h-full w-full object-cover object-top"
        />
      </div>

      <div className="relative flex flex-col items-start gap-stack p-panel">
        {live && (
          <a
            href={live.href}
            target="_blank"
            rel="noreferrer noopener"
            className="label-mono inline-flex items-center gap-glyph rounded-full border border-foreground/80 bg-live px-2.5 py-1 text-on-live transition-[filter] hover:brightness-110"
          >
            <Radio size={12} aria-hidden /> {live.label}
          </a>
        )}

        <Avatar src={portrait} alt={PROFILE.name} live={live && live.label} />

        <h1 className="w-full max-w-80">
          <img
            src={tagPic}
            alt={`${PROFILE.name} X`}
            width={640}
            height={369}
            className="tag-mark h-auto w-full"
          />
        </h1>

        <ul className="flex flex-wrap gap-cluster" aria-label="Plays">
          {PROFILE.roles.map(({ icon, label }) => (
            <li key={label}>
              <Pill icon={icon}>{label}</Pill>
            </li>
          ))}
        </ul>

        <p className="profile-quote body-base">“{PROFILE.quote}”</p>

        <ul
          aria-label="Bands"
          className="flex flex-wrap gap-x-part gap-y-0.5 body-base-bold text-muted-foreground"
        >
          {PROFILE.bands.map(({ name, shop }) => {
            const band = onOpenShop && shelved(shop)
            return (
              <li key={name} className="list-inside list-disc">
                {band ? (
                  <button
                    type="button"
                    onClick={() => onOpenShop(band)}
                    className="underline decoration-muted-foreground/40 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
                  >
                    {name}
                  </button>
                ) : (
                  name
                )}
              </li>
            )
          })}
        </ul>

        <Separator space="none" />

        <div className="flex w-full flex-wrap items-center justify-between gap-part">
          <ul className="flex flex-wrap gap-cluster" aria-label="Elsewhere">
            {VISIBLE_SOCIALS.map(({ icon, label, href }) => (
              <li key={href}>
                <SocialButton icon={icon} label={label} href={href} />
              </li>
            ))}
          </ul>

          {/* Block size, like every other brand button; the wrapper sizes it
              to its label instead of the card's width. */}
          <div className="shrink-0">
            <Button icon={MessageSquare} onClick={onContact}>
              Contact
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
