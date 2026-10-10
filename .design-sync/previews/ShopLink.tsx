import { ShopLink } from "tibbiex-ui"

/* Closes a portfolio section; it counts the band's shelf itself and renders
   nothing for a band with no shop items. */
export const ReaganYouth = () => (
  <div className="w-[34rem]">
    <ShopLink
      entry={{
        id: "reagan-youth",
        band: "Reagan Youth",
        role: "Bass",
        years: "2023 — present",
        blurb: "The current lineup.",
        highlights: [],
        photos: [],
      }}
      onOpen={() => {}}
    />
  </div>
)
