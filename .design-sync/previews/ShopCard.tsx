import { ShopCard } from "tibbiex-ui"

const noop = () => {}

export const Formats = () => (
  <div className="w-64">
    <ShopCard
      item={{
        id: "a-vampire-cats",
        item: "Vampire Cats",
        image:
          "https://media.tibbiex.studio/shop/art/vampire-cats/artwork.76622c0e.jpg",
        alt: "Two red cats in spiked collars, fangs out, in teal waves and red glass.",
        formats: [
          { id: "sticker", label: "Sticker", price: 5 },
          { id: "patch", label: "Patch", price: 10 },
          { id: "tee", label: "Men’s tee", price: 35 },
        ],
      }}
      onOpen={noop}
    />
  </div>
)

/* Cards sit in a two-column grid on the Buy tab. */
export const Grid = () => (
  <div className="grid w-[34rem] grid-cols-2 gap-stack">
    <ShopCard
      item={{
        id: "ry-the-next-generation",
        item: "The Next Generation",
        image:
          "https://media.tibbiex.studio/shop/bands/reagan-youth/the-next-generation/artwork.5a3e32a7.jpg",
        formats: [
          { id: "sticker", label: "Sticker", price: 5 },
          { id: "tee", label: "Men’s tee", price: 35 },
        ],
      }}
      onOpen={noop}
    />
    <ShopCard
      item={{
        id: "a-vampire-cats-tee",
        item: "Vampire Cats — Women’s tee",
        image:
          "https://media.tibbiex.studio/shop/art/vampire-cats/womens-tee.08516bec.jpg",
        price: 35,
      }}
      onOpen={noop}
    />
  </div>
)
