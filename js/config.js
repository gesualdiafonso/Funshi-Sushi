/**
 * Business configuration — the single source of truth for business facts.
 *
 * EDITING: replace each `null` with the real value. Every `null` is a fact the
 * owner hasn't provided yet; its placeholder name (see docs/PRODUCT_BRIEF.md §11)
 * is in the comment. Never put an invented value here: features that depend on
 * a missing value switch themselves off (see js/core/features.js).
 *
 * Money is always an integer in the currency's minor unit (e.g. cents).
 */

/**
 * @typedef {[string, string]} Shift  Opening and closing time, "HH:MM". A closing time
 *   earlier than the opening time means the shift ends after midnight.
 * @typedef {{ mon: Shift[], tue: Shift[], wed: Shift[], thu: Shift[], fri: Shift[], sat: Shift[], sun: Shift[] }} WeeklyHours
 * @typedef {{ id: string, label: string, allowsChange?: boolean }} PaymentMethod
 * @typedef {{ id: string, label: string, fee: number }} DeliveryZone
 */

export const CONFIG = Object.freeze({
  brandName: 'Funshi Sushi', // {{BRAND_NAME}} — provisional until confirmed

  locale: null, // {{LOCALE}} e.g. 'pt-BR' or 'es-AR'
  currency: null, // {{CURRENCY}} ISO 4217, e.g. 'BRL' or 'ARS'
  timeZone: null, // {{TIMEZONE}} IANA, e.g. 'America/Sao_Paulo'

  whatsappNumber: null, // {{WHATSAPP_NUMBER}} digits only, with country code
  phone: null, // {{PHONE_NUMBER}} as displayed, e.g. '+00 00 0000-0000'

  /** @type {null | { street: string, area: string, city: string, region: string, postalCode: string, country: string }} */
  address: null, // {{ADDRESS}}
  mapsUrl: null, // {{MAPS_URL}}

  /** @type {null | WeeklyHours} */
  hours: null, // {{OPENING_HOURS}}

  fulfilment: Object.freeze({
    delivery: Object.freeze({
      enabled: true, // {{FULFILMENT_MODES}}
      minOrder: null, // {{MIN_ORDER_DELIVERY}} minor units; 0 = no minimum
      fee: null, // {{DELIVERY_FEE}} minor units; null = "to be confirmed"
      /** @type {null | DeliveryZone[]} */
      zones: null, // {{DELIVERY_ZONES}}
      eta: null, // {{DELIVERY_TIME_ESTIMATE}} text, e.g. '40–60 min'
      area: null, // {{DELIVERY_AREA}} text
    }),
    pickup: Object.freeze({
      enabled: true, // {{FULFILMENT_MODES}}
      minOrder: null, // {{MIN_ORDER_PICKUP}}
      eta: null, // {{PREP_TIME}}
    }),
  }),

  /** @type {null | PaymentMethod[]} */
  payments: null, // {{PAYMENT_METHODS}}

  outOfHoursPolicy: 'warn', // {{OUT_OF_HOURS_POLICY}} 'warn' | 'block' (default: warn)

  limits: Object.freeze({
    maxQtyPerItem: 20, // {{MAX_QTY_PER_ITEM}} proposed default
    maxItemsPerOrder: 100, // {{MAX_ITEMS_PER_ORDER}} proposed default
    noteMaxLength: 280, // {{NOTE_MAX_LENGTH}} proposed default
    itemNoteMaxLength: 120,
  }),

  /** @type {{ label: string, url: string }[]} */
  social: [], // {{SOCIAL_LINKS}}
});
