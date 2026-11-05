# Repository Audit — Funshi Sushi

**Phase:** 0 — Repository Discovery & Baseline Audit
**Date:** 2026-11-04
**Source:** `https://github.com/gesualdiafonso/Funshi-Sushi.git` (branch `main`, HEAD `22dd4f0`), cross-checked against the ZIP export `Funshi-Sushi-main.zip`.
**Application files modified during this phase:** none (verified by SHA-256 before/after; see end of document).

---

## 1. Summary

The repository is an early-stage stub: one HTML file containing an empty header, one stylesheet of four rules, and a two-line README. There is no content, no JavaScript, no assets and no build tooling. The ZIP and the GitHub `main` branch are byte-identical.

**Conclusion:** there is no existing application functionality to preserve beyond the project name and one brand color. The project should be treated as a new build that keeps the repository, its history and its stated intent.

## 2. File inventory

| Path | Size | Lines | Purpose |
|---|---|---|---|
| `README.md` | 36 B | 2 | Title and one-line description ("Restaurante de sushi", Portuguese) |
| `index.html` | 672 B | 24 | Single page: `<header>` → `<nav>` → logo link. No `<main>`, no `<footer>` |
| `styles.css` | 443 B | 20 | `body`, `#header-nav`, `#logo-imag` rules |

No other files exist. Specifically absent:

- `package.json`, lockfiles, `node_modules`
- JavaScript files of any kind
- Images, logo, favicon, fonts, video
- Configuration (`.editorconfig`, `.gitignore`, linters, formatters, CI)
- License file
- Data files (menu, prices, business info)

## 3. Architecture

| Aspect | Finding |
|---|---|
| Architecture | Static single HTML page + one global stylesheet |
| Entry point | `index.html` |
| Components | None. The only structural unit is the header/nav block |
| Dependencies | None (no external scripts, stylesheets or fonts are loaded) |
| Pages | 1 (`index.html`) |
| Routing | None. The only link is `index.html` → `index.html` (self) |
| Animation | None |
| Responsive behavior | None defined (viewport meta present; no media queries, no fluid sizing) |
| Configuration | None |
| JavaScript | None |

## 4. Git history

| Commit | Date | Author | Message | Change |
|---|---|---|---|---|
| `eb4dac0` | 2024-02-29 12:57 | Afonso Gesualdi | Initial commit | `README.md` |
| `9896f50` | 2024-02-29 13:02 | Afonso Gesualdi | Add files via upload | `index.html`, `styles.css` |
| `87de3c1` | 2024-02-29 13:15 | Afonso Gesualdi | Add files via upload | (on `gesualdiafonso-patch-1`) |
| `22dd4f0` | 2024-02-29 13:16 | Afonso Gesualdi | Merge pull request #1 from gesualdiafonso-patch-1 | merge |

**Branches**

- `main` — current, HEAD `22dd4f0`.
- `origin/gesualdiafonso-patch-1` — fully merged into `main`; contains no unmerged work.

All work was uploaded through the GitHub web interface within about 20 minutes on a single day. No later activity.

## 5. Existing implementation decisions

| Decision | Evidence | Keep? |
|---|---|---|
| Project name "Funshi Sushi" | repo name, README title | **Yes** (pending owner confirmation, see §6) |
| Burgundy header `#4b011d` | `styles.css` line 9 | **Candidate** as brand accent (white on it = 15.9:1 contrast) |
| Warm beige page background `#a79986` | `styles.css` line 4 | No as-is (fails contrast with the chosen text color); the warm-neutral intent can inform the palette |
| Serif typeface (Times New Roman) | `styles.css` line 5 | No; system default, not a deliberate brand face |
| Logo as CSS background on a `<div>` | `index.html` line 16, `styles.css` line 16 | No; inaccessible and broken |
| Portuguese code comments | `styles.css` lines 7, 14, 19 | Decide language convention in Phase 1 |
| Bootstrap-3-style class names (`nav-bardefault`, `nav-barheader`, `container`) | `index.html` lines 12–14 | No; Bootstrap is not loaded and is not allowed by the project constraints |

## 6. Inconsistencies requiring an owner decision

1. **Brand name appears three ways:** "Funshi Sushi" (repo), "Suriname Sushi" (`<title>`), "Fenshu Sushi" (logo path).
2. **Language:** `lang="en"` while README and comments are Portuguese. The target audience language is not defined.
3. **Logo asset:** referenced but never committed. Unknown whether one exists.

## 7. Reusable vs. redesign

| Item | Verdict |
|---|---|
| Repository, history, name | Reuse |
| `#4b011d` color | Reuse as a design token candidate |
| HTML document skeleton | Redesign (small; rewriting is cheaper than patching) |
| `styles.css` | Redesign |
| README | Rewrite with project documentation |

## 8. Integrity check (no user work overwritten)

SHA-256 of application files recorded before the audit and re-checked after writing documentation:

```
index.html  styles.css  README.md  — unchanged
```

Only new files were added, all under `docs/audit/`.
