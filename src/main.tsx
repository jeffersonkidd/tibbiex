import React from "react"
import ReactDOM from "react-dom/client"
import { injectSpeedInsights } from "@vercel/speed-insights"
import App from "./App"
import { warnStagedContent } from "./content-status"
import "./index.css"

/* Dev-only: list any placeholder content still shown as real. No-op in the
   production build. */
warnStagedContent()

/* Initialize Vercel Speed Insights */
injectSpeedInsights()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)