import { useEffect, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { Toaster, toast } from "sonner"

import { excludeThisBrowser } from "../lib/analytics"
import FilterPill from "../ui/controls/FilterPill"
import MagicDust from "../ui/MagicDust"
import AvatarMaker from "./avatar/AvatarMaker"
import LinkMaker from "./links/LinkMaker"
import ProductsModule from "./products/ProductsModule"

/* The modules, in the order they were built. The id is the URL hash, so
   /studio#avatar opens straight onto that module and a bookmark keeps it. */
const MODULES = [
  { id: "links", label: "Link Maker", Module: LinkMaker },
  { id: "avatar", label: "Avatar", Module: AvatarMaker },
  { id: "products", label: "Products", Module: ProductsModule },
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
   only makes links that are public the moment they are pasted. Avatar is
   the first module that writes to the live site, so the gate sits on its
   write, not the door: a passcode its endpoint checks (api/avatar.ts). */
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
    <div className="flex min-h-screen justify-center pb-20 font-sans text-foreground selection:bg-accent-soft">
      <Toaster position="top-center" richColors />

      <div className="w-full min-w-0 max-w-[600px] space-y-stack px-4 pt-6 sm:px-6">
        <header className="surface flex items-center justify-between rounded-lg p-3">
          <span className="label-mono px-2 text-muted-foreground">
            Tibbie X <span className="text-accent">Studio</span>
          </span>
          <a
            href="/"
            className="flex items-center gap-glyph rounded-md border border-border bg-card px-3 py-2 body-xs-bold text-foreground transition-colors hover:bg-muted"
          >
            View site
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </header>

        <div className="px-1 pt-2">
          <h1 className="heading-xl">Back office</h1>
          <p className="body-small mt-1 text-muted-foreground">
            Tools for the site, built one at a time.
          </p>
        </div>

        <nav
          aria-label="Modules"
          className="surface flex gap-1 rounded-lg bg-card/50 p-strip"
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
