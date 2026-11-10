import { useEffect, useState } from "react"
import { ArrowUpRight, Lock } from "lucide-react"
import { Toaster, toast } from "sonner"

import { excludeThisBrowser } from "../lib/analytics"
import FilterPill from "../ui/controls/FilterPill"
import MagicDust from "../ui/MagicDust"
import AvatarMaker from "./avatar/AvatarMaker"
import LinkMaker from "./links/LinkMaker"
import Login from "./Login"
import { checkPasscode, savePasscode, savedPasscode } from "./passcode"
import SheetDesk from "./products/SheetDesk"

/* The modules, in the order they were built. The id is the URL hash, so
   /dashboard#avatar opens straight onto that module and a bookmark keeps it. */
const MODULES = [
  { id: "links", label: "Link Maker", Module: LinkMaker },
  { id: "avatar", label: "Avatar", Module: AvatarMaker },
  { id: "products", label: "Products", Module: SheetDesk },
] as const

type ModuleId = (typeof MODULES)[number]["id"]

function fromHash(): ModuleId {
  const id = window.location.hash.slice(1)
  return MODULES.find((m) => m.id === id)?.id ?? MODULES[0].id
}

/* The studio at /dashboard: the door first, then the back office behind it.

   A device that already holds the passcode walks straight in, and the door
   is asked again quietly in the background, so a passcode changed on the
   server sends this device back to the door instead of failing its next
   write. The door is a courtesy, not the lock: every write still carries the
   passcode and its endpoint checks it (api/avatar.ts, api/products.ts). */
export default function Studio() {
  const [inside, setInside] = useState(() => Boolean(savedPasscode()))

  useEffect(() => {
    const saved = savedPasscode()
    if (!saved) return
    checkPasscode(saved).then((answer) => {
      if (answer !== "refused") return
      savePasscode(null)
      setInside(false)
      toast.error("The studio passcode changed. Type the new one.")
    })
  }, [])

  function enter(note?: string) {
    setInside(true)
    if (note) toast(note)
  }

  function lock() {
    savePasscode(null)
    setInside(false)
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      {inside ? <BackOffice onLock={lock} /> : <Login onIn={enter} />}
      <MagicDust />
    </>
  )
}

/* The back office: the site owner's tools, one module at a time, in the
   site's own skin so it feels like the back of the same shop rather than
   somebody else's admin panel. A second Vite entry (dashboard.html), so the
   public page ships none of it. */
function BackOffice({ onLock }: { onLock: () => void }) {
  const [active, setActive] = useState<ModuleId>(fromHash)

  useEffect(() => {
    const onHash = () => setActive(fromHash())
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  function open(id: ModuleId) {
    history.replaceState(null, "", `#${id}`)
    setActive(id)
  }

  const { Module } = MODULES.find((m) => m.id === active)!

  /* Whoever gets past the door is the owner: leave this browser out of the
     analytics, so their own test taps never pollute the numbers. */
  useEffect(() => {
    if (excludeThisBrowser()) {
      toast("This browser is now left out of the site's analytics.")
    }
  }, [])

  return (
    <div className="studio-enter flex min-h-screen justify-center pb-20 font-sans text-on-surface selection:bg-tertiary/20">
      <div className="w-full min-w-0 max-w-[600px] space-y-stack px-4 pt-6 sm:px-6">
        <header className="surface flex items-center justify-between rounded-lg p-3">
          <span className="label-mono px-2 text-on-surface-variant">
            Tibbie X <span className="text-tertiary">Studio</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLock}
              title="Forget the passcode on this device"
              className="flex items-center gap-glyph rounded-md border border-outline-variant bg-surface-container-low px-3 py-2 body-xs-bold text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface"
            >
              <Lock className="h-4 w-4" />
              Lock
            </button>
            <a
              href="/"
              className="flex items-center gap-glyph rounded-md border border-outline-variant bg-surface-container-low px-3 py-2 body-xs-bold text-on-surface transition-colors hover:bg-surface-container-highest"
            >
              View site
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </header>

        <div className="px-1 pt-2">
          <h1 className="heading-xl">Back office</h1>
          <p className="body-small mt-1 text-on-surface-variant">
            Tools for the site, built one at a time.
          </p>
        </div>

        <nav
          aria-label="Modules"
          className="surface flex gap-1 rounded-lg bg-surface-container-low/50 p-strip"
        >
          {MODULES.map((m) => (
            <FilterPill
              key={m.id}
              label={m.label}
              active={m.id === active}
              onClick={() => open(m.id)}
            />
          ))}
        </nav>

        <main>
          <Module />
        </main>
      </div>
    </div>
  )
}
