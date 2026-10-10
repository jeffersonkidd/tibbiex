import { TabItem } from "tibbiex-ui"

const noop = () => {}

/* The main tab strip: items share the strip evenly. */
export const TabStrip = () => (
  <nav className="surface flex w-[34rem] gap-cluster rounded-lg bg-card/50 p-strip">
    <TabItem label="Home" active onSelect={noop} />
    <TabItem label="Buy" active={false} onSelect={noop} />
    <TabItem label="Tour" active={false} onSelect={noop} />
  </nav>
)

export const SecondActive = () => (
  <nav className="surface flex w-[34rem] gap-cluster rounded-lg bg-card/50 p-strip">
    <TabItem label="Home" active={false} onSelect={noop} />
    <TabItem label="Buy" active onSelect={noop} />
  </nav>
)
