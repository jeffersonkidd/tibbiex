import { Separator } from "tibbiex-ui"

/* In normal flow a rule opens its own room with `space`. */
export const InFlow = () => (
  <section className="surface w-96 rounded-lg p-panel">
    <p className="body-small">Bass and co-vocals in the NYC four-piece.</p>
    <Separator space="sm" />
    <p className="body-small text-muted-foreground">East coast DIY circuit</p>
  </section>
)

/* Inside a gap stack it takes no margin of its own. */
export const InStack = () => (
  <section className="surface flex w-96 flex-col gap-part rounded-lg p-panel">
    <p className="body-small">Contribute $10</p>
    <Separator />
    <p className="body-small text-muted-foreground">Top contributors</p>
  </section>
)
