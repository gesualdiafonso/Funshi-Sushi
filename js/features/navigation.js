import { qs, qsa } from '../utils/dom.js';

const DESKTOP_QUERY = '(min-width: 60em)';

/**
 * Header behavior:
 *  - mobile disclosure menu (Esc closes, link click closes, focus returns to toggle)
 *  - active link for the section in view (aria-current)
 *  - border + soft shadow once the page is scrolled
 */
export function initNavigation() {
  const header = qs('[data-js="site-header"]');
  const toggle = qs('[data-js="nav-toggle"]');
  const toggleLabel = qs('[data-js="nav-toggle-label"]');
  const nav = qs('[data-js="site-nav"]');
  if (!header || !toggle || !nav) return;

  const toggleIcon = qs('use', toggle);
  const desktop = window.matchMedia(DESKTOP_QUERY);

  function setOpen(open, { returnFocus = false } = {}) {
    toggle.setAttribute('aria-expanded', String(open));
    toggleLabel.textContent = open ? 'Close' : 'Menu';
    toggleIcon?.setAttribute('href', open ? '#icon-close' : '#icon-menu');
    nav.toggleAttribute('data-open', open);
    if (!open && returnFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a') && !desktop.matches) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.hasAttribute('data-open')) {
      setOpen(false, { returnFocus: true });
    }
  });

  // Close when focus or a click moves outside the open header.
  document.addEventListener('click', (event) => {
    if (nav.hasAttribute('data-open') && !header.contains(event.target)) setOpen(false);
  });

  desktop.addEventListener('change', () => setOpen(false));

  initScrollState(header);
  initActiveLinks(nav);
}

function initScrollState(header) {
  let ticking = false;
  const update = () => {
    header.toggleAttribute('data-scrolled', window.scrollY > 8);
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}

function initActiveLinks(nav) {
  if (!('IntersectionObserver' in window)) return;

  const links = qsa('a[href^="#"]', nav).filter((link) => link.getAttribute('href').length > 1);
  const linkFor = new Map();
  for (const link of links) {
    const section = document.getElementById(link.getAttribute('href').slice(1));
    if (section && !link.classList.contains('btn')) linkFor.set(section, link);
  }

  const setCurrent = (activeLink) => {
    for (const link of linkFor.values()) {
      if (link === activeLink) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  };

  // A section is "current" when it crosses a thin band 40% down the viewport.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setCurrent(linkFor.get(entry.target));
      }
    },
    { rootMargin: '-40% 0px -59% 0px' },
  );

  for (const section of linkFor.keys()) observer.observe(section);

  // Clear the state while the hero (not in the nav) is in the band.
  const hero = document.getElementById('top');
  if (hero) {
    new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setCurrent(null);
      },
      { rootMargin: '-40% 0px -59% 0px' },
    ).observe(hero);
  }
}
