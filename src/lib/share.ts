import { toast } from "sonner"

import { SITE_URL } from "../content/site"

// The phone's own share sheet. Absent on most desktop browsers, so the share
// modal only offers it where this is true.
export function canShareNatively() {
  return (
    typeof navigator !== "undefined" && typeof navigator.share === "function"
  )
}

export async function shareLink() {
  try {
    await navigator.share({ url: SITE_URL })
  } catch (error) {
    // Closing the sheet rejects with AbortError; that is a choice, not a fault.
    if (error instanceof DOMException && error.name === "AbortError") return
    await copyLink()
  }
}

export async function copyLink() {
  try {
    await navigator.clipboard.writeText(SITE_URL)
  } catch {
    toast.error(`Couldn't copy the link. It's ${SITE_URL}`)
    return
  }
  toast.success("Bio link copied. Spread the word.")
}
