# Plan: Custom Hook Extraction

## Context
After the code quality refactor (2026-03-19-code-quality-refactor.md), `Column.tsx` still holds several
independent state/effect clusters that would benefit from extraction. Two other components
(`AuthModal.tsx`, `ColumnSettingsModal.tsx`) each have one small but reusable pattern worth pulling out.
`App.tsx` has straightforward modal state that can be tidied with a generic hook.

---

## Hooks to Extract

### 1. `useColumnDragDrop` — `Column.tsx` lines 26–77
**New file:** `src/hooks/useColumnDragDrop.ts`

**State/effects to move:**
- `isDragging` / `dropEdge` state (lines 26–27)
- `ref` / `handleRef` refs (lines 28–29)
- Atlaskit `draggable` + `dropTargetForElements` effect (lines 46–77)

**Signature:**
```ts
function useColumnDragDrop(columnId: string): {
  ref: RefObject<HTMLElement>;
  handleRef: RefObject<HTMLSpanElement>;
  isDragging: boolean;
  dropEdge: 'left' | 'right' | null;
}
```

**Consumers:** `Column.tsx` (replace the 4 declarations + effect with one hook call)

---

### 2. `useRefreshSpinner` — `Column.tsx` lines 22, 31–38, 79–83
**New file:** `src/hooks/useRefreshSpinner.ts`

**State/effects to move:**
- `spinning` state (line 22)
- `prevFetching` ref + fetch-completion effect (lines 31–38)
- `handleRefresh` callback (lines 79–83)

**Signature:**
```ts
function useRefreshSpinner(
  isFetching: boolean,
  refetch: () => void,
): {
  spinning: boolean;
  lastUpdated: Date | null;
  handleRefresh: () => void;
}
```

Note: `lastUpdated` state (line 24) and its update logic (inside the same effect at lines 33–38) are
produced by the same `prevFetching` effect, so include it here and remove the separate `lastUpdated`
state from `Column.tsx`.

**Consumers:** `Column.tsx` (removes ~10 lines + the `prevFetching` ref)

---

### 3. `useMinuteTicker` — `Column.tsx` lines 25, 40–44
**New file:** `src/hooks/useMinuteTicker.ts`

**State/effects to move:**
- `[, setTick]` state (line 25)
- 60-second `setInterval` effect (lines 40–44)

**Signature:**
```ts
function useMinuteTicker(): void
// Just triggers re-render every 60s; no return value needed.
```

**Consumers:** `Column.tsx` (replace 5 lines with one call)

---

### 4. `useConfirmation` — `Column.tsx` line 21, `ColumnSettingsModal.tsx` line 14
**New file:** `src/hooks/useConfirmation.ts`

**State to move:**
- `confirming` / `confirmingClear` boolean + setter

**Signature:**
```ts
function useConfirmation(): {
  isConfirming: boolean;
  startConfirm: () => void;
  cancelConfirm: () => void;
}
```

**Consumers:**
- `Column.tsx`: replace `confirming` state
- `ColumnSettingsModal.tsx`: replace `confirmingClear` state

---

### 5. `useCountdownTimer` — `AuthModal.tsx` lines 16, 22–28
**New file:** `src/hooks/useCountdownTimer.ts`

**State/effects to move:**
- `secondsLeft` state (line 16)
- `setInterval` countdown effect (lines 22–28)

**Signature:**
```ts
function useCountdownTimer(expiresAt: number | null): number
// Returns secondsLeft directly (single value, no object wrapper needed).
```

**Consumers:** `AuthModal.tsx` (replace ~7 lines with one call)

---

### 6. `useModal` — `App.tsx` lines 21, 25
**New file:** `src/hooks/useModal.ts`

**State to move:**
- Generic `boolean` open/close state

**Signature:**
```ts
function useModal(initialOpen?: boolean): {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}
```

**Consumers:** `App.tsx` — replace `showModal` and `showAuthModal` with two `useModal` calls.

Note: `showAuthModal` has a non-trivial initial value (`!isDemoMode && auth.status === "idle"`) and is
set imperatively in `handleSignOut`. Pass `initialOpen` for the first case; the `open()` function
replaces `setShowAuthModal(true)`.

---

## File Inventory

| File | Action |
|---|---|
| `src/hooks/useColumnDragDrop.ts` | New |
| `src/hooks/useRefreshSpinner.ts` | New |
| `src/hooks/useMinuteTicker.ts` | New |
| `src/hooks/useConfirmation.ts` | New |
| `src/hooks/useCountdownTimer.ts` | New |
| `src/hooks/useModal.ts` | New |
| `src/components/Column.tsx` | Remove extracted state/effects; import 4 new hooks |
| `src/components/AuthModal.tsx` | Replace countdown state/effect; import `useCountdownTimer` |
| `src/components/ColumnSettingsModal.tsx` | Replace `confirmingClear` state; import `useConfirmation` |
| `src/components/App.tsx` | Replace two modal state pairs; import `useModal` |

---

## Execution Order

1. `useMinuteTicker` — trivial, no external deps
2. `useCountdownTimer` — trivial, updates `AuthModal.tsx` only
3. `useConfirmation` — simple boolean hook, updates two files
4. `useModal` — simple boolean hook, updates `App.tsx`
5. `useRefreshSpinner` — absorbs `lastUpdated` logic, updates `Column.tsx`
6. `useColumnDragDrop` — largest extraction, updates `Column.tsx`

Build check (`npm run build`) after each step. Full `npm test` at the end.

## Status: COMPLETE (2026-03-19)
All 68 tests pass.
