/**
 * Derive which features can run from the business configuration.
 * Pure: no DOM, no globals — tested in tests/features.test.js.
 *
 * A missing (null) business fact switches off exactly the features that
 * depend on it, so the site never shows or sends an invented value
 * (UX_ARCHITECTURE §11, E13).
 */

const WHATSAPP_DIGITS = /^\d{8,15}$/;

/**
 * @typedef {Object} Features
 * @property {boolean} canOrder        WhatsApp ordering can be offered (number + a fulfilment mode)
 * @property {boolean} hasPayments     Payment methods configured (else "to be agreed")
 * @property {boolean} canFormatMoney  Locale + currency known
 * @property {boolean} showOpenStatus  Hours + time zone known
 * @property {boolean} showAddress
 * @property {boolean} hasWhatsapp     Valid WhatsApp number configured
 * @property {boolean} hasPhone
 * @property {boolean} delivery        Delivery mode offered
 * @property {boolean} pickup          Pickup mode offered
 * @property {string[]} missing        Config keys still missing (for developer warnings)
 */

/**
 * @param {import('../config.js').CONFIG} config
 * @returns {Features}
 */
export function deriveFeatures(config) {
  const missing = [];
  const has = (key, value) => {
    const ok = value !== null && value !== undefined && value !== '';
    if (!ok) missing.push(key);
    return ok;
  };

  const hasLocale = has('locale', config.locale);
  const hasCurrency = has('currency', config.currency);
  const hasTimeZone = has('timeZone', config.timeZone);
  const hasHours = has('hours', config.hours);
  const hasAddress = has('address', config.address);
  const hasPayments = has('payments', config.payments) && config.payments.length > 0;

  let hasWhatsapp = has('whatsappNumber', config.whatsappNumber);
  if (hasWhatsapp && !WHATSAPP_DIGITS.test(String(config.whatsappNumber))) {
    missing.push('whatsappNumber (invalid: digits only, 8–15)');
    hasWhatsapp = false;
  }

  const delivery = Boolean(config.fulfilment?.delivery?.enabled);
  const pickup = Boolean(config.fulfilment?.pickup?.enabled);
  if (!delivery && !pickup) missing.push('fulfilment (no mode enabled)');

  const canFormatMoney = hasLocale && hasCurrency;

  return {
    // Sending needs only a real destination and a way to receive the food.
    // Unknown currency → neutral prices; unknown payment methods → "to be agreed".
    canOrder: hasWhatsapp && (delivery || pickup),
    hasPayments,
    canFormatMoney,
    showOpenStatus: hasHours && hasTimeZone,
    showAddress: hasAddress,
    hasWhatsapp,
    hasPhone: has('phone', config.phone),
    delivery,
    pickup,
    missing,
  };
}
