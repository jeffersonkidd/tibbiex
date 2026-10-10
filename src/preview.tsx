import React from "react"
import ReactDOM from "react-dom/client"
import PortraitPreview from "./PortraitPreview"
import "./styles/index.css"

/* The entry for preview/index.html -- the profile picture preview page. It
   mounts neither analytics nor the spark canvas: it is a tool, not the site. */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PortraitPreview />
  </React.StrictMode>,
)
