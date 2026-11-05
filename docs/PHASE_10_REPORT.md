# Funshi Sushi — Phase 10 Completion Report

| | |
|---|---|
| **Phase** | 10 — Interactions & Motion |
| **Date** | 2026-11-05 |
| **Branch** | `phase/10-motion` (local; based on `phase/09-checkout`) |
| **Status** | Complete — awaiting approval |

---

## 1. Summary

Most of the site's interactions were already built in phases 05–09. This phase started with a **measured audit**: layout shift on load, and a keyboard walk through every page checking two things at each stop, whether a focus ring shows and whether a sticky bar covers the focused element. The changes then fixed what the audit found and filled the motion gaps:

- **Fixed: the menu jumped on load.** Layout shift (CLS) was **0.36** on phones and **0.45** on desktop; it is now **0.001** and **0.000**. A skeleton holds the menu's space while its scripts run. The same fix went into checkout.
- **Fixed: keyboard focus could land behind the mobile cart bar.** This happened on the home and menu pages and fails WCAG 2.2 **2.4.11** (*Focus Not Obscured*). Focus is now always kept clear of the header, the category bar and the cart bar.
- **Exit animations.** The cart drawer, the dish dialog, the mobile menu and toasts used to animate in and vanish on close. They now leave in the reverse direction, faster than they arrive.
- **Small refinements:**
  - dish photos fade in once loaded;
  - dish photos lift slightly on hover;
  - chips give a little press feedback;
  - the selected category chip scrolls into view on phones;
  - empty states have icons and fade in.

**Reduced motion:** the whole site works with no movement at all. All of the above is tested both with motion allowed and with *reduce motion* on.

| Check | Result |
|---|---|
| New motion & loading browser suite | **58 / 58** pass |
| Earlier suites: all pages / home / menu / cart / checkout | **99 / 99**, **55 / 55**, **71 / 71**, **61 / 61**, **57 / 57** pass |
| Unit tests | **127 / 127** pass |
| HTML validation | **0 errors** |
| axe (WCAG 2.2 AA) | **0 violations**, including the loading state; all earlier axe checks still pass |
| CLS, 7 page/size/cart combinations, normal and slowed scripts | All **< 0.01** (target < 0.1) |

---

## 2. Audit First

| Measured (before) | Finding | Fix |
|---|---|---|
| CLS `menu.html` 360 px: **0.357**; 1440 px: **0.452** | The menu UI and the sample-menu notice were hidden until JS rendered them, so the footer jumped down | Skeleton (§3.1); the sample notice is in the HTML from the start |
| Focus walk `index.html` 360 px with a cart | Hero "Location and hours" button **under the fixed cart bar** | `js/ui/focus-clear.js` (§3.2) |
| Focus walk `menu.html` 360 px with a cart | All 8 category chips **under the cart bar** on first load | Same |
| Focus walk `menu.html` 1440 px | "Tuna nigiri" partly under the sticky header | `scroll-padding` + the same helper |
| Focus rings | Present everywhere (no change needed) | — |
| CLS `404.html` 360 px: **0.073** | Headline font swapping in (wraps differently from the fallback font), not scripts | Below 0.1; left for the performance phase (§7, G2) |

One audit result was wrong at first. The covered chips looked as if they were under the header, but logging the overlap coordinates showed the covering element was the **cart bar** at the bottom. The fix targets the real cause.

---

## 3. Tasks

| Task | Status | Implementation |
|---|---|---|
| Mobile navigation | ✓ | Fades in (existing) **and now out**; it takes no clicks while fading. Focus, back button and inert background are unchanged from phase 06. |
| Interactive buttons | ✓ | Existing: hover colors, a 1 px press, loading spinner (`aria-busy`), the "Added" state. New: chips get the same press feedback and a smooth border-color change. |
| Cart drawer | ✓ | Slides out to the right on close (140 ms; opening takes 240 ms) |
| Modal interactions | ✓ | Dish dialog: a sheet that slides down on phones, sinks and fades on desktop. **Focus returns to the dish** that opened it (tested). |
| Toast notifications | ✓ | Fade out instead of disappearing; they stop taking input as soon as they start leaving. Removed at once with reduced motion. |
| Loading states | ✓ | Menu and checkout skeletons (§3.1); button spinner (existing) |
| Empty states | ✓ | Icon (cart: bag; no search results: magnifier) + short fade-in; the wording already existed |
| Hover effects | ✓ | Dish photos lift 4 % (`scale`, 420 ms) on menu lines and featured cards, only on devices that hover and with motion allowed |
| Focus states | ✓ | Rings were already everywhere. **New:** focus is never hidden under a sticky or fixed bar (§3.2). |
| Scroll interactions | ✓ | Selected category chip kept in view in the sideways chip row (row only, never the page); `scroll-padding` for the mobile category bar and the cart bar |
| Subtle animations | ✓ | Lazy dish photos fade in when loaded instead of painting top to bottom |

### 3.1 Skeletons (menu, checkout)

- **Shown only while it's needed:** only when scripting is on, and only until `<html data-app>` is set. Startup now sets it on failure too (`data-app="error"`), so a broken start can't leave a skeleton on screen forever.
- **Sized to prevent the jump.** The menu skeleton fills at least one screen, so the footer stays out of view until the much longer menu replaces it.
- **Accessible:** the shapes are `aria-hidden`, and a visually hidden "Loading the menu…" says what's happening.
- **Pulse:** slow and low-contrast. It starts after 400 ms, so fast loads never see it move, and it's off with reduced motion.
- **Scripts that never arrive** (network failure): after 8 s, a message laid over the shapes says the page is taking longer than usual and suggests reloading. This needs no JS (a CSS animation delay), and it takes no space before it appears.
- **No JavaScript:** no skeleton. The existing `<noscript>` text shows instead.

### 3.2 Focus kept clear of sticky bars (WCAG 2.4.11)

Browsers scroll a focused element into view only when it is outside the viewport. An element already on screen but **under** the fixed cart bar stays hidden, and `scroll-padding` doesn't help with that.

`js/ui/focus-clear.js` (≈50 lines) runs after each focus change:
- it checks which bars are actually stuck and overlap the element horizontally;
- if the element sits under one, it scrolls just enough to reveal it, plus an 8 px gap;
- the scroll is instant, so focus is never hidden partway through a smooth scroll;
- it ignores elements inside a bar or dialog.

`scroll-padding` is set for the mobile category bar and the cart bar, so in-page jumps also land clear of them.

### 3.3 Exit animations

- **Dialogs:** the `display` and `overlay` properties are transitioned with `allow-discrete`, so a closed dialog stays rendered for 140 ms while its panel slides out.
- **State changes at once:** `dialog.open` turns false, focus returns, history updates and the background is no longer inert, all straight away. Only the picture lags.
- **Older browsers:** without `allow-discrete` support, dialogs close instantly, as they did before this phase.

### 3.4 Reduced motion

`css/base.css` already cut animation and transition durations to 1 ms and turned off smooth scrolling. **Fixed:** the dialog backdrops' fade wasn't covered (`::backdrop` isn't matched by `*`), so it still faded for 240 ms. It is now included.

Everything that moves is opted in with `prefers-reduced-motion: no-preference`; with *reduce motion* on, nothing moves.

**Kept with reduced motion:** the spinner shows as a static ring, and images still wait until they've loaded but appear without a fade.

---

## 4. Motion Inventory

| Element | Enter | Exit | Property |
|---|---|---|---|
| Cart drawer | 240 ms slide from right | 140 ms slide right | `translate`, backdrop `opacity` |
| Dish dialog (phone) | 240 ms sheet up | 140 ms sheet down | `translate` |
| Dish dialog (≥ 40rem) | 240 ms rise + fade | 140 ms sink + fade | `translate` 8 px, `opacity` |
| Mobile menu | 240 ms fade | 140 ms fade | `opacity` |
| Toast | 240 ms rise + fade | 140 ms fade | `translate` 8/4 px, `opacity` |
| Dish photo (lazy) | 240 ms fade when loaded | — | `opacity` |
| Dish photo hover | 420 ms lift to 104 % | 420 ms back | `scale` |
| Buttons, chips | 140 ms color, 1 px press | — | `background-color`, `translate` |
| Hero (existing) | 1400 ms settle, title rise | — | `scale`, `opacity` |
| Skeleton | 1.6 s pulse after 400 ms | — | `opacity` |
| Cart badge (existing) | bump on add | — | `scale` |

Every animated property is `opacity`, `translate`, `scale` or color. None of them triggers layout.

---

## 5. Validation

### 5.1 New suite: `validate-motion.mjs` (58 checks)

| Area | Verified |
|---|---|
| Skeleton | Shown while the page script is held back; real UI hidden; shapes `aria-hidden` + "Loading the menu…"; axe clean; removed once ready; same on checkout; **not** shown without JS; **startup failure** → `data-app="error"`, skeleton gone, error banner shown; **scripts blocked** → "taking longer" message hidden at first, visible after 8 s |
| Layout shift | 14 runs: home / menu / checkout (with and without a cart) at 360 and 1440 px, normal and with page scripts delayed 800 ms: all < 0.1 (in practice ≤ 0.005) |
| Focus | 80-stop Tab walks on 5 page/size combinations, with the mobile cart bar showing: a ring at every stop, never covered by the header, the category bar or the cart bar |
| Exit animations | Drawer, dish dialog, mobile nav: closed at once (`open` false); **still drawn at 40 ms with motion allowed**, not drawn with reduced motion; gone by 440 ms either way; focus returns to the dish; the fading nav ignores clicks |
| Reduced motion | No drawer animation (panel or backdrop) over 1 ms; no hover lift; no smooth scroll |
| Toasts | Times out → fades with `data-leaving` and `inert`, then is removed; reduced motion → removed at once |
| Images | Lazy dish image transparent while loading (box shows its inset color), visible once loaded; eager dialog image never hidden |
| Chip scroll | `menu.html?category=drinks` at 360 px: the "Drinks" chip is scrolled into the row and **the page itself doesn't scroll**; choosing "All" scrolls the row back |
| Empty states | Icons present and `aria-hidden` |

### 5.2 Regression

All earlier browser suites pass unchanged (343 checks), including every axe check, the no-JS checks and the history/back behavior of overlays.

### 5.3 Performance

| Page (JS, gzip -9) | Phase 09 | Phase 10 | Budget 50 KB |
|---|---|---|---|
| Home | 40.9 KB | 42.4 KB | ✓ |
| **Menu** | 48.5 KB | **50.4 KB** | **✗ 0.4 KB over** |
| Checkout | 51.2 KB | 52.6 KB | ✗ (already over, G2 of phase 09) |

(Measured with maximum gzip over each page's full module graph. The phase 09 report used a slightly different measurement, so its figures are a little higher; the before/after difference is what matters here.)

**What it costs:** +1.4–1.9 KB per page. 1.0 KB of that is `focus-clear.js`, which fixes a WCAG AA failure. The rest is the menu-filter chip scroll (0.4 KB) and toast exits (0.3 KB).

The CSS added is 2.4 KB gzip (skeleton.css plus exit rules), and the skeleton markup is about 0.5 KB per page.

**Recommendation (unchanged from phase 09):** minify at deploy time. It typically cuts these sources by 30–40%, which puts every page well under budget. I didn't trim comments to get under the line: the readable sources are part of the no-build design.

---

## 6. Deviations

| # | Change | Why |
|---|---|---|
| DV-1 | Kept the **cart drawer** (no separate cart page) | It already works with back and focus, and the checkout page is the full-page view of the same cart |
| DV-2 | No skeleton on the home page | Its CLS was already 0.001: the featured list sits in a fixed-height scrolling row |
| DV-3 | The sample-menu notice is now in the HTML from the start (JS hides it once the menu is real) | It was the second cause of the menu's shift; it matches how the site-wide preview notice already works |
| DV-4 | No `aria-busy` on the "Copy order text" button | Copying takes a few milliseconds, so a spinner would only flicker. It already confirms with a toast. |
| DV-5 | No swipe-to-close on the drawer or sheet | Not planned for v1 (UX D9); back, Esc and the close button cover it |
| DV-6 | Exit animations rely on `transition-behavior: allow-discrete` (and, for dialogs, the `overlay` property) | Supported in current Chrome/Edge and Safari. Where a browser lacks either one (Firefox may lack `overlay`; to be confirmed in QA), the overlay simply closes instantly, as before. No JS timers keep closed dialogs on screen. |

---

## 7. Known Gaps

| # | Gap | Phase |
|---|---|---|
| G1 | JS over budget: menu by 0.4 KB, checkout by 2.6 KB | Performance (deploy-time minify) |
| G2 | 404 page CLS 0.073 from the headline font swap; a metric-matched fallback (`size-adjust`) needs measuring against real devices' Georgia / Noto Serif | Performance |
| G3 | Exit animations and the focus helper are tested in Chrome only; Safari and Firefox still need real-device checks | QA |

---

## 8. Commits (local)

```
feat(motion): styles for skeletons, exit transitions, image fade-in, hover lift and focus scroll padding
feat(motion): keep focus clear of sticky bars, end loading on failed startup, toast exit, chip scroll, image fade-in
feat(pages): add the menu and checkout skeletons, empty-state icons and the new module preload
docs: add phase 10 report; describe motion in the README
```
To apply the bundle: `git fetch funshi-phase10.bundle phase/10-motion:phase/10-motion`

*End of Phase 10. Awaiting approval.*
