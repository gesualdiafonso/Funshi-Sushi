/**
 * Entry module — Checkout page (checkout.html): order review, customer
 * details and the WhatsApp handoff.
 */

import { startPage } from '../app.js';
import { initCartView } from '../ui/cart-view.js';
import { initCheckoutForm } from '../ui/checkout-form.js';
import { qs } from '../ui/dom.js';

startPage(({ store, config, features, isDemoMenu }) => {
  const form = qs('[data-checkout-order]');
  if (!form) return;
  initCartView(form, { store, config });
  initCheckoutForm({ store, config, features, isDemo: isDemoMenu });
  form.hidden = false;
});
