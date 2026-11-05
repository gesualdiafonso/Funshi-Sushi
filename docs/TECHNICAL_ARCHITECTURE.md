# Funshi Sushi — Phase 04 Technical Architecture

| | |
|---|---|
| **Phase** | 04 — Technical Architecture |
| **Date** | 2026-11-04 |
| **Depends on** | `PRODUCT_BRIEF.md` (requirements), `BRAND_GUIDELINES.md` (tokens), `UX_ARCHITECTURE.md` (flows, states) |
| **Status** | Proposal — awaiting approval |

---

## 1. Architectural Overview

### 1.1 What the system is

A **static, multi-page website** with no build step and no backend. It runs directly from files on any static host (GitHub Pages by default).

```
  Browser
  ┌──────────────────────────────────────────────────────────────┐
  │  index.html  menu.html  checkout.html  404.html               │  static HTML: content,
  │       │          │           │                                │  header, footer, templates
  │       ▼          ▼           ▼                                │
  │  js/pages/*.js   (one entry module per page)                  │
  │       │                                                       │
  │       ├── js/app.js ─ shared startup: header, cart drawer,    │
  │       │               cart bar, toasts                        │
  │       │                                                       │
  │       ├── UI modules (js/ui/*) ── read/write DOM only         │
  │       │        ▲ subscribe            │ call actions          │
  │       │        │                      ▼                       │
  │       ├── cart store (js/cart/cart-store.js) ─── localStorage │
  │       │                                                       │
  │       └── pure logic (js/core/*, js/checkout/*) ── no DOM     │
  │                 ▲                                             │
  │       data: js/config.js  js/data/menu.js                     │
  └──────────────────────────────────────────────────────────────┘
                     │ window.open(wa.me URL)
                     ▼
                  WhatsApp (outside the site)
```

### 1.2 Architectural decisions

| # | Decision | Alternatives rejected | Why |
|---|---|---|---|
| AD-1 | **Multi-page site with real HTML files** | A single-page app with a client-side router | Each page gets its own title, description and indexable URL; the back button works natively; no router to write (`UX_ARCHITECTURE.md` §2) |
| AD-2 | **No build step** | Bundler (Vite, esbuild), template engine | Required by the brief (vanilla). The site can be edited and deployed by copying files. |
| AD-3 | **Native ES modules** loaded with `<script type="module">` | One large script; global functions | Separation of concerns without tooling; deferred by default |
| AD-4 | **Header, footer and drawer markup duplicated in each HTML page** | Injecting shared markup with JS | Works without JS, can be indexed, and doesn't shift the layout on load. With only 4 pages, the duplication is small and kept consistent with a checklist (§11.6). |
| AD-5 | **Data as JS modules** (`config.js`, `data/menu.js`) | JSON loaded with `fetch()` | No extra network request, no CORS issues, comments allowed for the non-developer editor, simply `import`ed |
| AD-6 | **Repeated UI built from `<template>` elements + `textContent`** | HTML string concatenation + `innerHTML` | Prevents XSS by design (NFR-09); markup stays in HTML where designers expect it |
| AD-7 | **One small store with subscribe/notify** for the cart | A global event bus; a state library; no store at all | Several independent UI parts (header count, cart bar, drawer, checkout summary) react to the same changes. One owner of cart state avoids them going out of sync. Other state (filters, overlays) stays local to its module. |
| AD-8 | **Native `<dialog>` + `inert`** for overlays | Hand-written focus traps | The browser provides focus containment, Esc handling and the top layer |
| AD-9 | **Prices as integers in minor units** | Floating-point amounts | No rounding errors in totals (NFR-08) |
| AD-10 | **Pure functions for business logic, separate from DOM code** | Logic inside event handlers | Can be unit-tested with Node's built-in test runner and no dependencies (§11.5) |
| AD-11 | **CSS cascade layers (`@layer`) + several `<link>` files** | One big stylesheet; `@import` chains; CSS-in-JS | Controlled specificity (`BRAND_GUIDELINES.md` §8.2), parallel downloads, no `@import` waterfall |

### 1.3 Deliberately *not* built

| Not built | Why |
|---|---|
| Router, virtual DOM, component classes or a base `Component` class | Four pages and a handful of widgets; plain functions with an `init` per module are enough |
| Global event bus | The cart store's `subscribe` covers the only cross-module communication |
| Service worker / offline mode | Not in the requirements; adds a stale-cache risk for prices |
| Dark-mode theme switching | Deferred (`BRAND_GUIDELINES.md` §3.6); role tokens keep it possible later |
| Internationalization framework | One `strings.js` module satisfies NFR-14 readiness |
| Analytics | Not approved (`PRODUCT_BRIEF.md` A6) |

---

## 2. Directory Structure

```
Funshi-Sushi/
├── index.html                 Home
├── menu.html                  Digital menu
├── checkout.html              Checkout + sent state
├── 404.html                   Not found
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── favicon.svg                (+ favicon.ico, apple-touch-icon.png in assets/brand)
│
├── css/
│   ├── tokens.css             @layer order declaration + base and role tokens
│   ├── reset.css              @layer reset — modern minimal reset
│   ├── base.css               @layer base — typography, links, focus, forms baseline
│   ├── layout.css             @layer layout — container, grid, section, stack, surfaces
│   ├── utilities.css          @layer utilities — visually-hidden, etc. (kept small)
│   └── components/            @layer components — one file per component
│       ├── button.css
│       ├── chip.css
│       ├── stepper.css
│       ├── badge.css
│       ├── header.css         (includes the mobile nav)
│       ├── footer.css
│       ├── drawer.css         (cart drawer + filter sheet)
│       ├── dialog.css         (product dialog)
│       ├── toast.css
│       ├── cart-bar.css
│       ├── cart-line.css
│       ├── form.css           (fields, choice cards, error summary)
│       ├── hero.css
│       ├── featured.css
│       ├── story.css
│       ├── visit.css          (address, hours table, contact)
│       ├── menu.css           (search bar, category nav, menu sections, menu line)
│       └── checkout.css       (layout, summary, sent state)
│
├── js/
│   ├── config.js              Business configuration (single source of truth)
│   ├── strings.js             All UI text
│   ├── app.js                 Shared startup for every page
│   ├── data/
│   │   └── menu.js            Categories, tags, products
│   ├── core/                  Pure helpers, no DOM (testable in Node)
│   │   ├── money.js           format, minor-unit helpers
│   │   ├── text.js            normalize for search, slugify, truncate
│   │   ├── hours.js           open/closed status in the restaurant's time zone
│   │   ├── validate.js        field rules (checkout)
│   │   ├── catalog.js         menu index, lookups, data validation
│   │   └── pricing.js         line + order totals, minimum order
│   ├── services/
│   │   └── storage.js         safe, versioned localStorage wrapper
│   ├── cart/
│   │   ├── cart-store.js      state, actions, persistence, subscribe
│   │   └── reconcile.js       saved cart ↔ current menu (pure)
│   ├── checkout/
│   │   ├── order.js           build Order from form + cart (pure)
│   │   ├── whatsapp.js        message text + wa.me URL (pure)
│   │   └── customer.js        opt-in saved customer details
│   ├── ui/                    DOM modules — each exports init…()
│   │   ├── dom.js             qs, cloneTemplate, setText, icon()
│   │   ├── overlay.js         open/close, history, scroll lock, one-at-a-time
│   │   ├── announcer.js       shared polite live region
│   │   ├── toast.js           toasts with optional undo
│   │   ├── header.js          sticky state, mobile nav
│   │   ├── cart-drawer.js
│   │   ├── cart-bar.js
│   │   ├── cart-count.js
│   │   ├── hours-view.js      status badge + hours table
│   │   ├── featured.js
│   │   ├── menu-view.js       render categories + lines once
│   │   ├── menu-filters.js    search, tags, URL sync, show/hide
│   │   ├── category-nav.js    scroll-spy
│   │   ├── product-dialog.js
│   │   └── checkout-form.js   fields, validation UI, send, sent state
│   └── pages/
│       ├── home.js
│       ├── menu.js
│       ├── checkout.js
│       └── not-found.js
│
├── assets/
│   ├── brand/                 logo.svg, favicon set, og-image.jpg
│   ├── icons/sprite.svg       Lucide icons used, as <symbol>s
│   └── images/
│       ├── hero/              hero-480.avif … hero-1600.jpg
│       ├── story/
│       └── products/          <slug>-320.avif, <slug>-320.webp, <slug>-320.jpg …
│
├── tests/                     Node built-in test runner (dev only, not deployed logic)
│   ├── pricing.test.js
│   ├── reconcile.test.js
│   ├── hours.test.js
│   ├── validate.test.js
│   ├── text.test.js
│   ├── whatsapp.test.js
│   └── catalog.test.js
│
├── docs/                      Phase reports (AUDIT_REPORT.md … TECHNICAL_ARCHITECTURE.md)
├── README.md
├── IMAGE_CREDITS.md
├── .editorconfig
└── .gitignore
```

**Size guideline:** a module longer than ~300 lines, or doing two unrelated jobs, gets split (NFR-11). Expected scale: about 30 JS modules, most under 150 lines.

---

## 3. HTML Page Structure

### 3.1 Shared skeleton

Every page follows this order. Only the parts marked *page-specific* differ between pages.

```html
<!doctype html>
<html lang="{{SITE_LANGUAGE}}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Menu · Funshi Sushi</title>                         <!-- page-specific -->
  <meta name="description" content="…">                      <!-- page-specific -->
  <link rel="canonical" href="{{DOMAIN}}/menu.html">         <!-- page-specific -->
  <meta name="theme-color" content="#240910">

  <!-- Open Graph / Twitter: page-specific values -->
  <meta property="og:type" content="website"> …

  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="site.webmanifest">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=…&display=swap">

  <!-- CSS: order matters only for the first file (it declares the @layer order) -->
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/reset.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/components/button.css">
  …                                                          <!-- only components this page uses -->
  <link rel="stylesheet" href="css/utilities.css">

  <!-- JS: entry module + preloads for its imports -->
  <link rel="modulepreload" href="js/app.js">
  <link rel="modulepreload" href="js/cart/cart-store.js">
  <script type="module" src="js/pages/menu.js"></script>     <!-- page-specific -->

  <script type="application/ld+json">…</script>              <!-- page-specific (§3.3) -->
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>

  <header class="site-header" data-header>…</header>          <!-- shared block -->

  <main id="main" tabindex="-1">…</main>                     <!-- page-specific -->

  <footer class="site-footer">…</footer>                     <!-- shared block -->

  <dialog class="drawer" data-cart-drawer>…</dialog>         <!-- shared (not on checkout) -->
  <div class="cart-bar" data-cart-bar hidden>…</div>         <!-- shared (home, menu) -->
  <div class="toast-region" data-toasts></div>               <!-- shared -->
  <div class="visually-hidden" aria-live="polite" data-announcer></div>

  <template id="tpl-cart-line">…</template>                  <!-- shared -->
  <template id="tpl-menu-line">…</template>                  <!-- page-specific -->

  <noscript>…WhatsApp fallback (UX E1)…</noscript>
</body>
</html>
```

### 3.2 Page contents

| Page | Static HTML (works without JS) | Rendered by JS | Entry module |
|---|---|---|---|
| `index.html` | Hero, story, address, hours table, contact links, footer | Open/closed status, featured dishes, cart UI | `pages/home.js` |
| `menu.html` | Header, h1, search form shell, `<noscript>` fallback | Categories, lines, filters, product dialog, cart UI | `pages/menu.js` |
| `checkout.html` | Header, h1, complete `<form>` markup with all fieldsets | Summary, conditional fieldsets, validation, send, sent state | `pages/checkout.js` |
| `404.html` | Everything | Cart count only | `pages/not-found.js` |

**About static content from `config.js`:** the address, hours and phone appear in static HTML *and* in `config.js`. There is no build step, so they can't be generated from one source automatically. To keep them consistent (BR-05):

- `hours-view.js` **re-renders the hours table from config on load**, so config always wins in the visible page.
- The static HTML copy serves no-JS visitors and search engines.
- The README editing guide lists every place a business fact appears (§11.6).

A one-command consistency check script (`tests/consistency.test.js`) compares the HTML with `config.js`.

### 3.3 Structured data (JSON-LD)

| Page | Schema | Source |
|---|---|---|
| Home | `Restaurant` (name, address, telephone, `openingHoursSpecification`, `servesCuisine: "Japanese"`, `hasMenu`) | Static block, checked by the consistency test |
| Menu | `Menu` → `MenuSection` → `MenuItem` (with `offers.price`) | Generated from `menu.js` by `menu-view.js` and injected on load. Search engines that run JavaScript (e.g. Google) read it. |

---

## 4. CSS Organization

### 4.1 Cascade layers

The first stylesheet declares the order once:

```css
/* css/tokens.css */
@layer tokens, reset, base, layout, components, utilities;
```

Every other file wraps its rules in its own layer (`@layer components { … }`). A later layer always wins over an earlier one, whatever the selector specificity. That ends the margin and specificity conflicts described in `AUDIT_REPORT.md`, without needing `!important`.

| Layer | Contains | Rule of thumb |
|---|---|---|
| `tokens` | Custom properties only | No selectors except `:root` and surface classes |
| `reset` | Box sizing, margin reset, media defaults, `[hidden]{display:none !important}` | The only `!important` in the project |
| `base` | Element selectors: `body`, headings, `a`, `:focus-visible`, form element baseline | No classes |
| `layout` | `.container`, `.section`, `.stack`, `.cluster`, `.grid`, `.surface-dark`, `.surface-light` | Layout only — no colors except surface role tokens |
| `components` | One BEM block per file | Never styles another block's internals |
| `utilities` | `.visually-hidden`, `.text-muted`, `.measure` | Single-purpose, few |

### 4.2 Tokens: base → role

Base tokens come from `BRAND_GUIDELINES.md` §11. Components use **role tokens**, which the surface classes reassign:

```css
@layer tokens {
  :root, .surface-light {
    --surface: var(--color-shari);
    --surface-inset: var(--color-shari-deep);
    --text: var(--color-urushi);
    --text-muted: var(--color-stone);
    --heading: var(--color-akami);
    --line: var(--color-line);
    --signal: var(--color-wasabi-deep);
    --focus-ring: var(--color-akami);
    --btn-primary-bg: var(--color-akami);
    --btn-primary-fg: var(--color-shari);
    --error: var(--color-error);
  }
  .surface-dark {
    --surface: var(--color-urushi);
    --surface-inset: var(--color-akami);
    --text: var(--color-shari);
    --text-muted: var(--color-kinari);
    --heading: var(--color-shari);
    --line: var(--color-line-on-dark);
    --signal: var(--color-wasabi);
    --focus-ring: var(--color-wasabi);
    --btn-primary-bg: var(--color-shari);
    --btn-primary-fg: var(--color-urushi);
    --error: var(--color-error-on-dark);
  }
}
```

The result: a button placed inside a dark section is correct automatically, with no modifier class like `.button--on-dark`. Surfaces can't be nested to undefined effect, because each surface class sets every role token.

### 4.3 Naming

- **BEM** for components: `.menu-line`, `.menu-line__price`, `.menu-line--unavailable`.
- **State is expressed with attributes, not classes:** `[aria-expanded="true"]`, `[aria-pressed="true"]`, `[aria-invalid="true"]`, `[aria-current="page"]`, `[hidden]`, `[data-state="added"]`. This keeps styling and accessibility in sync: if the attribute is wrong, both the look and the accessibility are visibly wrong.
- **JavaScript never selects by class.** JS hooks use `data-*` attributes (`data-cart-open`, `data-menu-search`), so restyling can't break behavior.

### 4.4 Responsive approach

- Mobile-first: base styles target the smallest screen; `@media (min-width: …)` adds to them.
- Breakpoint values: `40rem` (640 px), `64rem` (1024 px), `90rem` (1440 px). They are written as literal values, because custom properties can't be used inside media queries.
- Container queries (`@container`) for components whose layout depends on the space they're given, not the screen: `menu-line` and `featured` cards.
- Fluid type and spacing come from the `clamp()` tokens.
- `@media (hover: hover)` around hover styles; `@media (prefers-reduced-motion: reduce)` in `base.css` shortens all durations.

### 4.5 Per-page CSS

Each page links only the component files it uses. Estimated total for the menu page: ≈ 25–35 KB uncompressed (≈ 8 KB compressed), well inside NFR-03.

---

## 5. JavaScript Modules

### 5.1 Layers and dependency rules

```
pages/*  ──►  app.js, ui/*  ──►  cart/*, checkout/*  ──►  core/*, services/*  ──►  config.js, data/*, strings.js
```

| Rule | Why |
|---|---|
| Imports only point **to the right** (pages → ui → cart/checkout → core → data). No cycles. | Clear ownership, easy testing |
| `core/*`, `cart/reconcile.js`, `checkout/order.js`, `checkout/whatsapp.js` **never touch the DOM, `window` or storage** | They can be run in Node tests |
| Only `services/storage.js` touches `localStorage` | One place for error handling and versioning |
| Only `ui/*` modules touch the DOM | |
| **Named exports only**, no default exports | Searchable, refactor-friendly |
| No module has side effects on import except `pages/*` (which call init) | Predictable startup |

### 5.2 Module responsibilities

| Module | Exports | Responsibility |
|---|---|---|
| `config.js` | `CONFIG` (frozen) | Business facts and rules (§6.4) |
| `strings.js` | `t(key, params)` | All UI text, with simple `{name}` interpolation; plural forms via `Intl.PluralRules` |
| `data/menu.js` | `CATEGORIES`, `TAGS`, `PRODUCTS` | Menu content (§6.1) |
| `core/money.js` | `formatMoney(minor)`, `toMinor(major)` | `Intl.NumberFormat(CONFIG.locale, {style:'currency', currency})` |
| `core/text.js` | `normalize(str)`, `matchesQuery(haystack, query)` | Removes accents and case (`NFD` + strip combining marks) for search |
| `core/hours.js` | `getOpenStatus(hours, timeZone, now)` | Returns `{state:'open'|'closing-soon'|'closed', until, nextOpen}`; handles shifts that pass midnight |
| `core/validate.js` | `validateCheckout(values, ctx)` → `{valid, errors}` | Rules from `UX_ARCHITECTURE.md` §9.4; error **keys**, not text |
| `core/catalog.js` | `buildCatalog(data)` → `{products, byId, bySlug, categories}`, `validateMenu(data)` | Indexes the menu once; checks data integrity at startup |
| `core/pricing.js` | `priceLines(lines, catalog)`, `computeTotals(priced, fulfilment, config)` | All arithmetic; integers only |
| `services/storage.js` | `readJSON(key, validate)`, `writeJSON(key, value)`, `remove(key)`, `isAvailable()` | §7 |
| `cart/reconcile.js` | `reconcile(savedCart, catalog, limits)` → `{cart, notices}` | `UX_ARCHITECTURE.md` §8.3 |
| `cart/cart-store.js` | `cartStore` (see §6.2 API) | Single owner of cart state |
| `checkout/order.js` | `buildOrder(formValues, cart, catalog, config, now)` → `Order` | Assembles the final order object |
| `checkout/whatsapp.js` | `formatOrderMessage(order, t)`, `buildWhatsAppUrl(number, text)`, `isUrlTooLong(url)` | `PRODUCT_BRIEF.md` §9 |
| `checkout/customer.js` | `loadCustomer()`, `saveCustomer(values)`, `forgetCustomer()` | Opt-in remembered details |
| `ui/dom.js` | `qs`, `qsa`, `cloneTemplate(id)`, `setText(root, field, value)`, `icon(name)` | Tiny DOM helpers; `setText` targets `[data-field="…"]` slots inside templates |
| `ui/overlay.js` | `openOverlay(el, opts)`, `closeOverlay(el)` | §8.3 |
| `ui/announcer.js` | `announce(message)` | Writes to the single polite live region (cleared and re-set so repeated messages are read) |
| `ui/toast.js` | `showToast({message, action, timeout})` | Visual toasts; the undo action stays focusable |
| `ui/header.js` | `initHeader()` | Scrolled state (`IntersectionObserver` on a sentinel element); mobile nav toggle |
| `ui/cart-count.js` | `initCartCount()` | Header badge + accessible name |
| `ui/cart-bar.js` | `initCartBar()` | Mobile sticky bar |
| `ui/cart-drawer.js` | `initCartDrawer()` | Lines, steppers, notes, empty state, undo |
| `ui/hours-view.js` | `initHoursView()` | Status badges + hours table, refreshed every minute while the page is visible |
| `ui/featured.js` | `initFeatured(catalog)` | Home featured row |
| `ui/menu-view.js` | `renderMenu(catalog, root)` | Builds all sections and lines **once**; injects Menu JSON-LD |
| `ui/menu-filters.js` | `initMenuFilters(catalog, root)` | Search, tags, URL sync, toggles `hidden`, result count, empty states |
| `ui/category-nav.js` | `initCategoryNav(root)` | Scroll-spy, `aria-current` |
| `ui/product-dialog.js` | `initProductDialog(catalog)`, `openProduct(slug, trigger)` | Variant choice, quantity, note, add |
| `ui/checkout-form.js` | `initCheckoutForm(catalog)` | Conditional fieldsets, validation display, send flow, sent state |
| `app.js` | `initApp()` → `{catalog}` | Shared startup for every page (§5.3) |

### 5.3 Startup sequence

```js
// js/pages/menu.js
import { initApp } from '../app.js';
import { renderMenu } from '../ui/menu-view.js';
import { initMenuFilters } from '../ui/menu-filters.js';
import { initCategoryNav } from '../ui/category-nav.js';
import { initProductDialog } from '../ui/product-dialog.js';

const { catalog } = initApp();          // catalog, storage check, cart store, header, drawer, toasts
const root = document.querySelector('[data-menu]');
renderMenu(catalog, root);
initMenuFilters(catalog, root);
initCategoryNav(root);
initProductDialog(catalog);             // also opens ?dish= on load
```

`initApp()` does the following in order:

1. Validates `CONFIG` (records which features are disabled by missing values, UX E13).
2. `buildCatalog()` + `validateMenu()`; invalid products are excluded and logged (`console.warn`).
3. Storage availability check (UX E2).
4. `cartStore.load(catalog)` → reconcile → queue notices.
5. `initHeader()`, `initCartCount()`, `initCartDrawer()`, `initCartBar()`, `initHoursView()`.
6. Shows queued reconciliation notices as toasts.
7. Marks the page as enhanced: `document.documentElement.dataset.js = 'ready'` (CSS hides no-JS fallbacks).

The entire startup is wrapped in `try/catch`. If it fails, the static content stays usable and the WhatsApp fallback notice is shown (UX E1).

---

## 6. Data Models

Types are documented with **JSDoc `@typedef`** in the module that owns them. Editors provide type hints, and no TypeScript build is needed.

### 6.1 Product data model (`js/data/menu.js`)

```js
/**
 * @typedef {Object} Category
 * @property {string} id         Stable ID, never changes ("cat-nigiri")
 * @property {string} slug       URL anchor ("nigiri")
 * @property {string} name       Display name
 * @property {string} [nameJa]   Optional verified Japanese name (BRAND_GUIDELINES §4.5)
 * @property {string} [intro]    Optional one-line intro
 */

/**
 * @typedef {Object} Tag
 * @property {string} id         "raw" | "cooked" | "vegetarian" | "vegan" | "spicy" | …
 * @property {string} label      Display text
 * @property {boolean} filter    true → offered as a menu filter
 * @property {string} [icon]     Optional sprite icon name ("leaf", "flame")
 */

/**
 * @typedef {Object} Variant
 * @property {string} id         Stable within the product ("8", "16")
 * @property {string} label      "8 pcs"
 * @property {number} price      Minor units, integer ≥ 0
 * @property {number} [pieces]
 */

/**
 * @typedef {Object} ProductImage
 * @property {string} base       Path without size/extension ("assets/images/products/salmon-uramaki")
 * @property {number[]} widths   Available widths ([160, 320, 480, 800])
 * @property {string} alt        Describes the dish
 * @property {boolean} [illustrative]  true → caption "Illustrative image"
 */

/**
 * @typedef {Object} Product
 * @property {string} id           Stable ID used in the cart ("p-salmon-uramaki")
 * @property {string} slug         URL slug, unique ("salmon-uramaki")
 * @property {string} categoryId
 * @property {string} name
 * @property {string} description  One line, shown on the menu line
 * @property {string} [details]    Longer text, shown in the dialog
 * @property {string[]} [ingredients]   Searched, shown in the dialog
 * @property {string[]} [allergens]     {{ALLERGEN_DATA}}
 * @property {string[]} tags       Tag IDs
 * @property {number} [price]      Minor units — required when there are no variants
 * @property {number} [pieces]
 * @property {Variant[]} [variants]  When present, `price` is ignored; the menu shows "from"
 * @property {ProductImage|null} image   null → typographic tile
 * @property {boolean} available
 * @property {boolean} [featured]
 */

export const CATEGORIES = [ /* in display order */ ];
export const TAGS = [ /* … */ ];
export const PRODUCTS = [ /* in display order within each category */ ];
export const IS_DEMO_MENU = true;   // shows the demo banner (UX §10)
```

**Integrity rules enforced by `validateMenu()`**

| Rule | On failure |
|---|---|
| Unique `id`; unique `slug` | Duplicate products excluded |
| `categoryId` refers to an existing category | Product excluded |
| Either a valid `price` (integer ≥ 0) or a non-empty `variants` array with unique IDs and valid prices | Product excluded |
| Tag IDs exist in `TAGS` | Unknown tags dropped |
| Required strings non-empty | Product excluded |

Every failure is logged with the product ID. The site stays up when the data has a mistake, and the developer sees exactly what to fix.

**Why stable `id` separate from `slug`:** the owner may rename a dish (which changes its slug and URL) without breaking carts saved in customers' browsers, which reference the `id`.

### 6.2 Cart data model (`js/cart/cart-store.js`)

**Persisted shape** (what goes into `localStorage`, deliberately minimal):

```js
/**
 * @typedef {Object} SavedCartLine
 * @property {string} key          `${productId}|${variantId ?? ''}|${normalizedNote}`
 * @property {string} productId
 * @property {string|null} variantId
 * @property {number} qty          Integer 1…CONFIG.limits.maxQtyPerItem
 * @property {string} note         '' when empty; ≤ 120 characters
 */

/**
 * @typedef {Object} SavedCart
 * @property {1} v                 Schema version
 * @property {string} updatedAt    ISO timestamp
 * @property {SavedCartLine[]} lines
 * @property {string} orderNote    ≤ CONFIG.limits.noteMaxLength
 */
```

**Prices, names and totals are never saved.** They are calculated from the catalog (`UX_ARCHITECTURE.md` D7).

**Runtime view** (calculated on every change and passed to subscribers):

```js
/**
 * @typedef {Object} PricedLine
 * @property {SavedCartLine} line
 * @property {Product} product
 * @property {Variant|null} variant
 * @property {number} unitPrice    Minor units
 * @property {number} lineTotal    unitPrice × qty
 * @property {'ok'|'unavailable'} status
 *
 * @typedef {Object} CartView
 * @property {PricedLine[]} lines
 * @property {number} itemCount    Sum of qty
 * @property {number} subtotal     Sum of lineTotal for status 'ok'
 * @property {boolean} hasUnavailable
 * @property {string} orderNote
 */
```

**Store API**

```js
cartStore.load(catalog)                    // read + reconcile; returns notices
cartStore.getView()                        // → CartView
cartStore.subscribe(fn)                    // fn(view, change) — returns unsubscribe
cartStore.add({ productId, variantId, qty, note })   // merges by key; clamps to max
cartStore.setQty(key, qty)                 // qty 0 → remove
cartStore.remove(key)                      // → { line, index } for undo
cartStore.restore({ line, index })         // undo
cartStore.setOrderNote(text)
cartStore.clear()
```

- Each action validates its input, updates state, **saves**, then notifies subscribers once with a `change` object: `{type:'add'|'qty'|'remove'|'restore'|'note'|'clear'|'sync', key}`. UI modules use `change.type` to choose announcements and the "bump" animation.
- **Implementation:** a plain object holding state plus a `Set` of listener functions, about 120 lines. No classes are required.
- **Other tabs:** a `storage` event listener re-reads the cart when another tab changes it and notifies with `type:'sync'`, so two open tabs never show different carts.

### 6.3 Checkout data model (`js/checkout/order.js`)

```js
/**
 * @typedef {'delivery'|'pickup'} Fulfilment
 *
 * @typedef {Object} CheckoutValues        Raw form state (strings, trimmed)
 * @property {Fulfilment|''} fulfilment
 * @property {string} name
 * @property {string} phone
 * @property {string} street
 * @property {boolean} noStreetNumber
 * @property {string} apartment
 * @property {string} area               Zone ID (if zones) or free text
 * @property {string} reference
 * @property {string} payment            Payment method ID from CONFIG
 * @property {string} changeFor          Raw input, parsed by validate.js
 * @property {string} notes
 * @property {boolean} remember
 *
 * @typedef {Object} OrderTotals
 * @property {number} subtotal
 * @property {number|null} deliveryFee   null → "to be confirmed" (OR-13)
 * @property {number} total              subtotal + (deliveryFee ?? 0)
 * @property {boolean} feePending        true when deliveryFee is null for a delivery order
 *
 * @typedef {Object} Order
 * @property {string} ref                "FS-241104-7K3Q"
 * @property {string} createdAt          ISO, restaurant time zone shown in the message
 * @property {Fulfilment} fulfilment
 * @property {{name:string, phone:string}} customer
 * @property {{street:string, apartment:string, area:string, reference:string}|null} address
 * @property {{method:string, changeFor:number|null}} payment
 * @property {{name:string, variantLabel:string|null, qty:number, note:string, lineTotal:number}[]} items
 * @property {OrderTotals} totals
 * @property {string} notes
 */
```

**Flow:** `CheckoutValues` → `validateCheckout()` → (if valid) `buildOrder()` → `formatOrderMessage()` → `buildWhatsAppUrl()`.

- Every step is a **pure function** with explicit inputs, including `now` for testing.
- `buildOrder()` recalculates totals from the catalog (OR-21) and excludes unavailable lines. It throws if any remain, but the UI checks for them first (`UX_ARCHITECTURE.md` §9.5).
- **Order reference:** `FS-` + `YYMMDD` (in the restaurant's time zone) + 4 characters from an unambiguous alphabet (`23456789ABCDEFGHJKMNPQRSTVWXYZ`), generated with `crypto.getRandomValues`.

### 6.4 Configuration model (`js/config.js`)

```js
export const CONFIG = Object.freeze({
  brandName: 'Funshi Sushi',                 // {{BRAND_NAME}} — provisional
  locale: null,                              // {{LOCALE}} e.g. 'pt-BR', 'es-AR'
  currency: null,                            // {{CURRENCY}} e.g. 'BRL', 'ARS'
  timeZone: null,                            // {{TIMEZONE}} e.g. 'America/Sao_Paulo'
  whatsappNumber: null,                      // {{WHATSAPP_NUMBER}} digits with country code
  phone: null,                               // {{PHONE_NUMBER}}
  address: null,                             // {{ADDRESS}} { street, area, city, region, postalCode, country }
  mapsUrl: null,                             // {{MAPS_URL}}
  hours: null,                               // {{OPENING_HOURS}} see below
  fulfilment: {
    delivery: { enabled: true, minOrder: null, fee: null, zones: null, eta: null },
    pickup:   { enabled: true, minOrder: null, eta: null },
  },
  payments: null,                            // {{PAYMENT_METHODS}} [{ id:'cash', label:'Cash', allowsChange:true }]
  outOfHoursPolicy: 'warn',                  // 'warn' | 'block'  (UX Q3 default)
  limits: { maxQtyPerItem: 20, maxItemsPerOrder: 100, noteMaxLength: 280, itemNoteMaxLength: 120 },
  social: [],                                // {{SOCIAL_LINKS}}
});
```

**Unknown values are `null`, never invented.** Each `null` documents its placeholder name in the comment beside it.

`initApp()` derives a `features` object from the config. Examples:
- `canOrder = whatsappNumber && currency && locale`
- `showStatus = hours && timeZone`

The UI degrades exactly as specified in UX E13. **Prices still display** while the locale or currency is missing: they use a neutral format (`0.000`), and the demo banner states that prices are illustrative.

**Hours format**

```js
hours: {
  mon: [],                                   // closed
  tue: [['19:00', '23:30']],
  fri: [['12:00', '15:00'], ['19:00', '01:00']],   // close < open → closes after midnight
  // …
}
```

**Delivery fee options** (only one is used, depending on `{{DELIVERY_FEE_MODEL}}`):
- `fee: 1500` — a flat amount, in minor units
- `fee: null` — fee to be confirmed
- `zones: [{ id, label, fee }]` — a fee per zone, with an optional `freeAbove`

---

## 7. LocalStorage Strategy

### 7.1 What is stored

| Key | Contents | Written when | Lifetime | Personal data? |
|---|---|---|---|---|
| `funshi.cart.v1` | `SavedCart` | Every cart change | Until the cart is emptied or reset | No (dish IDs, quantities, notes) |
| `funshi.customer.v1` | `{v:1, name, phone, street, apartment, area, reference}` | Only when sending with "Remember my details" ticked | Until the box is unticked on a later order, or "Forget my details" is used | **Yes — opt-in only** (NFR-10) |

**Never stored:** prices, totals, payment details, order history, search/filter state (that lives in the URL), analytics identifiers.

### 7.2 The storage wrapper (`services/storage.js`)

```js
export function isAvailable()                 // test write/remove once, cache the result
export function readJSON(key, validate)       // → value | null
export function writeJSON(key, value)         // → true | false
export function remove(key)                   // → true | false
```

| Concern | Handling |
|---|---|
| Storage blocked / private mode / quota exceeded | Every call is wrapped in `try/catch`; it returns `null`/`false` and never throws. The cart store then keeps working in memory (UX E2). |
| Corrupted JSON | `JSON.parse` failure → `null` → cart reset notice (UX E3) |
| Schema mismatch | `validate(value)` checks the shape and version. Failure → `null`. |
| Version migration | The version is part of the key name. A future `v2` reads `v1` once, migrates it, writes `v2` and removes `v1`. No migration code exists until a `v2` exists. |
| Cross-tab sync | `window.addEventListener('storage', …)` in the cart store, filtered to `funshi.cart.v1` |
| Size | A cart of 100 items is ≈ 6 KB, far below browser limits |

### 7.3 Write frequency

The cart is saved synchronously after each action; actions are discrete clicks, so this is cheap. The order note is saved after the field loses focus or after 500 ms without typing (`UX_ARCHITECTURE.md` §8.2), not on every keystroke.

---

## 8. Navigation Architecture

### 8.1 Page navigation

- Normal `<a href>` links between pages. No JavaScript is involved, so it works without JS and the browser's back and forward buttons behave naturally.
- `aria-current="page"` is written **in each page's static HTML** (no JS needed).
- Home section links (`index.html#story`) use native anchors. `scroll-margin-top` on sections (the header height plus spacing) prevents the sticky header from covering headings. `scroll-behavior: smooth` is applied only when the visitor doesn't prefer reduced motion.

### 8.2 In-page state in the URL

| State | URL | API | Restored on load |
|---|---|---|---|
| Category position | `#nigiri` | Native anchor | Yes (native) |
| Search / filters | `?q=salmon&tags=cooked,spicy` | `history.replaceState`: no new history entries while typing | Yes, `menu-filters.js` |
| Open product | `?dish=salmon-uramaki` | `history.pushState` on open | Yes, `product-dialog.js` |
| Other overlays (drawer, filter sheet, mobile menu) | No URL change; a history entry with `state.overlay` | `history.pushState({overlay:'cart'}, '')` | No (closed on reload) |

### 8.3 Overlay controller (`ui/overlay.js`)

One small module, about 100 lines, handles every overlay so they all behave the same (`UX_ARCHITECTURE.md` §12.3–12.4):

```js
openOverlay(el, {
  id: 'cart',               // history state ID
  url: null,                // optional URL to push (product dialog)
  returnFocus: triggerEl,   // focus target on close
  onClose: () => {},
});
closeOverlay(el, { fromHistory: false });
```

| Responsibility | Implementation |
|---|---|
| Open | `<dialog>` → `showModal()` (native focus containment, Esc and top layer). The mobile nav panel (not a dialog) → set `inert` on `main` and `footer`. |
| One at a time | Keeps a reference to the currently open overlay; opening another closes it first, without adding history entries |
| Back button closes | `pushState` on open; a `popstate` listener closes the current overlay with `fromHistory: true` |
| Closed another way (✕, Esc, backdrop) | Calls `history.back()` to consume the entry the overlay added. A flag stops the resulting `popstate` from being handled twice. |
| Scroll lock | `document.documentElement.style.overflow = 'hidden'` plus `scrollbar-gutter: stable` (in CSS) to avoid layout shift |
| Backdrop click | Closes when the click lands on the `<dialog>` element itself, outside its inner content box |
| Focus return | Focus goes back to `returnFocus` (falling back to `main`) |
| Reduced motion | CSS-only; the JS doesn't depend on transitions finishing |

---

## 9. Reusable UI Components

Each component = **one CSS block** + (where interactive) **one JS module or a shared helper** + **an HTML pattern** (inline markup or a `<template>`).

| Component | HTML | CSS block | JS | Variants / states |
|---|---|---|---|---|
| Button | `<button class="button button--primary">` / `<a class="button">` | `button` | — | primary · secondary · tertiary · destructive · icon; sizes compact/default/large; `aria-disabled`, `aria-busy`, `data-state="added"` |
| Icon | `<svg class="icon" aria-hidden="true"><use href="assets/icons/sprite.svg#plus"/></svg>` | `icon` (in base) | `dom.icon()` | 16 / 20 / 24 |
| Chip | `<button class="chip" aria-pressed>` · `<a class="chip" aria-current>` | `chip` | `menu-filters`, `category-nav` | toggle (filter) · link (category) |
| Badge | `<span class="badge">Raw</span>` | `badge` | — | tag · signal (open now) · count (cart) |
| Quantity stepper | `<div class="stepper">` −/value/+ | `stepper` | shared `bindStepper()` in `dom.js` | min/max disabled; trash-at-1 (drawer) |
| Menu line | `<template id="tpl-menu-line">` → `<article class="menu-line">` | `menu` | `menu-view` | with/without image · unavailable · variants ("from") |
| Feature card | `<template id="tpl-feature-card">` | `featured` | `featured` | Add / Choose |
| Product tile (placeholder) | `<div class="tile" data-field="initials">` | `menu` | `menu-view` | used when `image: null` or the image fails to load |
| Cart line | `<template id="tpl-cart-line">` | `cart-line` | `cart-drawer`, `checkout-form` | editable (drawer) · compact (checkout summary) · unavailable |
| Drawer / sheet | `<dialog class="drawer">` | `drawer` | `overlay` | right panel (desktop) · full height (mobile) · bottom sheet (filters) |
| Product dialog | `<dialog class="product-dialog">` | `dialog` | `product-dialog` | sheet (mobile) · modal (desktop) |
| Toast | built in JS from `<template id="tpl-toast">` | `toast` | `toast` | info · with action (undo) |
| Choice card | `<label class="choice-card"><input type="radio">…</label>` | `form` | — | checked · disabled |
| Form field | `<div class="field">` label + input + hint + error | `form` | `checkout-form` | `aria-invalid`; counter |
| Error summary | `<div class="error-summary" role="alert" tabindex="-1">` | `form` | `checkout-form` | — |
| Status badge | `<p class="status" data-hours-status>` | `visit` | `hours-view` | open · closing soon · closed |
| Hours table | `<table class="hours">` | `visit` | `hours-view` | today row `aria-current="date"` |
| Banner | `<div class="banner" role="note">` | `layout` | `app` | demo menu · storage notice · ordering unavailable |

**Rule against unnecessary abstraction:** a pattern becomes a shared component only once it is used in **two or more places**. Everything else stays local to its module.

---

## 10. Cross-Cutting Concerns

### 10.1 Security

| Risk | Mitigation |
|---|---|
| XSS through data or user input | All dynamic text is set with `textContent` or `setAttribute` on known attributes. **`innerHTML` is not used with data** (a code-review check, and a `grep` in the pre-commit checklist). |
| Unsafe URLs | Image paths are built from `image.base` (data controlled by the owner) and validated to be relative paths. The WhatsApp number is validated as digits only. `wa.me` message text is encoded with `encodeURIComponent`. |
| `window.open` reverse tabnabbing | `noopener` |
| Third-party code | Only Google Fonts CSS. No third-party JS. A Content-Security-Policy `<meta>` limits scripts to `'self'` and styles/fonts to `'self'` + Google Fonts. The JSON-LD on the menu page is injected via the DOM, which CSP allows for data scripts. |

### 10.2 Performance

| Technique | Where |
|---|---|
| `modulepreload` for each page's first-level imports | `<head>` |
| The menu is rendered once; filtering toggles `hidden` (no re-render, images aren't reloaded) | `menu-filters.js` |
| Search input debounced at 150 ms | `menu-filters.js` |
| `IntersectionObserver` for scroll-spy and the header state (no scroll listeners) | `category-nav.js`, `header.js` |
| `<picture>` with AVIF/WebP, `srcset`/`sizes`, `width`/`height`, `loading="lazy"`, `decoding="async"` | All images |
| `fetchpriority="high"` on the hero image | `index.html` |
| Hours status refresh paused while the tab is hidden (`visibilitychange`) | `hours-view.js` |

### 10.3 Error handling

- `initApp()` and each page entry are wrapped in `try/catch` and fall back to static content (UX E1).
- Pure functions **return** result objects for expected failures (validation, reconciliation) and **throw** only on programmer errors.
- `console.warn` for data and config problems (developer-facing). Customer-facing messages always go through `strings.js`.

---

## 11. Development Conventions

### 11.1 Code style

| Topic | Convention |
|---|---|
| Indentation / line endings / encoding | 2 spaces · LF · UTF-8 · final newline (enforced by `.editorconfig`) |
| JS | `const` by default, `let` when reassigned, never `var`. Strict equality. Semicolons. Single quotes. Template literals for interpolation. Optional chaining over nested `&&`. |
| Functions | Small, named, single purpose. Arrow functions for callbacks; `function` declarations for exported functions (readable stack traces). |
| Naming | `camelCase` functions/variables · `UPPER_SNAKE` module-level constants · `kebab-case` file names · verbs for functions (`buildOrder`), nouns for data (`order`) · booleans start with `is/has/can` |
| Data attributes | `data-<component>` for roots (`data-cart-drawer`), `data-<component>-<part>` for parts (`data-cart-drawer-close`), `data-field` for template slots |
| Language | Code, comments, commit messages and docs in English. Customer-facing text only in `strings.js` and HTML, in `{{SITE_LANGUAGE}}`. |
| Comments | JSDoc on exported functions and types. Inline comments explain *why*, not *what*. |
| HTML | Semantic elements first; ARIA only where HTML has no equivalent. Lowercase attributes, double quotes. `type` on every `<button>`. Every input has a `<label>`. |
| CSS | Properties grouped as layout → box → typography → visual → motion. Logical properties (`margin-inline`, `padding-block`). No IDs as selectors. No `!important` except the `[hidden]` reset. Colors only via tokens. |

### 11.2 Formatting tools

None are required, to respect the "no unnecessary dependencies" rule. `.editorconfig` covers the basics. Using Prettier from the editor is optional and adds nothing to the repository.

### 11.3 Running locally

ES modules don't load from `file://`, so a local static server is needed. Any of these works:

```bash
python3 -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000`.

### 11.4 Git workflow

| Topic | Convention |
|---|---|
| Branches | `main` = deployable. Work on `redesign/v1`, with short-lived branches per phase (`phase/05-foundation`) merged into it. |
| Commits | Conventional Commits: `feat(cart): add undo after removing a line`, `fix(menu): …`, `docs: …`, `test: …`, `refactor: …`, `style: …`, `chore: …` |
| Size | One logical change per commit; never mix formatting with behavior changes |
| Merge | Phase branch → `redesign/v1` after approval; `redesign/v1` → `main` at release |
| Delivery | This session can't push. Until push access is granted, each phase is delivered as files or a ZIP with a list of suggested commits. |

### 11.5 Testing

| Level | Tool | Scope |
|---|---|---|
| Unit | **Node's built-in test runner** (`node --test tests/`) — no packages to install | `core/*`, `cart/reconcile.js`, `checkout/order.js`, `checkout/whatsapp.js`. These are pure ES modules, so Node imports them directly. |
| Consistency | `tests/consistency.test.js` | Static HTML business facts vs `config.js` (§3.2); identical shared header/footer blocks across the four pages |
| Manual / QA | Checklists in the QA phase | Responsive breakpoints, keyboard-only pass, screen reader (VoiceOver + NVDA), Lighthouse, W3C validator, the WhatsApp handoff on real devices |

**Minimum unit test cases** (examples):
- **pricing:** variant price is used; integer totals for 100 lines; a null fee gives `feePending`; the minimum order applies per fulfilment mode.
- **hours:** a shift past midnight; a split shift; "closing soon" at 30 minutes before close; correct time zone results when the device time zone differs.
- **text:** accented letters match plain ones (`"salmão"` matches `"salmao"`).
- **validate:** every rule in `UX_ARCHITECTURE.md` §9.4.
- **reconcile:** every row in `UX_ARCHITECTURE.md` §8.3.
- **whatsapp:** empty fields are omitted; special characters (`&`, `#`, emoji, line breaks) survive encoding; URL length detection works.

### 11.6 Editing checklist for business facts (README)

| Fact | Edit here | Also appears in |
|---|---|---|
| Hours | `js/config.js` → `hours` | `index.html` hours table, footer, JSON-LD |
| Address / phone | `js/config.js` | `index.html` (visit section, footer, JSON-LD), footer of all pages |
| Menu, prices | `js/data/menu.js` | — (everything is generated) |
| WhatsApp number | `js/config.js` | `<noscript>` blocks on all pages |

Running `node --test` after editing catches any mismatch.

### 11.7 Definition of done (each phase)

1. Requirements traced to the `PRODUCT_BRIEF.md` IDs.
2. HTML validates (W3C), with no console errors or warnings in Chrome, Firefox or Safari.
3. Unit tests pass.
4. Keyboard-only walkthrough of the changed features.
5. Checked at 360, 768, 1024 and 1440 px.
6. A phase completion report with what was done, how it was validated, and known gaps.

---

## 12. Requirement Traceability (summary)

| Requirement area | Architecture element |
|---|---|
| BR-03, NFR-12 (editable by the owner) | `config.js`, `data/menu.js`, §11.6 |
| BR-05 (single source of truth) | `config.js` + consistency test |
| BR-06, NFR-15 (static, subpath) | AD-1, AD-2, relative URLs |
| FR-20 to FR-30 (menu) | `menu-view`, `menu-filters`, `category-nav`, `product-dialog`, §6.1 |
| FR-40 to FR-48 (cart) | `cart-store`, `reconcile`, `cart-drawer`, `cart-bar`, §6.2, §7 |
| FR-50 to FR-60, OR-* (checkout) | `checkout-form`, `validate`, `order`, `whatsapp`, §6.3 |
| FR-70 to FR-73 (hours/contact) | `hours.js`, `hours-view`, §6.4 |
| NFR-04 (accessibility) | `overlay`, `announcer`, attribute-based state (§4.3), §9 |
| NFR-08 (data integrity) | AD-9, `pricing`, versioned storage |
| NFR-09 (security) | AD-6, §10.1 |
| NFR-14 (i18n readiness) | `strings.js` |

---

## 13. Next Phase

**Phase 05 — Foundation implementation** (pending your roadmap). Proposed scope:
- Directory structure, `.editorconfig`, `.gitignore`
- CSS tokens, reset, base, layout and the button component
- The shared header and footer, and the four page shells with valid HTML
- The test runner set up with the first `core/*` tests

*End of Phase 04. No repository files were changed. Awaiting approval to proceed.*
