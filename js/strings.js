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

  // Cart (UX_ARCHITECTURE §7.3, §8)
  'cart.items': { one: '{count} item', other: '{count} items' },
  'cart.add': 'Add',
  'cart.added': 'Added',
  'cart.choose': 'Choose',
  'cart.addName': ' {name}',
  'cart.chooseName': ' a size of {name}',
  'cart.addWithPrice': 'Add · {price}',
  'cart.addedMessage': 'Added {qty} × {name}. Your order: {items}.',
  'cart.viewCart': 'View cart',
  'cart.dec': 'Decrease quantity of {name}',
  'cart.inc': 'Increase quantity of {name}',
  'cart.qtyChanged': '{name}: {qty}.',
  'cart.removed': 'Removed {name}.',
  'cart.undo': 'Undo',
  'cart.restored': 'Put back {name}.',
  'cart.cleared': 'Your order is empty.',
  'cart.clearConfirm': { one: 'Remove the {count} item in your order?', other: 'Remove all {count} items in your order?' },
  'cart.limitLine': 'You can order up to {max} of each dish.',
  'cart.limitOrder': 'You can order up to {max} items at a time.',
  'cart.notIncluded': 'Not included',
  'cart.lineUnavailable': 'Unavailable today. Remove it to continue.',
  'cart.lineUnpriced': 'Price not confirmed yet. Remove it to continue.',
  'cart.blocked': { one: 'Remove the dish that can’t be ordered to continue.', other: 'Remove the {count} dishes that can’t be ordered to continue.' },
  'cart.reason.unavailable': 'Unavailable today. It can’t be added to your order.',
  'cart.reason.unpriced': 'Its price isn’t confirmed yet, so it can’t be added.',
  'cart.reason.variant-required': 'Choose a size first.',
  'cart.reason.invalid-qty': 'Choose a quantity of 1 or more.',
  'cart.reason.unknown-product': 'This dish isn’t on the menu anymore.',
  'cart.reason.unknown-variant': 'That size isn’t available anymore.',
  'cart.lineNote': 'Note: {note}',
  'cart.noteCount': '{count} of {max} characters',
  'cart.notice.removed': { one: 'A dish in your saved order is no longer on the menu, so it was removed.', other: '{count} dishes in your saved order are no longer on the menu, so they were removed.' },
  'cart.notice.invalid': 'A line in your saved order had an invalid quantity and was removed.',
  'cart.notice.clamped': 'The quantity of {name} was lowered to {qty}, the most you can order.',
  'cart.notice.unavailable': '{name} is unavailable today. Remove it from your order to continue.',
  'cart.notice.reset': 'Your previous order couldn’t be restored, so the cart starts empty.',

  // Product details
  'dish.allergensNone': 'None listed.',
  'dish.allergensUnknown': 'Not listed. Ask the restaurant.',

  // Contact
  'contact.whatsappLabel': 'Message us on WhatsApp',
  'contact.newTab': '(opens in a new tab)',
};

const pluralRules = new Intl.PluralRules('en');

/**
 * Add a page-specific set of strings (e.g. js/checkout/strings.js), so pages
 * only download the text they use.
 * @param {Record<string, string | Record<string, string>>} entries
 */
export function registerStrings(entries) {
  Object.assign(STRINGS, entries);
}

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
