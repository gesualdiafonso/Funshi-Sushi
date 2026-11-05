# Funshi Sushi — Phase 05 Completion Report

| | |
|---|---|
| **Phase** | 05 — Design System & Foundation |
| **Date** | 2026-11-04 |
| **Branch** | `phase/05-foundation` (local; based on `main` @ `22dd4f0`) |
| **Status** | Complete — awaiting approval before building full pages |

---

## 1. Summary

The visual and technical foundation is implemented and validated in a real browser.

- **Validation results:** 39 automated tests, 99 browser checks, HTML validation and axe accessibility audits all pass with zero errors.
- **What isn't built yet:** no page content. The four site pages are valid shells with the shared header and footer.
- **Where to see it:** `styleguide.html` shows every foundation piece on both surfaces.

---

## 2. Deliverables by Task

| Task | Implementation | Files |
|---|---|---|
| CSS reset | Minimal modern reset; `[hidden]` always wins | `css/reset.css` |
| Design tokens | Base tokens (color, type, space, radius, elevation, motion, z-index) + **role tokens** reassigned by `.surface-light` / `.surface-dark`; cascade-layer order declared once | `css/tokens.css` |
| Typography | Self-hosted fonts (5 files, 94 KB in total), element defaults for h1–h4, the named styles from BRAND_GUIDELINES §4.4 as `.t-display`, `.t-lead`, `.t-small`, `.t-caption`, `.t-label`, `.t-price` | `css/tokens.css`, `css/base.css`, `assets/fonts/` |
| Containers | `.container` (1240 px max, fluid 16→40 px gutter), `.section` rhythm, `.page` sticky-footer shell | `css/layout.css` |
| Responsive grid | 4 / 8 / 12 columns at base / 40rem / 64rem; `.span-N`, `.span-sm-N`, `.span-lg-N`, `.start-lg-N` | `css/layout.css` |
| Buttons | Primary, secondary, tertiary, destructive, icon; compact (with 44 px hit area), default, large, block; states `aria-disabled`, `aria-busy`, `data-state="added"`; hover only on pointer devices | `css/components/button.css` |
| Navigation components | Skip link; sticky header with scrolled state; interim wordmark; main nav with `aria-current`; **mobile full-screen panel**; chips as category navigation; footer navigation | `css/components/header.css`, `chip.css`, `footer.css`, `js/ui/header.js` |
| Cards | `dish-card` with a **container query** (stacked, or side by side when the card itself is wide), aligned footers, and the typographic `tile` placeholder | `css/components/card.css` |
| Reusable layout patterns | `stack`, `cluster`, `grid`, `auto-grid`, `split` (7/5, reversible), `with-sidebar` (sticky rail), `scroller` (scroll-snap, edge bleed), `measure` | `css/layout.css` |
| JavaScript entry points | One entry per page → `startPage()` in `app.js` (config check, overlay listeners, header), with a try/catch fallback banner | `js/app.js`, `js/pages/*.js` |
| Global event handling | **Overlay controller**: one-at-a-time, back button closes, Esc, backdrop click, focus return, scroll lock, `inert`; declarative `data-overlay-target` / `data-overlay-close`; event delegation helper; shared live-region announcer | `js/ui/overlay.js`, `js/ui/dom.js`, `js/ui/announcer.js` |

**Supporting files**

| Area | Files |
|---|---|
| Configuration | `js/config.js` (every business fact is `null` + placeholder name), `js/core/features.js` (derives what can run), `js/strings.js` (UI text, plural support) |
| Components | `badge.css`, `banner.css`, `dialog.css` (modal base for the product dialog later) |
| Assets | `assets/icons/sprite.svg` (22 Lucide icons, 3.7 KB), `favicon.svg` |
| Project files | `.editorconfig`, `.gitignore`, `package.json` (test command only — **no dependencies**), `README.md`, `docs/` (all phase documents) |
| Removed | `styles.css` (replaced; its broken logo reference is gone) |

---

## 3. Validation

### 3.1 Automated tests — `npm test` (Node built-in runner)

**39 / 39 pass.**

| Suite | What it guarantees |
|---|---|
| `contrast.test.js` (23) | Every approved color pairing (BRAND_GUIDELINES §3.4) meets WCAG AA (4.5:1 for text, 3:1 for UI and focus rings), read live from `tokens.css`. Editing a token can't silently break contrast. |
| `features.test.js` (5) | With the shipped placeholders, ordering is **off**; a complete config enables everything; invalid WhatsApp numbers never enable ordering |
| `consistency.test.js` (11) | Shared header/footer identical on all 4 pages · one `<h1>`, skip link, `#main` and `lang` per page · no inline styles or scripts (CSP) · every referenced file and icon exists · no `innerHTML` · `core/` free of DOM code · named exports only · every CSS file inside a declared layer · no raw hex colors outside `tokens.css` |

### 3.2 HTML validation — `html-validate` (recommended ruleset)

**0 errors on all 5 pages.** Two style-only rules are turned off deliberately:
- **Lowercase `<!doctype html>`:** valid HTML5.
- **`role="list"` on styled lists:** restores list semantics that Safari/VoiceOver drops when `list-style: none` is applied.

### 3.3 Browser checks — Playwright + Chrome

**99 / 99 pass.**

| Area | Checks |
|---|---|
| 5 pages × 4 widths (360, 768, 1024, 1440) | No console errors, no failed requests, app started, **no horizontal overflow** |
| Fonts | Both families load (360 and 1440) |
| **axe-core** (WCAG 2.0/2.1/2.2 A + AA + best practices) | **0 violations** on all pages at 360 and 1440 |
| Skip link | First Tab stop; visible on focus; moves focus to `#main` |
| Mobile nav | Opens; `aria-expanded` and label update; `main`/`footer` become inert; scroll locks; focus moves to the first link. Esc closes and returns focus. History entry consumed (no back-button trap). Browser back closes it. A link navigates, and back returns with the panel closed. Widening past 1024 px closes it. |
| Dialog | Opens via `data-overlay-target` with focus inside. Closes with Esc, backdrop click, browser back and `data-overlay-close`, with focus back on the trigger. Tab stays inside. |
| Announcer | Live region receives the message; button shows the "added" state |
| No JavaScript | Toggle hidden; navigation links shown inline (`@media (scripting: none)`) |
| Reduced motion | Transitions collapse to about 0 |
| CSP | Confirmed enforced: the browser blocked an injected inline script during testing |

### 3.4 Visual review (screenshots)

| Found | Fixed |
|---|---|
| Card footers (price + Add) misaligned when a title wrapped | Inner grid rows `auto 1fr auto`; footers now measured at identical heights |
| The tile repeated the dish name directly above the card heading | In cards, the tile shows the **category**; documented in `card.css` |
| The tile's diagonal cut line crossed its label | The line now leans away from the label corner |

### 3.5 Performance budget (NFR-03)

| Resource | Measured (gzip) | Budget |
|---|---|---|
| CSS on a site page | 11.6 KB | — |
| JS on a site page | 9.3 KB | ≤ 50 KB |
| All text resources | 22.8 KB | ≤ 150 KB |
| Fonts (all 5 weights; 2 preloaded = 42 KB) | 94 KB | ≤ 100 KB |

---

## 4. Decisions and Deviations From Earlier Documents

| # | Change | Why |
|---|---|---|
| DV-1 | **Fonts are self-hosted** (from the Fontsource OFL packages) instead of loaded from Google Fonts | Same families. No third-party request, so better privacy (NFR-10) and a simpler CSP (`'self'` only). It also removes the extra connection, and the files are verified locally. |
| DV-2 | **Font risk from BRAND_GUIDELINES §4.2 resolved.** The Latin subset covers every tested pt/es character (ã õ ç ñ á é í ó ú â ê ô à ü ¿ ¡ and typographic quotes). **Neither family has tabular figures**, so prices are aligned by layout (right edge), as the guidelines' fallback planned. | Measured with fontTools |
| DV-3 | `app.js` exports `startPage(setupPage)` instead of `initApp()` | One place for the try/catch fallback, so pages can't forget it |
| DV-4 | Cards live in `card.css` (block `dish-card`), not `featured.css` | The same card will also be used outside the featured row |
| DV-5 | Added `dialog.css` (modal base) and `banner.css` now | Needed to validate the overlay controller and the startup-error fallback; the product dialog extends the modal later |
| DV-6 | The `base` layer also contains the named `.t-*` text styles and `.icon` | They are foundational, not components. The architecture's "no classes in base" note is updated by this. |
| DV-7 | JS detection uses **`@media (scripting: …)`** | Avoids an inline script, which the CSP would block. Older browsers without support get the no-JS navigation row, which still works. |
| DV-8 | Mobile nav panel uses `inert` on regions marked `data-inert-on-overlay`; dialogs use native `showModal()` | As planned; confirmed working |
| DV-9 | `package.json` added, with **no dependencies** | Tells Node the test files are ES modules and defines `npm test`. It is not needed by the site. |
| DV-10 | `!important` is also used in the reduced-motion override (`base.css`, outside layers) | A documented second exception: user motion preferences must win over every component |

---

## 5. Known Gaps (carried to later phases)

| # | Gap | Phase |
|---|---|---|
| G1 | **Business facts** (address, hours, WhatsApp, prices, language, currency) are still placeholders. The shells show "… to be confirmed". | Owner input |
| G2 | `lang="en"` is a working value until `{{SITE_LANGUAGE}}` is confirmed | Owner input |
| G3 | The cart button is in the header markup but `hidden` | Cart phase |
| G4 | **`404.html` uses relative paths.** On GitHub Pages, a missing *nested* URL (e.g. `/a/b`) would load the 404 page without its styles. | Deployment phase (fix with root-relative paths for the configured base) |
| G5 | No font-metric fallback (`size-adjust`) yet, so a small text shift is possible while the fonts load | Performance phase |
| G6 | The scroller has no edge fade yet (UX §12.4) | Menu phase, where the category chips use it |
| G7 | Tested in Chrome only in this environment. Firefox, Safari (including iOS) and real-device screen readers are still to do. | QA phase |
| G8 | The wordmark is styled text (interim, option A). The final logo depends on the owner. | Owner input |

---

## 6. Suggested Commits

This session can't push to GitHub. The branch is committed locally in these steps and delivered as a ZIP of the files and a git bundle that includes the commit history.

1. `chore: add editorconfig, gitignore and test runner config`
2. `docs: add phase 00–04 documents`
3. `feat(design): add self-hosted fonts and Lucide icon sprite`
4. `feat(css): add tokens, reset, base, layout and utility layers`
5. `feat(css): add button, chip, badge, banner, card, dialog, header and footer components`
6. `feat(js): add config, strings, feature flags, DOM helpers, overlay controller, header and app startup`
7. `feat(pages): add page shells and the design-system reference page`
8. `test: add contrast, feature and consistency suites`
9. `docs: add README and phase 05 report`

**To apply the bundle:**

```
git fetch funshi-phase05.bundle phase/05-foundation:phase/05-foundation
```

---

## 7. Next Phase

Pending your roadmap: **building the full pages**. That starts with the home page sections (hero, featured dishes, story, visit) on this foundation, plus the hours and open-status logic, once the business information is available, or with clearly labelled placeholders until then.

*End of Phase 05. Awaiting approval.*
