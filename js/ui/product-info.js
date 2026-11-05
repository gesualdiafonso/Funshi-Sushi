/**
 * Shared presentation of dish facts (price, pieces, labels) for the menu,
 * the product dialog and the home page — so every place shows them the same way.
 */

import { displayPrice, pieceRange } from '../core/catalog.js';
import { formatPrice } from '../core/money.js';
import { t } from '../strings.js';
import { icon } from './dom.js';

/** "2 pcs", "8–16 pcs", or null. */
export function piecesText(product) {
  const range = pieceRange(product);
  if (!range) return null;
  return range.min === range.max ? t('menu.pieces', { count: range.min }) : t('menu.piecesRange', range);
}

/**
 * @returns {{ text: string, unpriced: boolean }}
 *   "18.90", "from 24.90", or "Price to be confirmed"
 */
export function priceText(product, config) {
  const { amount, from } = displayPrice(product);
  const formatted = formatPrice(amount, config);
  if (!formatted) return { text: t('menu.priceTbc'), unpriced: true };
  return { text: from ? t('menu.priceFrom', { price: formatted }) : formatted, unpriced: false };
}

/** Write a price into an element, marking "to be confirmed" for styling. */
export function setPrice(el, product, config) {
  const { text, unpriced } = priceText(product, config);
  el.textContent = text;
  el.toggleAttribute('data-unpriced', unpriced);
}

/** Label badges (Raw, Vegetarian…), with icons where the tag has one. */
export function tagBadges(product, catalog) {
  return product.tags.map((tagId) => {
    const tag = catalog.tagById.get(tagId);
    const badge = document.createElement('span');
    badge.className = 'badge';
    if (tag.icon) badge.append(icon(tag.icon, { size: 'sm' }));
    badge.append(tag.label);
    return badge;
  });
}

/** "Unavailable today" badge. */
export function unavailableBadge() {
  const badge = document.createElement('span');
  badge.className = 'badge badge--unavailable';
  badge.textContent = t('menu.unavailable');
  return badge;
}
