# Funshi Sushi — Phase 11 Completion Report

| | |
|---|---|
| **Phase** | 11 — SEO & Accessibility |
| **Date** | 2026-11-05 |
| **Branch** | `phase/11-seo-a11y` (local; based on `phase/10-motion`) |
| **Status** | Complete — awaiting approval |

---

## 1. Summary

**SEO.** Every page now has:
- a favicon set, a web manifest and a share image;
- Open Graph and Twitter tags.

Canonical URLs, absolute share links, the sitemap, `robots.txt` and the structured data are **generated from `js/config.js`** by a new no-dependency tool (`node tools/build-seo.mjs`).

Nothing that needs the real domain is invented. The domain is still an owner input (`{{DOMAIN}}`), so the shipped pages:
- carry no canonical or share-image URL;
- ask search engines **not to index** the preview, which shows sample dishes and "to be confirmed" facts.

Setting `site.url` and `site.allowIndexing` and re-running the tool switches everything on. A test copy of the site, launched with a test domain, verifies the result.

**Structured data** contains only facts from the config and the menu data:
- **Now:** the restaurant's name and cuisine.
- **Later:** address, phone, hours and the menu with prices, once those are real.
- **Never:** ratings, reviews, price ranges or reservation claims.

**Accessibility.** The audit fixed four real problems, one of them a bug from Phase 08:

| Problem | Fix |
|---|---|
| **Focus lost after closing an overlay**, when the address had a `#fragment`: e.g. "Visit us", then the cart, then Esc. Focus jumped to the section instead of the cart button. | Restored after the browser's fragment handling; the skip link no longer adds `#main` |
| **400 % zoom / landscape phones:** the fixed header, category bar and cart bar covered **80 %** of the screen | Only the header stays fixed on short screens: **25 %** |
| **Windows high contrast:** the selected category and the chosen delivery card looked like the others | System highlight colors |
| **Quantity changes announced twice** by screen readers | One announcement, e.g. "Gyoza: 3."; "Delivery" radio no longer read as "Delivery Delivery fee…" |

| Check | Result |
|---|---|
| New SEO & accessibility browser suite | **93 / 93** pass |
| Earlier suites: all pages / home / menu / cart / checkout / motion | **99**, **55**, **71**, **61**, **57**, **58**: all pass |
| Unit tests | **139 / 139** pass (12 new: the generator, incl. a "pages are up to date" check) |
| HTML validation | **0 errors** |
| axe (WCAG 2.2 AA + best practice) | **0 violations**: 4 pages × 2 sizes, the dish dialog, the drawer, the mobile menu |

---

## 2. SEO Tasks

| Task | Implementation |
|---|---|
| Page titles | Unique per page. The home page was just "Funshi Sushi"; it is now "Funshi Sushi · Japanese restaurant". |
| Meta descriptions | Unique per page, ≤ 160 characters (tested) |
| Canonical URLs | Generated from `site.url`: home → the site root (never `/index.html`); menu → `menu.html` with no `?dish` or filters. **None until the domain is known.** |
| Open Graph | `og:type`, `og:site_name`, `og:title` and `og:description` are copied from the page's own `<title>` and description, so they can't drift. `og:locale` comes from the config's `locale`. `og:url`, `og:image` (1200×630, with alt and size) and `twitter:card summary_large_image` appear once the domain is set. |
| Favicon | `favicon.svg` (the "F" is now an outline, where it used to depend on a web font a favicon can't load), `favicon.ico` (32 + 16 px), `apple-touch-icon.png` (180), manifest icons 192 / 512 / maskable 512 |
| Sitemap | `sitemap.xml` with the home page and menu, written once the domain is set and indexing is allowed (it requires absolute URLs) |
| Robots.txt | Allows crawling: pages that must stay out of results say so with `<meta name="robots">`, which crawlers can only read if allowed in. Adds the `Sitemap:` line at launch. |
| Structured data | `Restaurant` on the home page; `Menu` on the menu page, real menu only (§3) |
| Image alt attributes | Every image (hero, story, 22 dish illustrations) has descriptive alt text, the dishes' from the menu data, "Illustration: …" since they aren't photos; decorative SVG icons are `aria-hidden` (tested on every page) |
| Semantic HTML | Already in place, and verified: one `h1` per page, no skipped heading levels, landmarks (`header`, `nav`, `main`, `footer`, labelled `aside`s), lists, `article` per dish, `dl` for totals |
| Clean URLs | Every link to the home page is now `./` (was `index.html`: a duplicate URL). Filters and dish deep links share the menu's canonical URL. Other pages keep `.html` (§6, DV-2). |

### 2.1 Share image and icons

Generated from the brand fonts and the hero illustration (`tools/brand_assets.py` → `tools/build-icons.mjs`):
- **Share image:** the wordmark on urushi, with three nigiri on the right. It says "Japanese restaurant", which is confirmed, and no tagline, because the tagline is still to be confirmed.
- **Icons:** all of them are the akami "F".

### 2.2 The 404 page at deep addresses

Hosts serve `404.html` for *any* missing address (e.g. `/Funshi-Sushi/menu/old`). Its relative links would then point to the wrong folder, leaving it unstyled with broken links. Once the domain is known, the generator gives it a `<base href>`.

Verified in the launched test copy: styles and scripts load, the logo links home, and the skip link stays on the page.

---

## 3. Structured Data: No Invented Facts

| Property | Source | Shipped now |
|---|---|---|
| `name` | `config.brandName` | "Funshi Sushi" |
| `servesCuisine` | The brief: Japanese restaurant | Japanese, Sushi |
| `url`, `image`, `logo` | `site.url` | — |
| `telephone` | `config.phone` | — |
| `address` (`PostalAddress`) | `config.address` | — |
| `openingHoursSpecification` | `config.hours`, one entry per shift (overnight closing kept as written) | — |
| `sameAs` | `config.mapsUrl`, `config.social` | — |
| `hasMenu` | Menu URL, only when the menu is real | — |
| `Menu` → `MenuSection` → `MenuItem` + `Offer` | `js/data/menu.js` (prices in decimal + `priceCurrency`; one offer per size; `suitableForDiet` for vegan/vegetarian) | — (sample menu) |
| `aggregateRating`, `review`, `priceRange`, `acceptsReservations` | — | **Never generated** (tested) |

At launch, the tool warns about each fact still missing ("address is not set: it is left out of the structured data").

---

## 4. Accessibility Tasks

| Task | Result |
|---|---|
| Keyboard navigation | Everything reachable, no positive `tabindex`, nothing focusable inside `aria-hidden`. Dialogs open with Enter, close with Esc and **return focus** (fixed for `#fragment` addresses, §5). |
| Visible focus indicators | A ring at every stop (Phase 10 walk), never under a sticky bar. Ring contrast is in the token contrast tests (akami/wasabi ≥ 3:1). |
| Accessible forms | Every checkout field has a `<label>`; `autocomplete` on name, phone and address (`address-line1/2`, `address-level3`); errors linked with `aria-describedby`, `aria-invalid`, error summary (Phase 09) |
| Proper labels | Accessible names reviewed in the accessibility tree: "Cart, 2 items", "Add Salmon nigiri", "Decrease quantity of Gyoza", dialogs named by their headings. **Fixed:** the delivery/pickup radios are now named just "Delivery"/"Pickup", with the fee as their description. |
| ARIA only when necessary | Inventory reviewed per page. Kept, each for a reason: `aria-pressed` (filter toggles), `aria-expanded`/`aria-controls` (menu button), `aria-haspopup="dialog"` (dish buttons), `role="list"` (Safari drops list semantics when `list-style: none`), `role="search"`, one live region. **Removed:** the implicit live regions on quantity values (`<output>` → `<span>`). |
| Color contrast | Token contrast tests (Phase 05) plus axe on every page and state. **New: forced colors.** The selected category chip and the chosen delivery card use system colors, so they stay visible in Windows high contrast (tested). |
| Screen reader compatibility | Accessibility tree reviewed for the header, filters, menu lines, dialog, drawer and checkout. One polite announcer for changes. **Fixed:** quantity changes were read twice in the drawer; in the dish dialog only the bare number was read. |
| Meaningful link text | No "click here"/"more"; links with the same text go to the same place; links that open a new tab say so |
| Also checked | Targets ≥ 24 × 24 px (WCAG 2.5.8); no horizontal scrolling at 320 px; text spacing (1.4.12) with nothing clipped; 400 % zoom (§5) |

---

## 5. Issues Found and Fixed

| Found | Cause | Fix |
|---|---|---|
| **Focus jumped to a section after closing an overlay.** Repro: home → "Visit us" → open the cart → Esc. Focus landed on the Visit section, not the cart button. Same on the menu after using the skip link. Present since Phase 08. | Closing goes back one history step to an address with `#visit`/`#main`; the browser then moves focus to that fragment, **after** our focus return | Focus is restored again once that history step finishes. The skip link moves focus without adding `#main` (plain link without JS). Regression test added, and confirmed failing without the fix. |
| **Fixed bars covered 80 % of the screen at 400 % zoom** (57 % on a landscape phone): about 50 px left for the menu | Sticky header + sticky category bar + fixed cart bar | Screens under 30rem tall: only the header stays fixed (25 %). The category bar scrolls with the page, and the cart bar steps aside: the header's cart button is always there. |
| Selected category invisible in forced colors | Selection was shown by background fill only (removed in forced colors) | `SelectedItem` / `Highlight` system colors |
| Quantity read twice in the drawer; just "2" in the dish dialog | `<output>` is an implicit live region, on top of the announcer | Plain values; the announcer says "Gyoza: 3." / "Tuna nigiri: 2." |
| Radio read as "Delivery Delivery fee to be confirmed" | The fee text was inside the label | `aria-labelledby` (title) + `aria-describedby` (fee) |
| `favicon.svg` drew its letter with a web font | Favicons can't load page fonts | Letter converted to an outline |
| **A compiled Python cache file was committed in Phase 07** (`tools/__pycache__/…pyc`) | No ignore rule | Removed from the repository; `__pycache__/` and `*.pyc` ignored |

Audit results that were the test's own mistake, not the site's:
- **Dish names under 24 px:** their tap area is the whole menu line (a stretched `::after`).
- **"Reference point" field without `autocomplete`:** no standard token exists for it.

---

## 6. Deviations

| # | Change | Why |
|---|---|---|
| DV-1 | Menu JSON-LD is **generated into the HTML** by the tool, not injected by `menu-view.js` at runtime (TECHNICAL_ARCHITECTURE §3.3) | Crawlers that don't run JavaScript can read it; it adds no JS to the page |
| DV-2 | Pages keep their `.html` names (`menu.html`), not `/menu/` | Folder URLs would break every relative path and the no-build workflow. Links, canonical URLs and the sitemap all use the same form, so there are no duplicates. Many hosts can also serve `/menu` for `menu.html`. |
| DV-3 | The shipped site is **`noindex`** until `site.allowIndexing: true` | Indexing sample prices and "address to be confirmed" would publish invented facts and hurt the launch ranking. One switch turns it off. |
| DV-4 | No Open Graph tags on checkout and 404 | Not pages anyone shares; they stay `noindex` |
| DV-5 | `site.webmanifest` uses `display: "browser"` | Icons and colors for home screens, with no claim that this is an installable app (there's no offline support) |

---

## 7. Validation

### 7.1 New suite: `validate-seo-a11y.mjs` (93 checks)

| Area | Verified |
|---|---|
| Metadata (4 pages) | Title, description length, `lang`, viewport, one `h1`, alt on every image, icon and manifest links, no `index.html` links, no canonical/`og:url`/`og:image` without a domain, `noindex` while in preview, OG matches the page, JSON-LD content, unique titles and descriptions |
| Files | `robots.txt`; no sitemap yet; manifest fields; every icon's real pixel size; the `.ico` structure; `favicon.svg` has no `<text>`; share image 1200×630 |
| **Launched copy** | Copy of the site with a test domain, generated by the real tool and served on its own port: canonical/OG absolute; indexable; JSON-LD gains URL and logo but **still no address/phone** (not configured); the menu canonical drops `?dish`; sitemap lists home + menu; `robots.txt` points to it; 404 served at `/menu/old/dish` loads styles and scripts and links home; the skip link stays on the page |
| axe | 4 pages × 360/1440 px, dish dialog, drawer, mobile menu: 0 violations |
| Keyboard & screen reader | Skip link first, visible, moves focus without changing the address; dialog by Enter, Esc returns focus; **focus return after a `#fragment` address**; announcements "Tuna nigiri: 2." and "Gyoza: 3." with no live stepper values; radio names and descriptions; labels and `autocomplete` |
| Structure | No positive `tabindex`; nothing focusable under `aria-hidden`; every SVG icon hidden; landmarks; new-tab links say so |
| Layout | 320 px: no horizontal scroll, all targets ≥ 24 px; text spacing applied with nothing clipped; 320×256 (400 % zoom) and 740×360: fixed bars ≤ 30 %, cart still reachable |
| Forced colors | Selected chip and chosen card visibly distinct |

### 7.2 Performance

| Page (JS, gzip -9) | Phase 10 | Phase 11 |
|---|---|---|
| Home | 42.4 KB | 43.1 KB |
| Menu | 50.4 KB | 51.2 KB |
| Checkout | 52.6 KB | 53.5 KB |

**+0.8 KB:** the focus-return fix, the skip link and the dialog announcement. The generated metadata is HTML, not JS (home HTML: 5.9 KB gzip). The budget overage from Phase 10 is unchanged in nature; minifying at deploy time remains the fix.

---

## 8. Known Gaps

| # | Gap | Owner / phase |
|---|---|---|
| G1 | The domain (`{{DOMAIN}}`) → canonical URLs, share image, sitemap | Owner |
| G2 | Launch switch (`allowIndexing`), once the real menu and facts are in | Owner |
| G3 | Site language (`lang="en"`) is the working language; `og:locale` follows `config.locale` | Owner / i18n |
| G4 | Real screen readers (NVDA, VoiceOver iOS/macOS, TalkBack) and Windows high contrast on a real machine; tested here with the accessibility tree, axe and emulation | QA |
| G5 | Lighthouse SEO / Accessibility scores (NFR-05 target ≥ 95) to be measured on the deployed site; the checks they run are covered here | QA / deploy |
| G6 | JS over budget (menu 1.2 KB, checkout 3.5 KB) | Performance |

---

## 9. Commits (local)

```
chore: stop tracking a compiled Python cache file; ignore them
feat(seo): brand icons, web manifest and share image generated from the brand fonts
feat(seo): generate canonical, social tags, robots.txt, sitemap and JSON-LD from the config; link icons; clean home URLs
fix(a11y): focus return after #fragment history, skip link, short screens, forced colors, announcements, radio names
docs: add phase 11 report; publishing guide in the README
```
To apply the bundle: `git fetch funshi-phase11.bundle phase/11-seo-a11y:phase/11-seo-a11y`

*End of Phase 11. Awaiting approval.*
