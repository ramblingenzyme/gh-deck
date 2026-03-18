# Column Header: Cursor Fixes + Styled Accessible Tooltips

## Context

The column header had two issues:
1. **Cursor**: Non-interactive text elements (`.colIcon`, `.colTitle`, `.colBadge`, `.lastUpdated`) rendered with a text/I-beam cursor because they contain text. They should show `cursor: default`.
2. **Tooltips**: All tooltips used the native HTML `title` attribute, which is unstyled, inaccessible on touch/keyboard, and can't be styled. Replaced with a proper styled tooltip component.

## Changes

### `src/components/ui/Tooltip.tsx` + `src/components/ui/Tooltip.module.css` — new files

Styled, accessible tooltip component:
- `role="tooltip"` + `aria-describedby` linkage
- Shows on hover and `:focus-within` (keyboard accessible)
- `position` prop: `'above' | 'below'` (default `'above'`)
- Animated (opacity + scale), respects `prefers-reduced-motion`

### `src/components/Column.module.css`

- Added `cursor: default` to `.colIcon`, `.colTitle`, `.colBadge`, `.lastUpdated`
- Added `user-select: none` to `.colHeader`

### `src/components/Column.tsx`

- Wrapped all 5 header buttons with `<Tooltip position="below">` using existing `aria-label` text; removed `title` attributes
- Wrapped `<h2 className={styles.colTitle}>` with `<Tooltip position="below">` for overflow hint
- Wrapped `<output className={styles.colBadge}>` with `<Tooltip position="below">` showing count + type-specific term (e.g. "3 PRs", "1 issue")
- Wrapped `<span className={styles.lastUpdated}>` with `<Tooltip position="below">` showing full `toLocaleTimeString()`

### `src/constants/index.ts`

- Added `itemLabel` field to `COLUMN_TYPES` for per-type badge tooltip terminology:
  - `prs` → "PR" / "PRs"
  - `issues` → "issue" / "issues"
  - `ci` → "run" / "runs"
  - `notifications` → "notification" / "notifications"
  - `activity` → "event" / "events"
