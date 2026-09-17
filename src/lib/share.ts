import { toast } from "sonner"

import { SITE_URL } from "../content/site"

export async function copyLink() {
  try {
    await navigator.clipboard.writeText(SITE_URL)
  } catch {
    /* clipboard unavailable — silently ignore */
  }
  toast.success("Bio link copied. Spread the word.")
}
