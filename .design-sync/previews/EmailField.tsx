import { EmailField } from "tibbiex-ui"

const noop = () => {}

export const Empty = () => (
  <div className="w-80">
    <EmailField value="" onChange={noop} error={null} />
  </div>
)

export const WithError = () => (
  <div className="w-80">
    <EmailField
      value="kat@squat"
      onChange={noop}
      error="That email doesn't look right."
    />
  </div>
)

export const Small = () => (
  <div className="w-80">
    <EmailField value="kat@squat.nyc" onChange={noop} error={null} size="sm" />
  </div>
)
