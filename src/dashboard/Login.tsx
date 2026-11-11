import { useRef, useState, type FormEvent } from "react"
import { ArrowLeft, KeyRound } from "lucide-react"

import profilePic from "../assets/illustrations/profile/tibbie-portrait.svg"
import tagPic from "../assets/marks/tibbiex-tag.png"
import { AVATAR_URL } from "../content/site"
import { castMagic } from "../lib/magic-dust"
import Button from "../ui/controls/Button"
import Field from "../ui/controls/Field"
import { TOO_MANY_TRIES, checkPasscode, savePasscode } from "./passcode"

/* The door at /dashboard: an all-access tour laminate on a lanyard, swaying a
   little, with the passcode field where the holder's details would go. The
   right passcode gets the pass stamped ON STAGE in the brand red, a burst of
   the site's magic dust, and the back office behind it. The wrong one shakes
   the pass, the way a door you can't open rattles.

   The answer comes from api/login.ts, and the passcode is saved the way the
   modules already save it (passcode.ts), so nothing asks for it again on this
   device. `pnpm dev` runs no API, so there the door lets anyone in and says
   it didn't check. */

const STRAP = "TIBBIE X · ALL ACCESS · ".repeat(6)
const LANDING_MS = 1200

type State = "idle" | "checking" | "in"

function still() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export default function Login({ onIn }: { onIn: (note?: string) => void }) {
  const [passcode, setPasscode] = useState("")
  const [state, setState] = useState<State>("idle")
  const [message, setMessage] = useState("")
  const [avatarFailed, setAvatarFailed] = useState(false)
  const passRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  function rattle() {
    if (still()) return
    passRef.current?.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-10px) rotate(-1.5deg)" },
        { transform: "translateX(8px) rotate(1deg)" },
        { transform: "translateX(-5px)" },
        { transform: "translateX(3px)" },
        { transform: "translateX(0)" },
      ],
      { duration: 420, easing: "ease-out" },
    )
  }

  function land(code: string, note?: string) {
    savePasscode(code)
    setState("in")
    setMessage("")
    const box = buttonRef.current?.getBoundingClientRect()
    if (box) castMagic(box.left + box.width / 2, box.top + box.height / 2)
    setTimeout(() => onIn(note), still() ? 500 : LANDING_MS)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (state !== "idle") return
    const code = passcode.trim()
    if (!code) {
      setMessage("Type the passcode first.")
      rattle()
      return
    }

    setState("checking")
    setMessage("")
    const answer = await checkPasscode(code)

    if (answer === "ok") return land(code)
    if (answer === "unreachable" && import.meta.env.DEV) {
      return land(code, "pnpm dev runs no API, so the passcode wasn't checked.")
    }

    setState("idle")
    setMessage(
      answer === "refused"
        ? "That passcode isn't right."
        : answer === "busy"
          ? TOO_MANY_TRIES
          : answer === "unset"
            ? "The studio passcode isn't set up on the server yet."
            : "Couldn't reach the studio. Check the connection and try again.",
    )
    if (answer === "refused") {
      setPasscode("")
      rattle()
    }
  }

  return (
    <div
      className={`login-stage flex min-h-screen flex-col items-center px-4 pb-12 font-sans text-on-surface ${
        state === "in" ? "is-leaving" : ""
      }`}
    >
      <div ref={passRef} className="login-pass w-full max-w-[340px]">
        <div className="login-strap" aria-hidden>
          <span>{STRAP}</span>
        </div>
        <div className="login-clip" aria-hidden />

        <form
          onSubmit={submit}
          className="login-card relative overflow-hidden rounded-xl"
          aria-labelledby="login-title"
        >
          <span className="login-slot" aria-hidden />

          <div className="login-band">
            <h1 id="login-title" className="login-band-title">
              All access
            </h1>
            <span className="label-mono-xs text-on-primary/80">Studio</span>
          </div>

          <div className="flex flex-col items-center gap-3 px-6 pb-5 pt-6">
            <img
              src={avatarFailed ? profilePic : AVATAR_URL}
              onError={() => setAvatarFailed(true)}
              alt=""
              className="avatar h-24 w-24 object-cover"
            />
            <img
              src={tagPic}
              alt="Tibbie X"
              width={640}
              height={369}
              className="tag-mark -mt-1 h-auto w-44"
            />
            <p className="label-mono text-on-surface-variant">
              Backstage <span className="text-tertiary-fixed">·</span> Back
              office
            </p>

            {/* For password managers: they file a password under a name. */}
            <input
              type="text"
              name="username"
              autoComplete="username"
              value="Tibbie X Studio"
              readOnly
              tabIndex={-1}
              aria-hidden
              className="sr-only"
            />

            <div className="mt-2 w-full space-y-1.5">
              <Field
                type="password"
                name="password"
                label="Studio passcode"
                placeholder="Studio passcode"
                autoComplete="current-password"
                value={passcode}
                onChange={(v) => {
                  setPasscode(v)
                  if (message) setMessage("")
                }}
                invalid={Boolean(message)}
                describedBy="login-message"
                required={false}
              />
              <p
                id="login-message"
                role="status"
                className={`body-xs min-h-[1.25em] ${
                  message ? "text-error" : "text-on-surface-variant"
                }`}
              >
                {message || "Asked once on each device you post from."}
              </p>
            </div>

            <div ref={buttonRef} className="w-full">
              <Button type="submit" icon={KeyRound} disabled={state !== "idle"}>
                {state === "checking"
                  ? "Checking…"
                  : state === "in"
                    ? "Come on in"
                    : "Let me in"}
              </Button>
            </div>
          </div>

          <div className="login-foot label-mono-xs">
            <span>No. 0001</span>
            <span>Not transferable</span>
          </div>

          {state === "in" && (
            <span className="login-stamp" aria-hidden>
              On stage
            </span>
          )}
        </form>
      </div>

      <a
        href="/"
        className="body-xs-bold mt-8 flex items-center gap-glyph text-on-surface-variant transition-colors hover:text-on-surface"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to the site
      </a>
    </div>
  )
}
