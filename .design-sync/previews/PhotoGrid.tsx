import { PhotoGrid } from "tibbiex-ui"

const GASH = "https://media.tibbiex.studio/portfolio/gash"

export const Gash = () => (
  <div className="w-[34rem]">
    <PhotoGrid
      photos={[
        {
          src: `${GASH}/promo.d4c42f53.jpg`,
          alt: "GASH promo shot on a red-lit stage",
          width: 960,
          height: 960,
        },
        {
          src: `${GASH}/live.6bb7cf5e.jpg`,
          alt: "Black-and-white live shot of GASH mid-set",
          width: 905,
          height: 905,
        },
        {
          src: `${GASH}/flyer.aa21984f.jpg`,
          alt: "Show flyer at North Star Bar",
          width: 685,
          height: 960,
        },
        {
          src: `${GASH}/artwork.832a46f8.jpg`,
          alt: "GASH artwork — a screamed face in red and black",
          width: 960,
          height: 540,
        },
      ]}
      onOpen={() => {}}
    />
  </div>
)
