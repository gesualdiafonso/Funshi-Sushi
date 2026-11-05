# Responsive Standards — Funshi Sushi

**Phase:** 1 — Architecture & Design Foundation
**Status:** Proposed. Awaiting approval.

Mobile-first: base CSS targets a 360px-wide phone; larger layouts are added with `min-width` queries.

---

## 1. Breakpoints

Breakpoints are set in `em`, so they respond to the visitor's zoom and font size. They are chosen where the content needs them, not by device.

| Name | Query | px at 16px | What changes |
|---|---|---|---|
| base | — | 0–639 | Single column, sticky compact header, bottom cart bar, cart as full-height sheet |
| `sm` | `(min-width: 40em)` | 640 | Larger menu thumbnails (120px), two-column form rows (name / phone) |
| `md` | `(min-width: 60em)` | 960 | Full navigation in header (no menu button), two-column menu list, hero split text/photo, cart as right drawer, bottom cart bar hidden |
| `lg` | `(min-width: 80em)` | 1280 | Maximum type sizes reached, wider gutters; layout otherwise the same |

Container queries (`@container`) may be used for the menu item if it is reused at different widths (list vs. dialog suggestions).

## 2. Body width and horizontal overflow

- `html { overflow-x: clip; }` is **not** used to hide problems. Overflow is prevented at the source:
  - `img, svg, video { max-inline-size: 100%; block-size: auto; }`
  - Long words and URLs: `overflow-wrap: anywhere` on paragraphs, addresses and the order summary.
  - Flex/grid children that hold text: `min-inline-size: 0`.
  - The category chip row scrolls horizontally *inside its own container* (`overflow-x: auto`, `scroll-snap-type: x proximity`) and never widens the page.
- Containers: `inline-size: min(100% - 2 * var(--gutter), var(--container))` and `margin-inline: auto`.
- **Check every phase:** `document.documentElement.scrollWidth === innerWidth` at 320, 360, 390, 768, 1024 and 1440px.

## 3. Grid behavior

| Area | base | sm (640) | md (960) | lg (1280) |
|---|---|---|---|---|
| Header | Seal + name, cart button, menu button | same | Seal + name, nav, cart | same |
| Hero | Text, then 4:5 photo | same | Text and photo side by side (5/7 columns) | same, larger type |
| Story | Text, then 3:2 photo | same | Text and photo side by side | same |
| Menu | Sticky category chips, 1-column rows | 1 column, larger thumbs | Category sidebar (sticky) + 2-column rows | same |
| Checkout | 1 column | Name and phone side by side | Inside the drawer: 1 column | same |
| Hours & location | Stacked: status, hours, address, map link | same | Hours and address side by side | same |
| Footer | Stacked | 2 columns | 3 columns | same |

Layouts use CSS Grid with named areas or `repeat(auto-fit, minmax(…))`. Floats and absolute-positioned layout are not used.

## 4. Typography scaling

- All type sizes use `clamp()` between 360px and 1280px viewports (see `tokens.css`). Body grows only 16 → 17px; headings grow most.
- No `vw`-only sizes. Each `clamp()` includes a `rem` term so text still scales with browser zoom (WCAG 1.4.4).
- Line length capped with `max-inline-size: var(--measure)` (65ch) for body text and 45ch for leads.
- Verified at 200% zoom: no loss of content, no horizontal scroll at 1280px wide (equivalent to 640px).

## 5. Navigation

| Viewport | Pattern |
|---|---|
| < 960px | Sticky 64px header with a seal, name, cart button (with count) and "Menu" button. The menu button opens a full-width panel below the header. The button has `aria-expanded` and `aria-controls`; Esc closes the panel and returns focus. Choosing a link closes the panel |
| ≥ 960px | Inline links: Menu, Our story, Visit us, plus the cart button. The current section is marked with `aria-current` based on scroll position (IntersectionObserver) |
| All | Skip link "Skip to menu" as the first focusable element. Header hides on scroll down and reappears on scroll up only below 960px; disabled with reduced motion |

**Mobile cart bar:** once the cart has items, below 960px a bar sticks to the bottom: "View order · 3 items · $ 0.000". It respects `env(safe-area-inset-bottom)`.

## 6. Image crops

| Image | Mobile | Desktop | Technique |
|---|---|---|---|
| Hero | 4:5 portrait, dish centered | 4:5 in split layout, or 16:9 full-bleed | `<picture>` with art-directed sources; `object-position` set per image in data |
| Dish thumbnail | 1:1, 88px | 1:1, 120px | `srcset` 1x/2x (176, 240, 360px files) |
| Dish detail | 4:3 full dialog width | 4:3, 560px | `srcset` + `sizes` |
| Ambience | 3:2 | 3:2 | `srcset` + `sizes` |

- Formats: AVIF and WebP with JPEG fallback through `<picture>`.
- Above the fold (hero): `fetchpriority="high"`, no lazy loading. Everything else: `loading="lazy" decoding="async"`.
- Every image has explicit `width` and `height`. Decorative images get `alt=""`; dish photos get a short description ("Two pieces of salmon nigiri").

## 7. Touch interactions

- Minimum target 44 × 44px (`--tap-target`), with at least 8px between adjacent targets.
- No hover-only features: everything hover reveals is also visible or reachable by tap. Hover styles are wrapped in `@media (hover: hover)` so they don't stick after a tap on touch screens.
- Inputs at least 16px font size, so iOS doesn't zoom on focus.
- Correct mobile keyboards: `type="tel"` + `inputmode="tel"` for phone, `autocomplete` on all customer fields.
- Swipe is never the only way to do something. The bottom sheet closes with a visible "Close" button, Esc and a tap on the scrim; swipe-down is optional.
- While the cart or dialog is open, background scroll is locked (`overflow: hidden` on `html`) and focus is trapped. Focus returns to the button that opened it.
- `touch-action: manipulation` on buttons removes the double-tap zoom delay.

## 8. Test matrix (each phase)

| Width | Represents |
|---|---|
| 320 | Smallest supported (iPhone SE 1st gen, zoomed) |
| 360 | Common Android |
| 390 | Current iPhone |
| 768 | Tablet portrait |
| 1024 | Tablet landscape / small laptop |
| 1440 | Desktop |
| 667×375 | Phone landscape (short height: sheet and dialog must scroll) |
| 1280 at 200% zoom | Accessibility zoom |

Checks at each width: no horizontal scroll, no clipped text, tap targets ≥ 44px, focus visible, header doesn't cover anchored headings, overlays scroll internally when taller than the viewport.
