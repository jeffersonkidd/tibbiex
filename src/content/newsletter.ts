/* "Join my Newsletter": the sign-up on the Home tab, and the restock alert in the
   product modal. Both used to hand off to the visitor's mail client; the
   sign-up now posts to api/subscribe.ts, which puts the address in a Resend
   audience, and the restock alert posts to api/contact.ts.

   `topics` is mirrored in api/subscribe.ts, which cannot import this file --
   change the two together, or a new topic is silently dropped from the list
   entry. */
export const NEWSLETTER = {
  title: "Join my Newsletter",
  blurb: "Tour dates, releases, and personal stuff.",
  /* The fine print under the email field. Off for now; the copy is kept so
     switching `enabled` back on is all it takes. */
  cadence: { text: "About once a month. Leave whenever.", enabled: false },
  /* Whether the turning "!" sits beside the title while the sign-up is the
     featured block. Off; the sigil still pulses. */
  spark: false,
  topics: ["Show dates", "Numbered drops", "Readings", "Podcast"],
}
