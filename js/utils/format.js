/**
 * Display formatting. Pure functions.
 * Currency and locale are placeholders until the site language and
 * currency are confirmed (blocker B2).
 */
export const LOCALE = 'en';
export const CURRENCY = 'ARS';

const priceFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

export function formatPrice(price) {
  return Number.isFinite(price) ? priceFormatter.format(price) : 'Price to be confirmed';
}

export function formatDishMeta({ category, pieces }) {
  if (!pieces) return category;
  return `${category}, ${pieces} ${pieces === 1 ? 'piece' : 'pieces'}`;
}
