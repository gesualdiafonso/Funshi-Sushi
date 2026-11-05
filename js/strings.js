/**
 * All customer-facing text used by JavaScript (NFR-14).
 * Text that lives in HTML stays in HTML; this module holds text the scripts
 * generate (announcements, status, errors).
 *
 * Working language: English, until {{SITE_LANGUAGE}} is confirmed. Translating
 * the site means translating this file and the HTML pages — no code changes.
 *
 * Use `{name}` for interpolation. Plurals: give an object keyed by
 * Intl.PluralRules categories ('one', 'other', …) and pass `count`.
 */

const STRINGS = {
  'nav.open': 'Open menu',
  'nav.close': 'Close menu',
  'cart.button': { one: 'Cart, {count} item', other: 'Cart, {count} items' },
  'app.startFailed': 'Some features could not load. You can still order by WhatsApp.',
  'overlay.close': 'Close',

  // Opening hours (UX_ARCHITECTURE §5.3)
  'hours.open': 'Open now · until {time}',
  'hours.closingSoon': 'Closing soon · until {time}',
  'hours.closedOpensToday': 'Closed now · opens today at {time}',
  'hours.closedOpensTomorrow': 'Closed now · opens tomorrow at {time}',
  'hours.closedOpensOn': 'Closed now · opens {day} at {time}',
  'hours.closed': 'Closed',
  'hours.closedDay': 'Closed',
  'hours.caption': 'Opening hours',
  'hours.shiftSeparator': ', ',

  // Menu items
  'menu.pieces': { one: '{count} pc', other: '{count} pcs' },
  'menu.piecesRange': '{min}–{max} pcs',
  'menu.priceTbc': 'Price to be confirmed',
  'menu.priceFrom': 'from {price}',
  'menu.viewOnMenuName': ' about {name}',
  'menu.unavailable': 'Unavailable today',
  'menu.all': 'All',
  'menu.count': { one: '{count} dish', other: '{count} dishes' },
  'menu.matching': 'matching “{query}”',
  'menu.inCategory': 'in {category}',
  'menu.withTags': '· {tags}',
  'menu.emptyText': 'Nothing on the menu {filters}.',

  // Product details
  'dish.allergensNone': 'None listed.',
  'dish.allergensUnknown': 'Not listed. Ask the restaurant.',

  // Contact
  'contact.whatsappLabel': 'Message us on WhatsApp',
  'contact.newTab': '(opens in a new tab)',
};

const pluralRules = new Intl.PluralRules('en');

/**
 * Get a string by key, with `{param}` replacement.
 * Unknown keys return the key itself so missing text is visible during development.
 * @param {string} key
 * @param {Record<string, string | number>} [params]
 * @returns {string}
 */
export function t(key, params = {}) {
  let entry = STRINGS[key];
  if (entry === undefined) {
    console.warn(`[strings] Missing string: ${key}`);
    return key;
  }
  if (typeof entry === 'object') {
    const category = pluralRules.select(Number(params.count ?? 0));
    entry = entry[category] ?? entry.other;
  }
  return entry.replace(/\{(\w+)\}/g, (match, name) =>
    name in params ? String(params[name]) : match,
  );
}
