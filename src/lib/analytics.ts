/* Self-exclusion from Vercel Web Analytics.

   Vercel has no IP or geo filter for your own visits, and a VPN moves the exit
   IP around anyway, so the opt-out lives in this browser: load the site once
   with ?no-analytics to set the flag, ?analytics to clear it. beforeSend
   returning null drops the event before it leaves the page. The flag is
   per-browser, so repeat it on every device/profile you browse the site from. */
const ANALYTICS_OPT_OUT_KEY = "tibbiex:no-analytics"

export function analyticsOptedOut() {
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.has("no-analytics")) {
      localStorage.setItem(ANALYTICS_OPT_OUT_KEY, "1")
    } else if (params.has("analytics")) {
      localStorage.removeItem(ANALYTICS_OPT_OUT_KEY)
    }
    return localStorage.getItem(ANALYTICS_OPT_OUT_KEY) === "1"
  } catch {
    /* Private window or blocked storage — count the visit rather than break. */
    return false
  }
}