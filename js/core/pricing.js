/**
 * Cart pricing — every price comes from the current menu data, never from
 * the browser (PRODUCT_BRIEF OR-21). Integers only (minor units).
 * Pure — tested in tests/pricing.test.js.
 */

import { checkOrderable, isValidPrice } from './catalog.js';

/**
 * @typedef {Object} PricedLine
 * @property {import('../cart/cart-model.js').CartLine} line
 * @property {import('./catalog.js').Product} product
 * @property {import('./catalog.js').Variant | null} variant
 * @property {number | null} unitPrice   null when it can't be ordered
 * @property {number | null} lineTotal
 * @property {'ok' | 'unavailable' | 'unpriced'} status
 *
 * @typedef {Object} PricedCart
 * @property {PricedLine[]} lines
 * @property {number} itemCount      every line, orderable or not
 * @property {number} orderableCount items that count towards the total
 * @property {number} subtotal
 * @property {number} total          subtotal + fees (fees arrive with checkout)
 * @property {boolean} hasBlocking   a line that must be removed before checkout
 */

/**
 * @param {import('../cart/cart-model.js').Cart} cart  already reconciled
 * @param {import('./catalog.js').Catalog} catalog
 * @returns {PricedCart}
 */
export function priceCart(cart, catalog) {
  let subtotal = 0;
  let itemCount = 0;
  let orderableCount = 0;
  const lines = [];

  for (const line of cart.lines) {
    const product = catalog.byId.get(line.productId);
    if (!product) continue; // reconcile removes these; never price an unknown dish
    itemCount += line.qty;
    const check = checkOrderable(product, line.variantId);
    const variant = product.variants?.find((v) => v.id === line.variantId) ?? null;

    if (!check.ok) {
      lines.push({ line, product, variant, unitPrice: null, lineTotal: null, status: check.reason === 'unpriced' ? 'unpriced' : 'unavailable' });
      continue;
    }
    const unitPrice = variant ? variant.price : product.price;
    const lineTotal = unitPrice * line.qty;
    if (!Number.isSafeInteger(lineTotal) || !Number.isSafeInteger(subtotal + lineTotal)) {
      throw new RangeError('Cart total out of range');
    }
    subtotal += lineTotal;
    orderableCount += line.qty;
    lines.push({ line, product, variant, unitPrice, lineTotal, status: 'ok' });
  }

  return {
    lines,
    itemCount,
    orderableCount,
    subtotal,
    total: subtotal,
    hasBlocking: lines.some((l) => l.status !== 'ok'),
  };
}

/**
 * @typedef {Object} OrderTotals
 * @property {'delivery' | 'pickup' | null} mode
 * @property {number} subtotal
 * @property {number | null} deliveryFee  null: pickup, or delivery fee not known yet
 * @property {boolean} feePending          delivery chosen but its fee isn't configured
 * @property {number} total                subtotal + known delivery fee
 * @property {number} minOrder             for the chosen mode (0 = none)
 * @property {number} shortBy              amount missing to reach the minimum
 */

/**
 * Totals for a fulfilment mode (PRODUCT_BRIEF OR-03…OR-07, OR-13).
 * A fee that isn't configured is never invented: it is reported as pending.
 * @param {PricedCart} priced
 * @param {{ mode: 'delivery' | 'pickup' | null, zoneId?: string | null }} choice
 * @param {typeof import('../config.js').CONFIG.fulfilment} fulfilment
 * @returns {OrderTotals}
 */
export function orderTotals(priced, { mode, zoneId = null }, fulfilment) {
  const subtotal = priced.subtotal;
  let deliveryFee = null;
  let feePending = false;

  if (mode === 'delivery') {
    const delivery = fulfilment.delivery;
    const zones = Array.isArray(delivery.zones) && delivery.zones.length > 0 ? delivery.zones : null;
    const fee = zones ? zones.find((zone) => zone.id === zoneId)?.fee : delivery.fee;
    if (isValidPrice(fee)) {
      deliveryFee = isValidPrice(delivery.freeAbove) && subtotal >= delivery.freeAbove ? 0 : fee;
    } else {
      feePending = true;
    }
  }

  const configuredMin = mode ? fulfilment[mode]?.minOrder : null;
  const minOrder = isValidPrice(configuredMin) ? configuredMin : 0;
  return {
    mode,
    subtotal,
    deliveryFee,
    feePending,
    total: subtotal + (deliveryFee ?? 0),
    minOrder,
    shortBy: Math.max(0, minOrder - subtotal),
  };
}
