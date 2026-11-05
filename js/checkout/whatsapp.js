/**
 * The WhatsApp message and link (PRODUCT_BRIEF §9.3–9.5).
 * Pure — tested in tests/whatsapp.test.js.
 *
 * Wording rule: this is an order REQUEST. Nothing here (or in the page)
 * says the order is confirmed; the restaurant confirms it by replying.
 */

/** Past this length some apps and browsers cut the prefilled text. */
export const MAX_URL_LENGTH = 4000;

/**
 * @param {import('./order.js').Order} order
 * @param {{ t: (key: string, params?: object) => string,
 *           price: (minor: number) => string,
 *           brandName: string,
 *           isDemo: boolean }} options
 * @returns {string} plain text with WhatsApp *bold*, empty fields left out
 */
export function formatOrderMessage(order, { t, price, brandName, isDemo }) {
  const lines = [];
  const add = (...text) => lines.push(...text);

  add(`*${t('wa.title', { brand: brandName })}*`);
  if (isDemo) add(t('wa.demo'));
  add(t('wa.ref', { ref: order.ref }), '');

  add(`*${t('wa.items')}*`);
  for (const item of order.items) {
    const name = item.variant ? `${item.name} (${item.variant})` : item.name;
    add(`${item.qty}× ${name} — ${price(item.lineTotal)}`);
    if (item.note) add(`   ${t('wa.itemNote', { note: item.note })}`);
  }
  add('');

  const { totals } = order;
  add(t('wa.subtotal', { amount: price(totals.subtotal) }));
  if (order.fulfilment === 'delivery') {
    add(totals.feePending ? t('wa.deliveryTbc') : t('wa.delivery', { amount: price(totals.deliveryFee) }));
  }
  add(`*${totals.feePending ? t('wa.totalPlusDelivery', { amount: price(totals.total) }) : t('wa.total', { amount: price(totals.total) })}*`, '');

  add(`*${order.fulfilment === 'delivery' ? t('wa.modeDelivery') : t('wa.modePickup')}*`);
  add(t('wa.name', { name: order.customer.name }));
  add(t('wa.phone', { phone: order.customer.phone }));
  if (order.address) {
    const { street, apartment, area, reference } = order.address;
    add(t('wa.address', { address: [street, apartment].filter(Boolean).join(', ') + (area ? ` — ${area}` : '') }));
    if (reference) add(t('wa.landmark', { reference }));
  }
  add('');

  if (order.payment) {
    add(order.payment.changeFor !== null
      ? t('wa.paymentChange', { method: order.payment.label, amount: price(order.payment.changeFor) })
      : t('wa.payment', { method: order.payment.label }));
  } else {
    add(t('wa.paymentTbc'));
  }
  if (order.notes) add(t('wa.notes', { notes: order.notes }));
  add('', t('wa.confirmRequest'), t('wa.footer', { brand: brandName }));

  return lines.join('\n');
}

/**
 * @param {string} number  digits only, with country code (validated by features.js)
 * @param {string} text
 */
export function buildWhatsAppUrl(number, text) {
  if (!/^\d{8,15}$/.test(String(number))) throw new Error('buildWhatsAppUrl: invalid number');
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export const isUrlTooLong = (url) => url.length > MAX_URL_LENGTH;
