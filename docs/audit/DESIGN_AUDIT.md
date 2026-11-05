# Design Audit — Funshi Sushi

**Phase:** 0 — Baseline
**Date:** 2026-11-04
**Method:** Page served locally and rendered in headless Chromium (Playwright) at 1440, 768 and 375 px wide. Screenshots: `screenshots/baseline-desktop.png`, `baseline-tablet.png`, `baseline-mobile.png`.

**[V]** = visually verified in the browser. **[C]** = based on reading the code.

---

## 1. What a visitor sees today [V]

A burgundy rectangle (150 px tall) at the top of a plain beige page, inset by an 8 px beige margin. There is no logo, text, navigation, imagery or content. The whole burgundy bar is an invisible link back to the same page.

| Viewport | Rendering |
|---|---|
| Desktop 1440 | Bar 1424×150 at y=10; rest of viewport empty beige |
| Tablet 768 | Bar 752×150; identical otherwise |
| Mobile 375 | Bar 359×150; identical otherwise |

## 2. Element-by-element review

| Area | Status | Observation |
|---|---|---|
| Brand identity / logo | **Broken** [V] | Logo image 404s; blank 150×150 box |
| Navigation | **Absent** [V] | `<nav>` contains no menu items |
| Homepage sections | **Absent** [V] | No hero, story, menu, location, contact |
| Typography | **Unused** [V] | Times New Roman declared, but no text renders |
| Color | **Weak** [V] | Burgundy + desaturated beige reads muddy rather than premium; text color planned (`brown`) would be unreadable on both backgrounds (2.2–2.5:1) |
| Imagery | **Absent** [V] | No food photography |
| Interactive elements | **1, defective** [V] | One empty full-width link; the browser's keyboard focus ring is the only visible feedback |
| Page transitions / animation | **None** [V] | — |
| Iconography | **None** | — |
| Footer | **Absent** | — |

## 3. Brand and visual opportunities

The brief asks for: restaurant identity, food quality, Japanese culinary inspiration, professionalism, trust, premium presentation and easy ordering. Proposed directions to settle in the design phase, not implemented now:

1. **Palette.** Keep the deep burgundy (`#4b011d`) as a signature accent and pair it with near-black ink, warm off-white "rice paper", and a single restrained highlight (salmon/vermilion or gold). Avoid the current mid-tone beige, which flattens contrast.
2. **Typography.** A refined display face for headings (Japanese-inspired but readable in Latin script), plus a clean humanist sans for body text and prices. Load at most two families with `font-display: swap`.
3. **Photography first.** Sushi sells visually. Large, well-cropped dish photos in the hero and menu cards with consistent lighting and aspect ratios. **Real photos are needed**; any stock images must be labelled placeholders.
4. **Japanese cues done with restraint.** Generous whitespace (*ma*), asymmetric grid, thin rules, a subtle seigaiha/wave pattern or a hanko-style red seal for the logo mark. Avoid clichés (brush-font everything, cherry blossoms on every section).
5. **Ordering as the primary action.** A persistent "Order" / cart button, especially on mobile, with a cart item count visible at all times.
6. **Trust signals.** Address with map link, opening hours with an "open now" status, WhatsApp contact, and dish allergen/ingredient notes.

## 4. Information architecture (proposal for review)

Single-page site with anchored sections, plus the cart as a drawer:

1. Header: logo, nav (Menu, About, Location, Contact), cart button
2. Hero: name, tagline, "See menu" / "Order on WhatsApp"
3. About / story
4. Menu: category tabs, search, filters, product cards → detail dialog
5. Cart drawer: items, quantities, summary → checkout form (delivery/pickup) → WhatsApp message
6. Location & hours
7. Contact
8. Footer

A multi-page split (e.g. separate `menu.html`) can be considered if the menu is large. Decide in the architecture phase.

## 5. Accessibility observations (design-related)

- Contrast failures noted above [V].
- No visible focus styles defined (only the browser default) [C].
- No reduced-motion handling yet; needed once animation is added [C].
- Touch target of the single link is oversized and invisible, so it is easy to tap by accident [V].
