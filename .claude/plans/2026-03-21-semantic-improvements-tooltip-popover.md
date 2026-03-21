# Semantic Improvements & Tooltip Popover Plan

## Context

A series of semantic HTML improvements were made, followed by adding an age tooltip and fixing tooltip overflow clipping with the Popover API.

---

## Part 1: Semantic HTML Improvements

### 1a. `role="alertdialog"` in `ColumnConfirmDelete.tsx`

The inline confirmation widget used `role="alert"`, which is for passive announcements. The confirm-remove prompt requires user interaction, making `role="alertdialog"` correct. Added `aria-labelledby` pointing to the prompt text.

**Files:** `src/components/ColumnConfirmDelete.tsx`

```tsx
<div className={styles.colConfirmation} role="alertdialog" aria-labelledby="confirm-remove-label">
  <span id="confirm-remove-label" className={styles.colConfirmationText}>Remove "{col.title}"?</span>
```

**Test update:** `test/components/Column.test.tsx` — `getByRole("alert")` → `getByRole("alertdialog")`

---

### 1b. `<h1>` in modal dialogs (`Modal.tsx`)

Each `<dialog>` is an independent document fragment — the first heading inside should be `<h1>`, not `<h2>`. Changed `<h2 id={titleId}>` to `<h1 id={titleId}>`.

**Files:** `src/components/ui/Modal.tsx`

---

### 1c. `<time dateTime>` for card ages

Card ages were previously stored as pre-formatted strings ("2h", "1d"). Changed the `age` field throughout the data layer to ISO 8601 strings so `<time dateTime={age}>` works correctly. `formatAge(isoString)` is called at render time for display.

**Files changed:**
- `src/store/githubMappers.ts` — all `age: formatAge(...)` → `age: item.updated_at` (raw ISO strings)
- `src/demo/mock.ts` — added `h()`, `d()`, `m()` helpers; replaced hardcoded strings with dynamic ISO calls
- `src/components/cards/CardParts.tsx` — `CardTop` now renders `<time dateTime={age}>{formatAge(age)}</time>`

---

## Part 2: Age Tooltip

Added a tooltip to the relative-time display so users can see the exact date on hover.

**`src/components/cards/CardParts.tsx`:**
```tsx
<Tooltip text={new Date(age).toLocaleString()} position="below">
  <time dateTime={age}>{formatAge(age)}</time>
</Tooltip>
```

---

## Part 3: Tooltip Popover Rewrite

### Problem

The `Tooltip` component used `position: absolute`, which is clipped by the column's `overflow-y: auto` container. Tooltips on card ages were cut off.

### Solution

Use the Popover API (`popover="hint"`) to render tooltips in the top layer, escaping all overflow clipping. Use CSS anchor positioning to place the tooltip relative to its trigger.

`popover="hint"` is not yet supported in Firefox but falls back to `popover="manual"` automatically.

### `src/components/ui/Tooltip.tsx`

- Add `useRef` for the popover span
- Derive a unique `anchorName` CSS custom property from `useId()`
- Add `onMouseEnter`/`onMouseLeave`/`onFocusIn`/`onBlurCapture` handlers calling `showPopover()`/`hidePopover()` (guarded with `?.` cast to `any` for test environments that don't implement the Popover API)
- Set `style={{ anchorName }}` on the wrapper span
- Add `popover="hint"` and `style={{ positionAnchor: anchorName }}` to the tooltip span

### `src/components/ui/Tooltip.module.css`

- Remove `position: relative` from `.wrapper`
- Replace `position: absolute` with anchor positioning:
  - `inset: auto; margin: 0` — reset popover browser defaults
  - `left: anchor(center); translate: -50% 0` — horizontal centering
  - `.above`: `bottom: anchor(top); translate: -50% -6px`
  - `.below`: `top: anchor(bottom); translate: -50% 6px`
- Visibility driven by `:popover-open` (opacity 1, scale 1)
- Entry animation via `@starting-style { &:popover-open { opacity: 0; scale: 0.95 } }`
- `transition` includes `display allow-discrete` and `overlay allow-discrete` for proper top-layer exit animation
- CSS `:hover`/`:focus-within` show triggers removed (handled in JS)

---

## Verification

```bash
npm run build    # TypeScript + Vite build must pass
npm run lint     # oxlint must pass
npm test         # vitest must pass (showPopover/hidePopover guarded for happy-dom)
```

Manual: hover over card ages — tooltip should appear above/below the column overflow boundary.
