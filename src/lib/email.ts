/* Good enough to catch a typo before anything leaves the page. The real test
   is whatever receives the address: Stripe, or a mail client. */
export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}
