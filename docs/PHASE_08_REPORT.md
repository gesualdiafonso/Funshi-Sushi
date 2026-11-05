# Funshi Sushi — Phase 08 Completion Report

| | |
|---|---|
| **Phase** | 08 — Shopping Cart |
| **Date** | 2026-11-05 |
| **Branch** | `phase/08-cart` (local; based on `phase/07-menu`) |
| **Status** | Complete — awaiting approval |

---

## 1. Summary

The cart works on every page:
- **Adding:** quick "Add" on menu lines and featured cards; "Choose" for dishes with sizes; a full add form (size, quantity, a note for the dish) in the product dialog.
- **Reviewing:** a header count, a drawer with quantity steppers, remove with undo, an order note and an empty-cart confirmation, plus a mobile cart bar. The checkout page shows the same order for review.
- **Persistence:** the cart is saved in `localStorage`, restored on reload, and kept in sync across tabs.

**Prices are never read from the browser.** The browser stores only *which dish, which size, how many and a note*. Every price, line total and subtotal is recalculated from the menu data each time it is shown. A cart read back from storage is parsed strictly and re-checked against the menu before use.

| Check | Result |
|---|---|
| Unit tests | **103 / 103** pass (24 new: cart model, pricing, store) |
| Cart browser checks | **61 / 61** pass |
| Earlier suites: all pages / home / menu | **99 / 99**, **55 / 55**, **71 / 71** pass |
| HTML validation | **0 errors** |
| axe (WCAG 2.2 AA) | **0 violations**: drawer (desktop and mobile), checkout review |

---

## 2. Tasks

| Task | Implementation |
|---|---|
| Add products | `Add` on menu lines and featured cards (simple dishes); `Choose` opens the dialog for dishes with sizes; the dialog form adds a size, a quantity (1–20) and a note. The same dish with a different size or note becomes a separate line; same size and note merge. |
| Remove products | `Remove` on every line, with an **Undo** toast that puts the line back where it was. `Empty cart`, with an inline confirmation. Setting the quantity to 0 removes the line. |
| Update quantities | − / + steppers in the drawer and on the checkout page. Focus stays on the same button after each update. Each change is announced to screen readers. |
| Calculate subtotals | Line total = unit price from the menu × quantity, in integers (minor units) |
| Calculate total | Subtotal of orderable lines. `total` = subtotal + fees; fees (delivery) arrive in the checkout phase. |
| Display cart item count | Header badge (bumps on add) and accessible name "Cart, 3 items"; mobile cart bar "3 items · 64.70"; "Subtotal · 3 items" in the drawer |
| Handle empty cart | Drawer: "Your order is empty." plus *See the menu*. Checkout: "There's nothing to check out yet." The storage entry is removed when the cart is emptied. |
| Persist cart using LocalStorage | `funshi.cart.v1`: `{ v, lines: [{ key, productId, variantId, qty, note }], orderNote }`. Saved after each change. If storage is blocked, the cart works in memory and the drawer says the order won't be saved. |
| Restore cart on page reload | Read → strict parse → reconcile against the current menu → the cleaned cart is saved back (so notices don't repeat). Also synced live from other tabs (`storage` event). |
| Validate quantities | Whole numbers ≥ 1 only; at most **20 per dish** and **100 per order** (config). Over a limit: clamped, with "You can order up to 20 of each dish." / "…100 items at a time." |
| Handle unavailable products | No Add button; the dialog explains why. Unavailable lines already in a cart are kept and flagged: "Unavailable today. Remove it to continue.", "Not included" in totals, and **Review order** is blocked with the reason (focus moves to it). |
| Prevent invalid prices and quantities | Only dishes whose price is a safe integer ≥ 0 can be added (`null`/unconfirmed prices are refused). Totals are guarded against overflow. Quantities are validated in the model, not only by the buttons; a forged "Add" button for an unavailable dish is refused (tested). |

---

## 3. Architecture

```
js/cart/cart-model.js   PURE  add / setQty / remove / restore / clear, limits, notes,
                              parseSavedCart (strict), reconcile (vs current menu)
js/core/pricing.js      PURE  priceCart: prices from the catalog only → lines, subtotal, total, blocking
js/core/catalog.js      PURE  + checkOrderable (available? valid size? confirmed price?)
js/services/storage.js        safe localStorage wrapper (never throws)
js/cart/cart-store.js         state owner: actions → save → notify subscribers; cross-tab sync
js/ui/cart-view.js            order list + totals + note + empty state (drawer AND checkout)
js/ui/cart-drawer.js          drawer dialog, links, empty-cart confirmation
js/ui/cart-indicators.js      header count, mobile cart bar
js/ui/add-to-cart.js          quick Add / Choose controls + feedback
js/ui/product-dialog.js       + add form (size radios, stepper, note, "Add · total")
js/ui/toast.js                toasts with action (Undo, View cart), inside the open dialog if any
js/ui/cart-messages.js        all cart wording in one place
```

- The pure modules are tested in Node. A consistency test keeps `cart-model.js` free of DOM code.
- The shared cart markup (drawer, line template, cart bar) is identical on every page that has it, which the consistency test enforces. The checkout page renders the same cart view inline.

### Trust boundaries

| Data | Source of truth | Stored in the browser? |
|---|---|---|
| Dish, name, price, availability, sizes | `js/data/menu.js` | **No** |
| Line total, subtotal, total | Calculated each time from the menu | **No** |
| Which dish / size / how many / notes | The customer | Yes, parsed strictly and re-checked on every load |

Verified with tampered storage: a `price: 1` injected into a line is ignored, `qty: 999` becomes 20, an unknown dish is removed, an unknown size is removed, and an over-long order note is cut to 280 characters.

---

## 4. Validation

### 4.1 Cart browser suite (61 checks)

| Area | Verified |
|---|---|
| Quick add | "Added" state, badge bump, "Cart, 1 item", announcement text |
| Dialog add | Size choice, quantity, live "Add · 91.80", note normalized ("No sesame"), dialog closes, toast with *View cart* |
| Drawer | Lines with size, quantity and totals from the menu; subtotal; focus on its heading; steppers keep focus; remove + undo restores position; order note saved; empty-cart confirm (Keep / Empty); empty state; storage cleared |
| Storage | Only id, size, qty and note are stored; **no prices, names or totals** |
| Across pages | Home → menu → reload → 404 → checkout: same cart; quantities editable on checkout; header cart goes to the order on checkout; a second tab syncs live |
| Navigation | Drawer "Review order" → checkout; back returns with the drawer closed |
| Tampering | Injected price ignored, quantities clamped, unknown dish/size removed, customer told; cleaned cart saved (no repeat notices); corrupted data → reset + notice |
| Unavailable | No Add button; dialog reason; forged Add refused; kept in cart, "Not included", checkout blocked with reason, unblocked once removed |
| Limits | Dialog stepper stops at 20; quick add beyond 20 per dish and 100 per order refused with an explanation |
| Mobile | No bar when empty; bar pinned to the bottom with "2 items · 33.80" and padding below the content; full-width drawer; back closes it; bar hidden on desktop |
| Blocked storage | Cart works for the visit and warns it won't be saved |
| No JavaScript | No cart controls shown (ordering needs JS) |
| axe | Drawer (desktop and mobile) and checkout review: 0 violations |

### 4.2 Issues found and fixed

| Found | Fix |
|---|---|
| `pricing.js` (core) imported from `cart/`, breaking the dependency direction | `checkOrderable` moved into `core/catalog.js` |
| The root flag `data-cart-bar` collided with the bar's own hook, so selectors matched `<html>` | Renamed to `data-has-cart-bar` |
| "Added" toast left behind the drawer's backdrop (unreachable) | Page toasts are dismissed when an overlay opens; toasts inside an open dialog render in it |
| Mobile drawer 15 px short of full width (scrollbar gutter) | Sized in viewport units |
| axe `region`: mobile cart bar outside landmarks | Labelled `<aside>` |
| Phase 07 test: category change left results mid-scroll | Instant jump after filtering (the content under the viewport was just replaced) |
| "Remove" links indented from the dish names | Aligned |

### 4.3 Performance — attention needed

| Menu page (gzip) | Size | Budget |
|---|---|---|
| HTML / CSS | 4.8 KB / 22.0 KB | — |
| **JS (31 modules)** | **48.1 KB** | **≤ 50 KB** |
| Text total | 74.9 KB | ≤ 150 KB |

JS is now close to its budget, and the checkout phase will add the form, validation and the WhatsApp message. Options for the next phases, in order of preference:
1. Load modules that only the menu page or the checkout page needs only on that page (already the case for the dialog). Load the drawer's code when it first opens.
2. Minify at deploy time (e.g. a GitHub Action). This keeps the no-build editing workflow.
3. Revisit the budget: 50 KB compressed is strict for a site with this much interaction.

---

## 5. Deviations

| # | Change | Why |
|---|---|---|
| DV-1 | `reconcile` lives in `cart-model.js` (not a separate `reconcile.js`) | It shares helpers and tests with the model; one module stays small (~230 lines) |
| DV-2 | "−" is disabled at 1 and **Remove** is always shown (instead of "−" turning into a trash icon) | One consistent way to remove, at any quantity |
| DV-3 | No generic "prices were updated" notice | Prices are never stored, so a change can't be detected — and doesn't need to be: totals always use current prices |
| DV-4 | The checkout page shows the **order review** now (editable), with a notice that the next step isn't available yet | "Review order" in the drawer leads to a working page, not an empty shell |
| DV-5 | Featured cards: the title links to the dish's details; the button is Add or Choose (the "Details" button was replaced) | One clear action per card |
| DV-6 | A whole saved cart is reset if any line is malformed (rather than dropping that line) | Malformed data means it wasn't written by this site; starting clean is safer |

---

## 6. Known Gaps

| # | Gap | Phase |
|---|---|---|
| G1 | Delivery fee, minimum order, fulfilment choice, customer form, WhatsApp handoff | Checkout phase |
| G2 | JS budget headroom (§4.3) | Checkout / performance |
| G3 | Swipe to close the drawer (not planned for v1, UX D9) | — |
| G4 | Chrome only so far; Safari's storage partitioning and private mode to be checked on real devices | QA phase |

---

## 7. Commits (local)

```
feat(cart): add the cart model, pricing from the menu, and safe storage
feat(cart): add the cart store with persistence and cross-tab sync
feat(cart): add the drawer, cart view, count, mobile bar and toasts
feat(cart): add to the order from menu lines, featured cards and the dish dialog
feat(checkout): show the order review on the checkout page
test: cover the cart model, pricing, storage tampering and the store
docs: add phase 08 report
```

To apply the bundle: `git fetch funshi-phase08.bundle phase/08-cart:phase/08-cart`

*End of Phase 08. Awaiting approval.*
