import { Avatar } from "tibbiex-ui"

const PORTRAIT = "https://tibbiex.studio/tibbie-portrait.jpg"

/* The root is a full-width block (the dot pins to its corner), so give it a
   shrink-wrapping parent -- the profile card gets one from its items-start column. */
export const Default = () => (
  <div className="w-fit">
    <Avatar src={PORTRAIT} alt="Tibbie X" />
  </div>
)

/* `live` is the dot's tooltip; omit it (or pass null) when she is not live. */
export const Live = () => (
  <div className="w-fit">
    <Avatar src={PORTRAIT} alt="Tibbie X" live="Live now on TikTok" />
  </div>
)
