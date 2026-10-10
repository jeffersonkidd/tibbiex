import { ShowRow } from "tibbiex-ui"

/* status "Tickets" renders the brand button; anything else is an amber badge. */
export const Tickets = () => (
  <div className="w-[34rem]">
    <ShowRow
      show={{
        id: "s1",
        venue: "Saint Vitus Bar",
        date: "Fri, Nov 14",
        city: "Brooklyn, NY",
        status: "Tickets",
      }}
    />
  </div>
)

export const Column = () => (
  <div className="w-[34rem] space-y-stack">
    <ShowRow
      show={{
        id: "s2",
        venue: "ABC No Rio",
        date: "Sat, Nov 22",
        city: "New York, NY",
        status: "Sold out",
      }}
    />
    <ShowRow
      show={{
        id: "s3",
        venue: "Pyramid Club",
        date: "Sun, Dec 7",
        city: "New York, NY",
        status: "Door only",
      }}
    />
  </div>
)
