import { Field } from "tibbiex-ui"

export const Default = () => (
  <div className="w-80">
    <Field placeholder="Name" type="text" name="name" label="Name" />
  </div>
)

export const Filled = () => (
  <div className="w-80">
    <Field
      placeholder="Email"
      type="email"
      label="Email"
      value="kat@squat.nyc"
      onChange={() => {}}
    />
  </div>
)

export const Invalid = () => (
  <div className="w-80">
    <Field
      placeholder="Email"
      type="email"
      label="Email"
      value="kat@"
      onChange={() => {}}
      invalid
    />
  </div>
)

export const SmallInARow = () => (
  <div className="flex w-96 gap-cluster">
    <div className="flex-1">
      <Field
        placeholder="name@email.com"
        type="email"
        label="Email"
        size="sm"
      />
    </div>
  </div>
)
