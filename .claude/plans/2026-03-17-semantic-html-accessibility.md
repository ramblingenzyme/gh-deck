# Plan: Semantic HTML & Accessibility Improvements

## Context

The codebase is almost entirely `<div>` and `<span>` elements with no landmark structure, no ARIA attributes, and minimal keyboard accessibility. This hurts screen reader users and keyboard-only users. Additionally, many CSS class names (`.topbar`, `.board`, `.column`, `.colHeader`) are doing naming work that semantic HTML should provide for free — switching to semantic elements is a CSS simplification too.

---

## Changes by File

### `Topbar.tsx`
- `<div className={styles.topbar}>` → `<header className={styles.topbar}>`
- `statusDot`: add `aria-hidden="true"` (decorative CSS circle)

### `Board.tsx`
- Both `<div className={styles.board}>` and `<div className={styles.boardEmpty}>` → `<main tabIndex={-1}>`
- `<div className={styles.boardEmptyIcon}>▪</div>` → add `aria-hidden="true"` (decorative)
- `boardEmptyInner` wrapper removed; `text-align: center` moved to `.boardEmpty`
- `boardEmptyText`: `<div>` → `<p>`

### `Column.tsx`
- `<div className={...column...}>` → `<section className={...} aria-label={col.title}>`
- `<div className={styles.colHeader}>` → `<header className={styles.colHeader}>`
- Icon buttons: `title` → `aria-label`, glyphs wrapped in `<Icon>`:
  - `←` → `aria-label="Move left"`
  - `→` → `aria-label="Move right"`
  - `✕` → `aria-label="Remove column"`
- Column type icon: add `aria-hidden="true"` (decorative, title in `<h2>`)
- Confirmation div: add `role="alert"` so it's announced by screen readers

### `AddColumnModal.tsx`
- Overlay div: add `role="dialog"`, `aria-modal="true"`, `aria-labelledby="add-column-modal-title"`
- `<h2>`: add `id="add-column-modal-title"`
- Wrap modal body + footer in a `<form onSubmit={handleAdd}>` (prevent default)
- Fix label/input: `htmlFor="column-title-input"` on label, `id="column-title-input"` on input
- Primary button: `type="submit"`, Cancel button: `type="button"`
- Add ESC key handler via `useEffect` to close modal on Escape
- Type selector buttons: `aria-pressed={selectedType === type}`, `type="button"`
- `<Icon>` for column type glyphs

### `AddColumnModal.module.css`
- Remove duplicate `.colIcon` block — already imported from `colStyles`

### Cards: `PRCard.tsx`, `IssueCard.tsx`, `CICard.tsx`, `NotifCard.tsx`, `ActivityCard.tsx`
- Root `<div className={cardStyles.card}>` → `<article className={cardStyles.card}>`
- `cardTitle` divs → `<p>`
- `cardMeta` divs → `<footer>` (supplementary metadata at bottom of article)

### `CardParts.tsx`
- `cardTop` div → `<header>` (top of article)
- Stat icons (✓, ⟳, 💬): `<Icon>` with `aria-label` on containing stat span

### `CICard.tsx` / `CICard.module.css`
- `ciBadgeWrapper` removed; badge moved into `<footer>` alongside branch and duration
- Duration moved next to branch with `·` separator; badge shows status only
- Status icon wrapped in `<Icon>` (label text alone conveys status)
- `margin-top` removed from `.ciBadge`
- `colBadge`: add `aria-label={\`${data.length} items\`}` — bare number had no context in tree

### `NotifCard.tsx`, `ActivityCard.tsx`
- Card icon glyphs: `<Icon className={cardStyles.cardIcon}>`

### `Icon.tsx` (new)
- Shared `<span aria-hidden="true">` wrapper for all decorative glyphs

### `App.tsx` / `App.module.css` / `globals.css`
- `appRoot` styles moved to `#root` in `globals.css`; `App.tsx` renders a Fragment; `App.module.css` deleted

### `globals.css`
- Contrast fixes (all now ≥ 4.5:1 on dark backgrounds, WCAG AA):
  - `--text-muted: #6b7280` → `#8a95a5`
  - `--text-faint: #4b5563` → `#748291`
  - `--text-ghost: #374151` → `#6e7f90`
- Add `:focus-visible` outline — fixes `button { all: unset }` stripping all focus rings

---

## CSS Impact

CSS class names stay — they're still needed for visual styles. The benefit is that semantic elements now carry meaning for free, and future CSS can use element selectors (`header`, `main`, `section`, `article`) instead of class names for structural targeting.

---

## Out of Scope

- Skip links
- Full focus trap in modal
- ARIA live regions
- Keyboard shortcuts

---

## Verification

1. `npm run dev` — nothing should look different visually
2. Browser DevTools Accessibility tree — confirm `header`, `main`, `section`, `article` landmarks
3. Tab through app — all buttons reachable, focus ring visible, icon buttons announce their `aria-label`
4. Open modal → press ESC → should close
5. Tab to title input in modal → label should announce "Column Title"
