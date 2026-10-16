import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { warnStagedContent } from "./content/status"
import { startGoogleAnalytics } from "./lib/analytics"
import { loadShop } from "./lib/shop"
import "./styles/index.css"

/* Dev-only: list any placeholder content still shown as real. No-op in the
   production build. */
warnStagedContent()
startGoogleAnalytics()
/* Ask for the published shop before React renders, so it is often back by
   the time anyone opens the Buy tab. */
loadShop()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
