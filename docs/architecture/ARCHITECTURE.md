# Architecture — Funshi Sushi

**Phase:** 1 — Architecture & Design Foundation
**Status:** Proposed. Awaiting approval.
**Date:** 2026-11-04

---

## 1. Constraints that shape the architecture

- Vanilla HTML5, CSS3, ES2020+ modules. No framework, no bundler, no runtime dependencies.
- Must run from any static host (GitHub Pages, Netlify, a plain web server) by opening `index.html` over HTTP.
- No backend. Orders leave the site as a WhatsApp message (`https://wa.me/<number>?text=…`).
- The repo currently holds a 24-line `index.html` and a 20-line `styles.css` (see `docs/audit/`). Nothing needs to be migrated except the project name and the burgundy color.

## 2. Evaluating the proposed `src/` structure

The proposal in the brief is modelled on a Vue app (`App.vue`, `composables/`, `router/`, `views/`). Those concepts don't exist in a framework-free site, so the structure is adapted rather than copied:

| Proposed (Vue-style) | Vanilla equivalent here | Why |
|---|---|---|
| `src/` wrapper | **No `src/`.** Files live at the repo root | There is no build step, so the source *is* the deployed site. GitHub Pages serves the root directly; a `src/` folder would put `/src/` in every URL or require a build to copy files out |
| `App.vue` | `index.html` + `js/main.js` | `index.html` holds the static page; `main.js` boots the interactive features |
| `components/layout, navigation, sections` | Static markup in `index.html`, one CSS file per layer | Sections are written once and never re-rendered. Putting them in HTML keeps them crawlable and visible with JS disabled |
| `components/cards, forms, ui` | `<template>` elements in `index.html` + render functions in `js/features/*` | Repeated items (menu row, cart line) are cloned from templates. No `innerHTML` with data → no injection risk |
| `composables/` | `js/core/` (store, storage, event bus) | Shared state logic |
| `router/` | **None.** In-page anchors (`#menu`, `#visit`) | Single page. A router would add complexity with no benefit |
| `views/` | **None** | One view |
| `data/` | `js/data/` | Data files are ES modules so they import without `fetch` and work from any host |
| `styles/` | `css/` | — |
| `utils/` | `js/utils/` | — |
| `assets/images, fonts, icons` | `assets/…` | Same |

## 3. Directory structure

```
/
├── index.html                  Single page: all sections + <template>s
├── 404.html                    Branded not-found page (Phase: polish)
├── robots.txt, sitemap.xml     SEO phase
├── site.webmanifest            Icons, theme color
│
├── assets/
│   ├── fonts/                  Self-hosted WOFF2 + OFL licenses   ✅ added in Phase 1
│   ├── images/
│   │   ├── brand/              Logo (SVG), favicon set, Open Graph image
│   │   ├── dishes/             Menu photos, 1:1 and 4:3, AVIF/WebP + JPEG
│   │   └── place/              Restaurant / team photos, 3:2
│   └── icons/
│       └── sprite.svg          One SVG sprite (cart, plus, minus, close, whatsapp, map, clock, search)
│
├── css/
│   ├── fonts.css               @font-face                         ✅ added in Phase 1
│   ├── tokens.css              Design tokens                      ✅ added in Phase 1
│   ├── base.css                Reset, element defaults, typography, focus
│   ├── layout.css              Container, section, grid, header, footer
│   ├── components.css          Buttons, menu item, chips, stepper, fields, drawer, dialog, toast
│   └── utilities.css           .visually-hidden, .stack, etc. (kept short)
│
├── js/
│   ├── main.js                 Entry: imports features, calls init()
│   ├── data/
│   │   ├── restaurant.js       Name, WhatsApp, address, hours, delivery rules, currency
│   │   └── menu.js             Categories and products
│   ├── core/
│   │   ├── cart-store.js       Cart state: add/remove/setQty/clear, totals, subscribe()
│   │   └── storage.js          Safe localStorage wrapper (try/catch, schema version, validation)
│   ├── features/
│   │   ├── navigation.js       Mobile menu toggle, active section highlighting
│   │   ├── menu-list.js        Renders categories and products from data
│   │   ├── menu-filter.js      Search + category + dietary filters
│   │   ├── product-dialog.js   <dialog> with product details
│   │   ├── cart-drawer.js      Drawer/sheet UI bound to cart-store
│   │   ├── checkout-form.js    Customer form, delivery/pickup, validation
│   │   ├── whatsapp-order.js   Builds and encodes the order message
│   │   └── opening-hours.js    "Open now" status from data
│   └── utils/
│       ├── dom.js              qs/qsa, createFromTemplate, trapFocus
│       ├── format.js           Intl.NumberFormat currency, time formatting
│       └── validate.js         Pure validation functions (testable)
│
├── tests/                      Unit tests for pure modules (Node's built-in test runner, no deps)
└── docs/
    ├── audit/                  Phase 0
    ├── architecture/           This document
    └── design-system/          DESIGN_SYSTEM.md, RESPONSIVE_STANDARDS.md, preview.html
```

### Phase 2 additions (as built)

| Path | Purpose |
|---|---|
| `css/sections.css` | Page-section styles (hero, story, dishes, ordering, gallery, contact), in a `sections` cascade layer between `components` and `utilities` |
| `js/features/contact-info.js` | Fills contact details, footer and preview banner from `restaurant.js` |
| `js/features/featured-dishes.js` | Renders featured dishes and the dish `<dialog>`. Will be generalised into `product-dialog.js` in the menu phase |
| `js/features/gallery.js` | Previous/next controls for the native-scroll gallery |
| `js/features/contact-form.js` | Contact form validation and WhatsApp hand-off |
| `js/utils/whatsapp.js` | Pure message and `wa.me` URL builders (tested) |
| `assets/images/brand/favicon.svg` | Provisional seal favicon |

`utilities.css` was not needed yet; `.visually-hidden` lives in `base.css` under `@layer utilities`.

### Fate of the existing files

| File | Action | Phase |
|---|---|---|
| `index.html` | Rewritten in place (git history keeps the original) | 2 |
| `styles.css` | Replaced by `css/*`; deleted once `index.html` no longer links it | 2 |
| `README.md` | Rewritten with setup and structure | Documentation phase |

Nothing is removed in Phase 1.

## 4. Module design

### 4.1 Data flow

```
js/data/menu.js ──► menu-list.js ──► DOM (menu rows)
                         │                │ click "Add"
                         ▼                ▼
                   menu-filter.js    cart-store.js ◄──► storage.js ◄──► localStorage
                                          │ subscribe()
                         ┌────────────────┼──────────────────┐
                         ▼                ▼                  ▼
                   header count     cart-drawer.js     checkout-form.js
                                                             │ submit (valid)
                                                             ▼
                                                   whatsapp-order.js ──► wa.me link
```

- **One source of truth for the cart:** `cart-store.js`. UI modules never mutate state directly; they call store methods and re-render on `subscribe` callbacks.
- **Store holds IDs and quantities only.** Prices and names are always read from `menu.js`, so a stale cart in localStorage can never show an old price. Unknown IDs are dropped on load.
- **No global variables.** Each module exports an `init(root)` function; `main.js` calls them in order.

### 4.2 Module rules

- Each file has one responsibility and stays under ~200 lines.
- Pure logic (`validate.js`, `format.js`, `whatsapp-order.js` message builder, `cart-store.js` reducers) has no DOM access, so it can be unit-tested with `node --test`.
- DOM is built with `<template>` + `textContent`, never by concatenating data into `innerHTML`.
- Event delegation on list containers (one listener per list, not per row).
- Features fail independently: an error in `opening-hours.js` is caught and logged and does not stop the menu or cart.

### 4.3 Progressive enhancement

| Without JavaScript | With JavaScript |
|---|---|
| Header, hero, story, hours and contact all render (static HTML) | Same |
| Menu section shows a "View the menu" message plus a direct WhatsApp link | Full interactive menu |
| WhatsApp contact link works | Cart, checkout and generated order message |

### 4.4 Persistence

```js
// localStorage key: "funshi:cart:v1"
{ "version": 1, "items": [{ "id": "nigiri-salmon", "qty": 2 }], "updatedAt": 1730764800000 }
```

- Wrapped in `try/catch`; private mode or blocked storage degrades to an in-memory cart.
- Validated on read: wrong shape, unknown version, non-integer or out-of-range quantity (1–20) → discarded.
- Carts older than 7 days are cleared (menus and prices change).
- Customer details are **not** stored by default. An optional "Remember my details on this device" checkbox in checkout can be decided in the checkout phase.

### 4.5 Menu rendering and SEO

The menu is rendered from `menu.js` by JavaScript. Google renders JavaScript, and the page will also carry `Restaurant` JSON-LD linking to the menu section. If indexable static menu HTML is required later, a small dev-only Node script can pre-render it into `index.html` without adding runtime dependencies. **Decision requested:** accept JS rendering for now.

## 5. Tooling (dev-only, pending approval — backlog item B8)

```json
{
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "npx serve .",
    "lint:html": "html-validate index.html 404.html",
    "lint:css": "stylelint \"css/**/*.css\"",   // config disables custom-property-empty-line-before: blank lines group tokens on purpose
    "test": "node --test tests/"
  },
  "devDependencies": { "html-validate": "…", "stylelint": "…", "stylelint-config-standard": "…" }
}
```

No package is shipped to visitors. If it isn't approved, the same checks run from outside the repo, as in Phase 0.

## 6. Naming conventions

- **CSS:** BEM-style classes (`.menu-item`, `.menu-item__price`, `.btn--primary`). No IDs for styling. State via attributes (`[aria-expanded="true"]`, `[aria-current]`, `[hidden]`, `[data-state="open"]`) rather than `.is-*` classes where an ARIA attribute already exists.
- **Cascade layers:** `@layer tokens, base, layout, components, utilities;` so specificity conflicts are settled by layer order, not selector weight.
- **JS:** `camelCase` functions, `kebab-case.js` files, named exports only. Data IDs are `kebab-case` slugs (`nigiri-salmon`).
- **Hooks for JS:** `data-js="cart-count"` attributes, never style classes, so CSS refactors can't break behavior.

## 7. Decisions requested

1. Flat root structure (no `src/`). **Recommended.**
2. Single page with anchors, no router. **Recommended.**
3. Menu rendered by JS from `menu.js`; static pre-render deferred.
4. Dev-only `package.json` (B8).
5. Self-hosted fonts instead of Google Fonts (see DESIGN_SYSTEM.md §3). **Recommended:** about 68 KB total, no third-party request, and it works where Google Fonts is blocked.
