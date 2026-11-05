# Improvement Backlog — Funshi Sushi

**Phase:** 0 — Baseline
**Date:** 2026-11-04
**Sources:** `REPOSITORY_AUDIT.md`, `TECHNICAL_AUDIT.md`, `DESIGN_AUDIT.md`, `RESPONSIVENESS_AUDIT.md`

IDs in brackets refer to findings in those documents.

---

## Blockers — owner input needed before implementation

| ID | Item | Why it blocks |
|---|---|---|
| B1 | Confirm the brand name (Funshi / Suriname / Fenshu) | Appears in title, logo, SEO, WhatsApp message |
| B2 | Site language (Spanish, Portuguese, English, or multiple) | Affects all copy, `lang`, SEO, currency/number formatting |
| B3 | WhatsApp number in international format | Required for order generation |
| B4 | Menu: categories, items, descriptions, prices, currency, allergens | No fake products may be invented; placeholders must be labelled |
| B5 | Address, opening hours, delivery area/fee, pickup policy, minimum order | Location, checkout rules and validation |
| B6 | Logo and food photography (or approval for labelled placeholders) | Visual quality depends on real imagery |
| B7 | Git workflow: new branch + PR, or direct delivery | Avoids overwriting the owner's work |
| B8 | Approval for dev-only tooling (`package.json` with linters, no runtime deps) | Brief restricts dependencies |

## Critical

| ID | Item | Ref |
|---|---|---|
| C1 | Fix the broken logo: commit a real asset, use `<img>` / inline SVG with `alt` | S1, H1, H2 |
| C2 | Correct the `<title>` and brand name throughout | H5, B1 |
| C3 | Build the page structure: `header`, `main` with sections, `footer`, heading hierarchy | H9 |
| C4 | Implement the digital menu from a structured data file (`data/menu.js` or JSON) | brief |
| C5 | Implement cart: add/remove, quantities, totals, LocalStorage persistence with validation of stored data | brief |
| C6 | Implement checkout: customer form, delivery/pickup, validation, WhatsApp message generation (`wa.me` link, URL-encoded) | brief |

## High

| ID | Item | Ref |
|---|---|---|
| HI1 | Accessible palette meeting WCAG AA (≥ 4.5:1 text, 3:1 UI) | S2, S3 |
| HI2 | Accessible names on all links/buttons; skip link; visible `:focus-visible` | H3, H11, S11 |
| HI3 | Mobile-first responsive layout with breakpoints and fluid type | R3, S9 |
| HI4 | Mobile navigation (disclosure button with `aria-expanded`, Esc to close) | R8 |
| HI5 | SEO: meta description, Open Graph, canonical, favicon, `theme-color`, `Restaurant` JSON-LD (address, hours, menu link) | H8 |
| HI6 | CSS architecture: reset, design tokens via custom properties, class-based naming (BEM), split into base/layout/components | S4, S5, S6 |
| HI7 | ES module architecture: `main.js` + modules (`menu`, `cart`, `storage`, `checkout`, `whatsapp`, `ui`), no monolith | brief |
| HI8 | Location & opening hours section, with "open now" computed from data | B5 |
| HI9 | Menu search and category filtering | brief |
| HI10 | Product detail view (accessible `<dialog>`) | brief |

## Medium

| ID | Item | Ref |
|---|---|---|
| M1 | Restaurant story / about section | brief |
| M2 | Image pipeline: WebP/AVIF, `srcset`, explicit dimensions, lazy loading | R-requirements |
| M3 | Rem-based font sizing; respect user font settings | R5 |
| M4 | Remove obsolete `X-UA-Compatible` and unused Bootstrap class names | H7, H10 |
| M5 | `.gitignore`, `.editorconfig`, rewrite `README.md` | Tech §4 |
| M6 | Lint/validate scripts (html-validate, stylelint) as dev-only tooling | B8 |
| M7 | Toast/live-region feedback for cart actions (`aria-live`) | a11y |
| M8 | Empty, error and "closed now" states for cart and checkout | brief |
| M9 | Performance budget: Lighthouse ≥ 90 on all categories (mobile) | brief |

## Optional enhancements

| ID | Item |
|---|---|
| O1 | Subtle scroll-reveal / transitions honoring `prefers-reduced-motion` |
| O2 | Dark color scheme |
| O3 | Dietary filters (vegetarian, gluten-free, spicy) if data supports it |
| O4 | "Popular" / "Chef's pick" badges |
| O5 | Basic offline support (service worker) for the menu |
| O6 | Multi-language toggle (only if B2 = multiple) |
| O7 | Print-friendly menu stylesheet |
| O8 | `LICENSE` file |

## Explicitly out of scope (per brief)

Payment processing, online reservations, backend, and any non-functional "fake" integrations.
