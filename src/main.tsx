import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { warnStagedContent } from "./content/status"
import { startGoogleAnalytics } from "./lib/analytics"
import "./styles/index.css"

/* Dev-only: list any placeholder content still shown as real. No-op in the
   production build. */
warnStagedContent()
startGoogleAnalytics()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
