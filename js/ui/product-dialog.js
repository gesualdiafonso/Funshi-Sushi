/**
 * Product details in a native <dialog> (UX_ARCHITECTURE §7.2), with the
 * add-to-order form: size, quantity, a note for the dish.
 * Opening pushes ?dish=<slug> so details can be linked to and the back
 * button closes them; the page can also load straight into a dish.
 */

import { checkOrderable } from '../core/catalog.js';
import { formatPrice } from '../core/money.js';
import { t } from '../strings.js';
import { addedMessage } from './add-to-cart.js';
import { announce } from './announcer.js';
import { reasonMessage } from './cart-messages.js';
import { delegate, icon, on, qs, setText } from './dom.js';
import { closeOverlay, openOverlay } from './overlay.js';
import { dishImage } from './picture.js';
import { piecesText, setPrice, tagBadges, unavailableBadge } from './product-info.js';
import { showToast } from './toast.js';

const IMAGE_SIZES = '(min-width: 48rem) 24rem, 100vw';

/**
 * @param {import('../core/catalog.js').Catalog} catalog
 * @param {typeof import('../config.js').CONFIG} config
 * @param {{ isDemo: boolean, items: Map<string, HTMLElement>,
 *           store: ReturnType<typeof import('../cart/cart-store.js').createCartStore>,
 *           drawer: { open: (trigger?: HTMLElement | null) => void } | null }} options
 * @returns {{ missingDish: string | null }} a ?dish= slug that matched no dish
 */
export function initProductDialog(catalog, config, { isDemo, items, store, drawer }) {
  const dialog = /** @type {HTMLDialogElement | null} */ (qs('[data-product-dialog]'));
  if (!dialog) return { missingDish: null };
  const limits = config.limits;
  const el = {
    sizes: qs('[data-sizes]', dialog),
    sizeList: qs('[data-sizes-list]', dialog),
    noteField: qs('[data-dish-note-field]', dialog),
    note: /** @type {HTMLInputElement} */ (qs('[data-dish-note]', dialog)),
    controls: qs('[data-add-controls]', dialog),
    qty: qs('[data-dish-qty]', dialog),
    dec: qs('[data-dish-qty-dec]', dialog),
    inc: qs('[data-dish-qty-inc]', dialog),
    add: qs('[data-dish-add]', dialog),
    reason: qs('[data-add-reason]', dialog),
    price: qs('[data-field="price"]', dialog),
  };
  el.note.maxLength = limits.itemNoteMaxLength;
  el.dec.replaceChildren(icon('minus', { size: 'sm' }));
  el.inc.replaceChildren(icon('plus', { size: 'sm' }));

  /** @type {{ product: import('../core/catalog.js').Product, qty: number, trigger: HTMLElement | null } | null} */
  let current = null;

  delegate(document, 'click', '[data-open-dish]', (event, button) => {
    const product = catalog.bySlug.get(button.dataset.openDish ?? '');
    if (product) open(product, { trigger: button });
  });

  on(el.dec, 'click', () => changeQty(-1));
  on(el.inc, 'click', () => changeQty(1));
  on(el.sizeList, 'change', updateAddButton);
  on(el.add, 'click', addToOrder);

  // Deep link: menu.html?dish=salmon-nigiri
  const slug = new URLSearchParams(location.search).get('dish');
  if (!slug) return { missingDish: null };
  const product = catalog.bySlug.get(slug);
  if (!product) {
    history.replaceState(history.state, '', withoutDish());
    return { missingDish: slug };
  }
  const trigger = items.get(product.id)?.querySelector('[data-open-dish]');
  open(product, { trigger: isShown(trigger) ? trigger : null, fromDeepLink: true });
  return { missingDish: null };

  // ---------------------------------------------------------------------------
  function open(product, { trigger, fromDeepLink = false }) {
    current = { product, qty: 1, trigger };
    fill(product);
    const params = new URLSearchParams(location.search);
    params.set('dish', product.slug);
    openOverlay(dialog, {
      id: 'dish',
      url: `${location.pathname}?${params}${location.hash}`,
      fromDeepLink,
      closeUrl: withoutDish(),
      returnFocus: trigger ?? null,
      // Start at the dish name: screen readers read it first, no stray focus ring.
      initialFocus: qs('#product-dialog-title', dialog),
      onClose: () => {
        // Arriving from a link (home page, shared URL): show where the dish sits on the menu.
        if (fromDeepLink && trigger) trigger.closest('[data-dish]')?.scrollIntoView({ block: 'center', behavior: 'instant' });
      },
    });
  }

  function fill(product) {
    const category = catalog.categoryById.get(product.categoryId);
    qs('[data-media]', dialog).replaceChildren(dishImage(product, { sizes: IMAGE_SIZES, eager: true, tileText: product.name }));
    dialog.toggleAttribute('data-unavailable', !product.available);
    setText(dialog, 'category', category?.name);
    setText(dialog, 'name', product.name);
    setText(dialog, 'description', product.description);
    setText(dialog, 'details', product.details);
    setText(dialog, 'pieces', piecesText(product));

    const meta = qs('[data-meta]', dialog);
    meta.querySelectorAll('.badge').forEach((badge) => badge.remove());
    if (!product.available) meta.prepend(unavailableBadge());
    meta.append(...tagBadges(product, catalog));
    qs('[data-unavailable-note]', dialog).hidden = product.available;

    fillSizes(product);

    const ingredients = product.ingredients ?? [];
    qs('[data-ingredients]', dialog).hidden = ingredients.length === 0;
    setText(dialog, 'ingredients', capitalize(ingredients.join(', ')));
    const allergens = product.allergens;
    setText(dialog, 'allergens', allergens === undefined
      ? t('dish.allergensUnknown')
      : allergens.length === 0
        ? t('dish.allergensNone')
        : allergens.map((id) => catalog.allergenById.get(id)?.label).join(', '));
    qs('[data-sample-dish]', dialog).hidden = !isDemo;

    // Order form
    el.note.value = '';
    setPrice(el.price, product, config);
    const firstOrderable = product.variants ? product.variants.find((v) => checkOrderable(product, v.id).ok) : null;
    const check = checkOrderable(product, firstOrderable?.id ?? (product.variants ? product.variants[0].id : null));
    el.controls.hidden = !check.ok;
    el.noteField.hidden = !check.ok;
    el.price.hidden = check.ok; // the Add button carries the price when orderable
    el.reason.hidden = check.ok;
    el.reason.textContent = check.ok ? '' : reasonMessage({ error: check.reason }, limits) ?? '';
    updateAddButton();
  }

  /** Sizes as a radio group: first orderable size selected. */
  function fillSizes(product) {
    el.sizes.hidden = !product.variants;
    if (!product.variants) {
      el.sizeList.replaceChildren();
      return;
    }
    let checked = false;
    el.sizeList.replaceChildren(...product.variants.map((variant) => {
      const orderable = checkOrderable(product, variant.id).ok;
      const label = document.createElement('label');
      label.className = 'size-option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'dish-size';
      input.value = variant.id;
      input.disabled = !orderable;
      if (orderable && !checked) {
        input.checked = true;
        checked = true;
      }
      const text = document.createElement('span');
      text.textContent = variant.label;
      const leader = document.createElement('span');
      leader.className = 'menu-item__leader';
      leader.setAttribute('aria-hidden', 'true');
      const price = document.createElement('span');
      price.className = 't-price';
      price.textContent = formatPrice(variant.price, config) ?? t('menu.priceTbc');
      label.append(input, text, leader, price);
      return label;
    }));
  }

  function selectedVariant() {
    if (!current?.product.variants) return null;
    const id = /** @type {HTMLInputElement | null} */ (el.sizeList.querySelector('input:checked'))?.value;
    return current.product.variants.find((v) => v.id === id) ?? null;
  }

  function changeQty(delta) {
    if (!current) return;
    const next = current.qty + delta;
    if (next < 1 || next > limits.maxQtyPerItem) return;
    current.qty = next;
    updateAddButton();
    // The value itself isn't a live region (the cart's steppers announce the
    // same way, so a change is never read twice).
    announce(t('cart.qtyChanged', { name: current.product.name, qty: next }));
  }

  function updateAddButton() {
    if (!current) return;
    const { product, qty } = current;
    const variant = selectedVariant();
    const unit = variant ? variant.price : product.price;
    el.qty.textContent = String(qty);
    el.dec.setAttribute('aria-disabled', String(qty <= 1));
    el.inc.setAttribute('aria-disabled', String(qty >= limits.maxQtyPerItem));
    el.dec.setAttribute('aria-label', t('cart.dec', { name: product.name }));
    el.inc.setAttribute('aria-label', t('cart.inc', { name: product.name }));
    const total = Number.isInteger(unit) ? formatPrice(unit * qty, config) : null;
    el.add.textContent = total ? t('cart.addWithPrice', { price: total }) : t('cart.add');
  }

  function addToOrder() {
    if (!current) return;
    const { product, qty, trigger } = current;
    const variant = selectedVariant();
    const result = store.add({ productId: product.id, variantId: variant?.id ?? null, qty, note: el.note.value });
    const problem = reasonMessage(result, limits);
    if (result.added === 0) {
      el.reason.textContent = problem ?? '';
      el.reason.hidden = !problem;
      return;
    }
    closeOverlay(dialog);
    const message = addedMessage(product, variant, result.added, store.getView().itemCount);
    showToast({
      message: problem ? `${message} ${problem}` : message,
      action: drawer ? { label: t('cart.viewCart'), onClick: () => drawer.open(trigger) } : undefined,
    });
  }
}

function withoutDish() {
  const params = new URLSearchParams(location.search);
  params.delete('dish');
  const search = params.toString();
  return `${location.pathname}${search ? `?${search}` : ''}${location.hash}`;
}

function isShown(element) {
  return Boolean(element) && !element.closest('[hidden]');
}

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}
