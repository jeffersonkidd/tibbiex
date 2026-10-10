import { PolaroidStack } from "tibbiex-ui"

export const ShopPrints = () => (
  <div className="w-[34rem]">
    <PolaroidStack
      photos={[
        {
          src: "https://media.tibbiex.studio/studio/tibbie-painting.8d0be710.jpg",
          alt: "Tibbie X at her desk painting red lettering onto a sketch.",
          caption: "in the studio",
        },
        {
          src: "https://media.tibbiex.studio/shop/art/vampire-cats/artwork.76622c0e.jpg",
          alt: "Two red cats in spiked collars.",
          caption: "Vampire Cats",
        },
      ]}
      label="Browse the art shelf"
      onOpen={() => {}}
    />
  </div>
)
