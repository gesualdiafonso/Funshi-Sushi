# Funshi Sushi — Repository Audit

**Phase:** 00 — Repository Audit  
**Date:** 2026-11-04  
**Scope:** Current working tree at `main`, including the existing uncommitted preview implementation.  
**Outcome:** Read-only audit complete. No existing files were modified or deleted.

## Executive summary

The GitHub `main` baseline is a very small static stub, but the current local working tree contains a substantial, modular Vanilla HTML/CSS/JavaScript preview that is not yet committed. It provides a polished responsive presentation, featured sample dishes, a detail dialog, a gallery, navigation, contact information placeholders, and a validated WhatsApp **contact** hand-off.

The primary project objective—a complete ordering experience—is not implemented yet. There is no full menu, search/filter, cart, cart persistence, customer checkout, delivery/pickup selection in checkout, or WhatsApp **order** generation. Current dish and business details are explicitly placeholders; the site should not be presented as launch-ready until confirmed business data and real photography are supplied.

The existing architecture is a good foundation for the remaining work. The most important issues are scope gaps, inaccurate ordering copy, missing launch SEO metadata, the stale legacy stylesheet, and a duplicate page under `docs/` whose relative assets cannot resolve from that location.

## 1. Existing architecture

- Static, single-page site served from the repository root; no bundler or framework.
- `index.html` contains the complete page structure and templates.
- CSS is split into `css/fonts.css`, `tokens.css`, `base.css`, `layout.css`, `components.css`, and `sections.css`, using custom properties, cascade layers, and BEM-like class naming.
- `js/main.js` initializes independent feature modules for navigation, contact details, featured dishes, gallery controls, and the contact form.
- `js/data/` holds menu and restaurant data; `js/utils/` holds DOM, formatting, validation, and WhatsApp helpers.
- `tests/` uses Node's built-in test runner. There is no `package.json`, build system, lint configuration, or CI configuration.
- `docs/` contains prior repository/design audits, architecture and design-system proposals, screenshots, and a duplicate `index.html`.

The original repository entry points remain `index.html`, `styles.css`, and `README.md`. The local implementation is mostly uncommitted: `index.html` and `README.md` are modified, while `assets/`, `css/`, `docs/`, `js/`, and `tests/` are untracked. Preserve these changes.

## 2. Technologies identified

- HTML5, semantic landmarks, native `<dialog>` and `<template>`.
- CSS3, custom properties, cascade layers, responsive media queries, Grid/Flexbox, `clamp()`, and reduced-motion handling.
- Vanilla JavaScript ES modules and browser APIs including `IntersectionObserver`, `matchMedia`, `requestAnimationFrame`, and `window.open`.
- `localStorage` is not currently used.
- Self-hosted WOFF2 fonts (Shippori Mincho B1 and Zen Kaku Gothic New), with SIL Open Font License texts.
- No runtime or development dependencies are declared.

## 3. Existing functionality

Implemented in the current working tree:

- Responsive one-page navigation with a mobile disclosure menu, Escape handling, active-section indication, and skip link.
- Hero, story, featured-dish, ordering-information, gallery, contact, and footer sections.
- Four sample dishes rendered from JavaScript data; native detail dialog and “Ask about this dish” contact-form prefill.
- Scrollable gallery with buttons and keyboard/native scrolling.
- Contact-information slots, footer links, preview banner, and current-year rendering driven by restaurant data.
- Contact form with custom validation, live status feedback, and a `wa.me` **contact-message** hand-off when a valid WhatsApp number is configured.
- Safe “to be confirmed” states and visible preview/draft/sample labels for unconfirmed business content.

Not implemented:

- Full digital menu, category browsing, search, or filters.
- Add-to-cart, cart summary, quantity management, persistence, or cart feedback.
- Customer checkout with delivery/pickup choice, address/phone inputs, and checkout validation.
- Order summary and WhatsApp **order** message generation.
- Dynamic opening-hours / “open now” calculation.
- Real menu prices, business hours, contact details, delivery rules, or photos.

The ordering steps currently describe choosing and adding dishes and saving a selection on the device, but the interface has no add action or saved selection. This is misleading until the ordering functionality exists or the copy is adjusted.

## 4. Visual assessment

- The page uses a restrained “ice and nori” palette, Japanese-inspired display typography, generous whitespace, clear section hierarchy, and responsive layouts.
- The desktop screenshot shows an editorial split hero, asymmetric story imagery, dish grid, ordering steps, horizontal gallery, contact form, and inverse footer. The mobile screenshot stacks these sections and switches to a compact navigation control.
- The implementation uses labelled patterned placeholders, not actual food or restaurant photography. The current appearance is a design preview, not a finished commercial presentation.
- Dish descriptions and cards are intentionally marked as samples; the story is explicitly draft copy.
- Provisional “F” seal branding is rendered in the header/footer; a favicon exists, but no confirmed production logo is present.

## 5. Code quality assessment

Strengths:

- Clear separation between content, styling, structured data, feature modules, and pure utilities.
- Semantic page landmarks, heading hierarchy, skip link, labelled controls, visible focus styles, and reduced-motion support.
- User-provided strings are generally inserted through `textContent`; contact status HTML uses a fixed template and adds links as DOM nodes.
- Pure validation and WhatsApp message/URL helpers have focused tests.
- Independent feature initialization logs module startup failures rather than silently swallowing them.
- Product and restaurant details remain explicitly unconfirmed rather than being represented as verified facts.

Concerns:

- `js/main.js` adds the `.js` class inline before the module has loaded. CSS hides the navigation and exposes its toggle based on that class. If module loading fails, the toggle may be visible but nonfunctional while the navigation remains hidden.
- `LOCALE = 'en'` and `CURRENCY = 'ARS'` are hard-coded even though language and currency are identified in project documentation as undecided. Current null prices avoid displaying a fabricated amount, but the formatting defaults need owner confirmation before real prices are added.
- There is no lint or HTML validation setup in the repository. The prior Phase 2 report documents external validation, but this audit independently reran only the unit tests.
- `styles.css` remains in the worktree despite the Phase 2 report saying it was removed. It is not linked by the current root page, but contains a stale, broken logo URL.
- `docs/index.html` is byte-identical to the root `index.html`; its root-relative-to-document-directory CSS, JS, font, and favicon references do not resolve from `docs/` because those directories do not exist there. It should not be treated as a second deployable entry point without correcting its hosting setup.
- The legacy `README.md` remains only a short project title/description and does not explain setup, project state, or launch requirements.

## 6. Technical problems

1. **Core ordering flow is absent.** The current WhatsApp integration sends a general contact message, not a cart-based order.
2. **Business launch data is unset.** `restaurant.js` has empty phone, WhatsApp, email, address, map, and hours fields; delivery area and fee are not represented in data. Menu items are samples with null prices.
3. **Content overpromises ordering behavior.** The ordering steps refer to actions and persistence that do not exist in the interface.
4. **No production photography.** All food imagery is a placeholder; image formats, responsive sources, and loading behavior cannot yet be validated.
5. **SEO is incomplete.** The root page has a title, description, theme color, and favicon, but no Open Graph metadata, canonical URL, or Restaurant structured data. No `robots.txt`, sitemap, or web manifest is present.
6. **Legacy stylesheet contains a broken asset path.** `styles.css` references `../Fenshu Sushi/#logo-imag`, and that target does not exist. The current page does not load this file.
7. **Duplicate `docs/index.html` has broken relative asset references** when served from the `docs/` directory.
8. **Progressive enhancement has a failure mode.** A module-load failure after `.js` is set can leave the responsive navigation inaccessible.
9. **No repository-level verification tooling or build checks** are configured. There are unit tests, but no recorded automatic tests for the full menu/cart/checkout because those features do not exist yet.
10. **Deployment readiness is unverified.** The root page references exist in the repository; no deployment configuration or production-host check was found.

## 7. Missing functionality

| Requirement | Status |
|---|---|
| Responsive page and navigation | Implemented in preview |
| Restaurant story | Draft placeholder |
| Structured full menu and categories | Not implemented; featured sample data only |
| Search and filtering | Not implemented |
| Product details | Basic dialog for sample dishes |
| Shopping cart and quantity control | Not implemented |
| Cart persistence | Not implemented |
| Order summary | Not implemented |
| Customer checkout form and validation | Not implemented; only general contact form exists |
| Delivery or pickup selection during checkout | Not implemented |
| WhatsApp order generation | Not implemented; contact-message hand-off only |
| Contact, location, hours | Placeholder fields; no confirmed values |
| SEO and structured restaurant data | Partial |
| Accessibility | Several good foundations; requires full feature-level validation |
| Image/performance optimization | Not applicable to placeholders; production assets absent |

## 8. Reusable components

- Design tokens and typography in `css/tokens.css` and `css/fonts.css`.
- Base accessibility and reset styles in `css/base.css`.
- Shared layout, buttons, form fields, status panel, tags, photo placeholders, and dialog styles in `css/layout.css` and `css/components.css`.
- Responsive section patterns in `css/sections.css`.
- SVG icon sprite and accessible page templates/dialog in `index.html`.
- Mobile navigation and active-section observer in `js/features/navigation.js`.
- Pure validators, formatting functions, and WhatsApp message/URL helpers in `js/utils/`.
- Restaurant-data-driven contact rendering in `js/features/contact-info.js`.
- Sample product data shape and featured-item rendering/dialog in `js/data/menu.js` and `js/features/featured-dishes.js`; generalize this for the full menu rather than duplicating it.
- Native gallery scrolling and reduced-motion-aware controls in `js/features/gallery.js`.

## 9. Recommended improvements

1. Keep the current uncommitted work intact and treat `index.html`, `css/`, `js/`, `assets/`, and `tests/` as the active preview implementation.
2. Before production content work, confirm brand spelling, site language, currency/locale, real menu/categories/prices/allergens, WhatsApp number, address, hours, delivery coverage/fees, and pickup policy.
3. Implement menu browsing and filtering from confirmed structured data, then add a single cart store, validated `localStorage` persistence, quantity controls, and clear empty/error states.
4. Implement checkout only after delivery/pickup rules and customer details are confirmed; validate input and generate a clear WhatsApp order summary. Keep the explicit final “send” action in WhatsApp; do not imply payment or automatic order acceptance.
5. Correct the ordering copy so it reflects currently working UI until the cart phase is complete.
6. Obtain and optimize licensed/owner-provided photography and production logo; use responsive image sources, intrinsic dimensions, and appropriate eager/lazy loading.
7. Confirm locale and currency before formatting real prices; calculate hours and open status from confirmed business hours and an agreed time zone.
8. Resolve `styles.css` and `docs/index.html` disposition; avoid stale/broken duplicate entry points.
9. Complete SEO metadata and structured data with confirmed business details; add deployment-specific canonical/robots/sitemap only when the production domain and hosting are known.
10. Add lightweight, dev-only validation/lint scripts if approved, and test the complete UI at mobile, tablet, desktop, keyboard-only, reduced-motion, and no-JavaScript states.
11. Replace the short README with accurate local preview/testing instructions and a clear statement of which content remains placeholder.

## 10. Proposed implementation strategy

Proceed in gated phases; do not expose sample data as confirmed business information:

1. **Phase 00 — Audit:** this report; no source changes.
2. **Phase 01 — Foundation approval:** confirm visual direction, brand, language, currency, and development/deployment approach; resolve whether the existing preview architecture is retained.
3. **Phase 02 — Content and data:** add only owner-confirmed menu, allergens, prices, hours, address, contact, delivery, and pickup details; retain explicit preview states for anything outstanding.
4. **Phase 03 — Complete menu UX:** full category menu, product details, search/filter, and accessible product selection.
5. **Phase 04 — Cart and persistence:** quantities, totals, storage validation, cart feedback, empty/error states, and stale-data handling.
6. **Phase 05 — Checkout and WhatsApp order hand-off:** delivery/pickup choice, customer validation, order summary, and honest hand-off states; no payment processing.
7. **Phase 06 — Production polish:** real photography and branding, SEO, accessibility/performance review, responsive/browser QA, documentation, and deployment verification.

Each phase should have its own implementation, targeted validation, and completion report. Owner-provided decisions are prerequisites for replacing the current preview data with commercial content.

## Repository and validation notes

- Git `HEAD`: `22dd4f0` on `main`; `origin/main` points to the same commit. The listed `gesualdiafonso-patch-1` branch is merged into `main`.
- History contains the initial README and the original uploaded `index.html`/`styles.css`; the current application work is local and uncommitted.
- The committed baseline is the small stub described by the existing `docs/audit/REPOSITORY_AUDIT.md`. That historical report predates the current local implementation and must not be read as a description of the current working tree.
- Validation run during this audit: `node --test tests/*.test.js` — **10 tests passed**.
- Existing Phase 2 documentation records broader browser, viewport, accessibility-target, HTML, and CSS validation. Those results were reviewed as existing documentation but were not independently rerun in this audit.
