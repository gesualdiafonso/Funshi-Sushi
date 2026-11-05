/**
 * Build the order from validated values and the priced cart.
 * Pure — tested in tests/order.test.js. Totals are recalculated from the
 * menu at this moment (PRODUCT_BRIEF OR-21), never taken from the page.
 */

// No 0/O, 1/I/L: easy to read out over the phone.
const REF_ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';

/**
 * "FS-261105-7K3Q": date (restaurant's time zone when known) + 4 random characters.
 * Generated in the browser: a reference for customer and staff to quote, NOT
 * an order number from a system (PRODUCT_BRIEF §9.2).
 * @param {Date} now
 * @param {string | null} timeZone
 * @param {(array: Uint8Array) => Uint8Array} getRandomValues  e.g. crypto.getRandomValues.bind(crypto)
 */
export function orderReference(now, timeZone, getRandomValues) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timeZone ?? undefined, year: '2-digit', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  const bytes = getRandomValues(new Uint8Array(4));
  const code = [...bytes].map((byte) => REF_ALPHABET[byte % REF_ALPHABET.length]).join('');
  return `FS-${get('year')}${get('month')}${get('day')}-${code}`;
}

/**
 * @typedef {Object} Order
 * @property {string} ref
 * @property {'delivery' | 'pickup'} fulfilment
 * @property {{ name: string, phone: string }} customer
 * @property {{ street: string, apartment: string, area: string, reference: string } | null} address
 * @property {{ label: string, changeFor: number | null } | null} payment   null = to be agreed
 * @property {{ qty: number, name: string, variant: string | null, note: string, lineTotal: number }[]} items
 * @property {import('../core/pricing.js').OrderTotals} totals
 * @property {string} notes
 */

/**
 * @param {{ clean: Record<string, any>,
 *           priced: import('../core/pricing.js').PricedCart,
 *           totals: import('../core/pricing.js').OrderTotals,
 *           orderNote: string,
 *           ref: string,
 *           zones: { id: string, label: string }[] | null,
 *           payments: { id: string, label: string }[] | null }} input
 * @returns {Order}
 */
export function buildOrder({ clean, priced, totals, orderNote, ref, zones, payments }) {
  if (priced.hasBlocking) throw new Error('buildOrder: the cart has lines that cannot be ordered');
  if (priced.lines.length === 0) throw new Error('buildOrder: the cart is empty');

  const method = payments?.find((p) => p.id === clean.payment) ?? null;
  const areaLabel = zones?.find((zone) => zone.id === clean.area)?.label ?? clean.area;

  return {
    ref,
    fulfilment: clean.fulfilment,
    customer: { name: clean.name, phone: clean.phone },
    address: clean.fulfilment === 'delivery'
      ? { street: clean.street, apartment: clean.apartment, area: areaLabel, reference: clean.reference }
      : null,
    payment: method ? { label: method.label, changeFor: clean.changeFor ?? null } : null,
    items: priced.lines.map(({ line, product, variant, lineTotal }) => ({
      qty: line.qty,
      name: product.name,
      variant: variant?.label ?? null,
      note: line.note,
      lineTotal,
    })),
    totals,
    notes: orderNote,
  };
}
