import { Lightbox } from "tibbiex-ui"

const GASH = "https://media.tibbiex.studio/portfolio/gash"

/* Lightbox is a fixed, full-viewport modal; the stage gives it room inside
   a preview card, where there is no viewport to fill. */
export const Gallery = () => (
  <div className="h-[52rem]">
    <Lightbox
      state={{
        index: 1,
        photos: [
          {
            src: `${GASH}/promo.d4c42f53.jpg`,
            alt: "GASH promo shot on a red-lit stage",
            width: 960,
            height: 960,
          },
          {
            src: `${GASH}/artwork.832a46f8.jpg`,
            alt: "GASH artwork — a screamed face in red and black beside the band logo",
            width: 960,
            height: 540,
          },
          {
            src: `${GASH}/live.6bb7cf5e.jpg`,
            alt: "Black-and-white live shot of GASH mid-set",
            width: 905,
            height: 905,
          },
        ],
      }}
      onChange={() => {}}
      onClose={() => {}}
    />
  </div>
)
