/**
 * Product details in a native <dialog> (UX_ARCHITECTURE §7.2).
 * Opening pushes ?dish=<slug> so the details can be linked to and the back
 * button closes them; the page can also load straight into a dish.
 */

import { t } from '../strings.js';
import { delegate, qs, setText } from './dom.js';
import { openOverlay } from './overlay.js';
import { dishImage } from './picture.js';
import { piecesText, setPrice, tagBadges, unavailableBadge } from './product-info.js';
import { formatPrice } from '../core/money.js';

const IMAGE_SIZES = '(min-width: 48rem) 24rem, 100vw';

/**
 * @param {import('../core/catalog.js').Catalog} catalog
 * @param {typeof import('../config.js').CONFIG} config
 * @param {{ isDemo: boolean, items: Map<string, HTMLElement> }} options
 * @returns {{ missingDish: string | null }} a ?dish= slug that matched no dish
 */
export function initProductDialog(catalog, config, { isDemo, items }) {
  const dialog = /** @type {HTMLDialogElement | null} */ (qs('[data-product-dialog]'));
  if (!dialog) return { missingDish: null };

  delegate(document, 'click', '[data-open-dish]', (event, button) => {
    const product = catalog.bySlug.get(button.dataset.openDish ?? '');
    if (product) open(product, { trigger: button });
  });

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

  function open(product, { trigger, fromDeepLink = false }) {
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
      initialFocus: dialog.querySelector('#product-dialog-title'),
      onClose: () => {
        // Arriving from a link (home page, shared URL): show where the dish sits on the menu.
        if (fromDeepLink && trigger) trigger.closest('[data-dish]')?.scrollIntoView({ block: 'center', behavior: 'instant' });
      },
    });
  }

  function fill(product) {
    const category = catalog.categoryById.get(product.categoryId);
    dialog.querySelector('[data-media]').replaceChildren(
      dishImage(product, { sizes: IMAGE_SIZES, eager: true, tileText: product.name }),
    );
    dialog.toggleAttribute('data-unavailable', !product.available);
    setText(dialog, 'category', category?.name);
    setText(dialog, 'name', product.name);
    setText(dialog, 'description', product.description);
    setText(dialog, 'details', product.details);
    setText(dialog, 'pieces', piecesText(product));

    const meta = dialog.querySelector('[data-meta]');
    meta.querySelectorAll('.badge').forEach((badge) => badge.remove());
    if (!product.available) meta.prepend(unavailableBadge());
    meta.append(...tagBadges(product, catalog));
    dialog.querySelector('[data-unavailable-note]').hidden = product.available;

    // Sizes
    const sizes = dialog.querySelector('[data-sizes]');
    sizes.hidden = !product.variants;
    if (product.variants) {
      dialog.querySelector('[data-sizes-list]').replaceChildren(...product.variants.map((variant) => {
        const li = document.createElement('li');
        li.className = 'product-dialog__size';
        const label = document.createElement('span');
        label.textContent = variant.label;
        const leader = document.createElement('span');
        leader.className = 'menu-item__leader';
        leader.setAttribute('aria-hidden', 'true');
        const price = document.createElement('span');
        price.className = 't-price';
        price.textContent = formatPrice(variant.price, config) ?? t('menu.priceTbc');
        li.append(label, leader, price);
        return li;
      }));
    }

    // Ingredients and allergens
    const ingredients = product.ingredients ?? [];
    dialog.querySelector('[data-ingredients]').hidden = ingredients.length === 0;
    setText(dialog, 'ingredients', capitalize(ingredients.join(', ')));

    const allergens = product.allergens;
    setText(dialog, 'allergens', allergens === undefined
      ? t('dish.allergensUnknown')
      : allergens.length === 0
        ? t('dish.allergensNone')
        : allergens.map((id) => catalog.allergenById.get(id)?.label).join(', '));

    dialog.querySelector('[data-sample-dish]').hidden = !isDemo;
    setPrice(dialog.querySelector('[data-field="price"]'), product, config);
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
