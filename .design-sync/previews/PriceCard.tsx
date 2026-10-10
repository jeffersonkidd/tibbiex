import { PriceCard } from "tibbiex-ui"

const noop = () => {}

export const Selected = () => (
  <div className="w-56">
    <PriceCard
      eyebrow="60 min"
      name="Full Hour"
      amount="$80"
      unit="flat"
      blurb="The whole board, front to back."
      includes={[
        "Celtic cross",
        "Voice note recap",
        "One follow-up card by text",
      ]}
      flag="Most asked for"
      pressed
      onClick={noop}
    />
  </div>
)

export const Unselected = () => (
  <div className="w-56">
    <PriceCard
      eyebrow="30 min"
      name="Half Hour"
      amount="$45"
      unit="flat"
      blurb="One question, cut clean."
      includes={["Three-card spread", "Voice note recap"]}
      pressed={false}
      onClick={noop}
    />
  </div>
)

export const TierRow = () => (
  <div className="grid w-[46rem] grid-cols-3 gap-cluster">
    <PriceCard
      eyebrow="30 min"
      name="Half Hour"
      amount="$45"
      unit="flat"
      blurb="One question, cut clean."
      includes={["Three-card spread", "Voice note recap"]}
      pressed={false}
      onClick={noop}
    />
    <PriceCard
      eyebrow="60 min"
      name="Full Hour"
      amount="$80"
      unit="flat"
      blurb="The whole board, front to back."
      includes={[
        "Celtic cross",
        "Voice note recap",
        "One follow-up card by text",
      ]}
      flag="Most asked for"
      pressed
      onClick={noop}
    />
    <PriceCard
      eyebrow="90 min"
      name="Hour and a Half"
      amount="$110"
      unit="flat"
      blurb="Deep read, nobody watching the clock."
      includes={[
        "Two spreads, your pick",
        "Voice note recap",
        "Written summary",
      ]}
      pressed={false}
      onClick={noop}
    />
  </div>
)
