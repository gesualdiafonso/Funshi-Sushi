# Responsiveness Audit — Funshi Sushi

**Phase:** 0 — Baseline
**Date:** 2026-11-04
**Method:** Headless Chromium (Playwright), full-page screenshots plus DOM measurements at each viewport. Server: `python3 -m http.server`.

---

## 1. Measurements [V]

| Viewport | Document width | Horizontal overflow | Nav box | Logo box | Focusable elements |
|---|---|---|---|---|---|
| Desktop 1440×900 | 1440 | None | x8 y10, 1424×150 | 150×150 (empty) | 1 link, 1424×150, no text |
| Tablet 768×1024 | 768 | None | x8 y10, 752×150 | 150×150 (empty) | 1 link, 752×150, no text |
| Mobile 375×812 | 375 | None | x8 y10, 359×150 | 150×150 (empty) | 1 link, 359×150, no text |

## 2. Findings

| # | Finding | Tag |
|---|---|---|
| R1 | No horizontal overflow at any tested width, but only because the page has no content. This is not evidence of a working responsive layout. | [V] |
| R2 | `<meta name="viewport" content="width=device-width, initial-scale=1.0">` is present and correct. | [C] |
| R3 | No media queries, container queries, `clamp()` or fluid units anywhere in the CSS. | [C] |
| R4 | Fixed 150 px header height takes 18% of a 812 px mobile viewport while showing nothing. | [V] |
| R5 | Fixed `font-size:16px` on `body` overrides the user's browser font-size preference; should use `rem`/`%`. | [C] |
| R6 | The default 8 px body margin produces an inset "frame" at all sizes. | [V] |
| R7 | Logo margin collapses through the header, pushing it 10 px down at all sizes. | [V] |
| R8 | No mobile navigation pattern (menu toggle) exists. Needed once nav items are added. | [C] |
| R9 | Navigation, homepage sections, images and page transitions could not be checked for responsiveness because they don't exist. | [V] |

## 3. Requirements for the build (mobile-first)

- Base styles target ~360 px; scale up at min-width breakpoints (≈ 640 / 960 / 1280 px). Final values to be set by the content, not by devices.
- Fluid type and spacing with `clamp()`.
- Images: `srcset`/`sizes`, explicit `width`/`height` or `aspect-ratio` to prevent layout shift, `loading="lazy"` below the fold.
- Touch targets ≥ 44×44 px.
- Sticky compact header on mobile with a cart button always reachable.
- Cart as a full-screen sheet on mobile, side drawer on desktop.
- Test matrix per phase: 360, 390, 768, 1024, 1440 px, landscape mobile, 200% zoom.
