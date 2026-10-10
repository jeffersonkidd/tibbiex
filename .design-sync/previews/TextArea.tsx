import { TextArea } from "tibbiex-ui"

export const Default = () => (
  <div className="w-96">
    <TextArea name="message" placeholder="Message" label="Message" />
  </div>
)

export const Short = () => (
  <div className="w-96">
    <TextArea
      placeholder="Anything we should know?"
      label="Notes"
      rows={2}
      size="sm"
    />
  </div>
)
