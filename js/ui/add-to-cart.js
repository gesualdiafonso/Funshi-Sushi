/**
 * Quick "Add" buttons on menu lines and featured cards (UX_ARCHITECTURE §7).
 * Dishes with sizes get "Choose" instead, which opens the product dialog.
 * Feedback: the button says "Added" briefly, the count bumps, and the
 * change is announced; limits and refusals get a toast.
 */

import { t } from '../strings.js';
import { announce } from './announcer.js';
import { lineName, reasonMessage } from './cart-messages.js';
import { delegate, icon } from './dom.js';
import { showToast } from './toast.js';

const ADDED_MS = 1200;

/**
 * @param {{ store: ReturnType<typeof import('../cart/cart-store.js').createCartStore>,
 *           catalog: import('../core/catalog.js').Catalog,
 *           config: typeof import('../config.js').CONFIG }} deps
 */
export function initQuickAdd({ store, catalog, config }) {
  delegate(document, 'click', '[data-add-dish]', (event, button) => {
    if (button.dataset.state === 'added') return;
    const product = catalog.byId.get(button.dataset.addDish ?? '');
    if (!product) return;
    const result = store.add({ productId: product.id, qty: 1 });
    const problem = reasonMessage(result, config.limits);
    if (result.added > 0) {
      showAdded(button);
      announce(addedMessage(product, null, result.added, store.getView().itemCount));
    }
    if (problem) showToast({ message: problem });
  });
}

/** "Added 2 × Salmon uramaki (16 pcs). Your order: 3 items." */
export function addedMessage(product, variant, qty, itemCount) {
  return t('cart.addedMessage', { qty, name: lineName(product, variant), items: t('cart.items', { count: itemCount }) });
}

/** Button feedback: "✓ Added" for a moment, then back to its label. */
export function showAdded(button) {
  const children = [...button.childNodes];
  button.dataset.state = 'added';
  const hidden = button.querySelector('.visually-hidden');
  button.replaceChildren(icon('check', { size: 'sm' }), t('cart.added'), ...(hidden ? [hidden] : []));
  window.setTimeout(() => {
    delete button.dataset.state;
    button.replaceChildren(...children);
  }, ADDED_MS);
}

/**
 * Configure an Add/Choose control for a dish (menu line, featured card).
 * @returns {HTMLElement | null} the control, or null when it can't be ordered
 */
export function addControl(product, { linkToMenu = false } = {}) {
  if (!product.available) return null;
  const hasSizes = Array.isArray(product.variants);
  const priced = hasSizes ? product.variants.some((v) => Number.isInteger(v.price)) : Number.isInteger(product.price);
  if (!priced) return null;

  let control;
  if (hasSizes && linkToMenu) {
    control = document.createElement('a');
    control.href = `menu.html?dish=${encodeURIComponent(product.slug)}`;
  } else {
    control = document.createElement('button');
    control.type = 'button';
    if (hasSizes) {
      control.dataset.openDish = product.slug;
      control.setAttribute('aria-haspopup', 'dialog');
    } else {
      control.dataset.addDish = product.id;
    }
  }
  control.className = `button button--${hasSizes ? 'secondary' : 'primary'} button--compact`;
  const hidden = document.createElement('span');
  hidden.className = 'visually-hidden';
  hidden.textContent = t(hasSizes ? 'cart.chooseName' : 'cart.addName', { name: product.name });
  control.append(t(hasSizes ? 'cart.choose' : 'cart.add'), hidden);
  return control;
}
