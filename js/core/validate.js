/**
 * Checkout field rules (UX_ARCHITECTURE §9.4). Pure — tested in
 * tests/validate.test.js. Returns error CODES per field; the UI turns them
 * into messages (js/strings.js), so rules and wording stay separate.
 */

export const FIELD_LIMITS = Object.freeze({
  name: [2, 60],
  street: [3, 100],
  apartment: 40,
  area: [2, 60],
  reference: 100,
});
const PHONE_DIGITS = [8, 15];

const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

/** "+55 (11) 99999-9999" → "+5511999999999"; null if not a plausible phone. */
export function normalizePhone(value) {
  const text = clean(value);
  if (!/^\+?[\d\s().-]+$/.test(text)) return null;
  const digits = text.replace(/\D/g, '');
  if (digits.length < PHONE_DIGITS[0] || digits.length > PHONE_DIGITS[1]) return null;
  return `${text.startsWith('+') ? '+' : ''}${digits}`;
}

/** "100", "100.50", "100,50" → 10000 / 10050 (minor units); null if not an amount. */
export function parseAmount(value) {
  const text = clean(value).replace(/\s/g, '');
  if (!/^\d{1,7}([.,]\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ''] = text.split(/[.,]/);
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}

/**
 * @typedef {Object} CheckoutValues  raw form values (strings / booleans)
 * @property {string} fulfilment  'delivery' | 'pickup' | ''
 * @property {string} name
 * @property {string} phone
 * @property {string} street
 * @property {boolean} noStreetNumber
 * @property {string} apartment
 * @property {string} area        zone id (when zones exist) or free text
 * @property {string} reference
 * @property {string} payment     payment method id or ''
 * @property {string} changeFor
 *
 * @typedef {Object} CheckoutContext
 * @property {string[]} modes                       enabled fulfilment modes
 * @property {{ id: string }[] | null} zones        delivery zones, if any
 * @property {{ id: string, allowsChange?: boolean }[] | null} payments
 * @property {number} total                         amount "change for" must cover
 */

/**
 * @param {CheckoutValues} values
 * @param {CheckoutContext} context
 * @returns {{ valid: boolean, errors: Record<string, string>, clean: Record<string, any> }}
 *   error codes: required · tooShort · tooLong · invalid · needsNumber · tooLow
 */
export function validateCheckout(values, context) {
  const errors = {};
  const out = {};

  out.fulfilment = context.modes.includes(values.fulfilment) ? values.fulfilment : '';
  if (!out.fulfilment) errors.fulfilment = 'required';

  out.name = clean(values.name);
  lengthRule('name', out.name, FIELD_LIMITS.name, true);

  out.phone = normalizePhone(values.phone);
  if (!clean(values.phone)) errors.phone = 'required';
  else if (!out.phone) errors.phone = 'invalid';

  if (out.fulfilment === 'delivery') {
    out.street = clean(values.street);
    out.noStreetNumber = Boolean(values.noStreetNumber);
    if (lengthRule('street', out.street, FIELD_LIMITS.street, true) && !out.noStreetNumber && !/\d/.test(out.street)) {
      errors.street = 'needsNumber';
    }
    out.apartment = clean(values.apartment);
    maxRule('apartment', out.apartment, FIELD_LIMITS.apartment);
    out.reference = clean(values.reference);
    maxRule('reference', out.reference, FIELD_LIMITS.reference);

    out.area = clean(values.area);
    if (context.zones) {
      if (!out.area) errors.area = 'required';
      else if (!context.zones.some((zone) => zone.id === out.area)) errors.area = 'invalid';
    } else {
      lengthRule('area', out.area, FIELD_LIMITS.area, true);
    }
  }

  if (context.payments && context.payments.length > 0) {
    const method = context.payments.find((p) => p.id === values.payment);
    out.payment = method ? method.id : '';
    if (!method) errors.payment = 'required';
    out.changeFor = null;
    if (method?.allowsChange && clean(values.changeFor)) {
      out.changeFor = parseAmount(values.changeFor);
      if (out.changeFor === null) errors.changeFor = 'invalid';
      else if (out.changeFor < context.total) errors.changeFor = 'tooLow';
    }
  } else {
    out.payment = '';
    out.changeFor = null;
  }

  return { valid: Object.keys(errors).length === 0, errors, clean: out };

  /** @returns {boolean} passed */
  function lengthRule(field, value, [min, max], required) {
    if (!value) {
      if (required) errors[field] = 'required';
      return false;
    }
    if (value.length < min) errors[field] = 'tooShort';
    else if (value.length > max) errors[field] = 'tooLong';
    return !errors[field];
  }

  function maxRule(field, value, max) {
    if (value.length > max) errors[field] = 'tooLong';
  }
}
