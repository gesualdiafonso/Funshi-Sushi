/**
 * Cart drawer — the order, reachable from every page (UX_ARCHITECTURE §8.1).
 * A native <dialog> opened through the shared overlay controller.
 */

import { t } from '../strings.js';
import { announce } from './announcer.js';
import { initCartView } from './cart-view.js';
import { delegate, qs } from './dom.js';
import { closeOverlay, getOpenOverlay, openOverlay } from './overlay.js';

/**
 * @param {{ store: ReturnType<typeof import('../cart/cart-store.js').createCartStore>,
 *           config: typeof import('../config.js').CONFIG }} deps
 * @returns {{ open: (trigger?: HTMLElement | null) => void } | null}
 */
export function initCartDrawer({ store, config }) {
  const drawer = /** @type {HTMLDialogElement | null} */ (qs('[data-cart-drawer]'));
  if (!drawer) return null;

  initCartView(drawer, { store, config });
  const storageNotice = qs('[data-storage-notice]', drawer);
  if (storageNotice) storageNotice.hidden = store.isPersistent();

  const title = qs('#cart-title', drawer);
  const open = (trigger = null) => {
    hideClearConfirm();
    openOverlay(drawer, { id: 'cart', returnFocus: trigger, initialFocus: title });
  };

  // Links inside the open drawer: close first (consumes its history entry), then go.
  delegate(drawer, 'click', 'a[href]', (event, link) => {
    if (link.getAttribute('aria-disabled') === 'true' || getOpenOverlay() !== drawer) return;
    const url = new URL(link.href, location.href);
    event.preventDefault();
    const samePage = url.pathname === location.pathname && !url.search;
    closeOverlay(drawer, { restoreFocus: samePage, afterClose: samePage ? undefined : () => location.assign(url.href) });
  });

  // Empty cart, with an inline confirmation.
  const clearButton = qs('[data-cart-clear]', drawer);
  const confirm = qs('[data-cart-clear-confirm]', drawer);
  delegate(drawer, 'click', '[data-cart-clear]', () => {
    qs('[data-cart-clear-question]', drawer).textContent = t('cart.clearConfirm', { count: store.getView().itemCount });
    confirm.hidden = false;
    clearButton.hidden = true;
    qs('[data-cart-clear-no]', drawer).focus();
  });
  delegate(drawer, 'click', '[data-cart-clear-yes]', () => {
    store.clear();
    hideClearConfirm();
    announce(t('cart.cleared'));
    title.focus();
  });
  delegate(drawer, 'click', '[data-cart-clear-no]', () => {
    hideClearConfirm();
    clearButton.focus();
  });

  function hideClearConfirm() {
    confirm.hidden = true;
    clearButton.hidden = false;
  }

  return { open };
}
