import { DetailList } from "tibbiex-ui"

export const Highlights = () => (
  <div className="w-96">
    <DetailList
      items={[
        { label: "Releases", detail: 'Demo tape · split 7"' },
        { label: "Live", detail: "East coast DIY circuit" },
        { label: "Writing", detail: "Co-writes the full set" },
      ]}
    />
  </div>
)

export const WhatYouGet = () => (
  <div className="w-96">
    <DetailList
      items={[
        { label: "Blank", detail: "Gildan" },
        { label: "Cut", detail: "Men’s, classic fit" },
        { label: "Ships", detail: "US only, flat rate" },
      ]}
    />
  </div>
)
