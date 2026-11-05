/**
 * Checkout form: delivery or pickup, customer details, address, payment,
 * validation, totals, and the WhatsApp handoff (UX_ARCHITECTURE §9).
 *
 * Honesty rules (PRODUCT_BRIEF §9.5):
 *  • The button says "Send order via WhatsApp", never "Place order" or "Pay".
 *  • After the handoff the page says the order is NOT confirmed until the
 *    restaurant replies. Opening WhatsApp is not a confirmation.
 *  • Without a configured WhatsApp number nothing can be sent; the site never
 *    falls back to a made-up destination.
 */

import { forgetCustomer, loadCustomer, saveCustomer } from '../checkout/customer.js';
import { buildOrder, orderReference } from '../checkout/order.js';
import { buildWhatsAppUrl, formatOrderMessage, isUrlTooLong } from '../checkout/whatsapp.js';
import { DAYS, getOpenStatus } from '../core/hours.js';
import { formatPrice } from '../core/money.js';
import { orderTotals } from '../core/pricing.js';
import { validateCheckout } from '../core/validate.js';
import { t } from '../strings.js';
import '../checkout/strings.js';
import { announce } from './announcer.js';
import { delegate, icon, on, qs, qsa } from './dom.js';
import { weekdayNames } from './hours-view.js';

const FIELDS = ['fulfilment', 'name', 'phone', 'street', 'apartment', 'area', 'reference', 'payment', 'changeFor'];
const REMEMBERED = ['name', 'phone', 'street', 'apartment', 'area', 'reference'];

/**
 * @param {{ store: ReturnType<typeof import('../cart/cart-store.js').createCartStore>,
 *           config: typeof import('../config.js').CONFIG,
 *           features: import('../core/features.js').Features,
 *           isDemo: boolean }} deps
 */
export function initCheckoutForm({ store, config, features, isDemo }) {
  const form = /** @type {HTMLFormElement} */ (qs('[data-checkout-form]'));
  const sent = qs('[data-sent]');
  if (!form || !sent) return;

  const { delivery, pickup } = config.fulfilment;
  const modes = /** @type {('delivery' | 'pickup')[]} */ (['delivery', 'pickup'].filter((m) => config.fulfilment[m]?.enabled));
  const zones = Array.isArray(delivery.zones) && delivery.zones.length > 0 ? delivery.zones : null;
  const payments = Array.isArray(config.payments) && config.payments.length > 0 ? config.payments : null;
  const price = (minor) => formatPrice(minor, config) ?? '';

  const el = {
    details: qs('[data-checkout-details]', form),
    address: qs('[data-fieldset="address"]', form),
    payment: qs('[data-fieldset="payment"]', form),
    changeWrap: qs('[data-change-wrap]', form),
    pickupInfo: qs('[data-pickup-info]', form),
    deliveryArea: qs('[data-delivery-area]', form),
    areaText: /** @type {HTMLInputElement} */ (qs('[data-area-text]', form)),
    areaZone: /** @type {HTMLSelectElement} */ (qs('[data-area-zone]', form)),
    summary: qs('[data-error-summary]', form),
    deliveryRow: qs('[data-total-delivery-row]', form),
    deliveryValue: qs('[data-total-delivery]', form),
    total: qs('[data-total]', form),
    minOrder: qs('[data-min-order]', form),
    blocked: qs('[data-cart-blocked]', form),
    hours: qs('[data-hours-alert]', form),
    off: qs('[data-ordering-off]', form),
    closedConfirm: qs('[data-closed-confirm]', form),
    send: qs('[data-send]', form),
    remember: /** @type {HTMLInputElement} */ (qs('[data-remember]', form)),
    forget: qs('[data-forget]', form),
  };

  buildFulfilmentOptions();
  buildZoneField();
  buildPaymentOptions();
  prefillCustomer();

  /** Fields the customer has left at least once: their errors may show. */
  const touched = new Set();
  let submitted = false;
  let closedConfirmed = false;
  /** @type {ReturnType<typeof state>} */
  let current = state();

  on(form, 'change', (event) => {
    const name = /** @type {HTMLInputElement} */ (event.target).name;
    if (FIELDS.includes(name)) touched.add(name);
    if (name === 'noStreetNumber') touched.add('street');
    refresh();
  });
  on(form, 'input', (event) => {
    const name = /** @type {HTMLInputElement} */ (event.target).name;
    // Live re-check only once an error is showing, so it clears as soon as it's fixed.
    if (FIELDS.includes(name) && form.querySelector(`[data-error-for="${name}"]:not([hidden])`)) refresh();
  });
  on(form, 'focusout', (event) => {
    const target = /** @type {HTMLInputElement} */ (event.target);
    if (FIELDS.includes(target.name) && target.type !== 'radio' && (target.value.trim() || touched.has(target.name))) {
      touched.add(target.name);
      refresh();
    }
  });
  on(form, 'submit', (event) => {
    event.preventDefault();
    submit();
  });
  delegate(form, 'click', '[data-send-anyway]', () => {
    closedConfirmed = true;
    submit();
  });
  delegate(form, 'click', '[data-error-list] a', (event, link) => {
    event.preventDefault();
    const target = document.getElementById(link.getAttribute('href').slice(1));
    target?.scrollIntoView({ block: 'center' });
    target?.focus({ preventScroll: true });
  });
  on(el.forget, 'click', () => {
    forgetCustomer();
    el.forget.hidden = true;
    el.remember.checked = false;
    announce(t('checkout.forgotten'));
  });
  initSentState();

  store.subscribe(() => refresh());
  refresh();

  // ---- State and rendering ---------------------------------------------------
  function values() {
    const data = new FormData(form);
    const text = (name) => String(data.get(name) ?? '');
    return {
      fulfilment: text('fulfilment'),
      name: text('name'),
      phone: text('phone'),
      street: text('street'),
      noStreetNumber: data.has('noStreetNumber'),
      apartment: text('apartment'),
      area: text('area'),
      reference: text('reference'),
      payment: text('payment'),
      changeFor: text('changeFor'),
    };
  }

  function state() {
    const view = store.getView();
    const v = values();
    const mode = modes.includes(v.fulfilment) ? v.fulfilment : null;
    const totals = orderTotals(view, { mode, zoneId: zones ? v.area : null }, config.fulfilment);
    const validation = validateCheckout(v, {
      modes,
      zones,
      payments,
      total: totals.total,
    });
    const status = features.showOpenStatus ? getOpenStatus(config.hours, config.timeZone, new Date()) : { state: 'unknown' };
    return { view, values: v, mode, totals, validation, status };
  }

  function refresh() {
    current = state();
    const { view, mode, totals, validation, status } = current;
    const empty = view.lines.length === 0;
    el.details.hidden = empty;

    // Conditional fields
    el.address.hidden = mode !== 'delivery';
    setDisabled(el.address, mode !== 'delivery');
    el.pickupInfo.hidden = mode !== 'pickup';
    const method = payments?.find((p) => p.id === current.values.payment);
    el.payment.hidden = !payments;
    el.changeWrap.hidden = !method?.allowsChange;

    // Totals
    el.deliveryRow.hidden = mode !== 'delivery';
    el.deliveryValue.textContent = totals.feePending
      ? t('checkout.tbc')
      : totals.deliveryFee === 0 ? t('checkout.freeDelivery') : price(totals.deliveryFee ?? 0);
    el.total.textContent = totals.feePending ? t('checkout.totalPending', { amount: price(totals.total) }) : price(totals.total);

    // Things that stop sending, each with its reason
    el.minOrder.hidden = totals.shortBy === 0;
    if (totals.shortBy > 0) {
      const pickupHasNoMin = mode === 'delivery' && modes.includes('pickup') && !(pickup.minOrder > 0);
      el.minOrder.textContent = t('checkout.minOrder', {
        amount: price(totals.shortBy),
        mode: t(mode === 'delivery' ? 'checkout.modeDeliveryLower' : 'checkout.modePickupLower'),
        min: price(totals.minOrder),
      }) + (pickupHasNoMin ? t('checkout.minOrderPickupHint') : '');
    }

    const closed = status.state === 'closed';
    const blockedByHours = closed && config.outOfHoursPolicy === 'block';
    el.hours.hidden = !blockedByHours;
    if (blockedByHours) el.hours.textContent = t('checkout.closedBlock', { next: nextOpening(status) });
    if (!closed) {
      el.closedConfirm.hidden = true;
      closedConfirmed = false;
    }

    el.off.hidden = features.canOrder;
    qs('[data-ordering-off-text]', el.off).textContent = t('checkout.orderingOff');

    const canSend = !empty && !view.hasBlocking && totals.shortBy === 0 && features.canOrder && !blockedByHours;
    el.send.setAttribute('aria-disabled', String(!canSend));

    renderErrors(validation.errors, submitted ? new Set(FIELDS) : touched);
  }

  function renderErrors(errors, visibleFields) {
    for (const field of FIELDS) {
      const slot = form.querySelector(`[data-error-for="${field}"]`);
      const code = errors[field];
      const show = Boolean(code) && visibleFields.has(field) && isActive(field);
      if (slot) {
        slot.hidden = !show;
        slot.querySelector('span').textContent = show ? errorMessage(field, code) : '';
      }
      for (const control of controlsFor(field)) {
        if (show) control.setAttribute('aria-invalid', 'true');
        else control.removeAttribute('aria-invalid');
      }
    }
  }

  function errorMessage(field, code) {
    if (field === 'area' && zones && code === 'required') return t('error.zone.required');
    if (field === 'changeFor' && code === 'tooLow') return t('error.changeFor.tooLow', { total: price(current.totals.total) });
    return t(`error.${field}.${code}`);
  }

  /** A field only counts when its section is shown (address for delivery…). */
  function isActive(field) {
    if (['street', 'apartment', 'area', 'reference'].includes(field)) return current.mode === 'delivery';
    if (field === 'payment') return Boolean(payments);
    if (field === 'changeFor') return !el.changeWrap.hidden;
    return true;
  }

  function controlsFor(field) {
    return qsa(`[name="${field}"]:not([disabled])`, form);
  }

  // ---- Submit ------------------------------------------------------------------
  function submit() {
    submitted = true;
    refresh();
    const { view, totals, validation, status } = current;
    const errorFields = FIELDS.filter((f) => validation.errors[f] && isActive(f));

    if (view.lines.length === 0) return focus(qs('[data-cart-focus]'));
    if (errorFields.length > 0) return showErrorSummary(errorFields, validation.errors);
    el.summary.hidden = true;
    if (view.hasBlocking) return focus(el.blocked);
    if (totals.shortBy > 0) return focus(el.minOrder);
    if (!features.canOrder) return focus(el.off);
    if (status.state === 'closed') {
      if (config.outOfHoursPolicy === 'block') return focus(el.hours);
      if (!closedConfirmed) {
        qs('[data-closed-confirm-text]', el.closedConfirm).textContent = t('checkout.closedWarn', { next: nextOpening(status) });
        el.closedConfirm.hidden = false;
        return focus(qs('[data-send-anyway]', el.closedConfirm));
      }
    }
    send(validation.clean, totals, view);
  }

  function showErrorSummary(fields, errors) {
    qs('[data-error-summary-title]', el.summary).textContent = t('checkout.errorSummary', { count: fields.length });
    qs('[data-error-list]', el.summary).replaceChildren(...fields.map((field) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${controlsFor(field)[0]?.id ?? field}`;
      link.textContent = errorMessage(field, errors[field]);
      li.append(link);
      return li;
    }));
    el.summary.hidden = false;
    focus(el.summary);
  }

  function send(clean, totals, view) {
    const ref = orderReference(new Date(), config.timeZone, (array) => crypto.getRandomValues(array));
    const order = buildOrder({ clean, priced: view, totals, orderNote: view.orderNote, ref, zones, payments });
    const text = formatOrderMessage(order, { t, price, brandName: config.brandName, isDemo });
    const url = buildWhatsAppUrl(config.whatsappNumber, text);

    if (el.remember.checked) {
      saveCustomer(Object.fromEntries(REMEMBERED.map((key) => [key, clean[key] ?? ''])));
    } else {
      forgetCustomer();
    }

    window.open(url, '_blank', 'noopener');
    showSent({ ref, text, url });
  }

  // ---- After the handoff ---------------------------------------------------------
  let lastText = '';

  function showSent({ ref, text, url }) {
    lastText = text;
    qs('[data-sent-ref]', sent).textContent = ref;
    qs('[data-sent-message]', sent).textContent = text;
    const again = /** @type {HTMLAnchorElement} */ (qs('[data-sent-open]', sent));
    again.href = url;
    again.target = '_blank';
    again.rel = 'noopener';
    qs('[data-sent-demo]', sent).hidden = !isDemo;
    const long = isUrlTooLong(url);
    qs('[data-sent-long]', sent).hidden = !long;
    qs('[data-sent-long-text]', sent).textContent = long ? t('checkout.longOrder') : '';
    qs('[data-copy-status]', sent).textContent = '';
    qs('[data-copy-fallback]', sent).hidden = true;
    qs('[data-new-confirm]', sent).hidden = true;

    form.hidden = true;
    sent.hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
    qs('#sent-title', sent).focus({ preventScroll: true });
  }

  function initSentState() {
    delegate(sent, 'click', '[data-sent-copy]', async () => {
      const status = qs('[data-copy-status]', sent);
      try {
        await navigator.clipboard.writeText(lastText);
        status.textContent = t('checkout.copied');
      } catch {
        // No clipboard access (old browser, permissions): let the customer copy by hand.
        const fallback = /** @type {HTMLTextAreaElement} */ (qs('[data-copy-fallback]', sent));
        fallback.value = lastText;
        fallback.hidden = false;
        fallback.focus();
        fallback.select();
        status.textContent = t('checkout.copyFailed');
      }
    });
    delegate(sent, 'click', '[data-sent-edit]', () => {
      sent.hidden = true;
      form.hidden = false;
      el.send.focus();
    });
    delegate(sent, 'click', '[data-sent-new]', () => {
      qs('[data-new-question]', sent).textContent = t('checkout.newOrderConfirm');
      qs('[data-new-confirm]', sent).hidden = false;
      qs('[data-new-no]', sent).focus();
    });
    delegate(sent, 'click', '[data-new-no]', () => {
      qs('[data-new-confirm]', sent).hidden = true;
      qs('[data-sent-new]', sent).focus();
    });
    delegate(sent, 'click', '[data-new-yes]', () => {
      store.clear();
      location.assign('menu.html');
    });
  }

  // ---- Setup -------------------------------------------------------------------------
  function buildFulfilmentOptions() {
    const container = qs('[data-fulfilment-options]', form);
    container.replaceChildren(...modes.map((mode) => {
      const isDelivery = mode === 'delivery';
      const settings = config.fulfilment[mode];
      const label = document.createElement('label');
      label.className = 'choice-card';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'fulfilment';
      input.value = mode;
      input.id = `fulfilment-${mode}`;
      // Name = the option ("Delivery"); the fee and time are its description.
      input.setAttribute('aria-labelledby', `fulfilment-${mode}-title`);
      input.setAttribute('aria-describedby', `fulfilment-${mode}-meta err-fulfilment`);
      if (modes.length === 1) input.checked = true;

      const body = document.createElement('span');
      body.className = 'choice-card__body';
      const title = document.createElement('span');
      title.className = 'choice-card__title';
      title.id = `fulfilment-${mode}-title`;
      title.append(icon(isDelivery ? 'bike' : 'store'), t(isDelivery ? 'checkout.delivery' : 'checkout.pickup'));
      const meta = document.createElement('span');
      meta.className = 'choice-card__meta';
      meta.id = `fulfilment-${mode}-meta`;
      const feeText = isDelivery
        ? (zones ? null : Number.isInteger(delivery.fee) ? t('checkout.deliveryFee', { amount: price(delivery.fee) }) : t('checkout.deliveryFeeTbc'))
        : t('checkout.pickupFree');
      meta.textContent = [feeText, settings.eta ? t('checkout.eta', { eta: settings.eta }) : null].filter(Boolean).join(' · ');
      body.append(title, meta);
      label.append(input, body, icon('check', { className: 'choice-card__check' }));
      return label;
    }));

    el.pickupInfo.textContent = config.address
      ? t('checkout.pickupAt', { address: [config.address.street, config.address.area, config.address.city].filter(Boolean).join(', ') })
      : t('checkout.pickupAtTbc');
    el.deliveryArea.hidden = !delivery.area;
    el.deliveryArea.textContent = delivery.area ? t('checkout.deliveryArea', { area: delivery.area }) : '';
  }

  function buildZoneField() {
    if (!zones) return;
    el.areaText.hidden = true;
    el.areaText.disabled = true;
    el.areaZone.hidden = false;
    el.areaZone.disabled = false;
    qs('[data-area-label]', form).setAttribute('for', 'area-zone');
    qs('[data-area-label]', form).textContent = 'Zone';
    const placeholder = new Option(t('checkout.chooseZone'), '');
    el.areaZone.replaceChildren(placeholder, ...zones.map((zone) => new Option(
      Number.isInteger(zone.fee) ? t('checkout.zoneOption', { zone: zone.label, fee: price(zone.fee) }) : zone.label,
      zone.id,
    )));
  }

  function buildPaymentOptions() {
    if (!payments) return;
    qs('[data-payment-options]', form).replaceChildren(...payments.map((method) => {
      const label = document.createElement('label');
      label.className = 'checkbox';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'payment';
      input.value = method.id;
      input.id = `payment-${method.id}`;
      input.setAttribute('aria-describedby', 'err-payment');
      const text = document.createElement('span');
      text.textContent = method.label;
      label.append(input, text);
      return label;
    }));
  }

  function prefillCustomer() {
    const saved = loadCustomer();
    if (!saved) return;
    for (const key of REMEMBERED) {
      const control = /** @type {HTMLInputElement | HTMLSelectElement | null} */ (form.querySelector(`[name="${key}"]:not([disabled])`));
      if (control && saved[key]) control.value = saved[key];
    }
    el.remember.checked = true;
    el.forget.hidden = false;
  }

  function nextOpening(status) {
    const next = status.nextOpen;
    if (!next) return '';
    if (next.today) return t('checkout.opensToday', { time: next.time });
    if (next.tomorrow) return t('checkout.opensTomorrow', { time: next.time });
    return t('checkout.opensOn', { day: weekdayNames(config.locale)[DAYS.indexOf(next.day)], time: next.time });
  }
}

function setDisabled(fieldset, disabled) {
  // Hidden address fields must not be submitted, validated or autofilled.
  fieldset.disabled = disabled;
}

function focus(element) {
  if (!element) return;
  element.scrollIntoView({ block: 'center', behavior: 'instant' });
  element.focus({ preventScroll: true });
}
