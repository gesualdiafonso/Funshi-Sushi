# Funshi Sushi — Phase 09 Completion Report

| | |
|---|---|
| **Phase** | 09 — Checkout & WhatsApp Integration |
| **Date** | 2026-11-05 |
| **Branch** | `phase/09-checkout` (local; based on `phase/08-cart`) |
| **Status** | Complete — awaiting approval |

---

## 1. Summary

The checkout page now takes an order from review to WhatsApp:

1. **Review the order.** The same editable cart as the drawer.
2. **Choose delivery or pickup.**
3. **Enter details.** Name and phone; the address only for delivery; payment and "change for" when configured; notes.
4. **Validate, then send.** WhatsApp opens with a complete, readable order *request*.
5. **Afterwards**, the page says plainly that the order is **not confirmed until the restaurant replies**.

**The WhatsApp number comes only from `js/config.js` and is still `null`**, so the shipped site **sends nothing**. Sending is off and the page says why. No fallback or placeholder number exists anywhere in the code.

| Check | Result |
|---|---|
| Unit tests | **127 / 127** pass (24 new: validation, totals, order, message, customer storage) |
| Checkout browser checks | **57 / 57** pass |
| Earlier suites: all pages / home / menu / cart | **99 / 99**, **55 / 55**, **71 / 71**, **61 / 61** pass |
| HTML validation | **0 errors** |
| axe (WCAG 2.2 AA) | **0 violations**: form with errors (desktop and mobile), sent state |

---

## 2. Tasks

| Task | Implementation |
|---|---|
| Create checkout interface | One page: order review → *Delivery or pickup* → *Your details* → *Delivery address* (delivery only) → *Payment* (if configured) → *Notes*, with a sticky **Summary** (subtotal, delivery, total, the send button) on desktop that follows the form on mobile |
| Collect customer name | 2–60 characters, `autocomplete="name"` |
| Collect customer phone | 8–15 digits after removing spaces, dashes and parentheses, optional `+`; normalized in the message (`+5511987654321`); `type="tel"` |
| Select delivery or pickup | Large radio cards from config (`fulfilment.delivery/pickup.enabled`), each showing its fee and time estimate. If only one mode is enabled, it is preselected. |
| Collect delivery address when applicable | Street and number (a number is required unless "No street number" is ticked), apartment (optional), neighbourhood — **or a zone list** when `delivery.zones` is configured — and a reference point (optional). The address fields are disabled, not just hidden, for pickup, so they are never validated or sent. |
| Collect optional order notes | The cart's order note (shared with the drawer); per-dish notes from the dialog appear under each item |
| Validate required fields | `core/validate.js` (pure). Errors appear on leaving a field, then update live; on submit, all errors plus an **error summary** with links, which gets focus. `aria-invalid` + `aria-describedby`; icon + text, never color alone. |
| Generate readable order summary | Summary panel with live totals (delivery fee, "+ delivery" when the fee is unknown, minimum order); the item list; a "See the message" preview after sending |
| Generate WhatsApp message | `checkout/whatsapp.js` (pure): title "New order request", reference, items with size, notes and line totals, totals, delivery or pickup, customer, address, payment, notes, "Please confirm this order and the timing." Empty fields are left out. |
| Open the configured WhatsApp destination | `https://wa.me/<config.whatsappNumber>?text=<encoded>` in a new tab with `noopener`. The number is validated as 8–15 digits; an invalid one throws instead of sending anywhere. |

---

## 3. The Honesty Rules, and How They're Enforced

| Rule | Where | Tested |
|---|---|---|
| No invented WhatsApp number | `config.whatsappNumber: null`; `features.canOrder` is false without a valid number; `buildWhatsAppUrl` refuses invalid numbers | Shipped config: send disabled with the reason; a valid form opens nothing; **no `wa.me` link on the page**; unit test refuses `null`, `''`, `+5511`, spaced numbers |
| Opening WhatsApp ≠ confirmation | Button: **"Send order via WhatsApp"**. Message: "New order *request*… Please confirm". Sent state: **"Not confirmed yet.** Your order is confirmed only when the restaurant replies." Steps: check and send it in WhatsApp, then wait for the reply. | Message never contains "confirmed"; sent-state wording asserted |
| Can't detect whether it was sent | Step 1 says WhatsApp *should* now be open (it can't be verified); "Open WhatsApp again" + "Copy order text"; **the cart is kept** after the handoff | Cart still has 3 items after sending |
| Sample menu ≠ real order | While `IS_DEMO_MENU` is true, the message's second line is **"TEST ORDER from the sample menu — not a real order."**, and the sent state says so too | Asserted in the message and on the page |
| Unknown fees aren't invented | `orderTotals`: no fee configured → "To be confirmed" / "R$ 110,70 + delivery", and "Delivery: to be confirmed" in the message | Unit test + browser check |
| Prices from the menu only | `buildOrder` uses the priced cart, recalculated at send time | Unit tests (phase 08 + 09) |
| No online payment | "You pay when the order is delivered or picked up. Nothing is charged on this site." Without payment methods: "Payment: to be agreed" | Unit + browser |

---

## 4. Business Rules Supported (all from `js/config.js`)

| Setting | Behavior |
|---|---|
| `whatsappNumber` | Required to send (digits only, with country code) |
| `fulfilment.delivery / pickup.enabled` | Which choice cards appear |
| `delivery.fee` | Flat fee; `null` → "to be confirmed" |
| `delivery.zones` `[{ id, label, fee }]` | Zone list replaces the neighbourhood field; the zone's fee is used |
| `delivery.freeAbove` | Free delivery at or above this subtotal |
| `delivery.minOrder` / `pickup.minOrder` | "Add R$ 39,30 more to order delivery. The minimum is R$ 150,00. Pickup has no minimum." Sending is disabled until it's met. |
| `delivery.eta` / `pickup.eta`, `delivery.area` | Shown on the cards and under the address |
| `payments` `[{ id, label, allowsChange }]` | Payment radios; "Change for" appears for methods that allow it (must cover the total) |
| `outOfHoursPolicy` + `hours` + `timeZone` | `warn`: "We're closed right now. We open tomorrow at 19:00…" + **Send anyway**. `block`: sending disabled with the next opening time. Unknown hours: no check. |
| `address` | "Pick up at Test Street 123, Test Area, Test City." (otherwise: "will be confirmed by the restaurant") |

---

## 5. Architecture

```
js/core/validate.js       PURE  field rules → error codes; phone/amount normalization
js/core/pricing.js        PURE  + orderTotals: delivery fee (flat / zone / free above), minimum, pending
js/checkout/order.js      PURE  orderReference (FS-YYMMDD-XXXX, unambiguous letters), buildOrder
js/checkout/whatsapp.js   PURE  formatOrderMessage, buildWhatsAppUrl, isUrlTooLong
js/checkout/customer.js         opt-in "remember my details" (strict parse; local only)
js/checkout/strings.js          checkout + message wording (loaded only on checkout)
js/ui/checkout-form.js          form state, conditional fields, errors, totals, send flow, sent state
```

The order reference is generated in the browser and quoted in the message. It is explicitly **not** a system order number (PRODUCT_BRIEF §9.2).

---

## 6. Validation

### 6.1 Checkout browser suite (57 checks)

Test configurations are served in place of `config.js` only during tests (fake number `5500000000000`). `window.open` is intercepted to capture the exact link, and the clock is fixed to test opening hours.

| Area | Verified |
|---|---|
| Shipped config | Send disabled + reason; valid form opens nothing; focus to the reason; no `wa.me` links; payment not asked |
| Empty cart | Empty state only |
| Validation | Quiet while typing → error on leaving the field → clears live; on submit all 4 errors shown + summary focused ("4 things need your attention:"); links go to fields; `aria-invalid`; axe clean |
| Delivery / pickup | Address appears/disappears with its errors; unknown fee "To be confirmed"; street-number rule + "No street number"; pickup address shown |
| Send (pickup) | `wa.me/5500000000000`, `_blank`, `noopener`; message has the title, TEST ORDER line, reference, items/sizes/notes/totals, customer, normalized phone, payment with change, notes, the confirmation request — and never "confirmed" |
| Sent state | Replaces the form, focus on its heading; **"Not confirmed yet"**; same reference and link; preview = message; cart kept; **copy puts the exact message on the clipboard**; edit returns to the filled form; "Start a new order" (after confirming) empties the cart |
| Zones | List replaces free text; zone required; fee added (R$ 119,70); address with zone in the message |
| Minimum order | Exact shortfall message; disabled; switching to pickup clears it |
| Hours | Closed + warn: asks, nothing opened until **Send anyway**; closed + block: disabled with reason, nothing opened |
| Remember me | Off by default; off → nothing stored; on → name and phone (no order, no payment) stored locally; prefilled next visit; "Forget my details" removes them |
| Blocking line | Unavailable dish in the cart → nothing sent; focus on the reason |
| Long order | 30 lines with long notes: still opens and warns to copy the text too |
| Mobile 360 px | No overflow; axe clean with errors; sent state fits |

### 6.2 Issues found and fixed

| Found | Fix |
|---|---|
| **The site-wide preview notice was only on the home page.** The Phase 06 report said it was on every page; that was wrong. | Added to every page, plus a consistency test that keeps it identical everywhere |
| Validator: `target`/`rel` on a link before it has an `href` | Set together with the `href` |
| "WhatsApp opened with your order…" asserted something the site can't know | "WhatsApp should now be open…" |
| Test comparison failed on `R$ 91,80` | Intl uses a non-breaking space after the symbol (displays correctly); tests normalize it |
| JS budget exceeded on the menu page (50.1 KB) after adding checkout wording to the shared strings | Checkout/message strings moved to `js/checkout/strings.js`, loaded only on checkout → menu **48.9 KB** |

### 6.3 Performance

| Page (gzip JS) | Size | Budget 50 KB |
|---|---|---|
| Home | 41.2 KB | ✓ |
| Menu | 48.9 KB | ✓ |
| **Checkout** | **52.4 KB** | **✗ 2.4 KB over** |

Total text on the checkout page is 74.5 KB, within the 150 KB total budget. The JS overage is the first item for the performance phase. **Recommended:** minify at deploy time (for example in a GitHub Action), which typically removes 30–40% of these sources. Source files stay unminified, so editing still needs no build step. Alternative: load `cart-drawer.js` only on pages that have a drawer (checkout doesn't need it), which saves about 1.5 KB.

---

## 7. Deviations

| # | Change | Why |
|---|---|---|
| DV-1 | `canOrder` now needs only a valid WhatsApp number and a fulfilment mode (not locale, currency or payments) | Payment can be "to be agreed" and prices can be neutral. The **number** is what must be real. |
| DV-2 | No separate mobile sticky "Send" bar (UX §9.2) | The summary (with the single send button) follows the form on mobile. One button, no duplicate state. |
| DV-3 | Out-of-hours default is **warn** (ask, then allow) | `{{OUT_OF_HOURS_POLICY}}` is unanswered; UX Q3 default |
| DV-4 | Sample-menu orders can be sent once a number is configured, labelled **TEST ORDER** | Lets the owner try the whole flow before the real menu exists, without misleading staff |
| DV-5 | Saved customer details exclude payment and order | Only what saves typing next time (NFR-10) |

---

## 8. Known Gaps

| # | Gap | Phase |
|---|---|---|
| G1 | Real WhatsApp number, fees, zones, minimums, payment methods, hours: owner input | Owner |
| G2 | Checkout JS 2.4 KB over budget | Performance |
| G3 | The site language is English. The message language should match the restaurant staff's (pt/es); it's all in `js/checkout/strings.js`. | Owner / i18n |
| G4 | Real-device check of `wa.me` on iOS/Android and on desktop without WhatsApp installed | QA |
| G5 | Privacy note wording to be reviewed for the jurisdiction (LGPD / Ley 25.326) | Owner |

---

## 9. Commits (local)

```
fix(pages): show the preview notice on every page
feat(checkout): add field validation, order totals and the order model
feat(checkout): add the WhatsApp message and link builder
feat(checkout): build the checkout form, send flow and sent state
test: cover validation, totals, order, message and saved details
docs: add phase 09 report
```

To apply the bundle: `git fetch funshi-phase09.bundle phase/09-checkout:phase/09-checkout`

*End of Phase 09. Awaiting approval.*
