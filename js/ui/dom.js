/**
 * Small DOM helpers. Everything that inserts text uses textContent — never
 * innerHTML with data (TECHNICAL_ARCHITECTURE §10.1).
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const SPRITE_URL = new URL('../../assets/icons/sprite.svg', import.meta.url).pathname;

/**
 * @template {Element} T
 * @param {string} selector
 * @param {ParentNode} [root]
 * @returns {T | null}
 */
export function qs(selector, root = document) {
  return root.querySelector(selector);
}

/**
 * @param {string} selector
 * @param {ParentNode} [root]
 * @returns {Element[]}
 */
export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

/**
 * Clone the first element of a <template>.
 * @param {string} id  Template element id
 * @returns {HTMLElement}
 */
export function cloneTemplate(id) {
  const template = document.getElementById(id);
  if (!(template instanceof HTMLTemplateElement)) {
    throw new Error(`Template #${id} not found`);
  }
  const element = template.content.firstElementChild?.cloneNode(true);
  if (!element) throw new Error(`Template #${id} is empty`);
  return /** @type {HTMLElement} */ (element);
}

/**
 * Set the text of a `[data-field="name"]` slot inside `root`.
 * An empty or nullish value hides the slot instead of leaving an empty element.
 * @param {ParentNode} root
 * @param {string} field
 * @param {string | number | null | undefined} value
 */
export function setText(root, field, value) {
  const slot = root.querySelector(`[data-field="${field}"]`);
  if (!(slot instanceof HTMLElement)) return;
  const text = value === null || value === undefined ? '' : String(value);
  slot.textContent = text;
  slot.hidden = text === '';
}

/**
 * Create an icon element that references the Lucide sprite.
 * @param {string} name   Symbol id in assets/icons/sprite.svg
 * @param {{ size?: 'sm' | 'lg', className?: string }} [options]
 * @returns {SVGSVGElement}
 */
export function icon(name, { size, className } = {}) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', ['icon', size && `icon--${size}`, className].filter(Boolean).join(' '));
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', `${SPRITE_URL}#${name}`);
  svg.append(use);
  return svg;
}

/**
 * Add an event listener and get a function that removes it.
 * @param {EventTarget} target
 * @param {string} type
 * @param {(event: any) => void} handler
 * @param {AddEventListenerOptions} [options]
 * @returns {() => void}
 */
export function on(target, type, handler, options) {
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
}

/**
 * Event delegation: one listener on `root` handles events from any matching
 * descendant, including elements added later (rendered lists).
 * The handler receives the event and the matched element.
 * @param {ParentNode & EventTarget} root
 * @param {string} type
 * @param {string} selector
 * @param {(event: Event, match: HTMLElement) => void} handler
 * @returns {() => void}
 */
export function delegate(root, type, selector, handler) {
  return on(root, type, (event) => {
    const origin = event.target instanceof Element ? event.target : null;
    const match = origin?.closest(selector);
    if (match instanceof HTMLElement && /** @type {Node} */ (root).contains(match)) {
      handler(event, match);
    }
  });
}
