/* The newsletter asks once. The first time a visitor taps a link row or a
   shop banner, App opens the sign-up before going where they tapped; after
   that, never again in this browser, joined or not. Blocked storage (a
   private window) falls back to once per page load, so it still can't nag. */
const ASKED_KEY = "tibbiex:newsletter-asked"

let askedThisLoad = false

export function shouldAskToJoin() {
  if (askedThisLoad) return false
  try {
    return localStorage.getItem(ASKED_KEY) !== "1"
  } catch {
    return true
  }
}

export function markAskedToJoin() {
  askedThisLoad = true
  try {
    localStorage.setItem(ASKED_KEY, "1")
  } catch {
    /* Remembered for this page load only. */
  }
}

/* A click that opens in a new tab or window -- cmd, ctrl, shift, a middle
   click -- leaves this page where it is, so it isn't interrupted. */
export const isPlainClick = (e: {
  button: number
  metaKey: boolean
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
}) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
