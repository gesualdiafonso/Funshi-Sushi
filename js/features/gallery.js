import { qs, prefersReducedMotion } from '../utils/dom.js';

/**
 * Horizontal gallery built on native scrolling:
 *  - touch / trackpad: native swipe with scroll-snap
 *  - keyboard: the track is focusable; arrow keys scroll natively
 *  - mouse: previous / next buttons (no custom drag — native scrolling
 *    already covers touch and trackpads, and drag conflicts with text
 *    selection and click targets).
 */
export function initGallery() {
  const track = qs('[data-js="gallery-track"]');
  const controls = qs('[data-js="gallery-controls"]');
  const prev = qs('[data-js="gallery-prev"]');
  const next = qs('[data-js="gallery-next"]');
  if (!track || !controls || !prev || !next) return;

  controls.hidden = false;

  const step = () => Math.max(track.clientWidth * 0.8, 240);
  const behavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: behavior() }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: behavior() }));

  const updateButtons = () => {
    const max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
  };

  let ticking = false;
  track.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateButtons();
        ticking = false;
      });
    },
    { passive: true },
  );
  window.addEventListener('resize', updateButtons, { passive: true });
  updateButtons();
}
