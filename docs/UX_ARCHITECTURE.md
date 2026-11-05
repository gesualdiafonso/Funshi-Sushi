# Funshi Sushi — Phase 03 UX Architecture

| | |
|---|---|
| **Phase** | 03 — UX Research & Information Architecture |
| **Date** | 2026-11-04 |
| **Depends on** | `AUDIT_REPORT.md`, `PRODUCT_BRIEF.md`, `BRAND_GUIDELINES.md` |
| **Status** | Proposal — awaiting approval |

> **Carried-over assumptions.** The approval checklist in `BRAND_GUIDELINES.md` §13 has not been answered item by item yet. This document therefore uses the proposed defaults: four pages (Home, Menu, Checkout, 404), printed-menu style lines, typographic product placeholders, and the interim wordmark. Every placeholder (`{{…}}`) refers to `PRODUCT_BRIEF.md` §11.

---

## 1. UX Research Summary

No user research data exists for this restaurant yet, so the design rests on the personas in `PRODUCT_BRIEF.md` §2 and on well-established patterns in food ordering and e-commerce. Each pattern is listed below with how it is applied here.

| Finding / pattern | Design response |
|---|---|
| Most restaurant traffic is mobile and arrives from social media or maps links, often with one hand on the phone | Mobile-first layouts; the main actions sit in the lower half of the screen; the cart bar is reachable with the thumb |
| Customers abandon orders when the total or the fees appear late | Delivery fee and minimum order are visible from the cart onward; the total is never hidden |
| Multi-step checkout wizards add taps and hide context | **A single checkout page** with clearly grouped sections and the summary always visible |
| Being asked to choose a product option *before* knowing the option exists causes errors | "Add" for simple products; "Choose" (opens the product details) for products with variants |
| On mobile, people use the back gesture to close sheets and dialogs | The product dialog and cart drawer integrate with browser history: **back closes them** |
| Customers rarely read long descriptions | Line items show the name, a one-line description, pieces and price; full details are one tap away |
| Hand-typed WhatsApp orders are error-prone for staff | The system builds a structured message from validated data (`PRODUCT_BRIEF.md` §9) |

**Validation plan:** In Phase QA, run moderated hallway tests with 5 participants on mobile, covering journeys J1 (delivery), J2 (pickup) and J5 (out of hours), against the success metrics in `PRODUCT_BRIEF.md` §10.

---

## 2. Sitemap

```
Funshi Sushi
│
├── Home  ·························· index.html
│   ├── #hero          Arrival, call to action, open/closed status
│   ├── #featured      Featured dishes (from menu data)
│   ├── #story         Our story
│   └── #visit         Location, hours, contact
│
├── Menu  ·························· menu.html
│   ├── #<category-slug>             e.g. #nigiri, #uramaki   (category anchors)
│   └── ?dish=<product-slug>         Product detail dialog     (deep link)
│
├── Checkout  ······················ checkout.html
│   ├── Order summary
│   ├── Delivery or pickup
│   ├── Your details
│   ├── Payment at delivery/pickup
│   └── Sent state (same page, replaces the form)
│
├── 404  ··························· 404.html
│
└── Global layers (on every page except where noted)
    ├── Header + main navigation
    ├── Mobile navigation menu
    ├── Cart drawer             (not on checkout.html, where the cart is shown inline)
    ├── Toast / live region
    └── Footer

Non-page files: robots.txt · sitemap.xml · site.webmanifest
```

### 2.1 URL conventions

| Pattern | Example | Behavior |
|---|---|---|
| Category anchor | `menu.html#uramaki` | Scrolls to the category; marks it active in the category navigation |
| Product deep link | `menu.html?dish=salmon-uramaki` | Opens that product's detail dialog on load; falls back to the menu with a notice if the product no longer exists |
| Home sections | `index.html#visit` | Used by the "Visit" navigation item |

All URLs are relative, so the site works from a subpath such as a GitHub Pages project URL (`PRODUCT_BRIEF.md` NFR-15).

---

## 3. Navigation Structure

### 3.1 Primary navigation

| Order | Label | Target | Notes |
|---|---|---|---|
| — | **Funshi wordmark** | `index.html` | Accessible name: "Funshi Sushi, home" |
| 1 | Menu | `menu.html` | The primary destination |
| 2 | Our story | `index.html#story` | |
| 3 | Visit us | `index.html#visit` | Location, hours, contact |
| 4 | **Cart (n)** | Opens the cart drawer | Button, not a link. Accessible name: "Cart, 3 items"; on checkout it scrolls to the summary |

- **Current page:** `aria-current="page"` on the link, plus an akami underline (light) or shari underline (dark).
- **"Order now" call to action:** it lives in the hero and the "Visit us" section, not in the navigation. That keeps the navigation short; on mobile, the sticky cart bar takes over that role.

### 3.2 Header behavior

| State | Behavior |
|---|---|
| Top of page (home) | Transparent over the urushi hero; shari text |
| After scrolling 24 px | Solid urushi with the level 2 shadow (`BRAND_GUIDELINES.md` §5.3) |
| Menu & checkout pages | Always solid urushi |
| Height | 64 px mobile / 72 px desktop. Kept constant so anchors can be offset with `scroll-margin-top`. |
| Sticky | Yes (`position: sticky`). It does **not** hide on scroll, because the cart must stay reachable. |

### 3.3 Secondary navigation

| Element | Where | Behavior |
|---|---|---|
| Category navigation | Menu page | Desktop: sticky left rail. Mobile: sticky horizontal row of chips under the header. Highlights the category currently in view (scroll-spy using `IntersectionObserver`). |
| Skip link | Every page | "Skip to content"; visible on focus; targets `<main id="main">` |
| Footer navigation | Every page | Menu · Our story · Visit us · WhatsApp · {{SOCIAL_LINKS}} |
| Back to menu | Checkout and 404 | Tertiary link: "Back to the menu" |

### 3.4 Footer content

```
┌───────────────────────────────────────────────────────────────┐
│ Funshi Sushi             Visit us              Order          │
│ {{TAGLINE}}              {{ADDRESS}}           WhatsApp       │
│                          Today: {{HOURS}}      {{PHONE}}      │
│                          See all hours         Menu           │
│ ─────────────────────────────────────────────────────────────  │
│ © {{YEAR}} {{LEGAL_NAME}}   Privacy note   Image credits      │
└───────────────────────────────────────────────────────────────┘
```

---

## 4. Page Hierarchy (Heading Outlines)

Each page has exactly one `<h1>` and no skipped heading levels. These outlines double as the accessibility tree for screen-reader users.

### 4.1 Home — `index.html`

```
<header>  banner: wordmark, <nav aria-label="Main">
<main id="main">
  h1  Funshi Sushi                          (hero; display style)
      p  value proposition, CTA, open/closed status
  h2  From the counter                      (featured dishes)
      h3  [dish name] ×3–6
  h2  Our story
  h2  Visit us
      h3  Address
      h3  Opening hours
      h3  Contact
</main>
<footer>  contentinfo
```

### 4.2 Menu — `menu.html`

```
<main id="main">
  h1  Menu
      search (role=search) · filters · category navigation <nav aria-label="Menu categories">
  h2  [Category] ×n                         (each a <section aria-labelledby>)
      h3  [Product name] ×n                 (each an <article>)
  dialog  h2  [Product name]                (product detail; modal)
</main>
aside (cart drawer)  h2  Your order
```

### 4.3 Checkout — `checkout.html`

```
<main id="main">
  h1  Checkout
  h2  Your order                            (summary)
  form
    fieldset/legend  Delivery or pickup
    fieldset/legend  Your details
    fieldset/legend  Delivery address       (only when delivery is selected)
    fieldset/legend  Payment
    fieldset/legend  Notes for the restaurant
  ── after sending ──
  h2  Your order is ready to send            (sent state)
</main>
```

### 4.4 404 — `404.html`

```
<main id="main">
  h1  This page isn't on the menu
      links: Back to the menu · Go to home
</main>
```

### 4.5 Content priority per page

| Page | 1st | 2nd | 3rd | 4th |
|---|---|---|---|---|
| Home | Brand + "See the menu" | Open/closed status | Featured dishes | Story, then visit info |
| Menu | Categories + products + prices | Add / Choose | Search & filters | Cart access |
| Checkout | Summary & total | Fulfilment choice | Customer details | Send button |

---

## 5. Homepage Wireframe

### 5.1 Mobile (360 px)

```
┌────────────────────────────────┐
│ Funshi            [🛍 2]  [☰] │ header, 64 px, urushi (transparent at top)
├────────────────────────────────┤
│                                │
│   [ hero photograph 4:5 ]      │ full bleed, top-down signature piece
│                                │
│                                │
│ Funshi                         │ h1 display, overlaps photo bottom
│ Sushi                          │
├────────────────────────────────┤
│ Fresh sushi, made with care,   │ lead (value proposition)
│ ordered in a few taps.         │
│                                │
│ [      See the menu       ]    │ primary, large, full width
│ ● Open now · until 23:00       │ wasabi dot + text ({{OPENING_HOURS}})
├────────────────────────────────┤ ── shari section ──
│ From the counter               │ h2
│ ┌──────────┐ ┌──────────┐ ┌─  │ horizontal scroll-snap row
│ │  [img]   │ │  [img]   │ │   │ 3–6 featured items
│ │ Name     │ │ Name     │ │   │
│ │ $ 0.000  │ │ $ 0.000  │ │   │
│ │ [ Add ]  │ │[Choose]  │ │   │
│ └──────────┘ └──────────┘ └─  │
│ See the full menu              │ tertiary link
├────────────────────────────────┤ ── urushi section ──
│ Our story                      │ h2
│ [ editorial photo 3:2 ]        │ hands at work
│ {{RESTAURANT_STORY}}           │ ≤ 3 short paragraphs
├────────────────────────────────┤ ── shari section ──
│ Visit us                       │ h2
│ Address                        │ h3
│ {{ADDRESS}}                    │
│ [ Open in maps ]               │ secondary
│ Opening hours                  │ h3
│ Mon   closed                   │ table; today highlighted
│ Tue   19:00 – 23:00   ◀ today  │
│ …                              │
│ Contact                        │ h3
│ [ Message us on WhatsApp ]     │ secondary
│ [ Call {{PHONE}} ]             │ tertiary
├────────────────────────────────┤
│ footer                         │
└────────────────────────────────┘
┌────────────────────────────────┐ sticky cart bar (only when cart ≠ empty)
│ 2 items · $ 0.000  [View cart] │
└────────────────────────────────┘
```

### 5.2 Desktop (≥ 1024 px)

```
┌──────────────────────────────────────────────────────────────────┐
│ Funshi                          Menu   Our story   Visit us  🛍 2 │
├──────────────────────────────────────────────────────────────────┤
│                                     ┌───────────────────────────┐│
│ Funshi                              │                           ││
│ Sushi                               │   hero photograph 5:4     ││
│                                     │   (bleeds to right edge)  ││
│ Fresh sushi, made with care,        │                           ││
│ ordered in a few taps.              │                           ││
│                                     │                           ││
│ [ See the menu ]   ● Open now       │                           ││
│                     until 23:00     └───────────────────────────┘│
├──────────────────────────────────────────────────────────────────┤
│ From the counter                                See the full menu │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐      │ 4-col grid
│ │   [img]    │ │   [img]    │ │   [img]    │ │   [img]    │      │
│ │ Name       │ │ Name       │ │ Name       │ │ Name       │      │
│ │ desc       │ │ desc       │ │ desc       │ │ desc       │      │
│ │ $ 0  [Add] │ │ $ 0 [Choose│ │ $ 0  [Add] │ │ $ 0  [Add] │      │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘      │
├──────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────┐   Our story                         │ asymmetric:
│ │                          │   {{RESTAURANT_STORY}}              │ 7 / 5 cols,
│ │  editorial photo 3:2     │   paragraph 1                       │ image offset
│ │  (offset down 48 px)     │   paragraph 2                       │ below text
│ └──────────────────────────┘                                     │
├──────────────────────────────────────────────────────────────────┤
│ Visit us                                                         │
│ Address            │ Opening hours          │ Contact            │ 3 columns
│ {{ADDRESS}}        │ Mon  closed            │ [ WhatsApp ]       │
│ [ Open in maps ]   │ Tue  19:00–23:00 ◀     │ {{PHONE}}          │
│                    │ …                      │ {{SOCIAL_LINKS}}   │
├──────────────────────────────────────────────────────────────────┤
│ footer                                                           │
└──────────────────────────────────────────────────────────────────┘
```

### 5.3 Homepage behavior notes

- The **open/closed status** is calculated in `{{TIMEZONE}}`, not the visitor's time zone. States: "Open now · until HH:MM" (wasabi), "Closing soon · until HH:MM" (within 30 minutes of closing), "Closed now · opens today at HH:MM", "Closed now · opens Thursday at HH:MM". Without JavaScript, only the hours table is shown, with no live status.
- **Featured dishes** come from products flagged `featured: true` in the menu data, in data order, at most 6.
- On wide screens the story text sits beside the image, with the image placed lower than the text column. This is the one deliberate grid break on the home page.

---

## 6. Digital Menu Wireframe

### 6.1 Mobile

```
┌────────────────────────────────┐
│ Funshi            [🛍 2]  [☰] │ header (solid)
├────────────────────────────────┤
│ Menu                           │ h1
│ ┌────────────────────────────┐ │
│ │ 🔍 Search dishes           │ │ search input (type=search)
│ └────────────────────────────┘ │
│ [⚙ Filters (1)]                │ opens filter sheet; count of active filters
├────────────────────────────────┤ ▼ sticks under header on scroll
│ (Nigiri) Uramaki  Hot rolls  S…│ category chips, scroll-x, active = filled
├────────────────────────────────┤
│ Nigiri                         │ h2
│ ────────────────────────────── │
│ ┌────┐ Salmon nigiri ··· $ 0.000│ h3 + dot leader + price
│ │img │ Two pieces, torched     │ 1-line description (clamped)
│ │1:1 │ 2 pcs · Raw              │ pieces + labels (text badges)
│ └────┘                  [ Add ]│ compact primary
│ ────────────────────────────── │
│ ┌────┐ Salmon uramaki ·· from  │ variants → "from" price
│ │img │                  $ 0.000│
│ │    │ Cream cheese, sesame     │
│ └────┘ 8–16 pcs       [Choose] │ opens product dialog
│ ────────────────────────────── │
│ ┌────┐ Tuna nigiri ····· $ 0.000│
│ │img │ Unavailable today        │ greyed; no button; text states why
│ └────┘                         │
├────────────────────────────────┤
│ Uramaki                        │ h2 …
└────────────────────────────────┘
┌────────────────────────────────┐ sticky cart bar
│ 2 items · $ 0.000  [View cart] │
└────────────────────────────────┘
```

### 6.2 Desktop

```
┌──────────────────────────────────────────────────────────────────┐
│ Funshi                          Menu   Our story   Visit us  🛍 2 │
├──────────────────────────────────────────────────────────────────┤
│ Menu                                                             │
│ [🔍 Search dishes                    ]  [Raw] [Cooked] [Veg] [🌶] │ filters inline as chips
├────────────┬─────────────────────────────────────────────────────┤
│ Nigiri   ● │ Nigiri                                       握り    │ optional ja label
│ Uramaki    │ ─────────────────────────────────────────────────── │
│ Hot rolls  │ [img] Salmon nigiri ························ $ 0.000 │
│ Sashimi    │       Two pieces, lightly torched · 2 pcs · Raw     │
│ Combos     │                                             [ Add ] │
│ Drinks     │ ─────────────────────────────────────────────────── │
│            │ [img] Salmon uramaki ··················· from $ 0.000│
│ sticky     │       Cream cheese, sesame · 8–16 pcs     [Choose] │
│ rail       │                                                     │
│ (3 cols)   │ (9 cols, max line width ≈ 760 px for scannability)  │
└────────────┴─────────────────────────────────────────────────────┘
```

### 6.3 Search & filter behavior

| Aspect | Specification |
|---|---|
| **Search fields** | Product name, description, ingredients, category name |
| **Matching** | Ignores case and accents (`"salmao"` matches `"salmão"`); each word must match somewhere (AND); words of 1 character are ignored |
| **Timing** | Filters as you type, with a 150 ms debounce; no submit button needed (Enter does nothing harmful) |
| **Filters** | Dietary/preparation labels from the data (e.g. Raw, Cooked, Vegetarian, Spicy). Selected labels combine with **AND**: "Cooked" + "Vegetarian" shows only items that are both. |
| **Combining** | Search AND filters AND availability. Category chips **scroll to** a category; they are navigation, not filters. |
| **While a search or filter is active** | Categories with no matches are hidden; the category navigation hides those categories too; a result line appears: "4 dishes match 'salmon'" (announced politely to screen readers) with a **Clear** action |
| **Persistence** | Search text and filters are kept in the URL (`?q=salmon&tags=cooked`) using `history.replaceState`, so the filtered view can be shared and survives a reload. They are **not** stored in `localStorage`. |
| **Mobile filter sheet** | Bottom sheet with checkboxes, "Show 12 dishes" (live count) and "Clear all". It closes on Esc, on back, or on tapping the backdrop. |
| **Unavailable items** | Shown in place (customers like to know what exists) but de-emphasized, and sorted to the end of their category |

---

## 7. Product Interaction Flow

### 7.1 Two entry paths

| Product type | Button on the line | Tap on the rest of the line |
|---|---|---|
| **Simple** (no variants) | **Add** → adds 1 immediately | Opens the product dialog |
| **With variants** (e.g. 8 / 16 pcs) | **Choose** → opens the product dialog | Opens the product dialog |
| **Unavailable** | No button; "Unavailable today" | Opens the dialog in read-only mode |

### 7.2 Product dialog

**Mobile: bottom sheet**

```
┌────────────────────────────────┐
│            ───                 │ grab handle (visual only)
│ [ image 4:5, max 45vh ]    [✕] │ close button: "Close"
│                                │
│ Salmon uramaki                 │ h2
│ Cream cheese, cucumber, sesame │ full description
│ Raw · Contains: fish, sesame,  │ labels + {{ALLERGEN_DATA}}
│ milk                           │
│                                │
│ Size                           │ fieldset/legend (only with variants)
│ ( ) 8 pcs           $ 0.000    │ radio group; first variant preselected
│ (•) 16 pcs          $ 0.000    │
│                                │
│ Note for this dish (optional)  │ label
│ [ e.g. no sesame            ]  │ max 120 chars, live counter at 100+
│                                │
│ ┌──────────────────────────────┤ sticky footer of the sheet
│ │ [ − ]  2  [ + ]   [ Add · $ 0.000 ]
│ └──────────────────────────────┤ primary, shows the line total live
└────────────────────────────────┘
```

**Desktop:** a centered modal, 720 px wide, with the image on the left (5 columns) and the details on the right (7 columns).

**Technical behavior**

- Built on the native `<dialog>` element, opened with `showModal()`.
- Focus moves to the dialog heading on open and **returns to the triggering element** on close.
- It closes on Esc, ✕, a backdrop click, or browser back. Opening it pushes `?dish=<slug>` onto the browser history, so back closes it instead of leaving the page.
- Body scroll is locked while it's open, while preserving the scroll position.
- The quantity stepper goes from 1 to `{{MAX_QTY_PER_ITEM}}`. The "−" button is disabled at 1, and its accessible name gives the current value: "Decrease quantity, currently 2".

### 7.3 Add-to-cart flow

```
 [Tap Add / Add · $ X]
          │
          ▼
  validate (available? variant chosen? qty within limit?)
          │
   ┌──────┴───────┐
   │ invalid      │ valid
   ▼              ▼
 inline message  cart-store.add(line)
 in dialog        │
                  ├─► the same product + variant + note already in the cart?
                  │      yes → increase its quantity (respecting the max)
                  │      no  → new line
                  ▼
           save to localStorage
                  │
                  ▼
     UI feedback (all at once):
      • button → "Added ✓" (1.2 s), then back to the default label
      • cart count bumps
      • live region: "Added 2 salmon uramaki, 16 pcs. Cart: 3 items."
      • dialog closes (if it was open); focus returns to the trigger
      • NO automatic drawer opening (it would interrupt browsing)
```

**Line identity:** `productId + variantId + normalized note`. The same dish with a different note becomes a separate line, so special requests are never merged by mistake.

---

## 8. Cart Flow

### 8.1 Cart drawer

**Mobile: full-height sheet sliding in from the right**

```
┌────────────────────────────────┐
│ Your order                 [✕] │ h2
├────────────────────────────────┤
│ Salmon uramaki · 16 pcs        │ line name + variant
│ Note: no sesame                │ line note (if any)
│ [−] 2 [+]          $ 0.000     │ stepper + line total
│ Remove                         │ destructive tertiary
│ ────────────────────────────── │
│ Hot roll · 8 pcs               │
│ [−] 1 [+]          $ 0.000     │
│ Remove                         │
├────────────────────────────────┤
│ Note for the restaurant        │ order-level note, max {{NOTE_MAX_LENGTH}}
│ [                           ]  │
├────────────────────────────────┤ sticky drawer footer
│ Subtotal              $ 0.000  │
│ Delivery fee calculated at     │ or the fee, if it's a flat amount
│ checkout                       │
│ Add $ 0.000 more for delivery  │ shown only if under {{MIN_ORDER_DELIVERY}}
│ [        Go to checkout      ] │ primary
│ Continue browsing              │ tertiary (closes the drawer)
│ Empty cart                     │ destructive tertiary
└────────────────────────────────┘
```

**Desktop:** the same content in a 420 px panel on the right, with a backdrop. Wide screens use the same modal drawer; there is no permanent sidebar, which keeps the menu at full width.

### 8.2 Cart operations

| Operation | Behavior | Feedback |
|---|---|---|
| Increase | +1 up to the maximum; "+" disabled at the maximum, with the helper text "Maximum {{MAX_QTY_PER_ITEM}} per dish" | Line total and subtotal update; polite announcement |
| Decrease | −1; at 1, "−" is replaced by a trash icon labelled "Remove" | Same |
| Remove | The line is removed immediately | Toast: "Removed hot roll. **Undo**" (6 s; focusable). Focus moves to the next line, or to the heading when no lines are left. |
| Empty cart | Asks for confirmation inline: "Remove all 3 dishes? [Empty cart] [Keep]" | Drawer shows its empty state |
| Edit note | Saved when the field loses focus and after 500 ms of no typing | No toast (quiet change) |
| Go to checkout | Navigates to `checkout.html` | — |

### 8.3 Persistence & reconciliation

The cart is saved in `localStorage` under a versioned key (`funshi.cart.v1`). Each saved line stores only `productId`, `variantId`, `qty` and `note`. **Prices are never stored**; they are always looked up in the current menu.

On every page load, the saved cart is checked against the current menu data:

| Situation detected | Action | Message shown (once, in the drawer and as a toast) |
|---|---|---|
| Product no longer exists | Line removed | "Salmon skin roll is no longer on the menu and was removed from your order." |
| Product now unavailable | Line kept, flagged; checkout blocked until it's removed | "Tuna nigiri is unavailable today. Remove it to continue." |
| Variant removed | Line removed | Same as "no longer on the menu" |
| Price changed | New price applied automatically | "Prices were updated since your last visit." (generic; prices were never stored) |
| Quantity above a lower new maximum | Quantity clamped to the maximum | "Quantity of hot roll adjusted to the maximum of 10." |
| Corrupted or old-version data | The cart is reset safely | "We couldn't restore your previous order." |

### 8.4 Mobile sticky cart bar

- Appears when the cart has at least 1 item, on Home and Menu (not on Checkout).
- Content: `n items · $ subtotal` + **View cart** (opens the drawer).
- Hidden while the drawer, the dialog or the mobile menu is open, and while the on-screen keyboard is open (search field focused) so it doesn't cover input.
- The page adds bottom padding equal to the bar's height, so the bar never covers the last product.

---

## 9. Checkout Flow

### 9.1 Structure decision

**One page, progressive sections.** There is no multi-step wizard, because a wizard adds taps and hides the total. Fields that don't apply are hidden (e.g. the address appears only for delivery).

### 9.2 Wireframe — mobile

```
┌────────────────────────────────┐
│ Funshi                  [Menu] │ header (cart button replaced by a link back to the menu)
├────────────────────────────────┤
│ Checkout                       │ h1
│ ┌────────────────────────────┐ │
│ │ Your order · 3 items  [▾]  │ │ collapsible summary (collapsed on mobile)
│ │ Total $ 0.000              │ │ total always visible
│ └────────────────────────────┘ │
│   expanded: lines with steppers, Edit in the cart, subtotal, fee, total
├────────────────────────────────┤
│ Delivery or pickup             │ legend
│ ┌──────────────┐┌─────────────┐│ two large radio "cards"
│ │🚲 Delivery   ││🏪 Pickup     ││ selected: 2px akami border + ✓
│ │ $ fee · ~45m ││ ~20 min     ││ {{DELIVERY_TIME_ESTIMATE}} / {{PREP_TIME}}
│ └──────────────┘└─────────────┘│
│ Pickup at {{ADDRESS}}          │ (if pickup)
├────────────────────────────────┤
│ Your details                   │ legend
│ Name                           │
│ [                           ]  │ autocomplete="name"
│ Phone (WhatsApp)               │
│ [                           ]  │ type=tel, autocomplete="tel"
│ We'll use it to confirm your   │ hint
│ order.                         │
├────────────────────────────────┤ (delivery only)
│ Delivery address               │ legend
│ Street and number              │ autocomplete="address-line1"
│ Apartment, floor (optional)    │ autocomplete="address-line2"
│ Neighborhood / zone            │ select if {{DELIVERY_ZONES}}, else text
│ Reference point (optional)     │
│ We deliver to {{DELIVERY_AREA}}│ info
├────────────────────────────────┤
│ Payment                        │ legend
│ ( ) Cash   ( ) Transfer  ( )…  │ {{PAYMENT_METHODS}}
│ Change for (optional)          │ cash only; must be ≥ the total
│ You pay on delivery or pickup. │ hint (no online payment)
│ Nothing is charged here.       │
├────────────────────────────────┤
│ Notes for the restaurant       │ prefilled from the cart note
│ [                           ]  │
│ ☐ Remember my details on this  │ opt-in, off by default
│   device                       │
├────────────────────────────────┤
│ Your details are only included │ privacy note (small)
│ in the WhatsApp message you    │
│ send. Privacy note             │
├────────────────────────────────┤ sticky bottom bar
│ Total $ 0.000                  │
│ [ Send order via WhatsApp  ]   │ primary, large, full width
└────────────────────────────────┘
```

### 9.3 Wireframe — desktop

```
┌──────────────────────────────────────────────────────────────────┐
│ Checkout                                                         │
├──────────────────────────────────────┬───────────────────────────┤
│ Delivery or pickup                   │ Your order        (sticky)│
│ [Delivery ✓]  [Pickup]               │ 2× Salmon uramaki $ 0.000 │
│                                      │ 1× Hot roll       $ 0.000 │
│ Your details                         │ Edit in the cart          │
│ Name            Phone (WhatsApp)     │ ───────────────────────── │
│ [          ]    [              ]     │ Subtotal          $ 0.000 │
│                                      │ Delivery          $ 0.000 │
│ Delivery address                     │ Total             $ 0.000 │
│ Street and number                    │                           │
│ [                              ]     │ [Send order via WhatsApp] │
│ Apartment     Neighborhood / zone    │ Nothing is charged here.  │
│ [        ]    [               ▾]     │                           │
│ …                                    │                           │
│ Payment · Notes · Remember me        │                           │
│ (7 columns)                          │ (5 columns)               │
└──────────────────────────────────────┴───────────────────────────┘
```

### 9.4 Validation rules

| Field | Required | Rule | Error message |
|---|---|---|---|
| Fulfilment | Yes | One of the enabled modes | "Choose delivery or pickup." |
| Name | Yes | 2–60 characters after trimming spaces | "Enter your name." |
| Phone | Yes | 8–15 digits after removing spaces, dashes and parentheses; an optional leading `+` | "Enter a phone number with area code, for example {{PHONE_EXAMPLE}}." |
| Street and number | Delivery | 3–100 characters; at least one digit, *unless* the customer ticks "No street number" | "Enter the street and number." |
| Apartment/floor | No | ≤ 40 characters | "Keep this under 40 characters." |
| Neighborhood/zone | Delivery | Zone selected or text entered, 2–60 characters | "Choose your zone." / "Enter your neighborhood." |
| Reference point | No | ≤ 100 characters | — |
| Payment method | Yes | One of `{{PAYMENT_METHODS}}` | "Choose how you'll pay." |
| Change for | No | Number ≥ the order total | "Enter an amount equal to or above the total ($ 0.000)." |
| Notes | No | ≤ `{{NOTE_MAX_LENGTH}}` characters; a live counter appears from 80% of the limit | "Keep the note under 280 characters." |

**When validation runs**

- **Never while the customer is typing in a field for the first time.** A field is validated on **blur** after it has been interacted with, and after that it re-validates **as the customer types**, so the error clears as soon as it's fixed.
- **On submit:** everything is validated. An error summary appears above the form ("2 things need your attention:" followed by links to each field), and **focus moves to that summary**. Each field shows its own message, connected with `aria-describedby` and `aria-invalid="true"`.
- The browser's built-in validation pop-ups are disabled (`novalidate`); the native attributes (`required`, `type`, `autocomplete`, `inputmode`) are kept for semantics and autofill.
- Whatever the customer typed is never cleared when validation fails.

### 9.5 Send flow

```
[Send order via WhatsApp]
        │
        ▼
 Pre-send checks (in order; first failure wins):
   1. cart not empty ............................ else → empty state
   2. no unavailable lines ...................... else → "Remove unavailable dishes"
   3. form valid ................................ else → error summary
   4. minimum order met for the chosen mode ..... else → message with amount missing
   5. opening hours vs {{OUT_OF_HOURS_POLICY}} .. block → message with next opening
                                                  warn  → confirm ("We're closed now.
                                                          Your order will be seen at 19:00.")
        │ all pass
        ▼
 Recalculate totals from current menu data (OR-21)
 Generate reference (e.g. FS-241104-7K3Q)
 Build message → encodeURIComponent → wa.me URL
 Check URL length (OR-23) ──► too long: show "Copy order" fallback first
        │
        ▼
 Save customer details if opted in (only then)
 window.open(waUrl, "_blank", "noopener")
        │
        ▼
 Replace the form with the SENT STATE (below)
```

### 9.6 Sent state

```
┌────────────────────────────────┐
│ Your order is ready to send    │ h2; focus moves here
│ Reference FS-241104-7K3Q       │
│                                │
│ 1. WhatsApp opened with your   │ real sequence → numbered list is correct here
│    order filled in.            │
│ 2. Tap send in WhatsApp.       │
│ 3. We'll reply to confirm your │
│    order and timing.           │
│                                │
│ WhatsApp didn't open?          │
│ [ Open WhatsApp again ]        │ secondary
│ [ Copy order text ]            │ secondary → "Copied" feedback
│                                │
│ ───────────────────────────── │
│ [ Start a new order ]          │ clears the cart (with confirmation)
│ Back to the menu               │ keeps the cart (PRODUCT_BRIEF FR-58)
└────────────────────────────────┘
```

---

## 10. Empty States

Every empty state explains the situation and gives one clear next action.

| Where | Trigger | Message | Action |
|---|---|---|---|
| Cart drawer | No lines | **Your order is empty.** Add dishes from the menu and they'll appear here. | [See the menu] (on the menu page: "Continue browsing", which closes the drawer) |
| Checkout | Opened with an empty cart | **There's nothing to check out yet.** Your order is empty. | [See the menu] |
| Menu search | No results for the text | **No dishes match "tempura".** Try another word, or clear the search. | [Clear search] |
| Menu filters | No results for a filter combination | **No dishes are both cooked and spicy.** Remove a filter to see more. | [Clear filters] |
| Menu category | Every item in the category unavailable | The category stays, with its items marked "Unavailable today" | — |
| Featured (home) | No products flagged `featured` | The section is **not rendered** (no empty box) | — |
| Menu data | Menu data loads but is empty | **The menu is being updated.** Message us on WhatsApp to order. | [Message us on WhatsApp] |
| Placeholder data | Demo data in use (`PRODUCT_BRIEF.md` A7) | A persistent banner: **Demo menu: dishes and prices are illustrative.** | — |

---

## 11. Error States

| # | Error | Detection | User-facing behavior | Recovery |
|---|---|---|---|---|
| E1 | **JavaScript disabled or failed** | `<noscript>`; a failed module import is caught in a top-level `try/catch` | Static content (home, hours, contact) still works. Notice: "Online ordering needs JavaScript. You can order by WhatsApp: {{WHATSAPP_NUMBER}}" | Direct WhatsApp link |
| E2 | **localStorage unavailable** (private mode, blocked, full) | Write test wrapped in `try/catch` at startup | Cart works for this visit only. Small notice in the drawer: "Your order won't be saved if you close this page." | — |
| E3 | **Saved cart corrupted / old version** | Schema validation on load | Cart reset (§8.3) with a message | — |
| E4 | **Product image fails to load** | `error` event on the image | Swapped for the typographic tile; no broken-image icon | Automatic |
| E5 | **Deep-linked product not found** | `?dish=` slug not found in the data | "That dish isn't on the menu anymore." (toast); the menu is shown | — |
| E6 | **Form validation errors** | §9.4 | Error summary + inline messages | Fix fields; errors clear live |
| E7 | **Minimum order not met** | Cart subtotal vs config | In the cart and at checkout: "Add $ 0.000 more to order delivery." The send button has `aria-disabled` and the reason is shown next to it. Switching to pickup may solve it, and the message says so. | Add items or switch mode |
| E8 | **Restaurant closed** | Hours config + `{{TIMEZONE}}` | Per `{{OUT_OF_HOURS_POLICY}}`: block ("We're closed. We open Thursday at 19:00.") or warn and confirm | Wait, or send with the warning |
| E9 | **Unavailable item in cart** | Reconciliation (§8.3) | Line flagged; checkout blocked with "Remove unavailable dishes to continue." | Remove the line |
| E10 | **WhatsApp window didn't open** (pop-up blocked, no app) | `window.open` returns `null`; otherwise the sent state always offers the fallback | Sent state with [Open WhatsApp again] and [Copy order text] | Copy and paste manually |
| E11 | **Message too long for the URL** | Encoded URL length > threshold (set in the QA phase) | Before opening WhatsApp: "This order is long and may be cut off in WhatsApp. Copy the order text to make sure it arrives complete." | Copy text, then open WhatsApp |
| E12 | **Clipboard API unavailable** | `navigator.clipboard` missing or rejected | A read-only text area appears with the order text pre-selected: "Copy this text" | Manual copy |
| E13 | **Configuration placeholder not filled** (e.g. no WhatsApp number) | Config validation at startup | The send button is replaced by "Online ordering isn't set up yet." A console warning is logged for developers. **The site never sends to a fake number.** | Owner fills in the configuration |
| E14 | **404** | Hosting serves `404.html` | "This page isn't on the menu." | Links to Menu and Home |

**Error message style** (`BRAND_GUIDELINES.md` §12): state what happened and how to fix it, with no apology and nothing vague. Errors always use an icon and text, never color alone.

---

## 12. Mobile Navigation

### 12.1 Mobile header

```
┌────────────────────────────────┐
│ Funshi            [🛍 2]  [☰] │  64 px
└────────────────────────────────┘
   wordmark        cart     menu toggle
   (home)          button   (aria-expanded, aria-controls)
```

The cart sits **before** the menu toggle, so the action people use most is not hidden behind the menu.

### 12.2 Mobile menu panel

```
┌────────────────────────────────┐
│ Funshi                    [✕]  │ toggle becomes ✕ "Close menu"
├────────────────────────────────┤ full-screen urushi panel
│                                │
│ Menu                           │ h3-sized Mincho links,
│ Our story                      │ 56 px tall targets
│ Visit us                       │
│                                │
│ ─────────────────────────────  │
│ ● Open now · until 23:00       │ status
│ {{ADDRESS}}                    │
│ [ Message us on WhatsApp ]     │ secondary (on dark)
│                                │
└────────────────────────────────┘
```

**Behavior**

| Aspect | Specification |
|---|---|
| Element | `<nav>` panel controlled by a `<button aria-expanded aria-controls="mobile-nav">` |
| Opening | Fades in at `--dur-base`, with no slide-from-side theatrics. Background scroll is locked. |
| Focus | Moves to the first link on open. Focus is trapped inside the panel (header, toggle and panel links) and returns to the toggle on close. |
| Closing | ✕, Esc, selecting a link (including same-page anchors), browser back, or the viewport growing past 1024 px |
| Breakpoint | Below 1024 px; at 1024 px and wider the inline navigation is shown and the toggle is removed |
| No JS | The toggle is hidden and the navigation links are shown as a wrapped row (progressive enhancement) |

### 12.3 Mobile overlay layering (z-order)

| Layer | z-index token | Element |
|---|---|---|
| 1 | `--z-sticky` | Header, category chips, sticky cart bar, checkout send bar |
| 2 | `--z-drawer` | Cart drawer, filter sheet, mobile menu |
| 3 | `--z-dialog` | Product dialog (native top layer) |
| 4 | `--z-toast` | Toasts / undo |

Only **one** overlay at a time from layers 2–3. Opening one closes any other (for example, opening the cart from the product dialog's "View cart" link closes the dialog first).

### 12.4 Gestures and history

| Gesture | Result |
|---|---|
| Browser / OS back | Closes the open overlay (dialog, drawer, sheet, menu) before leaving the page. Implemented with `history.pushState` on open and `popstate` on close; the extra history entry is removed when the overlay is closed another way. |
| Swipe on sheets | **Not implemented in v1.** Swipe-to-dismiss is unreliable with scrollable content and needs careful touch handling; the ✕ button, back and backdrop tap cover dismissal. *Could* for a later version. |
| Horizontal scroll | Category chips and featured dishes use CSS scroll-snap, with a visible edge fade showing that more items follow |

---

## 13. Accessibility Interaction Contract (summary)

| Component | Keyboard | Screen reader |
|---|---|---|
| Category chips (menu) | Tab to the group; links behave as normal | `<nav aria-label="Menu categories">`, active item `aria-current="true"` |
| Filter chips | Tab, Space/Enter toggles | `<button aria-pressed>` |
| Quantity stepper | Tab between −/+; the value is not a text field | Buttons named "Decrease/Increase quantity of {dish}"; the value lives in an `aria-live="polite"` region |
| Product dialog | Esc closes; focus stays inside the dialog | Native `<dialog>` labelled by its h2 |
| Cart drawer | Esc closes; focus stays inside | `role="dialog" aria-modal="true" aria-labelledby` |
| Fulfilment cards | Arrow keys within the group (native radios) | `<fieldset><legend>` + radios visually styled as cards |
| Cart updates | — | One shared polite live region for all add/remove/update messages |
| Errors | Error summary receives focus on submit | `role="alert"` summary; inline `aria-describedby` |

Full validation will happen in the accessibility phase (WCAG 2.2 AA).

---

## 14. Decisions & Open Questions

### Decisions taken in this phase

| # | Decision | Reason |
|---|---|---|
| D1 | Single-page checkout | Fewer taps; the total is always visible |
| D2 | "Add" vs "Choose" depending on variants | Prevents choosing a wrong size by accident |
| D3 | Adding does not open the drawer automatically | Keeps the customer's place while browsing the menu |
| D4 | Back closes overlays | Matches mobile expectations |
| D5 | Unavailable items stay visible | Customers learn the full range; the reason is stated |
| D6 | Search/filter state in the URL, cart in `localStorage` | The filtered view can be shared; the cart survives a visit |
| D7 | Prices never stored with the cart | Totals always come from the current menu |
| D8 | Sent state with copy fallback | A WhatsApp handoff can fail silently on desktop |
| D9 | No swipe gestures in v1 | Reliability over novelty |

### Open questions for the owner

| # | Question | Default if unanswered |
|---|---|---|
| Q1 | Do products have sizes or variants? (`{{HAS_VARIANTS}}`) | Data model supports them; the demo data includes one example |
| Q2 | Delivery zones with different fees? (`{{DELIVERY_ZONES}}`) | Free-text neighborhood; "fee to be confirmed" |
| Q3 | Out-of-hours policy (`{{OUT_OF_HOURS_POLICY}}`) | **Warn and confirm** (allow sending) |
| Q4 | Should "Change for" apply to cash only? | Yes |
| Q5 | Include Japanese category names (`BRAND_GUIDELINES.md` §4.5)? | No, until verified |
| Q6 | Phone number format example (`{{PHONE_EXAMPLE}}`) and country code | Needed for the phone validation hint |

---

## 15. Next Phase

**Phase 04 — Technical architecture** (pending your roadmap): file and module structure, data models (menu, cart line, config), the cart-store event contract, the storage schema, and the build-free development workflow.

*End of Phase 03. No repository files were changed. Awaiting approval to proceed.*
