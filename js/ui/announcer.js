/**
 * Shared polite live region for screen-reader announcements
 * (cart updates, filter result counts). One region per page:
 *   <div class="visually-hidden" aria-live="polite" data-announcer></div>
 */

let region = null;
let clearTimer = 0;

/**
 * Announce a message to assistive technology without moving focus.
 * The region is emptied first so repeating the same message is still read.
 * @param {string} message
 */
export function announce(message) {
  region ??= document.querySelector('[data-announcer]');
  if (!region) return;
  window.clearTimeout(clearTimer);
  region.textContent = '';
  // Next frame: screen readers notice a change from empty to the new text.
  requestAnimationFrame(() => {
    region.textContent = message;
    clearTimer = window.setTimeout(() => {
      region.textContent = '';
    }, 7000);
  });
}
