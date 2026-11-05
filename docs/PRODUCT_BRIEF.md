# Funshi Sushi — Phase 01 Product Brief

| | |
|---|---|
| **Project** | Funshi Sushi — commercial restaurant website with digital ordering |
| **Phase** | 01 — Product Discovery |
| **Date** | 2026-11-04 |
| **Depends on** | `AUDIT_REPORT.md` (Phase 00) |
| **Status** | Draft — awaiting approval |

---

## 0. How to Read This Document

This brief defines **what** the product is and **why**. It does not cover how the product looks (Phase 02, design system) or how it is built (later phases).

### Placeholder convention

No real business information has been invented. Every unknown fact appears as a placeholder in this format:

```
{{PLACEHOLDER_NAME}}
```

All placeholders are listed in **section 11, Missing Business Information**. In the code, they will be grouped in a single configuration file (`js/config.js`) and the menu data file, so replacing them later is a data edit, not a code change. While a placeholder is still unfilled, the site will show it as visibly provisional (for example, "Price to be confirmed" or a demo banner). It will never show a fake value that looks real.

### Requirement IDs

| Prefix | Meaning |
|---|---|
| `BR-` | Business requirement |
| `FR-` | Functional requirement |
| `NFR-` | Non-functional requirement |
| `OR-` | Ordering requirement |

Priority levels: **Must** (needed for launch), **Should** (high value, launch if possible), **Could** (later version).

---

## 1. Restaurant Positioning

### 1.1 Positioning statement (proposed)

> For people in {{CITY}} who want Japanese food they can trust, **Funshi Sushi** is a sushi restaurant that pairs carefully prepared Japanese-inspired dishes with a simple, fast ordering experience. Unlike generic delivery-app listings, Funshi offers its own channel: a clear menu, transparent prices and direct contact with the restaurant through WhatsApp.

### 1.2 Positioning attributes

| Attribute | Direction |
|---|---|
| **Category** | Japanese / sushi restaurant: {{SERVICE_MODEL: dine-in + delivery + pickup / delivery only / …}} |
| **Price tier** | {{PRICE_TIER: accessible / mid-range / premium}}. The brief targets a *premium presentation* whatever the actual price tier, because the site should communicate quality. |
| **Tone of voice** | Warm, precise and confident. Respectful of Japanese culinary tradition, without imitating it or using clichés. |
| **Brand pillars** | **Freshness**, **Craft**, **Hospitality**, **Ease** |
| **What it is not** | Not a franchise, not a cheap all-you-can-eat buffet, not a pastiche of Japanese culture |

### 1.3 Brand assets status

| Asset | Status |
|---|---|
| Official name | **To be confirmed.** The repository uses "Funshi Sushi", the old `<title>` uses "Suriname Sushi" and the old asset path uses "Fenshu Sushi". This brief assumes **{{BRAND_NAME}} = "Funshi Sushi"** until confirmed. |
| Logo | Does not exist in the repository: {{LOGO_FILE}} |
| Tagline | {{TAGLINE}}. Proposals will be offered in Phase 02 for approval. |
| Brand color | Burgundy `#4b011d` (kept from the existing code) |

---

## 2. Target Audience

These personas are **hypotheses** to guide design decisions. They should be checked against the owner's knowledge of the actual clientele.

### P1 — "The weeknight orderer" (primary)
- **Age:** 25–40. Works and orders dinner from home 1–3 times a week.
- **Device:** Mobile phone. Usually arrives from Instagram, Google Maps or a link shared on WhatsApp.
- **Wants:** To see the menu and prices immediately, order in under 3 minutes and know the delivery cost before committing.
- **Frustrations:** PDF menus, hidden fees, no prices online, having to type out an order by hand in a chat.

### P2 — "The group host"
- **Who:** Orders for 3–8 people (family dinner, friends, office).
- **Wants:** Combos and platters, clear piece counts, servings per item, notes for preferences (no raw fish, allergies).
- **Frustrations:** Not knowing how much food is enough; mistakes in large orders.

### P3 — "The explorer / first-timer"
- **Who:** Curious about sushi, unsure about the vocabulary (uramaki, nigiri, hot roll).
- **Wants:** Short descriptions, photos, labels (cooked / raw / vegetarian / spicy) and recommendations.
- **Frustrations:** Menus that assume prior knowledge.

### P4 — "The planner" (dine-in or pickup)
- **Who:** Checking the address, hours and how to get there before visiting or picking up.
- **Wants:** Address, map link, today's hours, whether it is open right now, a phone or WhatsApp contact.

### P5 — Secondary audiences
- **Portfolio reviewers / recruiters** for the developer: they evaluate code quality, UX and polish. This is covered by the non-functional requirements; it does not change the customer-facing scope.
- **The restaurant owner/staff:** they receive orders on WhatsApp and need them **legible, complete and consistent**.

---

## 3. Value Proposition

### For customers

| Customer job | Pain | Gain the site provides |
|---|---|---|
| Decide what to eat | Unclear menu, no photos | Organized categories, photos, short descriptions, dietary labels, search |
| Know what it costs | Hidden fees, prices missing | Prices on every item, a live subtotal, the delivery fee shown before sending |
| Place an order | Typing the order by hand in chat, mistakes | A structured cart that generates a complete, formatted WhatsApp message |
| Get it the way they want | Unclear whether pickup or delivery is available | Explicit choice between delivery and pickup, with the rules for each |
| Trust the restaurant | Generic or outdated online presence | A professional site, the restaurant's story, consistent information |

### For the business

| Business goal | How the site supports it |
|---|---|
| Own the ordering channel | Direct orders through WhatsApp, with no marketplace commission (marketplace commission rates vary and are not assumed here) |
| Reduce order-taking effort | Orders arrive already structured: items, quantities, totals, address, payment method |
| Raise the average order value | Combos and featured items, suggested add-ons in the cart (Should) |
| Be found locally | Local SEO: schema.org `Restaurant`, NAP (name, address, phone) consistency, Google-friendly menu |
| Low operating cost | Static site with no backend, free hosting (e.g. GitHub Pages) and editable data files |

### One-line value proposition (draft)

> **Fresh sushi, made with care, ordered in a few taps.**

---

## 4. Customer Journeys

### J1 — Delivery order on mobile (primary, Must)

| Step | Customer action | Site response | Success criterion |
|---|---|---|---|
| 1 | Taps a link (Instagram bio, Maps, shared link) | Home loads fast; hero shows "See menu / Order now" | Content visible in < 2.5 s on a mid-range phone on 4G |
| 2 | Opens the menu | Category tabs, search, product cards with price | Finds a category in ≤ 1 tap |
| 3 | Taps a product | Detail view: photo, description, pieces, labels, price, quantity selector | Information is enough to decide |
| 4 | Adds to cart | Cart counter updates, short confirmation (announced to screen readers) | No page reload, no lost scroll position |
| 5 | Repeats 2–4 | Cart keeps its contents, even after a page reload | Cart survives reload and accidental tab close |
| 6 | Opens the cart | Line items, ± quantity, remove, subtotal, order notes | Can edit without leaving the cart |
| 7 | Goes to checkout | Chooses delivery → enters name, phone, address, payment method | Form validates inline with clear messages |
| 8 | Reviews the summary | Items, subtotal, delivery fee, total, data entered | Totals are mathematically correct |
| 9 | Taps "Send order via WhatsApp" | WhatsApp opens with a prefilled, formatted message to the restaurant | The message is complete and readable |
| 10 | Sends the message in WhatsApp | Site shows "Order ready — confirm it in WhatsApp" with next steps | Customer understands the order is **not confirmed until the restaurant replies** |

### J2 — Pickup order (Must, if pickup is offered)
Same as J1, but at step 7 the customer chooses **Pickup**. No address is required, the pickup address and estimated preparation time ({{PREP_TIME}}) are shown, and no delivery fee is added.

### J3 — Visit or contact (Must)
Home → "Location & Hours" → sees the address, a map link that opens the native maps app, today's hours highlighted, an "Open now / Closed now" status, and a WhatsApp/phone tap-to-contact button.

### J4 — Discovery without ordering (Should)
Home → Story section → featured dishes → menu browsing → shares a link to a specific product or category.

### J5 — Ordering outside opening hours (Must, edge case)
The customer builds a cart while the restaurant is closed. The site clearly shows that it is closed and when it opens next. Final submission is either blocked or allowed with a warning, depending on business rule **{{OUT_OF_HOURS_POLICY}}** (see OR-12).

### J6 — Returning customer (Should)
The cart is restored from the previous visit. Name, phone and address can be pre-filled from this browser, **only if the customer opted in** with "Remember my details on this device".

---

## 5. Business Requirements

| ID | Requirement | Priority |
|---|---|---|
| BR-01 | The site must present the restaurant professionally and consistently under the official brand name. | Must |
| BR-02 | The site must let customers build a complete order and send it to the restaurant through WhatsApp. | Must |
| BR-03 | The restaurant owner must be able to update the menu, prices, hours and contact details by editing data files only, without changing logic code. | Must |
| BR-04 | The site must not claim capabilities it does not have: no online payment, no live order tracking, no table reservations, no fake reviews or ratings. | Must |
| BR-05 | All business information shown (address, phone, hours, prices) must come from one source of truth so that it stays consistent across the site and the SEO metadata. | Must |
| BR-06 | The site must work without a backend or database and be hostable on free static hosting. | Must |
| BR-07 | The site must support local discovery (search engines, maps, social sharing). | Must |
| BR-08 | The delivery fee, minimum order and service area rules must be configurable. | Must |
| BR-09 | The site should promote high-value items (combos, platters, featured items). | Should |
| BR-10 | The site should be suitable as a professional portfolio piece: clean code, documentation, a testing record. | Should |
| BR-11 | The site could support more than one language. | Could |

---

## 6. Functional Requirements

### 6.1 Global

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Responsive layout from 320 px to ≥ 1440 px wide. | Must |
| FR-02 | Header with logo, main navigation and a cart button showing the item count. It stays visible on scroll (sticky). | Must |
| FR-03 | Mobile navigation menu (accessible toggle, closes with Esc and on link click). | Must |
| FR-04 | Footer with contact details, hours summary, social links ({{SOCIAL_LINKS}}), legal notes and credits. | Must |
| FR-05 | Floating or persistent "View cart" access on mobile when the cart is not empty. | Should |
| FR-06 | Skip-to-content link. | Must |

### 6.2 Home / restaurant presentation

| ID | Requirement | Priority |
|---|---|---|
| FR-10 | Hero with brand name, tagline, a main call to action ("See menu / Order now") and a high-quality image. | Must |
| FR-11 | Value highlights: 3–4 short benefit statements (e.g. freshness, delivery, pickup). | Should |
| FR-12 | Featured dishes or combos taken from the menu data (not hard-coded). | Should |
| FR-13 | Restaurant story section: {{RESTAURANT_STORY}}. | Must |
| FR-14 | Location, hours and contact section (see 6.6). | Must |

### 6.3 Digital menu

| ID | Requirement | Priority |
|---|---|---|
| FR-20 | The menu is rendered from structured data (categories → products). | Must |
| FR-21 | Category navigation (tabs or chips) that scrolls to or filters by category. | Must |
| FR-22 | Product card: name, short description, price, image, labels, an "Add" action. | Must |
| FR-23 | Product labels: e.g. *raw*, *cooked*, *vegetarian*, *vegan*, *spicy*, *gluten-free option*, *new*, *best-seller*. The available labels come from the data. | Must |
| FR-24 | Product detail view (native `<dialog>`): larger image, full description, number of pieces, allergen information ({{ALLERGEN_DATA}}), quantity selector, item note, add to cart. | Must |
| FR-25 | Text search by name, description and ingredients. Matching ignores accents and capitalization. | Must |
| FR-26 | Filters by label (e.g. vegetarian, cooked only), combinable with search and category. | Must |
| FR-27 | Empty state when no products match, with a "clear filters" action. | Must |
| FR-28 | Unavailable products shown as "Unavailable" and not addable (`available: false` in the data). | Must |
| FR-29 | Product variants, e.g. 10 / 20 / 30 pieces, if the business needs them ({{HAS_VARIANTS}}). The data model supports them either way. | Should |
| FR-30 | Shareable deep link to a category or product (URL hash). | Could |

### 6.4 Shopping cart

| ID | Requirement | Priority |
|---|---|---|
| FR-40 | Add, remove, increment and decrement items. A quantity of 0 removes the line. | Must |
| FR-41 | Quantity limits per line: minimum 1, maximum {{MAX_QTY_PER_ITEM}} (default proposal: 20). | Must |
| FR-42 | Cart drawer/panel available from every page. | Must |
| FR-43 | Line subtotal, cart subtotal and item count recalculated live. | Must |
| FR-44 | Saved in `localStorage`. The cart is restored on reload and checked against the current menu: items whose price changed or that were removed are flagged to the customer. | Must |
| FR-45 | "Empty cart" action with confirmation. | Must |
| FR-46 | General order note (e.g. "no wasabi", "ring twice"), limited to {{NOTE_MAX_LENGTH}} characters (default proposal: 280). | Must |
| FR-47 | Minimum order indicator ("Add $X more for delivery") when a minimum applies. | Should |
| FR-48 | Suggested add-ons in the cart (drinks, extra sauce) taken from data flags. | Could |

### 6.5 Checkout

| ID | Requirement | Priority |
|---|---|---|
| FR-50 | Order summary: lines, quantities, line totals, subtotal, delivery fee, total. | Must |
| FR-51 | Fulfilment choice: **Delivery** or **Pickup** (each can be turned off in config). | Must |
| FR-52 | Customer fields: name (required), phone (required), and for delivery: street and number, apartment/floor (optional), neighborhood/area (required), reference point (optional). | Must |
| FR-53 | Payment method selection (informational only, no processing): {{PAYMENT_METHODS: e.g. cash / bank transfer / card on delivery}}. For cash, an optional "change for" amount. | Must |
| FR-54 | Inline validation with accessible error messages; the first invalid field gets focus on submit. | Must |
| FR-55 | "Remember my details on this device" opt-in checkbox (off by default). | Should |
| FR-56 | Building the WhatsApp message and handing off to WhatsApp (see section 9). | Must |
| FR-57 | Post-submit screen explaining that the order must be sent in WhatsApp and is confirmed by the restaurant. | Must |
| FR-58 | Option to keep or clear the cart after handoff (default proposal: keep it until the customer clears it, because the WhatsApp send cannot be detected). | Must |
| FR-59 | Delivery zone selection with a fee per zone, if the business uses zones ({{DELIVERY_ZONES}}). | Should |
| FR-60 | Optional scheduled time ("As soon as possible" or a chosen time slot). | Could |

### 6.6 Contact, location and hours

| ID | Requirement | Priority |
|---|---|---|
| FR-70 | Address with a link that opens the native maps app: {{ADDRESS}}, {{MAPS_URL}}. | Must |
| FR-71 | Weekly hours table, with today's row highlighted: {{OPENING_HOURS}}. | Must |
| FR-72 | "Open now / Closed / Opens at HH:MM" status calculated in the restaurant's time zone ({{TIMEZONE}}). | Must |
| FR-73 | Tap-to-contact WhatsApp and phone links: {{WHATSAPP_NUMBER}}, {{PHONE_NUMBER}}. | Must |
| FR-74 | Embedded map (loaded only on interaction, for performance and privacy). | Could |
| FR-75 | Special closures and holidays ({{SPECIAL_HOURS}}). | Could |

---

## 7. Non-Functional Requirements

| ID | Category | Requirement | Priority |
|---|---|---|---|
| NFR-01 | Technology | Vanilla HTML5, CSS3 and JavaScript ES modules only; no frameworks. Google Fonts and a lightweight icon set are allowed. | Must |
| NFR-02 | Performance | Lighthouse Performance ≥ 90 (mobile). Core Web Vitals targets: LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms. | Must |
| NFR-03 | Performance budget | Initial load (excluding images) ≤ 150 KB compressed; JS ≤ 50 KB compressed; images in AVIF/WebP with fallbacks, responsive `srcset`, lazy loaded below the first screen. | Should |
| NFR-04 | Accessibility | WCAG 2.2 level AA: contrast, keyboard operability, visible focus, focus management in dialogs and drawers, labelled form fields, live announcements for cart changes, `prefers-reduced-motion` respected. Lighthouse Accessibility ≥ 95. | Must |
| NFR-05 | SEO | Semantic HTML; unique title and meta description per page; Open Graph and Twitter Card tags; schema.org `Restaurant` (+ `Menu`) JSON-LD; `sitemap.xml` and `robots.txt`; canonical URLs ({{DOMAIN}}). Lighthouse SEO ≥ 95. | Must |
| NFR-06 | Compatibility | The last 2 versions of Chrome, Edge, Firefox and Safari, including iOS Safari and Android Chrome. No support for Internet Explorer. | Must |
| NFR-07 | Resilience | Content (story, hours, contact) readable without JavaScript. A `<noscript>` notice explains that ordering needs JS. A clear message appears when `localStorage` is unavailable, in which case the cart works for the session only. | Must |
| NFR-08 | Data integrity | Prices stored as integers in the smallest currency unit; formatting through `Intl.NumberFormat` ({{CURRENCY}}, {{LOCALE}}). Data saved in `localStorage` is versioned and validated on load. | Must |
| NFR-09 | Security | All user-entered and data-driven text is inserted with `textContent` or as text nodes, never as HTML; user input is encoded before going into the WhatsApp URL; no third-party tracking without consent. | Must |
| NFR-10 | Privacy | Personal data is never sent to any server by the site. It goes only into the WhatsApp message the customer chooses to send, and is stored locally only with opt-in. A short privacy note on the checkout page explains this. Wording to be reviewed by the owner against local regulations ({{PRIVACY_JURISDICTION}}). | Must |
| NFR-11 | Maintainability | Modular files (one concern per JS module), consistent BEM naming, CSS custom properties, no file over ~300 lines without a clear reason, comments only where intent isn't obvious. | Must |
| NFR-12 | Editability | Business config and menu are separate data files with inline documentation, editable by a non-developer following the README. | Must |
| NFR-13 | Documentation | README covering features, structure, how to edit content, running locally and deploying; a completion report for each phase. | Must |
| NFR-14 | Internationalization readiness | All UI text kept in one module so that adding a language later doesn't require refactoring. | Should |
| NFR-15 | Hosting | Works from a subpath (e.g. GitHub Pages `/Funshi-Sushi/`) using relative URLs only. | Must |

---

## 8. Website Pages (Information Architecture)

### 8.1 Page map (proposal)

```
/
├── index.html      Home
├── menu.html       Digital menu (search, filters, product detail)
├── checkout.html   Order summary + customer form + WhatsApp handoff
└── 404.html        Not found

Global (on every page): header with navigation and cart button, cart drawer, footer
```

**Why separate pages instead of a single page?**
- Each page gets its own title, description and indexable URL, which is better for SEO and link sharing ("here's our menu").
- Each page has a clear job, which keeps the HTML and the JS entry points small.
- The browser back button behaves as customers expect.
- The cart is shared through the cart store and `localStorage`, so moving between pages never loses state.

### 8.2 Page contents

| Page | Sections | Primary CTA |
|---|---|---|
| **Home** | Hero · value highlights · featured dishes · our story · location & hours · contact | See menu / Order now |
| **Menu** | Page header · search · category nav · filters · product grid by category · product detail dialog | Add to cart / View cart |
| **Checkout** | Order summary (editable quantities) · fulfilment choice · customer details · payment method · notes · privacy note · send button · post-send instructions | Send order via WhatsApp |
| **404** | Friendly message · links to Home and Menu | Back to menu |

### 8.3 Navigation

Home · Menu · Our Story (Home anchor) · Location & Hours (Home anchor) · **Cart (n)**

### 8.4 Explicitly out of scope

Table reservations, online payment, user accounts or login, order tracking, reviews or ratings, loyalty programs, an admin panel, a blog. Any of these would need a backend or third-party integration and explicit approval (BR-04).

---

## 9. Ordering Requirements

### 9.1 Order rules

| ID | Rule | Value / Placeholder |
|---|---|---|
| OR-01 | Fulfilment modes offered | {{FULFILMENT_MODES: delivery, pickup}} |
| OR-02 | Currency and number format | {{CURRENCY}} / {{LOCALE}} |
| OR-03 | Minimum order for delivery | {{MIN_ORDER_DELIVERY}} (may be zero) |
| OR-04 | Minimum order for pickup | {{MIN_ORDER_PICKUP}} (may be zero) |
| OR-05 | Delivery fee model | {{DELIVERY_FEE_MODEL: flat / by zone / free above X / to be agreed}} |
| OR-06 | Delivery fee amount(s) | {{DELIVERY_FEE}} / {{DELIVERY_ZONES}} |
| OR-07 | Free-delivery threshold | {{FREE_DELIVERY_THRESHOLD}} (optional) |
| OR-08 | Delivery area | {{DELIVERY_AREA}}. Shown as text; the site does not geocode addresses. |
| OR-09 | Estimated times | Delivery {{DELIVERY_TIME_ESTIMATE}} / Pickup {{PREP_TIME}}. Shown as "estimated", never guaranteed. |
| OR-10 | Payment methods | {{PAYMENT_METHODS}}. Informational only; no payment is processed on the site. |
| OR-11 | Max quantity per line / per order | {{MAX_QTY_PER_ITEM}} / {{MAX_ITEMS_PER_ORDER}} |
| OR-12 | Out-of-hours policy | {{OUT_OF_HOURS_POLICY: block sending / allow with warning (scheduled for next opening)}} |
| OR-13 | Fee shown when the zone is unknown | If the fee depends on a zone the customer hasn't chosen, the total is labelled "+ delivery fee to be confirmed". The site never shows an invented fee. |

### 9.2 Order identity

- Each sent order gets a short reference generated in the browser (e.g. `FS-241104-7K3Q`: date + random characters) so the customer and staff can refer to it.
- The reference is **not** a server-side order number and is never presented as one.

### 9.3 WhatsApp message (target format, draft)

The message is plain text using WhatsApp formatting (`*bold*`, line breaks), URL-encoded, and sent to `https://wa.me/{{WHATSAPP_NUMBER}}?text=…`.

```
*New order — Funshi Sushi*
Ref: FS-241104-7K3Q

*Items*
2× Salmon Uramaki (10 pcs) — $ {{price}}
1× Hot Roll (8 pcs) — $ {{price}}
   Note: no cream cheese

Subtotal: $ {{subtotal}}
Delivery: $ {{fee}}
*Total: $ {{total}}*

*Fulfilment:* Delivery
*Name:* {{customer}}
*Phone:* {{phone}}
*Address:* {{street}}, {{apartment}} — {{area}}
*Reference:* {{landmark}}

*Payment:* Cash (change for $ {{amount}})
*Order note:* Ring twice, please.

Sent from the Funshi Sushi website
```

### 9.4 Message requirements

| ID | Requirement |
|---|---|
| OR-20 | Every line item includes quantity, name, variant (if any) and line total. |
| OR-21 | Totals in the message are recalculated from the menu data at send time, never taken from saved values. |
| OR-22 | Fields left empty are omitted entirely (no "Apartment: —" lines). |
| OR-23 | The message stays well within practical URL length limits. If a very large order risks being cut off, the customer is warned (threshold set in Phase 06 testing). |
| OR-24 | On desktop, `wa.me` opens WhatsApp Web or the desktop app. If neither is available, the customer can copy the complete order text to the clipboard as a fallback. |
| OR-25 | Sending is only enabled when the cart is not empty, the form is valid, the minimum order is met and the out-of-hours policy allows it. |

### 9.5 Honest-state messaging (mandatory copy rules)

- The button says **"Send order via WhatsApp"**, not "Place order" or "Pay".
- After the handoff, the site says the order **is complete only once it's sent in WhatsApp and confirmed by the restaurant**.
- Unconfirmed prices or fees are labelled as such.

---

## 10. Success Metrics

The site has no analytics backend, so these are **targets to verify during QA**. They can also be measured after launch if the owner opts into an analytics tool (which would need approval and a consent mechanism).

| Metric | Target |
|---|---|
| Time from landing to WhatsApp handoff, for a 3-item order (usability test) | ≤ 3 minutes on mobile |
| Taps from home to the first item added | ≤ 3 |
| Checkout validation errors that block with an unclear message | 0 |
| Lighthouse (mobile) Performance / Accessibility / Best Practices / SEO | ≥ 90 / ≥ 95 / ≥ 95 / ≥ 95 |
| Arithmetic errors in totals (automated test cases) | 0 |
| Orders staff have to clarify because the message was incomplete (owner feedback) | Trending to 0 |

---

## 11. Missing Business Information

Everything below must be provided by the owner. Until it is, the site uses the placeholder and marks it as provisional on screen.

### 11.1 Blocking for launch (Must)

| # | Placeholder | Description | Used in |
|---|---|---|---|
| 1 | `{{BRAND_NAME}}` | Official name (Funshi / Suriname / Fenshu?) | Everywhere |
| 2 | `{{SITE_LANGUAGE}}` / `{{LOCALE}}` | Site language and regional format (e.g. pt-BR, es-AR) | All copy, `lang`, formatting |
| 3 | `{{CURRENCY}}` | Currency code (e.g. BRL, ARS) | Prices |
| 4 | `{{WHATSAPP_NUMBER}}` | Order number in international format, digits only | Checkout, contact |
| 5 | `{{PHONE_NUMBER}}` | Public phone (may be the same number) | Contact, JSON-LD |
| 6 | `{{ADDRESS}}` | Street, number, neighborhood, city, postal code, country | Contact, JSON-LD, pickup |
| 7 | `{{CITY}}` / `{{TIMEZONE}}` | City and IANA time zone | Copy, open/closed status |
| 8 | `{{OPENING_HOURS}}` | Hours per weekday, including split shifts | Hours table, status, JSON-LD |
| 9 | `{{MENU_DATA}}` | Categories, products, descriptions, piece counts, prices, availability | Menu |
| 10 | `{{FULFILMENT_MODES}}` | Delivery, pickup, or both | Checkout |
| 11 | `{{DELIVERY_FEE_MODEL}}` / `{{DELIVERY_FEE}}` / `{{DELIVERY_ZONES}}` | How delivery is charged | Totals |
| 12 | `{{DELIVERY_AREA}}` | Where the restaurant delivers | Checkout, home |
| 13 | `{{MIN_ORDER_DELIVERY}}` / `{{MIN_ORDER_PICKUP}}` | Minimum order values | Cart, checkout |
| 14 | `{{PAYMENT_METHODS}}` | Accepted methods at delivery or pickup | Checkout |
| 15 | `{{OUT_OF_HOURS_POLICY}}` | Block or allow orders when closed | Checkout |

### 11.2 Important (Should)

| # | Placeholder | Description |
|---|---|---|
| 16 | `{{LOGO_FILE}}` | Logo (SVG preferred). If none exists, a wordmark is proposed in Phase 02. |
| 17 | `{{PRODUCT_PHOTOS}}` | Real food photos. If none exist, licensed placeholder images labelled "illustrative" will be used. |
| 18 | `{{RESTAURANT_STORY}}` | Founding story, chef, philosophy. It must be true; the site will not invent a history. |
| 19 | `{{TAGLINE}}` | Brand tagline (proposals in Phase 02) |
| 20 | `{{ALLERGEN_DATA}}` | Allergen and dietary information per product |
| 21 | `{{HAS_VARIANTS}}` | Whether products come in sizes or piece counts |
| 22 | `{{DELIVERY_TIME_ESTIMATE}}` / `{{PREP_TIME}}` | Typical times |
| 23 | `{{SOCIAL_LINKS}}` | Instagram, Facebook, TikTok, Google Business profile |
| 24 | `{{MAPS_URL}}` | Google Maps / Apple Maps link to the restaurant |
| 25 | `{{DOMAIN}}` | Production domain, or confirmation that GitHub Pages will be used |
| 26 | `{{PRICE_TIER}}` / `{{SERVICE_MODEL}}` | Positioning inputs (section 1) |
| 27 | `{{PRIVACY_JURISDICTION}}` | Country whose data-protection law applies (e.g. LGPD in Brazil, Ley 25.326 in Argentina) |

### 11.3 Optional (Could)

| # | Placeholder | Description |
|---|---|---|
| 28 | `{{SPECIAL_HOURS}}` | Holidays and closures |
| 29 | `{{FREE_DELIVERY_THRESHOLD}}` | Free delivery above a certain order value |
| 30 | `{{MAX_QTY_PER_ITEM}}` / `{{MAX_ITEMS_PER_ORDER}}` | Order limits (defaults proposed: 20 / 100) |
| 31 | `{{NOTE_MAX_LENGTH}}` | Note length limit (default proposed: 280) |
| 32 | Business legal name / tax ID | Footer, if required locally |

---

## 12. Assumptions & Open Decisions

| # | Assumption / decision | Default if not answered |
|---|---|---|
| A1 | Brand name is "Funshi Sushi" | Used provisionally |
| A2 | The README is in Portuguese, so the site language may be Portuguese | **Needs confirmation.** Copy will be written in the confirmed language only. |
| A3 | Multi-page structure (Home / Menu / Checkout / 404) | Adopted unless rejected |
| A4 | Hosting on GitHub Pages | Adopted; relative paths required anyway |
| A5 | Cart kept after the WhatsApp handoff until the customer clears it | Adopted (FR-58) |
| A6 | No analytics or tracking | Adopted (NFR-09/10) |
| A7 | Until real menu data arrives, demo products will be used, clearly labelled "Demo menu — prices illustrative" | Adopted |

---

## 13. Next Phase

**Phase 02 — Design System / Visual Identity** (pending your roadmap): color tokens with checked contrast, typography pairing, spacing scale, component inventory, wordmark/logo direction and tagline options.

*End of Phase 01. No repository files were changed. Awaiting explicit approval and the business information in section 11 to proceed.*
