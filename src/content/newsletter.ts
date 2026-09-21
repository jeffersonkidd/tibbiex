/* "Get told first": the sign-up on the Home tab, and the restock alert in the
   product modal. Both used to hand off to the visitor's mail client; the
   sign-up now posts to api/subscribe.ts, which puts the address in a Resend
   audience, and the restock alert posts to api/contact.ts.

   `topics` is mirrored in api/subscribe.ts, which cannot import this file --
   change the two together, or a new topic is silently dropped from the list
   entry. */
export const NEWSLETTER = {
  title: "Get told first",
  blurb:
    "Numbered runs go in a day and show dates land here before anywhere else.",
  cadence: "About once a month. Leave whenever.",
  topics: ["Show dates", "Numbered drops", "Readings", "Podcast"],
}
