import { PanelHeader } from "tibbiex-ui"
import { Flame, Mail } from "lucide-react"

/* The top of a Home panel, inside its .surface panel. */
export const WithBadge = () => (
  <section className="surface w-[34rem] rounded-lg p-panel">
    <PanelHeader
      icon={Flame}
      title="Van Fund"
      sub="Get the band to the next show"
      badge="62% there"
    />
  </section>
)

/* lit = the featured block on the page; the panel itself wears .featured. */
export const Lit = () => (
  <section className="surface featured w-[34rem] rounded-lg p-panel">
    <PanelHeader
      icon={Mail}
      title="Get told first"
      sub="New prints, shows and readings — before anyone else"
      lit
    />
  </section>
)
