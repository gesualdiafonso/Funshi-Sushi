/**
 * Cart count in the header and the mobile cart bar (UX_ARCHITECTURE §8.4).
 * Both open the drawer; on a page without one (checkout) they go to the order.
 */

import { formatPrice } from '../core/money.js';
import { t } from '../strings.js';
import { delegate, qs, qsa, setText } from './dom.js';

/**
 * @param {{ store: ReturnType<typeof import('../cart/cart-store.js').createCartStore>,
 *           config: typeof import('../config.js').CONFIG,
 *           drawer: { open: (trigger?: HTMLElement | null) => void } | null }} deps
 */
export function initCartIndicators({ store, config, drawer }) {
  const buttons = qsa('[data-cart-open]');
  const badges = qsa('[data-cart-count]');
  const bar = qs('[data-cart-bar]');
  for (const button of buttons) button.hidden = false; // ordering needs JS: shown only now

  delegate(document, 'click', '[data-cart-open]', (event, button) => {
    if (drawer) {
      drawer.open(button);
      return;
    }
    const order = qs('[data-cart-focus]');
    order?.scrollIntoView({ block: 'start' });
    order?.focus({ preventScroll: true });
  });

  const render = (view, change) => {
    const count = view.itemCount;
    for (const badge of badges) {
      badge.textContent = String(count);
      badge.dataset.count = String(count);
      if (change.type === 'add') {
        delete badge.dataset.bump;
        void badge.offsetWidth; // restart the animation
        badge.dataset.bump = '';
      }
    }
    for (const button of qsa('.cart-button')) button.setAttribute('aria-label', t('cart.button', { count }));

    if (bar && drawer) {
      bar.hidden = count === 0;
      document.documentElement.toggleAttribute('data-has-cart-bar', count > 0);
      setText(bar, 'count', t('cart.items', { count }));
      setText(bar, 'subtotal', formatPrice(view.subtotal, config));
    }
  };
  store.subscribe(render);
  render(store.getView(), { type: 'load' });
}
