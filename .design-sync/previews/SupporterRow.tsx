import { SupporterRow } from "tibbiex-ui"

export const Leaderboard = () => (
  <div className="flex w-96 flex-col gap-cluster">
    <SupporterRow
      rank={1}
      supporter={{ name: "Kat", msg: "for the van, obviously", amount: 50 }}
    />
    <SupporterRow
      rank={2}
      supporter={{ name: "Dmitri", msg: "see you at Vitus", amount: 25 }}
    />
    <SupporterRow
      rank={3}
      supporter={{ name: "Rosa", msg: "keep it loud", amount: 10 }}
    />
  </div>
)
