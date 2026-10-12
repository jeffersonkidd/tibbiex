import { SITE_URL } from "../content/site"

/* The tagged bio link: SITE_URL with the three UTM parameters Google
   Analytics sorts visits by. The studio's Link Maker builds one per profile,
   so a visit from the Instagram bio and one from the TikTok bio stop arriving
   as the same "direct" visit.

     utm_source    which app sent them        instagram
     utm_medium    what kind of link it was   social
     utm_campaign  where on the profile       bio

   Pure: no DOM, no storage. The studio renders the pieces; this only spells
   them. */
export type Tag = {
  source: string
  medium: string
  campaign: string
}

export type TagPart = keyof Tag

/* The order the parameters appear in, and the order the anatomy reads them. */
export const TAG_PARTS: TagPart[] = ["source", "medium", "campaign"]

/* Lowercase, hyphens for anything that is not a letter or digit, no hyphen
   at either end. GA treats "Bio" and "bio" as two campaigns, so everything
   that reaches a parameter goes through here first. */
export function slug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
}

/* The bare address the tags hang off: SITE_URL with exactly one trailing
   slash, so the link reads tibbiex.studio/?utm_... the way browsers print it. */
export const BASE_URL = `${SITE_URL.replace(/\/+$/, "")}/`

export function buildLink(tag: Tag) {
  const params = new URLSearchParams()
  for (const part of TAG_PARTS) params.set(`utm_${part}`, slug(tag[part]))
  return `${BASE_URL}?${params}`
}
