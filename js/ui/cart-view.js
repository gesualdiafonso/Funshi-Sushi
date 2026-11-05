/**
 * The order list: lines with quantity steppers, totals, empty state and the
 * note for the restaurant. Used by the cart drawer and the checkout page,
 * so the cart looks and behaves the same in both (UX_ARCHITECTURE §8).
 *
 * Hooks inside `root`:
 *   [data-cart-lines] [data-cart-empty] [data-cart-summary] [data-cart-subtotal]
 *   [data-cart-total] [data-cart-count-text] [data-cart-blocked] [data-cart-checkout]
 *   [data-cart-note] [data-cart-note-count] [data-cart-focus]
 */

import { formatPrice } from '../core/money.js';
import { t } from '../strings.js';
import { announce } from './announcer.js';
import { lineName, limitMessage } from './cart-messages.js';
import { cloneTemplate, delegate, icon, on, qs, setText } from './dom.js';
import { dishImage } from './picture.js';
import { showToast } from './toast.js';

const NOTE_SAVE_MS = 500;

/**
 * @param {HTMLElement} root
 * @param {{ store: ReturnType<typeof import('../cart/cart-store.js').createCartStore>,
 *           config: typeof import('../config.js').CONFIG }} deps
 */
export function initCartView(root, { store, config }) {
  const el = {
    lines: qs('[data-cart-lines]', root),
    empty: qs('[data-cart-empty]', root),
    summary: qs('[data-cart-summary]', root),
    subtotal: qs('[data-cart-subtotal]', root),
    total: qs('[data-cart-total]', root),
    count: qs('[data-cart-count-text]', root),
    blocked: qs('[data-cart-blocked]', root),
    checkout: qs('[data-cart-checkout]', root),
    note: /** @type {HTMLTextAreaElement | null} */ (qs('[data-cart-note]', root)),
    noteCount: qs('[data-cart-note-count]', root),
    noteField: qs('[data-cart-note-field]', root),
  };
  const limits = config.limits;
  const price = (minor) => formatPrice(minor, config) ?? '';

  // ---- Quantity, remove ---------------------------------------------------
  delegate(root, 'click', '[data-qty]', (event, button) => {
    if (button.getAttribute('aria-disabled') === 'true') return;
    const line = findLine(button);
    if (!line) return;
    const delta = button.dataset.qty === 'inc' ? 1 : -1;
    const result = store.setQty(line.line.key, line.line.qty + delta);
    const limit = limitMessage(result, limits);
    if (limit) showToast({ message: limit });
    else if (!result.error) announce(t('cart.qtyChanged', { name: lineName(line.product, line.variant), qty: result.qty }));
  });

  delegate(root, 'click', '[data-remove]', (event, button) => {
    const line = findLine(button);
    if (!line) return;
    const name = lineName(line.product, line.variant);
    const removed = store.remove(line.line.key);
    showToast({
      message: t('cart.removed', { name }),
      action: {
        label: t('cart.undo'),
        onClick: () => {
          store.restore(removed);
          announce(t('cart.restored', { name }));
        },
      },
    });
  });

  // ---- Order note -----------------------------------------------------------
  if (el.note) {
    el.note.maxLength = limits.noteMaxLength;
    let timer = 0;
    const save = () => {
      window.clearTimeout(timer);
      store.setOrderNote(el.note.value);
    };
    on(el.note, 'input', () => {
      updateNoteCount();
      window.clearTimeout(timer);
      timer = window.setTimeout(save, NOTE_SAVE_MS);
    });
    on(el.note, 'blur', save);
  }

  // Checkout link is disabled while a line can't be ordered.
  if (el.checkout) {
    on(el.checkout, 'click', (event) => {
      if (el.checkout.getAttribute('aria-disabled') === 'true') {
        event.preventDefault();
        el.blocked?.focus();
      }
    });
  }

  let current = store.getView();
  store.subscribe((view, change) => render(view, change));
  render(current, { type: 'load' });

  function render(view, change) {
    current = view;
    const focus = rememberFocus();
    const empty = view.lines.length === 0;

    if (el.lines) el.lines.replaceChildren(...view.lines.map(lineElement));
    if (el.empty) el.empty.hidden = !empty;
    if (el.summary) el.summary.hidden = empty;
    if (el.noteField) el.noteField.hidden = empty;
    if (el.count) el.count.textContent = t('cart.items', { count: view.itemCount });
    if (el.subtotal) el.subtotal.textContent = price(view.subtotal);
    if (el.total) el.total.textContent = price(view.total);

    const blocking = view.lines.filter((l) => l.status !== 'ok').length;
    if (el.blocked) {
      el.blocked.hidden = blocking === 0;
      el.blocked.textContent = blocking ? t('cart.blocked', { count: blocking }) : '';
    }
    if (el.checkout) el.checkout.setAttribute('aria-disabled', String(blocking > 0));

    // Don't overwrite the note while the customer is typing it here.
    if (el.note && (document.activeElement !== el.note || change.type === 'sync')) {
      el.note.value = view.orderNote;
      updateNoteCount();
    }
    restoreFocus(focus);
  }

  /** @param {import('../core/pricing.js').PricedLine} priced */
  function lineElement(priced) {
    const { line, product, variant, lineTotal, status } = priced;
    const item = cloneTemplate('tpl-cart-line');
    const name = lineName(product, variant);
    item.dataset.key = line.key;
    item.dataset.status = status;

    item.querySelector('[data-media]').append(dishImage(product, { sizes: '4rem', tileText: product.name }));
    setText(item, 'name', product.name);
    setText(item, 'variant', variant?.label);
    setText(item, 'note', line.note ? t('cart.lineNote', { note: line.note }) : null);
    setText(item, 'status', status === 'ok' ? null : t(status === 'unpriced' ? 'cart.lineUnpriced' : 'cart.lineUnavailable'));
    setText(item, 'qty', line.qty);
    setText(item, 'total', lineTotal === null ? t('cart.notIncluded') : price(lineTotal));

    const dec = item.querySelector('[data-qty="dec"]');
    const inc = item.querySelector('[data-qty="inc"]');
    dec.setAttribute('aria-label', t('cart.dec', { name }));
    inc.setAttribute('aria-label', t('cart.inc', { name }));
    dec.setAttribute('aria-disabled', String(line.qty <= 1));
    const atMax = line.qty >= limits.maxQtyPerItem || current.itemCount >= limits.maxItemsPerOrder;
    inc.setAttribute('aria-disabled', String(atMax || status !== 'ok'));
    dec.replaceChildren(icon('minus', { size: 'sm' }));
    inc.replaceChildren(icon('plus', { size: 'sm' }));
    setText(item, 'remove-name', ` ${name}`);
    return item;
  }

  function findLine(element) {
    const key = element.closest('[data-key]')?.dataset.key;
    return current.lines.find((l) => l.line.key === key) ?? null;
  }

  function updateNoteCount() {
    if (!el.note || !el.noteCount) return;
    const count = el.note.value.length;
    // Shown from 80% of the limit (UX_ARCHITECTURE §8.1).
    el.noteCount.hidden = count < limits.noteMaxLength * 0.8;
    el.noteCount.textContent = t('cart.noteCount', { count, max: limits.noteMaxLength });
  }

  /** Re-rendering replaces lines; keep keyboard focus on the same control. */
  function rememberFocus() {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || !el.lines?.contains(active)) return null;
    const lineEl = active.closest('[data-key]');
    const items = [...el.lines.children];
    return {
      key: lineEl?.dataset.key,
      control: active.dataset.qty ? `[data-qty="${active.dataset.qty}"]` : active.hasAttribute('data-remove') ? '[data-remove]' : null,
      index: items.indexOf(lineEl),
    };
  }

  function restoreFocus(focus) {
    if (!focus) return;
    const items = [...el.lines.children];
    const same = items.find((item) => item.dataset.key === focus.key);
    const target = same
      ? same.querySelector(focus.control ?? '[data-remove]')
      : (items[focus.index] ?? items[focus.index - 1])?.querySelector('[data-remove]') ?? qs('[data-cart-focus]', root);
    target?.focus();
  }
}
