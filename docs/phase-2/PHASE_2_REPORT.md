# Phase 2 Report — Homepage Redesign

**Date:** 2026-11-04
**Status:** Complete. Awaiting approval.
**Screenshots:** `docs/phase-2/screenshots/`

---

## 1. Brief adaptation

The Phase 2 brief was written for "AUREA", an architecture studio. The owner chose to adapt it to Funshi Sushi. Each section maps as follows:

| Brief section | Funshi Sushi equivalent |
|---|---|
| 01 Header & navigation | Same. Contact CTA: "Contact us" |
| 02 Hero (architectural photography) | Food photography slot, display headline, two CTAs |
| 03 About / Studio | "Our story", asymmetric two-photo layout |
| 04 Featured projects | **Featured dishes:** title, category, pieces (instead of location/year), consistent 4:5 ratio, hover state, details dialog |
| 05 Services | **How ordering works:** 3 steps plus Delivery and Pickup. No other service is claimed |
| 06 Gallery | Food gallery with horizontal scroll |
| 07 Contact form | Validated form that **hands off to WhatsApp** (owner's choice) |
| 08 Footer | Brand, navigation, contact, copyright. Social links appear only when configured |

## 2. What was built

| File | Notes |
|---|---|
| `index.html` | Rewritten: 8 sections, landmarks, skip link, SVG icon sprite, `<template>` for dish cards, `<dialog>` for details |
| `css/base.css`, `layout.css`, `components.css`, `sections.css` | Cascade layers `tokens → base → layout → components → sections → utilities`. All values come from `tokens.css` |
| `js/main.js` + 5 feature modules + 4 utils + 2 data files | ES modules; each feature starts in its own `try/catch` |
| `tests/*.test.js` | 10 unit tests (validation, message building, URL encoding, formatting) using Node's built-in runner |
| `styles.css` | **Removed.** Replaced by `css/*` as planned in ARCHITECTURE.md; the original stays in git history |

### Section notes

- **Header:** sticky. A border and soft shadow appear after 8px of scroll; that is the only scroll effect. Below 960px a Menu/Close disclosure button controls the nav (`aria-expanded`, Esc closes and returns focus, choosing a link closes it, so does clicking outside). The current section is marked with `aria-current` using IntersectionObserver. Without JavaScript the nav is always visible.
- **Hero:** Mincho display headline, which is the page's single entrance animation (disabled under reduced motion). Text and photo side by side from 960px; the photo fills the viewport height (30–46rem).
- **Story:** large 4:5 photo with a 3:2 detail photo overlapping its corner. Text is marked **Draft**.
- **Featured dishes:** rendered from `js/data/menu.js`. Two columns on phones, four from 960px with alternate cards offset. Hover underlines the title and tints the photo. Click opens a `<dialog>` with details and "Ask about this dish", which pre-fills the contact form and focuses the message.
- **Ordering:** 3 numbered steps (a real sequence) and Delivery/Pickup panels whose area, fee and address show "To be confirmed".
- **Gallery:** native horizontal scroll with snap points. Works with touch swipe, trackpad and keyboard (the track is focusable; arrow keys scroll it), plus previous/next buttons from 640px. **No custom drag:** native scrolling already covers touch and trackpads, and mouse-drag conflicts with clicking and text selection.
- **Contact:** Name, Email (optional, since replies come on WhatsApp), Topic and Message. Errors show on blur and on submit; on submit, focus moves to the first invalid field. There is a character counter. States:
  - **Loading:** button disabled, "Opening WhatsApp…"
  - **Success:** "WhatsApp is open with your message. Press send in WhatsApp to reach us." Form resets.
  - **Error (blocked pop-up):** explains, keeps the text and offers a direct link.
  - **Error (no number configured):** explains that this preview has no WhatsApp number. **This is what visitors see today**, because no number has been confirmed.
- **Footer:** Nori band, brand, navigation, contact (filled from data), automatic copyright year. Social and legal links are omitted because none exist yet.

## 3. No invented business information

- All contact data lives in `js/data/restaurant.js` and is **empty**. The page shows "To be confirmed" until values are added.
- Dishes are flagged `sample: true`, have no prices ("Price to be confirmed"), and are labelled "Sample dishes" on the page.
- Every photo slot is a labelled placeholder (wave pattern plus a "Photo placeholder" tag naming the shot and ratio).
- A preview banner at the top states this. Set `isPreview: false` in `restaurant.js` to remove it.
- The story copy is marked "Draft text".

## 4. Validation

| Check | Result |
|---|---|
| Unit tests (`node --test tests/*.test.js`) | 10 / 10 pass |
| html-validate (recommended; `doctype-style` off, `region` role allowed) | 0 errors |
| stylelint (standard; config in §6) | 0 errors |
| ESLint (browser + module rules) | 0 errors |
| Console / page errors, 404s | None, at all 7 viewports |
| Horizontal overflow at 320, 360, 390, 768, 1024, 1440, 667×375 | None |
| Interactive targets under 44px | None |
| No-JS rendering | Nav, hero, story, ordering, contact details and footer visible; dishes show a `<noscript>` message |
| `prefers-reduced-motion` | Hero animation and smooth scrolling disabled |

**Automated interaction checks (Playwright, 38 assertions):** mobile nav open/close/Esc/focus return/link close; anchors clear the sticky header; header scroll state; dish dialog open/Esc/focus return; "Ask about this dish" pre-fill; form validation and focus; email error; no-number error keeps text; gallery buttons and arrow keys; WhatsApp success path and blocked-pop-up path (with a test number injected into a stubbed request, and `window.open` stubbed) build the correct URL.

Two checks failed in the scripted run: "active nav link" and "skip link is first Tab stop". Both were **test-script timing issues, not site bugs**. Smooth scrolling had not finished when the link was checked, and a previous click had moved focus. Re-run in isolation with instant scrolling and a fresh page, both pass: the skip link is the first Tab stop, and Story/Dishes/Ordering/Gallery/Contact each become `aria-current` in turn.

## 5. Known limitations

- The WhatsApp hand-off cannot be tested end-to-end until a real number is configured.
- The Contact topic list ("Group or party order" and so on) is a proposal. Confirm which topics apply.
- Copy is in English pending the language decision (B2).
- Hero, story and gallery need real photography (B6). Each placeholder names the shot it expects.
- The mobile nav panel pushes the page down rather than overlaying it. This is intentional (simpler, no scroll lock), but can be changed.

## 6. Proposed lint configuration (for the dev-only package.json, B8)

```json
// .stylelintrc.json
{ "extends": "stylelint-config-standard",
  "rules": { "custom-property-empty-line-before": null, "selector-class-pattern": null,
             "no-descending-specificity": null, "media-feature-range-notation": "prefix" } }
// .htmlvalidate.json
{ "extends": ["html-validate:recommended"],
  "rules": { "doctype-style": "off", "prefer-native-element": ["error", { "exclude": ["region"] }] } }
```
