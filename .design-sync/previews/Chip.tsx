import { Chip } from "tibbiex-ui"

const noop = () => {}

export const AmountGrid = () => (
  <div className="grid w-96 grid-cols-4 gap-cluster">
    <Chip pressed={false} onClick={noop}>
      $5
    </Chip>
    <Chip pressed onClick={noop}>
      $10
    </Chip>
    <Chip pressed={false} onClick={noop}>
      $25
    </Chip>
    <Chip pressed={false} onClick={noop}>
      $50
    </Chip>
  </div>
)

export const SizesWithSoldOut = () => (
  <div className="grid w-80 grid-cols-4 gap-cluster">
    <Chip pressed={false} onClick={noop}>
      S
    </Chip>
    <Chip pressed onClick={noop}>
      M
    </Chip>
    <Chip pressed={false} onClick={noop}>
      L
    </Chip>
    <Chip pressed={false} onClick={noop} disabled label="XL, sold out">
      XL
    </Chip>
  </div>
)
