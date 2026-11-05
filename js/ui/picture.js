/**
 * Responsive dish images (BRAND_GUIDELINES §6.4) and the typographic tile
 * used when a dish has no image or its image fails to load (UX E4).
 */

export const PRODUCT_IMAGE_WIDTHS = [240, 480, 800];
const JPEG_WIDTH = 480;
const BASE = new URL('../../assets/images/products/', import.meta.url).pathname;
const REPO_BASE = 'assets/images/products/';

/** Every file a dish image needs (used by tests/consistency.test.js). */
export function PRODUCT_IMAGE_FILES(file) {
  return [
    ...PRODUCT_IMAGE_WIDTHS.flatMap((w) => [`${REPO_BASE}${file}-${w}.avif`, `${REPO_BASE}${file}-${w}.webp`]),
    `${REPO_BASE}${file}-${JPEG_WIDTH}.jpg`,
  ];
}

const srcset = (file, ext) => PRODUCT_IMAGE_WIDTHS.map((w) => `${BASE}${file}-${w}.${ext} ${w}w`).join(', ');

/**
 * @param {import('../core/catalog.js').Product} product
 * @param {{ sizes: string, eager?: boolean, tileText?: string }} options
 *   sizes: the `sizes` attribute for this context; tileText: fallback label
 * @returns {HTMLElement} <picture> or tile
 */
export function dishImage(product, { sizes, eager = false, tileText = product.name }) {
  if (!product.image) return tile(tileText);

  const picture = document.createElement('picture');
  for (const [type, ext] of [['image/avif', 'avif'], ['image/webp', 'webp']]) {
    const source = document.createElement('source');
    source.type = type;
    source.srcset = srcset(product.image.file, ext);
    source.sizes = sizes;
    picture.append(source);
  }
  const img = document.createElement('img');
  img.src = `${BASE}${product.image.file}-${JPEG_WIDTH}.jpg`;
  img.alt = product.image.alt;
  img.width = 800;
  img.height = 800;
  img.decoding = 'async';
  img.loading = eager ? 'eager' : 'lazy';
  if (!eager) {
    // Fades in once decoded instead of painting top to bottom (base.css).
    img.dataset.loading = '';
    img.addEventListener('load', () => img.removeAttribute('data-loading'), { once: true });
  }
  img.addEventListener('error', () => picture.replaceWith(tile(tileText)), { once: true });
  picture.append(img);
  return picture;
}

/** Decorative placeholder: the dish name is always in a heading nearby. */
export function tile(text) {
  const el = document.createElement('div');
  el.className = 'tile';
  el.setAttribute('aria-hidden', 'true');
  const name = document.createElement('span');
  name.className = 'tile__name';
  name.textContent = text;
  el.append(name);
  return el;
}
