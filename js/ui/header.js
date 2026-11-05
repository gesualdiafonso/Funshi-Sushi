/**
 * Site header: scrolled state and the mobile navigation panel.
 * UX_ARCHITECTURE §3.2, §12.1–12.2.
 */

import { t } from '../strings.js';
import { closeOverlay, getOpenOverlay, openOverlay } from './overlay.js';
import { delegate, on, qs } from './dom.js';

const WIDE_SCREEN = '(min-width: 64rem)';

export function initHeader() {
  const header = qs('[data-header]');
  if (!header) return;

  initScrolledState(header);
  initMobileNav(header);
}

/** Mark the header as scrolled once the page moves past the top (shadow, solid bg). */
function initScrolledState(header) {
  const sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;inset:0 auto auto 0;width:1px;height:24px;pointer-events:none;';
  document.body.prepend(sentinel);

  const observer = new IntersectionObserver(([entry]) => {
    header.toggleAttribute('data-scrolled', !entry.isIntersecting);
  });
  observer.observe(sentinel);
}

function initMobileNav(header) {
  const toggle = qs('[data-nav-toggle]', header);
  const nav = qs('[data-nav]', header);
  if (!toggle || !nav) return;

  const setExpanded = (expanded) => {
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', t(expanded ? 'nav.close' : 'nav.open'));
    header.toggleAttribute('data-nav-open', expanded);
  };

  const close = (flags) => closeOverlay(nav, flags);

  on(toggle, 'click', () => {
    if (getOpenOverlay() === nav) {
      close();
      return;
    }
    openOverlay(nav, {
      id: 'nav',
      returnFocus: toggle,
      onClose: () => setExpanded(false),
    });
    setExpanded(true);
  });

  // A link inside the open panel: close first, then navigate, so the panel's
  // history entry is consumed before the new navigation (no back-button trap).
  delegate(nav, 'click', 'a[href]', (event, link) => {
    if (getOpenOverlay() !== nav) return;
    const url = new URL(link.href, location.href);
    const samePage = url.pathname === location.pathname && url.hash;

    event.preventDefault();
    close({
      restoreFocus: false,
      afterClose: () => {
        if (samePage) {
          location.hash = url.hash;
          // The browser restores the old scroll position after history.back();
          // scroll on the next frame so the section wins over that restore.
          requestAnimationFrame(() => focusSection(url.hash.slice(1)));
        } else {
          location.assign(url.href);
        }
      },
    });
  });

  // Growing past the breakpoint (rotation, resize) closes the panel.
  const wide = window.matchMedia(WIDE_SCREEN);
  on(wide, 'change', (event) => {
    if (event.matches && getOpenOverlay() === nav) close({ restoreFocus: false });
  });
}

/** Scroll to an in-page section and move keyboard focus to it. */
function focusSection(id) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ block: 'start' }); // honors scroll-padding-top (sticky header)
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}
