// Popup-side whitelist domain helpers.
//
// More aggressive than the options-page normaliser (src/utils/whitelist-
// normalize.ts) because the quick-add UX in the popup should turn
// "www.example.com" into "example.com" so the whitelist entry matches every
// subdomain. The options-page normaliser deliberately preserves `www.` for
// users who type domain entries by hand.

/**
 * Normalise a hostname/URL for the popup's quick-add button:
 *   - strip protocol if a URL was pasted
 *   - strip path / query / fragment
 *   - strip a leading "www."
 *   - lowercase
 */
export function normalizeQuickWhitelistDomain(value: string): string {
  // Lowercase FIRST so the protocol / www stripping below also catches
  // mixed-case inputs like "HTTPS://WWW.EXAMPLE.COM/". The legacy bundled
  // popup lowercased only at the end, which silently leaked "www." into
  // whitelist entries for uppercase pastes.
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
}

/**
 * Returns true if `domain` matches an entry in the whitelist either exactly
 * or as a subdomain (`api.x.com` matches whitelist entry `x.com`). Domain
 * comparisons are case-sensitive — callers are expected to have normalised
 * both sides via `normalizeQuickWhitelistDomain`.
 */
export function isDomainInWhitelist(domain: string, whitelist: string[]): boolean {
  return whitelist.some((item) => domain === item || domain.endsWith("." + item));
}
