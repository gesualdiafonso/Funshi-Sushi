export const qs = (selector, root = document) => root.querySelector(selector);
export const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

/** Clones the first element child of a <template>. */
export function cloneTemplate(template) {
  if (!(template instanceof HTMLTemplateElement)) {
    throw new TypeError('cloneTemplate expects a <template> element');
  }
  return template.content.firstElementChild.cloneNode(true);
}

/** Sets textContent on the element matching [data-slot="name"] inside root. */
export function fillSlot(root, name, text) {
  const target = root.querySelector(`[data-slot="${name}"]`);
  if (target) target.textContent = text;
  return target;
}

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
