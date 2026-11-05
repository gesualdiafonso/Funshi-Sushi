# Funshi Sushi — Phase 00 Repository Audit Report

| | |
|---|---|
| **Repository** | https://github.com/gesualdiafonso/Funshi-Sushi |
| **Owner** | gesualdiafonso |
| **Audited commit** | `22dd4f0` (`main`, HEAD) |
| **Audit date** | 2026-11-04 |
| **Phase type** | Read-only — no repository files were modified, created or deleted |

---

## Summary

The repository is an early starting stub: **3 files, 44 lines in total**, with no JavaScript, no assets and no working features. Only an empty header bar renders. Nearly everything in the project brief has to be built from scratch. What carries over is the project's intent: a sushi restaurant site, written in Portuguese, using a burgundy and beige palette.

**Recommendation:** Treat Phase 01 onward as a fresh, structured build inside this repository. Keep the repo, its history and the brand color direction. Replace the current markup and styles instead of patching them.

---

## 1. Existing Architecture

### File tree

```
Funshi-Sushi/
├── README.md      2 lines   project title + one-line description
├── index.html    23 lines   single page: <head> + empty header/nav
└── styles.css    19 lines   body, header and logo rules
```

- **Structure:** A flat folder with a single HTML page. There are no folders for scripts, styles, images, fonts or data.
- **Build process:** None. There's no build tooling, package manager, `package.json`, linter config, `.gitignore`, `.editorconfig` or license.
- **Rendering model:** Static HTML linked to one stylesheet. There is no client-side logic.

### Git history

| Commit | Branch | Date | Message | Change |
|---|---|---|---|---|
| `eb4dac0` | main | 2024-02-29 12:57 | Initial commit | Added `README.md` |
| `9896f50` | main | 2024-02-29 13:02 | Add files via upload | Empty commit (no file changes) |
| `87de3c1` | gesualdiafonso-patch-1 | 2024-02-29 13:15 | Add files via upload | Added `index.html` and `styles.css` |
| `22dd4f0` | main | 2024-02-29 13:16 | Merge pull request #1 (PR title in Portuguese) | Merged the patch branch into `main` |

- All work happened on a single day, in about 20 minutes, through GitHub's web upload. Nothing has been committed since.
- The `gesualdiafonso-patch-1` branch is fully merged and has no differences from `main`. It can be deleted later; this audit leaves it alone.
- The commit messages are GitHub's defaults and say nothing about what changed.

---

## 2. Technologies Identified

| Technology | Status |
|---|---|
| HTML5 | Used (doctype, viewport meta) |
| CSS3 | Used (one plain stylesheet, no custom properties) |
| JavaScript | **Not present** |
| Frameworks / libraries | None loaded. The class names look like Bootstrap 3 (`navbar-default`, `navbar-header`, `container`), but Bootstrap is not included. |
| Fonts | System font only (`'Times New Roman', Times, serif`) |
| Icons | None |
| Images / assets | **None in the repository** |
| Encoding | `index.html` is ASCII, `styles.css` is UTF-8 (because of Portuguese comments) |

This already fits the Vanilla-only rule in the brief. There are no dependencies to remove.

---

## 3. Existing Functionality

| Feature | Status |
|---|---|
| Header bar | Renders as a burgundy strip |
| Logo | **Broken.** Renders as an empty 150×150 box. |
| Navigation links | None. The `.container` inside the nav is empty. |
| Hero, story, menu, cart, checkout, contact, footer | Not present |
| Responsiveness | Only the viewport meta tag exists. There are no media queries or flexible layout. |
| Interactivity | None |

In practice, the page shows a beige background with a burgundy bar containing an empty square that links back to `index.html`.

---

## 4. Visual Assessment

### Current design direction

| Token | Value | Use |
|---|---|---|
| Burgundy | `#4b011d` | Header background |
| Warm beige | `#a79986` | Page background |
| Brown (named color) | `brown` = `#a52a2a` | Body text |
| Typeface | Times New Roman | Body |

### Contrast check (WCAG 2.1)

| Pair | Ratio | Normal text AA (4.5:1) |
|---|---|---|
| Brown text on beige (current body) | **2.54:1** | Fails |
| Brown on burgundy | **2.24:1** | Fails |
| Burgundy on beige | 5.71:1 | Passes |
| White on burgundy | 15.89:1 | Passes (AAA) |

### Assessment

- **Burgundy is a strong anchor.** It suits a premium Japanese restaurant and pairs well with cream, off-white, ink black and a muted gold or vermilion accent.
- **The beige is muddy as a full-page background.** It works better as a secondary surface or a lighter tint.
- **Times New Roman reads as an unstyled default** rather than a deliberate choice. It does not express Japanese culinary identity or a premium feel.
- **There is no imagery, logo, spacing system, type scale or visual hierarchy yet.**

**Verdict:** The visual direction is worth keeping: burgundy as the primary color, warm neutrals as the base. The execution should be redesigned.

---

## 5. Code Quality Assessment

### HTML (`index.html`)

| Line(s) | Finding | Severity |
|---|---|---|
| 2 | `lang="en"`, but the project content is Portuguese | Medium (accessibility, SEO) |
| 6 | `<meta http-equiv="X-UA-Compatible">` is obsolete and only applied to Internet Explorer | Low |
| 7 | `<title>Suriname Sushi</title>`: the brand name is wrong | **High** |
| 12 | `class="nav-bardefault"` / `nav-barheader` (line 14) look like malformed Bootstrap class names with no styles behind them | Low |
| 15 | `<a href="index.html" class="">`: empty `class` attribute, and the link has **no accessible name** | **High** (accessibility) |
| 16 | `<div id="logo-imag" alt="logo-imag">`: `alt` is invalid on a `<div>`; the logo is not an `<img>`/`<svg>`; the ID is misspelled ("imag") | **High** |
| 11–22 | No `<main>`, `<footer>` or headings (`<h1>`), and no navigation list | Medium |
| — | No meta description, Open Graph tags, canonical URL, favicon, theme color or structured data | Medium (SEO) |
| 23 | No trailing newline at end of file | Trivial |

### CSS (`styles.css`)

| Line(s) | Finding | Severity |
|---|---|---|
| 3 | Uses the named color `brown` and fails contrast (see section 4) | **High** |
| 1–5 | No reset or normalize, no `box-sizing`, no custom properties, no type scale | Medium |
| 9–10 | `border-radius: 0; border: 0;` override Bootstrap defaults that aren't loaded, so they do nothing | Low |
| 8, 16 | Rules are keyed by ID (`#header-nav`, `#logo-imag`), which makes styles hard to reuse and override | Low |
| 17 | `background: url('../Fenshu Sushi/#logo-imag')`: **broken reference** (see section 6) | **High** |
| 18–19 | Fixed 150×150 px logo, which is too large for a mobile header | Medium |
| — | No media queries and no layout system (flexbox or grid) | Medium |
| — | Inconsistent indentation (line 7 onward is indented by one space) | Trivial |

**Positives:** The files are short and easy to read, have Portuguese section comments, and the viewport meta tag is present.

### JavaScript

None exists, so there is nothing to review.

---

## 6. Technical Problems

### 6.1 Broken references

| Reference | Location | Problem |
|---|---|---|
| `url('../Fenshu Sushi/#logo-imag')` | `styles.css:17` | (a) `../` points **outside the repository**, to the developer's local machine. (b) The folder name "Fenshu Sushi" doesn't match the project name. (c) `#` starts a URL fragment, so the browser actually requests `../Fenshu Sushi/` and never asks for a file. (d) There's no file extension. (e) **No logo file exists in the repo.** |
| `href="styles.css"` | `index.html:9` | Works correctly. |

### 6.2 Missing files

- Logo (SVG preferred), favicon set and social share image (`og:image`)
- Food and restaurant photography
- JavaScript (none at all)
- Menu data source
- `.gitignore`, `.editorconfig`, `LICENSE`
- `robots.txt`, `sitemap.xml`, `site.webmanifest`
- A `404.html` page (useful if the site is deployed on GitHub Pages)

### 6.3 Responsive issues

- The fixed 150×150 px logo plus margins takes up a large share of a 360 px screen.
- There is no layout, breakpoints or fluid typography.
- The nav has no links and no mobile menu pattern.

### 6.4 Brand inconsistency

Three different names appear: **Funshi** (repository), **Suriname** (`<title>`) and **Fenshu** (asset path). The brand name has to be confirmed before any copy, metadata or SEO work.

### 6.5 Accessibility

- The only interactive element (the logo link) has no accessible name. Screen readers will announce something like "link, index.html".
- Body text contrast fails WCAG AA.
- The page language is declared incorrectly.
- There are no landmarks besides `<header>`/`<nav>`, no headings and no skip link.

---

## 7. Missing Functionality

Compared against the master brief, **everything below is still to be built.**

| Area | Feature |
|---|---|
| Layout | Responsive mobile-first layout, header, footer, sticky navigation, mobile menu |
| Brand | Logo, hero section, restaurant story / about section |
| Menu | Structured menu data, categories, product cards, product detail view, search, filtering |
| Cart | Add/remove items, quantity management, saving the cart in `localStorage`, cart drawer or panel, running totals |
| Checkout | Order summary, customer form, delivery/pickup selection, address fields for delivery, validation, building the WhatsApp message and opening the `wa.me` link |
| Info | Contact details, address and map link, opening hours (including an open/closed status) |
| SEO | Meta tags, Open Graph tags, schema.org `Restaurant` + `Menu` JSON-LD, sitemap, robots.txt |
| Accessibility | Landmarks, keyboard support, focus management for the cart drawer and dialogs, ARIA live updates for the cart, reduced-motion support |
| Performance | Responsive images (`srcset`, AVIF/WebP), lazy loading, font loading strategy, keeping JS and CSS small |
| Docs | README with setup, structure, how to edit the menu and how to deploy |

---

## 8. Reusable Components

| Item | Reuse? | Notes |
|---|---|---|
| Repository and Git history | **Yes** | Keep the repository; continue on a feature branch |
| Burgundy `#4b011d` | **Yes** | Use as the primary brand color (`--color-primary`) |
| Beige `#a79986` | **Partially** | Use as a muted accent or derive lighter tints from it; not as the full-page background |
| `<!DOCTYPE>`, charset and viewport meta | **Yes** | Standard boilerplate |
| `<header>` / `<nav>` elements | **Yes** (semantically) | Rebuild their contents |
| Bootstrap-style class names | No | Replace with one consistent naming scheme (BEM proposed) |
| ID-based CSS rules | No | Replace with class-based components |
| Logo `<div>` with background image | No | Replace with an inline SVG or an `<img>` with alt text |
| Times New Roman | No | Replace with a deliberate type pairing |
| `README.md` | No (too minimal) | Rewrite as full project documentation |

---

## 9. Recommended Improvements

### Must fix before anything else

1. **Confirm the brand name** and fix the `<title>`.
2. Set the correct **`lang`** to match the site's language.
3. Add a real **logo asset** inside the repo and reference it with a relative path.
4. Fix the **text contrast** (≥ 4.5:1 for body text).
5. Give the logo link an accessible name and use a proper `<img>`/`<svg>` for the logo.

### Architecture

6. Organize the files into folders (`css/`, `js/`, `assets/`, `data/`).
7. Adopt a **CSS custom properties** token system: colors, type scale, spacing, radii, shadows, motion.
8. Split the CSS into layers in a fixed order: tokens, reset, base, layout, components, utilities.
9. Use **BEM** class naming (`.menu-card__price--discounted`).
10. Use **native ES modules** with one module per concern: state, cart, menu rendering, filters, checkout, WhatsApp, storage, formatting.
11. Keep menu content in a **separate data file** so prices and items can be edited without touching the logic.

### Quality

12. Add `.editorconfig` and `.gitignore`.
13. Write descriptive commit messages with one commit per logical change.
14. Run validation each phase: W3C HTML validator, Lighthouse (performance, accessibility, best practices, SEO) and a keyboard-only test pass.

---

## 10. Proposed Implementation Strategy

### 10.1 Target structure (proposal)

```
Funshi-Sushi/
├── index.html
├── 404.html
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── README.md
├── .editorconfig
├── .gitignore
├── css/
│   ├── main.css            # @import order only
│   ├── tokens.css          # custom properties
│   ├── reset.css
│   ├── base.css            # typography, links, focus styles
│   ├── layout.css          # container, grid, sections
│   ├── components/         # header, hero, menu-card, cart, checkout, footer…
│   └── utilities.css
├── js/
│   ├── main.js             # entry point, wires modules together
│   ├── config.js           # business info: WhatsApp number, hours, fees
│   ├── data/menu.js        # categories + products
│   ├── state/cart-store.js # cart state, calculations, events
│   ├── services/storage.js # safe localStorage wrapper
│   ├── services/whatsapp.js# message builder + wa.me URL
│   ├── ui/                 # nav, menu-render, filters, product-dialog, cart-drawer, checkout-form
│   └── utils/              # currency formatting, DOM helpers, validation
└── assets/
    ├── images/             # optimized AVIF/WebP + fallbacks
    ├── icons/              # SVG sprite or individual icons
    └── brand/              # logo.svg, favicon set, og-image
```

Notes on the proposal:

- **Menu as a JS module** rather than JSON: ES modules can `import` it directly with no fetch request, no CORS problems when opening the file locally, and it can include comments for whoever edits it.
- **Native `<dialog>`** for product details and checkout confirmation, which handles focus and the Esc key natively.
- **A cart store with event notifications:** the UI subscribes to changes instead of modules updating each other's DOM directly.
- **Prices stored as integers** (whole currency units or cents) so totals never pick up floating-point errors.

### 10.2 Phased plan (subject to your roadmap)

| Phase | Scope | Main deliverable |
|---|---|---|
| 00 | Audit (this report) | `AUDIT_REPORT.md` |
| 01 | Content & brand decisions, design system: tokens, typography, color palette, components | Design tokens + style reference |
| 02 | Project scaffolding, semantic HTML skeleton of every section, base CSS | Static responsive shell |
| 03 | Header and nav, hero, story, contact/location/hours, footer | Complete informational site |
| 04 | Menu data model, menu rendering, categories, search, filters, product detail | Working digital menu |
| 05 | Cart: state, quantities, saving in `localStorage`, cart drawer | Working cart |
| 06 | Checkout: form, delivery/pickup, validation, WhatsApp order | End-to-end ordering |
| 07 | SEO, accessibility audit, performance optimization | Lighthouse and WCAG pass |
| 08 | QA across devices and browsers, documentation, deployment (GitHub Pages) | Release + README |

Each phase will include its own analysis, implementation, validation and completion report, as the brief requires.

### 10.3 Workflow

- All work on a feature branch (e.g. `redesign/v1`), merged to `main` only after you approve it.
- Current session limitation: **read-only access to the repository** (no push). Until push access is granted, each phase will be delivered as files or a ZIP for you to commit.

### 10.4 Information needed before Phase 01

| # | Item | Why |
|---|---|---|
| 1 | Official brand name (Funshi / Suriname / Fenshu?) | Title, copy, SEO |
| 2 | Site language (Portuguese / Spanish / English / several) | `lang`, all copy |
| 3 | WhatsApp number (international format) | Checkout target |
| 4 | Address, delivery area, opening hours | Contact section, JSON-LD, open/closed status |
| 5 | Menu: categories, items, descriptions, prices, currency | Menu data |
| 6 | Delivery fee, minimum order, whether pickup is offered | Checkout rules |
| 7 | Logo and photography (if any) | Visual identity. If none exist, a wordmark and clearly marked placeholder images will be used. |
| 8 | Social links, domain name (for canonical URLs and the sitemap) | Footer, SEO |
| 9 | Hosting target (GitHub Pages?) | Paths, 404 page, deployment |

---

*End of Phase 00. No repository files were changed. Awaiting explicit approval to proceed to Phase 01.*
