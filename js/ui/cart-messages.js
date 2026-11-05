/**
 * Customer-facing wording for cart results and load-time notices, in one
 * place so every entry point (menu line, dialog, drawer) says the same thing.
 */

import { t } from '../strings.js';

/** "Salmon uramaki (16 pcs)" */
export function lineName(product, variant) {
  return variant ? `${product.name} (${variant.label})` : product.name;
}

/** Message when an add or quantity change hit a limit, else null. */
export function limitMessage(result, limits) {
  const reason = result.limited ?? result.error;
  if (reason === 'line' || reason === 'line-limit') return t('cart.limitLine', { max: limits.maxQtyPerItem });
  if (reason === 'order' || reason === 'order-limit') return t('cart.limitOrder', { max: limits.maxItemsPerOrder });
  return null;
}

/** Why a dish can't be added or changed: limits first, then refusal reasons. */
export function reasonMessage(result, limits) {
  const limit = limitMessage(result, limits);
  if (limit) return limit;
  const known = ['unavailable', 'unpriced', 'variant-required', 'invalid-qty', 'unknown-product', 'unknown-variant'];
  return known.includes(result.error) ? t(`cart.reason.${result.error}`) : null;
}

/**
 * Turn load-time notices (reconcile) into short sentences.
 * @param {import('../cart/cart-model.js').Notice[] | { type: 'reset' }[]} notices
 * @param {import('../core/catalog.js').Catalog} catalog
 */
export function noticeMessages(notices, catalog) {
  const name = (id) => catalog.byId.get(id)?.name ?? '';
  const messages = [];
  const removed = notices.filter((n) => n.type === 'removed').length;
  if (removed > 0) messages.push(t('cart.notice.removed', { count: removed }));
  if (notices.some((n) => n.type === 'invalid')) messages.push(t('cart.notice.invalid'));
  for (const n of notices.filter((x) => x.type === 'clamped')) messages.push(t('cart.notice.clamped', { name: name(n.productId), qty: n.qty }));
  for (const n of notices.filter((x) => x.type === 'unavailable')) messages.push(t('cart.notice.unavailable', { name: name(n.productId) }));
  if (notices.some((n) => n.type === 'reset')) messages.push(t('cart.notice.reset'));
  return messages;
}
