# Context

`RepoChipList` is a multi-select combobox for repository selection. This session polished it to meet standard multi-select/combobox UX expectations.

---

## Files modified

- `src/components/ui/RepoChipList.tsx`
- `src/components/ui/RepoChipList.module.css`
- `src/components/ui/usePopoverToggle.ts` (extracted from RepoChipList)
- `src/components/ui/useChipKeyNav.ts` (extracted from RepoChipList)
- `src/components/ui/icons/ChevronDownIcon.tsx` (new)
- `src/components/ui/SvgIcon.tsx` — added `chevronDown` to ICON_MAP
- `src/utils/focus.ts` — extracted `FOCUSABLE_SELECTOR`
- `src/utils/id.ts` — extracted `cleanId` utility
- `src/globals.css` — added `interpolate-size: allow-keywords` to `:root`
- `test/components/ui/RepoChipList.test.tsx`
- `test/components/ui/usePopoverToggle.test.tsx` (new)
- `test/components/ui/useChipKeyNav.test.tsx` (new)

---

## Changes made

### Keyboard / focus

- `<menu>` given `tabIndex={-1}` — no longer a Tab stop
- **Backspace on empty input**: focuses the last chip's remove button (first press) — remove button's `onKeyDown` handles deletion on second press, then re-focuses input
- **Backspace/Delete on focused chip**: removes it and re-focuses input
- **Tab from chip remove button**: returns focus to input
- **Shift+Tab from input**: focuses last chip's remove button
- **Shift+Tab from first chip**: moves to previous focusable element in document (programmatic tab order search), closes menu
- **Tab from chip**: goes to input
- **ArrowDown/Up in menu**: cycles (wraps around) using modular arithmetic

### Dropdown behaviour

- `chipAreaRef` added; click-outside handler updated to use it
- Clicking anywhere in chip area toggles menu open/closed; `justClosedRef` prevents focus handler from immediately re-opening
- Chevron button (`tabIndex={-1}`) stops propagation on `pointerDown` so it handles its own toggle cleanly
- Hover over menu item syncs focus and `aria-selected` (via `onMouseEnter → focus({ preventScroll: true })`)
- `usePopoverToggle` hook encapsulates open/close state, click-outside, and Escape handling
- `useChipKeyNav` hook encapsulates chip keyboard navigation

### Chevron affordance

- SVG `ChevronDown` component (12×12, `currentColor` stroke) registered in SvgIcon ICON_MAP as `chevronDown`
- Absolutely positioned top-right; chipArea gets `padding-right: 28px`

### Dropdown connection

- When open (`data-open` on chipArea): bottom border removed, bottom corners squared, border-color set to `--accent-ui`
- Menu: `margin: 0`, `border-top: none`, top corners squared — sits flush below field
- `interpolate-size: allow-keywords` added to `:root` in `globals.css`; only open animation (`@starting-style`) retained

### Visual / ARIA

- `aria-expanded` on input reflects `isOpen`
- `aria-selected` on options driven by `activeIndex` state; first option pre-selected (`activeIndex: 0`) on typing
- Chip focus: `border-color: var(--accent-ui)` via `.chip:has(:focus-visible)`
- Chip hover: danger border tint + danger × color on `.chip:hover`; × hover state scoped to button only
- × button: full-height via `padding: 0` on chip + `min-width` on button, right-only border-radius
- Chip background: `var(--bg-hover)` / `var(--border-ghost)` border
- Placeholder: `--text-ghost` color; hidden (`""`) once any repos are selected
- "Create" entry appended to options when typed value isn't an existing suggestion

### Utilities extracted

- `FOCUSABLE_SELECTOR` → `src/utils/focus.ts`
- `cleanId` (strips `:` from `useId()` output for CSS/DOM use) → `src/utils/id.ts`; used in `RepoChipList`, `ColumnHeader`, and `Tooltip`

---

## Test coverage (44 tests in RepoChipList.test.tsx + 12 in usePopoverToggle + 11 in useChipKeyNav)

### RepoChipList

- Chip rendering, remove button, Enter add/validation, duplicate prevention, create entry, remount persistence
- Suggestion filtering and exclusion of already-added repos
- Backspace: focuses last chip (first press), removes on second press, no-op on non-empty input
- Backspace/Delete on chip remove button removes and re-focuses input
- Tab/Shift+Tab navigation through chips and input
- Tab from option closes menu; Tab from input closes menu
- ArrowDown/Up cycle navigation (wrapping from last→first and first→last)
- ArrowDown from closed menu opens it
- Typing characters while option is focused forwards to input and returns focus
- Clicking suggestion calls `onAdd` and clears input
- `aria-expanded` / `aria-selected` reflect state
- Escape closes menu and returns focus to input
- Click-outside closes menu; clicking chip area toggles
- Empty state shown when filter matches nothing

### usePopoverToggle

- open/close state and popover API calls
- Auto-close when filteredCount drops to 0
- Outside click closes; inside anchor/menu click does not
- Escape key closes and focuses input

### useChipKeyNav

- handleInputNavKeys: Shift+Tab, Backspace (empty/non-empty), other keys
- handleChipRemoveKeyDown: Tab/Shift+Tab navigation, Backspace/Delete removal
