/**
 * Money formatting. Amounts are integers in the currency's minor unit
 * (TECHNICAL_ARCHITECTURE AD-9). Pure — tested in tests/money.test.js.
 */

const formatters = new Map();

function formatterFor(locale, currency) {
  const key = `${locale}|${currency}`;
  if (!formatters.has(key)) {
    formatters.set(key, new Intl.NumberFormat(locale, { style: 'currency', currency }));
  }
  return formatters.get(key);
}

/**
 * Number of minor-unit digits for a currency (2 for BRL, 0 for JPY…).
 * @param {string} currency ISO 4217 code
 */
export function minorDigits(currency) {
  return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits;
}

/**
 * Format a minor-unit amount, e.g. 2490 → "R$ 24,90" (pt-BR, BRL).
 * Returns null when the amount or the locale/currency isn't known, so the
 * caller shows "price to be confirmed" instead of a made-up format.
 * @param {number | null} minor
 * @param {{ locale: string | null, currency: string | null }} config
 * @returns {string | null}
 */
export function formatMoney(minor, { locale, currency }) {
  if (minor === null || minor === undefined || !locale || !currency) return null;
  if (!Number.isInteger(minor)) throw new TypeError(`formatMoney expects an integer, got ${minor}`);
  return formatterFor(locale, currency).format(minor / 10 ** minorDigits(currency));
}

/**
 * Format a price for display. With a configured currency → formatMoney.
 * Without one (not confirmed yet) → a neutral number with two decimals and
 * no currency symbol, so sample prices can be shown without inventing a
 * currency (TECHNICAL_ARCHITECTURE §6.4). Null amount → null.
 * @param {number | null} minor
 * @param {{ locale: string | null, currency: string | null }} config
 * @returns {string | null}
 */
export function formatPrice(minor, config) {
  if (minor === null || minor === undefined) return null;
  if (config.locale && config.currency) return formatMoney(minor, config);
  if (!Number.isInteger(minor)) throw new TypeError(`formatPrice expects an integer, got ${minor}`);
  return neutralFormatter(config.locale ?? 'en').format(minor / 100);
}

const neutral = new Map();
function neutralFormatter(locale) {
  if (!neutral.has(locale)) {
    neutral.set(locale, new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }
  return neutral.get(locale);
}
