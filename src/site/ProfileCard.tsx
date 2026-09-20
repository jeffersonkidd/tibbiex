import { MessageSquare, Radio } from "lucide-react"

import profilePic from "../assets/imagery/tibbie-portrait.jpg"
import bannerPic from "../assets/imagery/tibbie-onstage.jpg"
import { PROFILE, SOCIALS, TAGS } from "../content/profile"
import Pill from "../ui/Pill"

/* The card at the top of the page, built from the Figma "Profile Card"
   (Tibbie X - DSP, 4307:25191). The live photo runs behind the top of the
   card and everything else sits over it: the live badge, the avatar, the
   wordmark, what she plays and who with, then the social keys, the contact
   button and the tags. Every word of it comes from content/profile.ts. */
export default function ProfileCard({ onContact }: { onContact: () => void }) {
  const { live } = PROFILE

  return (
    <section className="surface relative mb-6 overflow-hidden rounded-lg">
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

      <div className="relative flex flex-col items-start gap-4 p-5">
        {/* Reserves the badge's height when she is not live, so the avatar
            does not jump when the badge comes and goes. */}
        <div className="min-h-[26px]">
          {live && (
            <a
              href={live.href}
              target="_blank"
              rel="noreferrer noopener"
              className="mono-label inline-flex items-center gap-1.5 rounded-full border border-foreground/80 bg-live px-2.5 py-1 text-on-live transition-[filter] hover:brightness-110"
            >
              <Radio size={12} aria-hidden /> {live.label}
            </a>
          )}
        </div>

        <div className="relative mt-3">
          <img
            src={profilePic}
            alt="Tibbie X"
            className="profile-avatar h-36 w-36 object-cover sm:h-40 sm:w-40"
          />
          {live && (
            <span
              className="absolute bottom-2 right-6 h-4 w-4 rounded-full border border-foreground/80 bg-live sm:right-7"
              title={live.label}
            />
          )}
        </div>

        <h1 className="wordmark flex items-center gap-2 text-5xl leading-none">
          <span className="wordmark-chrome">{PROFILE.name}</span>
          <span className="wordmark-x">X</span>
        </h1>

        <ul className="flex flex-wrap gap-2" aria-label="Plays">
          {PROFILE.roles.map(({ icon, label }) => (
            <li key={label}>
              <Pill icon={icon} variant="role">
                {label}
              </Pill>
            </li>
          ))}
        </ul>

        <p className="profile-quote text-base leading-snug">
          “{PROFILE.quote}”
        </p>

        <ul
          aria-label="Bands"
          className="flex flex-wrap gap-x-3 gap-y-0.5 text-base font-bold leading-snug text-muted-foreground"
        >
          {PROFILE.bands.map((band) => (
            <li key={band} className="list-inside list-disc">
              {band}
            </li>
          ))}
        </ul>

        <div className="flex w-full flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <ul className="flex flex-wrap gap-2" aria-label="Elsewhere">
            {SOCIALS.map(({ icon: Icon, label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  title={label}
                  className="social-key"
                >
                  <Icon size={20} />
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onContact}
            className="brand-surface brand-lift flex items-center gap-2 rounded-sm border border-border-strong bg-primary p-2 font-mono text-sm uppercase leading-none tracking-[0.07em] text-primary-foreground"
          >
            <MessageSquare size={20} aria-hidden /> Contact
          </button>
        </div>

        <ul className="flex flex-wrap gap-x-1.5 gap-y-2" aria-label="About">
          {TAGS.map(({ icon, label }) => (
            <li key={label}>
              <Pill icon={icon} variant="tag">
                {label}
              </Pill>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
