/**
 * Keep keyboard focus clear of sticky and fixed bars (WCAG 2.2 — 2.4.11
 * Focus Not Obscured).
 *
 * `scroll-padding` handles focus that needs scrolling anyway, but browsers
 * don't scroll an element that is already inside the viewport, even when the
 * mobile cart bar or the sticky header is drawn over it. After each focus
 * change this checks the bars that are actually stuck and, if the focused
 * element sits under one, scrolls just enough to reveal it.
 */

/** Bars that stay on screen while the page scrolls. */
const BARS = '[data-header], .menu-layout__rail, [data-cart-bar]:not([hidden])';
/** Space kept between the focused element and a bar, in px. */
const GAP = 8;

export function initFocusClear() {
  document.addEventListener('focusin', (event) => {
    const el = event.target;
    // Elements inside a fixed bar or a dialog move with it.
    if (!(el instanceof Element) || el.closest('[data-header], [data-cart-bar], dialog')) return;
    // After layout has settled (e.g. a filter that re-renders the list).
    requestAnimationFrame(() => {
      if (document.activeElement === el) reveal(el);
    });
  });
}

/** @param {Element} el */
function reveal(el) {
  const rect = el.getBoundingClientRect();
  if (rect.height === 0 || rect.height > innerHeight / 2) return;

  let top = 0;
  let bottom = innerHeight;
  for (const bar of document.querySelectorAll(BARS)) {
    if (bar.contains(el) || !/sticky|fixed/.test(getComputedStyle(bar).position)) continue;
    const b = bar.getBoundingClientRect();
    if (b.height === 0 || b.right <= rect.left || b.left >= rect.right) continue;
    if (b.top < innerHeight / 2) top = Math.max(top, b.bottom);
    else bottom = Math.min(bottom, b.top);
  }

  let delta = 0;
  if (rect.top < top + GAP) delta = rect.top - top - GAP;
  else if (rect.bottom > bottom - GAP) delta = rect.bottom - bottom + GAP;
  // Focus moves instantly; a smooth scroll would leave it hidden mid-way.
  if (delta !== 0) window.scrollBy({ top: delta, behavior: 'instant' });
}
