import { featuredProducts, findProduct } from '../data/menu.js';
import { qs, cloneTemplate, fillSlot } from '../utils/dom.js';
import { formatPrice, formatDishMeta } from '../utils/format.js';

/**
 * Renders featured dishes from menu data and opens a details dialog.
 * "Ask about this dish" pre-fills the contact form.
 */
export function initFeaturedDishes() {
  const grid = qs('[data-js="dish-grid"]');
  const template = qs('[data-js="dish-template"]');
  const dialog = qs('[data-js="dish-dialog"]');
  if (!grid || !template) return;

  const items = featuredProducts().map((product) => {
    const item = cloneTemplate(template);
    const button = qs('.dish__button', item);
    button.dataset.productId = product.id;
    fillSlot(item, 'meta', formatDishMeta(product));
    fillSlot(item, 'name', product.name);
    fillSlot(item, 'price', formatPrice(product.price));
    fillSlot(item, 'photo-caption', `${product.name} · 4:5`);
    qs('.dish__photo', item).setAttribute('aria-label', `Photo placeholder: ${product.name}`);
    return item;
  });
  grid.replaceChildren(...items);

  if (!dialog || typeof dialog.showModal !== 'function') return;

  let currentProduct = null;

  grid.addEventListener('click', (event) => {
    const button = event.target.closest('.dish__button');
    if (!button) return;
    currentProduct = findProduct(button.dataset.productId);
    if (!currentProduct) return;
    fillDialog(dialog, currentProduct);
    dialog.showModal();
  });

  qs('[data-js="dialog-close"]', dialog)?.addEventListener('click', () => dialog.close());

  // Click on the backdrop closes the dialog.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  // Return focus to the dish that opened the dialog.
  dialog.addEventListener('close', () => {
    if (!currentProduct) return;
    grid.querySelector(`[data-product-id="${currentProduct.id}"]`)?.focus();
  });

  qs('[data-js="dish-ask"]', dialog)?.addEventListener('click', () => {
    const product = currentProduct;
    currentProduct = null; // focus goes to the form, not back to the card
    dialog.close();
    if (product) prefillContactForm(product);
  });
}

function fillDialog(dialog, product) {
  fillSlot(dialog, 'meta', formatDishMeta(product));
  fillSlot(dialog, 'name', product.name);
  fillSlot(dialog, 'description', product.description);
  fillSlot(dialog, 'price', formatPrice(product.price));
  fillSlot(dialog, 'photo-caption', `${product.name} · 4:3`);
  qs('[data-js="dish-dialog-photo"]', dialog).setAttribute('aria-label', `Photo placeholder: ${product.name}`);

  const tags = qs('[data-slot="tags"]', dialog);
  tags.replaceChildren(
    ...product.tags.map((tag) => {
      const item = document.createElement('li');
      item.className = 'tag';
      item.textContent = tag;
      return item;
    }),
  );
  tags.hidden = product.tags.length === 0;
}

function prefillContactForm(product) {
  const topic = document.getElementById('contact-topic');
  const message = document.getElementById('contact-message');
  if (topic) topic.value = 'Question about a dish';
  if (message && !message.value.trim()) {
    message.value = `I'd like to know more about the ${product.name}: `;
    message.dispatchEvent(new Event('input', { bubbles: true }));
  }
  document.getElementById('contact')?.scrollIntoView({ block: 'start' });
  message?.focus({ preventScroll: true });
  message?.setSelectionRange(message.value.length, message.value.length);
}
