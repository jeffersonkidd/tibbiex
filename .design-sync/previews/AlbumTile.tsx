import { AlbumTile } from "tibbiex-ui"

const noop = () => {}

export const Single = () => (
  <div className="w-64">
    <AlbumTile
      album={{
        id: "d1",
        album: "Constructs of the State",
        band: "Leftover Crack",
        year: "2015",
        role: "Bass, Vocals",
        image:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
      }}
      onOpen={noop}
    />
  </div>
)

export const Grid = () => (
  <div className="grid w-[34rem] grid-cols-2 gap-stack">
    <AlbumTile
      album={{
        id: "d2",
        album: "Never Rest in Peace",
        band: "Star Fucking Hipsters",
        year: "2009",
        role: "Guest Vocals",
        image:
          "https://images.unsplash.com/photo-1526394931762-90052e97b376?q=80&w=400&auto=format&fit=crop",
      }}
      onOpen={noop}
    />
    <AlbumTile
      album={{
        id: "d3",
        album: "Fuck World Trade",
        band: "Leftover Crack",
        year: "2004",
        role: "Bass",
        image:
          "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=400&auto=format&fit=crop",
      }}
      onOpen={noop}
    />
  </div>
)
