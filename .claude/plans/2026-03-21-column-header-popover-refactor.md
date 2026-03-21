# Column Header Dropdown: Popover API Refactor

## Context

The column header dropdown menu (added in the column settings modal plan) was initially implemented with `useState` + a `useEffect` document-click listener for light-dismiss. This is a manual reimplementation of behaviour the browser provides natively via `popover="auto"`. This plan refactors the dropdown to use the Popover API + CSS anchor positioning, following the same pattern already used by `Tooltip.tsx`.

## What Was Built

- `popover="auto"` on the `<menu>` element — provides native light-dismiss (outside-click closes) with no JS listener
- `popovertarget` on the drag handle button — declaratively wires button → popover toggle
- CSS anchor positioning (`anchorName` on button, `positionAnchor` on menu) — places the menu below the button without a wrapper `<div>` or JS coordinate calculation; follows the exact same pattern as `Tooltip.tsx`
- `onToggle` on the menu syncs `menuOpen` state — used to conditionally suppress the `Tooltip` while the menu is open

**Removed:** `useEffect` document-click listener, `menuRef`, `.handleWrap` wrapper `<div>`

### Why conditional Tooltip rendering is still needed

`Tooltip` uses `popover="hint"`, which *should* be auto-dismissed when a `popover="auto"` opens. However, `popover="hint"` support is not yet complete in Firefox, so the tooltip must be suppressed manually via `menuOpen` state for now. A `TODO` comment in `ColumnHeader.tsx` explains this — once Firefox catches up, the `onToggle` handler and conditional render can be removed.

## Files Modified

| File | Change |
|------|--------|
| `src/components/ColumnHeader.tsx` | Popover API wiring; CSS anchor positioning; `onToggle` for tooltip suppression |
| `src/components/ColumnHeader.module.css` | Removed `.handleWrap`; `.dropMenu` uses `position: absolute` with `anchor()` for placement |
