import { CONTACT_EMAIL } from "./site"

/* "Get told first": the sign-up on the Home tab, and the restock alert in the
   product modal. There is no mailing list behind either yet -- no provider is
   connected -- so both hand off to the visitor's mail client the way the
   booking form does, and the inbox is the list until one exists. The flag keeps
   that on the go-live checklist. When a list provider is connected, swap
   signupMailtoUrl for a call to it and drop the flag. */
export const NEWSLETTER = {
  title: "Get told first",
  blurb:
    "Numbered runs go in a day and show dates land here before anywhere else.",
  cadence: "About once a month. Leave whenever.",
  topics: ["Show dates", "Numbered drops", "Readings", "Podcast"],
  staged: true as const,
}

function mailto(subject: string, lines: string[]) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`
}

export function signupMailtoUrl(email: string, topics: string[]) {
  return mailto("Add me to the list", [
    `Email: ${email.trim()}`,
    `Tell me about: ${topics.length ? topics.join(", ") : "everything"}`,
  ])
}

export function restockMailtoUrl(email: string, item: string, size?: string) {
  const what = size ? `${item} (${size})` : item
  return mailto(`Restock alert — ${what}`, [
    `Email: ${email.trim()}`,
    `Tell me when ${what} is back.`,
  ])
}
