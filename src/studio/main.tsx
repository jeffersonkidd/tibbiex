import React from "react"
import ReactDOM from "react-dom/client"
import Studio from "./Studio"
import "../styles/index.css"
import "../styles/studio.css"

/* The studio's own entry (studio.html). No analytics and no staged-content
   checklist: this page is for the owner, not for visitors. */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Studio />
  </React.StrictMode>,
)
