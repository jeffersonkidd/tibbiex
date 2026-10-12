import { useEffect } from "react"
import { ArrowUpRight } from "lucide-react"
import { Toaster, toast } from "sonner"

import { excludeThisBrowser } from "../lib/analytics"
import MagicDust from "../ui/MagicDust"
import LinkMaker from "./links/LinkMaker"

/* The back office at /studio: the site owner's tools, one module at a time,
   in the site's own skin so it feels like the back of the same shop rather
   than somebody else's admin panel.

   Light on purpose. It is a second Vite entry (studio.html), so the public
   page ships none of it; it has no backend and no login, because nothing in
   it is secret yet -- the links it makes are public the moment they are
   pasted. The first module that touches something private brings the gate
   with it (see "Studio" in the README). */
export default function Studio() {
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
            Tools for the site, built one at a time. Start by pointing every
            profile home.
          </p>
        </div>

        <main>
          <LinkMaker />
        </main>
      </div>

      <MagicDust />
    </div>
  )
}
