import { useEffect, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { Toaster, toast } from "sonner"

import { excludeThisBrowser } from "../lib/analytics"
import FilterPill from "../ui/controls/FilterPill"
import MagicDust from "../ui/MagicDust"
import AvatarMaker from "./avatar/AvatarMaker"
import LinkMaker from "./links/LinkMaker"
import ProductsDesk from "./products/ProductsDesk"

/* The modules, in the order they were built. The id is the URL hash, so
   /studio#avatar opens straight onto that module and a bookmark keeps it. */
const MODULES = [
  { id: "links", label: "Link Maker", Module: LinkMaker },
  { id: "avatar", label: "Avatar", Module: AvatarMaker },
  { id: "products", label: "Products", Module: ProductsDesk },
] as const

type ModuleId = (typeof MODULES)[number]["id"]

function fromHash(): ModuleId {
  const id = window.location.hash.slice(1)
  return MODULES.find((m) => m.id === id)?.id ?? MODULES[0].id
}

/* The back office at /studio: the site owner's tools, one module at a time,
   in the site's own skin so it feels like the back of the same shop rather
   than somebody else's admin panel.

   Light on purpose. It is a second Vite entry (studio.html), so the public
   page ships none of it, and there is no login to get in: Link Maker
   only makes links that are public the moment they are pasted. Avatar and
   Products write to the live site, so the gate sits on their writes, not
   the door: a passcode each endpoint checks (api/avatar.ts,
   api/products.ts). */
export default function Studio() {
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

  /* Whoever opens the studio is the owner: leave this browser out of the
     analytics, so their own test taps never pollute the numbers. */
  useEffect(() => {
    if (excludeThisBrowser()) {
      toast("This browser is now left out of the site's analytics.")
    }
  }, [])

  return (
    <div className="flex min-h-screen justify-center pb-20 font-sans text-on-surface selection:bg-tertiary/20">
      <Toaster position="top-center" richColors />

      <div className="w-full min-w-0 max-w-[600px] space-y-stack px-4 pt-6 sm:px-6">
        <header className="surface flex items-center justify-between rounded-lg p-3">
          <span className="label-mono px-2 text-on-surface-variant">
            Tibbie X <span className="text-tertiary">Studio</span>
          </span>
          <a
            href="/"
            className="flex items-center gap-glyph rounded-md border border-outline-variant bg-surface-container-low px-3 py-2 body-xs-bold text-on-surface transition-colors hover:bg-surface-container-highest"
          >
            View site
            <ArrowUpRight className="h-4 w-4" />
          </a>
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

      <MagicDust />
    </div>
  )
}
