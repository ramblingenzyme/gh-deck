# Codebase Nitpick Fixes

> Date: 2026-03-19

Addressed 16 issues across bugs, code quality, type safety, and style. Also added unit tests for the three bugs and three E2E-style integration tests.

---

## Bugs fixed

### 1. Refresh spinner decoupled from fetch state (`useRefreshSpinner.ts`)

Replaced the hardcoded 800 ms `setTimeout` with logic driven by `isFetching`. The spinner now stays on until the fetch completes, then stops — respecting an 800 ms minimum display time so it doesn't flash on fast fetches.

### 2. Missing `authModal.close` dep in `useEffect` (`App.tsx`, `useModal.ts`)

Stabilised `open` and `close` in `useModal` with `useCallback` so their references don't change between renders. Added `authModal.close` to the `useEffect` dependency array in `App.tsx`.

### 3. Unknown filter keys silently passed everything (`queryFilter.ts`)

Changed `default: return true` to `default: return false` in the `matchesTokens` switch. Mistyped keys like `authr:alice` now correctly match zero items.

---

## Code quality

### 4. Duplicate `CardTop` definition (`ui/Card.tsx`, `cards/CardParts.tsx`)

Removed the private copy in `Card.tsx`; it now imports `CardTop` from `CardParts.tsx`.

### 5. Duplicated midpoint calculation in `useColumnDragDrop.ts`

Extracted the 3-line block into a shared `updateDropEdge(clientX)` helper called by both `onDragEnter` and `onDrag`.

### 6. `renderCard` closure defined inside component body (`Column.tsx`)

Moved `renderCard` outside the `Column` component as a module-level function taking `colType` as a parameter.

### 7. Redundant `as ActivityType` casts (`githubMappers.ts`)

Removed all `as ActivityType` casts; the return type annotation on `mapEvent` is sufficient.

### 8. Sign-out uses `document.getElementById` (`Topbar.tsx`)

Replaced the manual DOM query with a typed `useRef<PopoverElement>` on the popover `<div>`.

### 9. Trailing blank line in `Column.tsx`

Removed the blank line between the closing `</div>` and `</section>`.

---

## Type safety

### 10. `JSON.parse` result cast without validation (`layoutStorage.ts`)

Added an `Array.isArray` guard before the `as` cast so a non-array value (string, number, object) returns `DEFAULT_COLUMNS` intentionally rather than throwing.

### 11. `as string` casts on drag-and-drop data (`Board.tsx`)

Replaced `as string` casts with `typeof ... === 'string'` runtime guards; the function returns early if either value is not a string.

---

## Minor / style

### 12. Dead `stableId` fallbacks (`githubMappers.ts`)

Removed `|| stableId(event.id)` / `|| stableId(n.id)` throughout `mapEvent` and `mapNotification`; GitHub IDs are always numeric strings. The now-unused `stableId` function was also deleted, along with the unused `ActivityType` import.

### 13. `filter` helper re-created every render (`useColumnData.ts`)

Wrapped `filter` in `useCallback` keyed on `tokens` for consistency.

### 14. `noop` declared inside function body (`useColumnData.ts`)

Hoisted `const noop = () => {}` to module scope.

### 15. Double cast for `ref` in `PushEvent` handler (`githubMappers.ts`, `github.ts`)

Added `ref?: string` to `GHEvent.payload` in `github.ts`; removed the `(event.payload as { ref?: string }).ref` workaround.

---

## Tests added

- **`src/utils/queryFilter.test.ts`** — 18 tests covering bug 3 (unknown keys → false) and all known filter keys
- **`src/hooks/useRefreshSpinner.test.ts`** — 8 tests covering bug 1 (spinner tied to `isFetching`, minimum display time, `lastUpdated` stamping)
- **`src/hooks/useModal.test.ts`** — 9 tests covering bug 2 (stable `close`/`open` references, modal closes when auth becomes `'authed'`)
- **`src/components/App.e2e.test.tsx`** — 4 full-app integration tests: board loads with default columns, add column flow, remove column flow

---

## What was NOT changed

- Item 6 from the original report ("`CardMeta` and `CardFooter` both render `<footer>`") was reverted after implementation — semantic HTML elements should not be replaced with `<div>`.
