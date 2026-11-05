# Funshi Sushi — Phase 07 Completion Report

| | |
|---|---|
| **Phase** | 07 — Digital Menu |
| **Date** | 2026-11-05 |
| **Branch** | `phase/07-menu` (local; based on `phase/06-website`) |
| **Status** | Complete — awaiting approval |

---

## 1. Summary

The menu page is a complete dynamic menu built from one data file:
- **Content:** 26 sample dishes in 8 categories, each with an illustration (or a typographic tile for drinks), price, description, ingredients and allergens.
- **Browsing:** category filtering, label filters, accent-insensitive search and a product details dialog.
- **Unavailable dishes:** a clear state, both in the list and in the dialog.

The data is explicitly sample content. Every place it appears says so, and prices are shown **without a currency** until the restaurant confirms one.

| Check | Result |
|---|---|
| Unit tests | **79 / 79** pass (14 new for search and filtering) |
| Menu-page browser checks | **71 / 71** pass |
| Earlier suites (all pages / home) | **99 / 99** and **55 / 55** pass |
| HTML validation | **0 errors** |
| axe (WCAG 2.2 AA) | **0 violations**: menu at 360 and 1440, dialog open on desktop, sheet open on mobile |

---

## 2. Tasks

| Task | Implementation |
|---|---|
| Define product data structure | `js/core/catalog.js` typedefs: Category, Tag, **Allergen**, Variant, ProductImage `{file, alt}`, Product. Integer prices in minor units or `null`; sizes as `variants`; a permanent `id` separate from the URL `slug`. |
| Create product catalog | `buildCatalog()` validates the data and indexes it (by id, slug, category). Problems are reported in the console. A broken dish is left out; a broken *part* (an unknown tag or allergen, a bad image) is dropped and the dish is kept. |
| Define menu categories | Nigiri · Sashimi · Uramaki · Hot rolls · Gunkan · Combos · Sides · Drinks, each with a one-line intro |
| Create product cards | Printed-menu lines: thumbnail, Mincho name, **dotted leader**, price on the right edge, one-line description, pieces and labels. The whole line is one button (the name), and it opens the details. |
| Implement category filtering | "All" plus one button per category (`aria-pressed`). Sticky horizontal row under the header on mobile; sticky left rail from 1024 px. |
| Implement search | Matches name, description, details, ingredients, category and labels. Every word must match; case and accents ignored ("EDAMAMÉ" finds edamame). 150 ms debounce. The result count is announced to screen readers. |
| Product details | Native `<dialog>` through the shared overlay controller: image, category, description, details, pieces and labels, **sizes with prices**, ingredients, allergens + allergy advice, sample note, price footer. Bottom sheet on mobile, two columns from 768 px. |
| Display prices | `formatPrice()`: real currency format once `locale` and `currency` are configured (tested: `R$ 14,90`), otherwise a neutral `14.90`. "from" price for dishes with sizes; "Price to be confirmed" for `null`. |
| Display descriptions | One line on the menu; full details in the dialog |
| Display product images | 22 dish illustrations: AVIF and WebP at 240, 480 and 800 px, plus a JPEG fallback. Lazy-loaded with `srcset`/`sizes`. If an image fails to load, it is replaced by the tile. |
| Unavailable product states | Still listed, **moved to the end of its category**, image faded, name and price muted, a dashed **"Unavailable today"** badge (text, not color alone). The dialog explains it can't be ordered today. Shown with a dish that has an image (white fish nigiri) and one without (yuzu lemonade). |

---

## 3. Separation of Data and Presentation

```
js/data/menu.js          CONTENT only: categories, labels, allergens, dishes (no markup, no formatting)
js/core/catalog.js       validation + indexes                         ─┐
js/core/menu-query.js    search, category/label filtering, URL state   ├─ pure, tested in Node
js/core/money.js         price formatting                             ─┘
js/ui/product-info.js    shared presentation of price, pieces, labels (menu, dialog, home)
js/ui/picture.js         responsive <picture> / tile fallback
js/ui/menu-view.js       renders the menu ONCE from <template>s
js/ui/menu-filters.js    controls → state → show/hide (no re-render, images never reload)
js/ui/product-dialog.js  fills and opens the dialog; ?dish= deep links
menu.html                markup: page shell, <template>s, <dialog>
```

- **Editing the menu means editing data only.** The file opens with an editing guide (ids, slugs, minor-unit prices, sizes, images, availability, featured).
- **The home page reads the same data.** Its featured cards now show the illustrations and sample prices, and "Details" opens that dish on the menu.

---

## 4. Sample Content

| What | How it's identified |
|---|---|
| Data file | Banner comment: "SAMPLE CONTENT … NOT the restaurant's menu"; `IS_DEMO_MENU = true` |
| Menu page | "This is a sample menu" notice: examples, illustrations, no currency |
| Every dish dialog | "Sample dish: the price, ingredients, allergens and illustration are examples." |
| Home page | "Sample dishes and prices, not the restaurant's menu." |
| Every page | The site-wide preview notice (from Phase 06) |
| Images | Every `alt` starts with "Illustration:"; each source SVG says "sample illustration" |
| Prices | No currency symbol until one is configured. A test fails if sample prices exist while `IS_DEMO_MENU` is `false`. |
| Allergens | Shown with permanent advice: "If you have an allergy, confirm with the restaurant before ordering." |

The dishes are common sushi-bar items with generic descriptions. The prices are plausible but fictitious.

---

## 5. URL Behavior

| URL | Result |
|---|---|
| `menu.html?category=sides` | Sides only |
| `menu.html?tags=vegan,spicy&q=salad` | Filters restored on load and reload; shareable |
| `menu.html?dish=gyoza` | Opens the dish on load. Closing removes `?dish` and scrolls to and focuses that dish in the menu. |
| `menu.html?dish=unknown` | Notice "That dish isn't on the menu anymore"; parameter removed |
| Unknown category or label values | Ignored (validated against the data) |

- **History:** filter changes replace the history entry instead of adding one, so back doesn't step through every keystroke. Opening a dish adds one entry, so back closes it.
- **Focus:** returns to the dish that was opened.

---

## 6. Validation

### 6.1 Menu-page browser suite (71 checks)

| Area | Verified |
|---|---|
| 4 widths | No errors or failed requests; **no horizontal overflow**; 8 sections and 26 dishes from data; 22 illustrations + 4 tiles; sample notice; sample prices without currency; categories as a sticky row (< 1024 px) or a vertical rail (≥ 1024 px) |
| Category | One category shown, one pressed, URL updated, status text, "All" restores, no history entries added |
| Search + labels | Case/accent-insensitive, ingredients searchable, AND across words, announced, kept in URL, restored on reload; labels AND-combined |
| Empty state | Specific message ("Nothing on the menu in Drinks · Vegan, Spicy."); "Search all categories" and "Clear filters" both work; focus returns to the search field |
| Unavailable | Last in its category, text badge, dialog explanation |
| Dialog | Content from data, sizes and "from" price, ingredients and allergens, larger image, focus on the dish name, URL with `?dish` keeping the filter; back and Esc close and restore the URL, focus returns to the dish; opens from the keyboard |
| Deep links | Open on load (mobile); closing focuses and shows the dish; unknown dish → notice; the home page "Details" opens the right dish |
| Currency configured | `R$ 14,90` (pt-BR, BRL) |
| Images | Lazy thumbnails with dimensions and "Illustration:" alt text; **only on-screen images load first** (mobile); first-load image bytes ≤ 40 KB |
| Mobile | Category row sticks right under the header; choosing a category brings the results into view |
| No JavaScript | Heading and explanation shown; filter UI hidden |

### 6.2 Issues found and fixed

| Found | Cause | Fix |
|---|---|---|
| 470 px horizontal overflow on phones | A single-column grid sized itself to the unwrapped category row | `grid-template-columns: minmax(0, 1fr)` on `.with-sidebar` |
| Dotted leaders stopped halfway across the line | Base rule caps `<li>` at 65 characters | Menu lines opt out |
| axe contrast on unavailable tiles | Opacity applied to tile text | Unavailable tiles use muted colors; opacity only on photos |
| axe: scrollable dialog body not keyboard-reachable | Overflowing region with no focusable content | Body is a labelled `<section tabindex="0">` with an inset focus ring |
| Focus ring on the close button when a sheet opened | Native dialog focuses the first control | Focus goes to the dish name (as specified in UX §7.2) |
| Deep-link close didn't land on the dish | Smooth scroll still running | Instant jump |
| Product names wrapped awkwardly on phones | 20 px names next to prices | 18 px below 640 px |

Three dish illustrations were also redrawn after review: roll fillings were too small, gyoza pleats looked like hairs, and the eel's sesame spilled off the fish.

### 6.3 Performance (menu page, gzip)

| Resource | Size | Budget |
|---|---|---|
| HTML / CSS | 3.6 KB / 18.4 KB | — |
| JS (21 modules, including 3.9 KB of menu data) | 31.4 KB | ≤ 50 KB |
| Text total | 53.3 KB | ≤ 150 KB |
| Thumbnails | ~2–3 KB each (AVIF 240 px), lazy | First load ≤ 40 KB (tested) |

---

## 7. Deviations From Earlier Documents

| # | Change | Why |
|---|---|---|
| DV-1 | **Categories filter** the menu ("All" + one category) instead of scrolling to anchors (UX §6.3) | Requested in this phase ("category filtering"). Shorter pages on mobile, and the category combines with search and labels. |
| DV-2 | **Label filters are inline chips** on all sizes; no mobile filter sheet | Only five labels; one tap instead of three; no extra overlay |
| DV-3 | **Sample prices shown**, without a currency, instead of "Price to be confirmed" | This phase asks for realistic demo data. The currency isn't known, so none is invented. |
| DV-4 | Product image model is `{ file, alt }` (not `base` + `widths`) | Widths are a site-wide constant in `picture.js`; editors only name the file |
| DV-5 | Added an **allergen vocabulary** (`ALLERGENS`) | Allergens are referenced by id, so labels stay consistent and checked |
| DV-6 | No "Add" button in the dialog yet | The cart is the next phase. A button that does nothing would be a nonfunctional integration. The dialog footer is ready for it. |
| DV-7 | No Menu JSON-LD yet | Sample prices must not be published as structured data. It will be generated when `IS_DEMO_MENU` is `false` (SEO phase). |

---

## 8. Known Gaps

| # | Gap | Phase |
|---|---|---|
| G1 | Real menu, prices, currency, allergens and photos: owner input | Owner |
| G2 | Add to cart (dialog footer, featured cards) | Cart phase |
| G3 | Going *forward* in history to a `?dish=` entry doesn't reopen the dialog (back works) | Minor, later |
| G4 | Allergens are sample data. Real allergen information must come from the restaurant and be verified. | Owner |
| G5 | Chrome only so far | QA phase |

---

## 9. Commits (local)

```
feat(design): add sample dish illustrations and product image variants
feat(menu): expand sample menu data with allergens, sizes and availability
feat(menu): add search, filtering and URL state as pure functions
feat(menu): build the menu page, product dialog and shared dish presentation
feat(home): show dish illustrations and sample prices on featured cards
test: cover menu search and filtering, sample-data rules and image files
docs: add phase 07 report
```

To apply the bundle: `git fetch funshi-phase07.bundle phase/07-menu:phase/07-menu`

*End of Phase 07. Awaiting approval.*
