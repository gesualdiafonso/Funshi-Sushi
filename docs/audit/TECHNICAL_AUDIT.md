# Technical Audit — Funshi Sushi

**Phase:** 0 — Baseline
**Date:** 2026-11-04

Findings are tagged **[V]** when verified by running a tool or the page in a browser, and **[C]** when based on reading the code only.

---

## 1. Baseline build & tooling (Step 0.2)

| Check | Result |
|---|---|
| `package.json` present | **No** [V] |
| `npm install` | Not applicable; there is no manifest and no dependencies |
| `npm run build` | Not applicable; no scripts. The site is static and needs no build step |
| `npm run dev` | Not applicable. The page was served with `python3 -m http.server` for testing |
| Lint scripts | None in repo |
| Test scripts | None in repo |

Because the repo has no tooling, the following checks were run from a scratch folder **outside** the repository (nothing was installed into the project):

### 1.1 HTML validation — `html-validate` (recommended preset) [V]

```
index.html
  15:22  error  Anchor link must have a text describing its purpose  wcag/h30
✖ 1 problem (1 error, 0 warnings)
```

### 1.2 CSS lint — `stylelint` + `stylelint-config-standard` [V]

```
styles.css
   7:2   ×  Expected empty line before comment  comment-empty-line-before
  14:14  ×  Expected whitespace before "*/"     comment-whitespace-inside
  19:29  ×  Disallowed unit                     length-zero-no-unit
× 3 problems (3 errors, 0 warnings)
```

All three are formatting-level.

### 1.3 Runtime (Chromium via Playwright) [V]

| Viewport | Network errors | Console errors |
|---|---|---|
| 1440×900 | `404 /Fenshu%20Sushi/` | `Failed to load resource: 404` |
| 768×1024 | same | same |
| 375×812 | same | same |

No JavaScript errors (no JavaScript exists).

## 2. Code-level findings

### HTML (`index.html`)

| # | Line | Issue | Severity | Tag |
|---|---|---|---|---|
| H1 | 16 | `alt` attribute on a `<div>` is invalid HTML (only valid on `img`, `area`, `input[type=image]`). Screen readers get no name for the link. | High | [C] (validator flagged the empty link, H3) |
| H2 | 16 | Logo implemented as CSS background image: no accessible name, not printable, not indexable | High | [C] |
| H3 | 15 | Link to home has no text content and no `aria-label` → empty link | High | [V] |
| H4 | 15 | `class=""` empty attribute | Low | [C] |
| H5 | 7 | `<title>` is "Suriname Sushi", not the project name | High | [C] |
| H6 | 2 | `lang="en"` contradicts Portuguese project language (undecided) | Medium | [C] |
| H7 | 6 | `X-UA-Compatible` meta is obsolete (IE only) | Low | [C] |
| H8 | — | No `<meta name="description">`, Open Graph, canonical, favicon, theme-color | High (SEO) | [C] |
| H9 | — | No `<main>`, `<footer>`, headings or landmarks beyond `header`/`nav` | High | [C] |
| H10 | 12–14 | Bootstrap-3 class names with no Bootstrap loaded; `.container` / `.nav-bardefault` have no CSS | Low | [C] |
| H11 | — | No skip link | Medium | [C] |
| H12 | 24 | No trailing newline | Low | [C] |

### CSS (`styles.css`)

| # | Line | Issue | Severity | Tag |
|---|---|---|---|---|
| S1 | 16 | `url('../Fenshu Sushi/#logo-imag')`: goes above the site root, uses a space in the path, and the `#logo-imag` part is a URL fragment, not a filename. Resolves to `/Fenshu%20Sushi/` → 404 | Critical | [V] |
| S2 | 3–4 | Text `brown` (#a52a2a) on `#a79986` = **2.54:1** contrast, fails WCAG AA (4.5:1) | High | [V] (computed) |
| S3 | 3, 9 | `brown` on header `#4b011d` = **2.24:1**, also fails | High | [V] (computed) |
| S4 | all | ID selectors only; no class-based reusable styling, high specificity | Medium | [C] |
| S5 | all | No custom properties / design tokens | Medium | [C] |
| S6 | all | No reset or normalisation. Default `body` margin 8px is visible as a beige frame around the header | Medium | [V] |
| S7 | 19 | Logo top margin collapses through `nav`/`header`/`body`, pushing the header 10px down | Low | [V] (nav `y=10`) |
| S8 | 10–11 | `border-radius:0; border:0` override Bootstrap defaults that don't exist | Low | [C] |
| S9 | all | No media queries, no fluid type or spacing | Medium | [C] |
| S10 | 5 | Font stack is a system default; no brand typography | Medium | [C] |
| S11 | — | No `:focus-visible` styles | Medium | [C] |
| S12 | — | No `prefers-reduced-motion` / `prefers-color-scheme` handling (nothing animated yet, so not urgent) | Low | [C] |

### JavaScript

None present. Every interactive feature in the brief (menu, search/filter, cart, persistence, checkout, WhatsApp order) is **not started**.

## 3. Technical debt summary

The debt is small in volume because there is little code. The main issue is that **almost everything is missing**: no structure, content, data, scripts or tooling. The existing code is not worth patching. A clean rewrite costs less than fixing the 20 findings above one by one.

## 4. Configuration gaps to address in Phase 1

- `.gitignore`, `.editorconfig`
- Optional dev-only `package.json` holding lint/validate scripts (`html-validate`, `stylelint`) and a static dev server. These are dev tooling only and must not ship to users. **Needs approval**, since the brief limits dependencies.
- `LICENSE` (owner's choice)
- `README.md` with setup, structure and contribution notes
