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

/* The same flag, set without the query string: the studio calls this on load,
   since whoever opens the studio is the owner, and their visits -- including
   the test taps on the links it makes -- should not count. Returns whether
   this call is what set it, so the studio can say so once. */
export function excludeThisBrowser() {
  try {
    if (localStorage.getItem(ANALYTICS_OPT_OUT_KEY) === "1") return false
    localStorage.setItem(ANALYTICS_OPT_OUT_KEY, "1")
    return true
  } catch {
    return false
  }
}

/* Google Analytics 4, beside Vercel's: it reads the utm_source tags on the
   bio links on the free plan, which is what it is here for. The tag is
   injected rather than written into index.html so the opt-out above can keep
   it from loading at all, and production-only so dev visits never count. The
   /preview page has its own entry and never calls this. */
const GA_ID = "G-DSD6P5JGEN"

declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

/* gtag.js reads the arguments object itself, not an array of it. */
function gtag(..._args: unknown[]) {
  window.dataLayer?.push(arguments)
}

export function startGoogleAnalytics() {
  if (!import.meta.env.PROD || analyticsOptedOut()) return
  window.dataLayer = window.dataLayer || []
  gtag("js", new Date())
  gtag("config", GA_ID)
  const script = document.createElement("script")
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.append(script)
}

/* There is no router, so GA sees one page; this is how it learns which tab
   was opened. A no-op when GA never started. */
export function trackTab(tab: string) {
  gtag("event", "tab_view", { tab })
}
