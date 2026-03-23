# Plan: Fix React Antipatterns

## Context

Several components used React antipatterns or unnecessary JS where native browser behavior suffices. This plan addresses the ones with real impact, skipping intentional workarounds (e.g. `useColumnDragDrop`'s `setAttribute` has an explanatory comment) and non-issues (`showModal()` is required for modal dialogs — the `open` attribute creates non-modal dialogs).

---

## Changes

### 1. `App.tsx` — Remove `useEffect` that syncs auth state → modal

**Problem:** `useEffect` calls `closeAuthModal()` when `authStatus === "authed"`. This is derived-state sync, not a side effect.

**Fix:** Remove the `useEffect` entirely. The `open` prop passed to `<AuthModal>` (see §3a) will be `authModal.isOpen && authStatus !== "authed"` — the modal hides automatically when auth is achieved via the `open` prop, no effect needed. Also remove the destructured `close: closeAuthModal` line since it's no longer used.

**File:** `src/components/App.tsx`

---

### 2. `AuthModal.tsx` — Remove duplicate `useEffect` for onClose

**Problem:** `useEffect(() => { if (status === "authed") onClose(); })` — the parent (`App.tsx`) already handles closing the modal when authed (after fix #1 above). This is redundant.

**Fix:** Delete the effect entirely.

**File:** `src/components/AuthModal.tsx`

---

### 3. `Modal.tsx` — Add `open` prop; remove manual Escape keydown listener

**Problem:**

- Visibility is split across two mechanisms: callers conditionally render `<Modal>` and Modal calls `showModal()` on mount. This is inconsistent — the dialog's open state isn't owned in one place.
- A `document.addEventListener("keydown", ...)` effect manually handles Escape. The native `<dialog>` `onCancel` event already covers this.

**Fix:**

1. Add `open: boolean` prop to `Modal`. Drive `showModal()` / `close()` from a `useEffect` watching `open`:
   ```tsx
   useEffect(() => {
     if (open) dialogRef.current?.showModal();
     else dialogRef.current?.close();
   }, [open]);
   ```
2. Remove the manual Escape `keydown` listener. Handle both cases in `onCancel`:
   ```tsx
   onCancel={
     preventCancel
       ? (e) => e.preventDefault()
       : (e) => { e.preventDefault(); onClose(); }
   }
   ```
   Both branches call `e.preventDefault()` so the dialog doesn't close natively (React controls unmounting via the `open` prop effect).
3. Callers (`AddColumnModal`, `AuthModal`) no longer conditionally render — always render `<Modal open={...}>`. The `open` value comes from the same boolean that previously gated conditional rendering.

**File:** `src/components/ui/Modal.tsx`

---

### 3a. Update callers of `Modal`

**`App.tsx`:** Change from conditional render to always-rendered with `open` prop:

```tsx
// Before
{authModal.isOpen && authStatus !== "authed" && <AuthModal ... />}
{addColumnModal.isOpen && <AddColumnModal ... />}

// After
<AuthModal open={authModal.isOpen && authStatus !== "authed"} ... />
<AddColumnModal open={addColumnModal.isOpen} ... />
```

**`AuthModal.tsx` and `AddColumnModal.tsx`:** Pass `open` through to `<Modal open={open} ...>`. Update their prop interfaces to include `open: boolean`.

**Files:** `src/components/App.tsx`, `src/components/AuthModal.tsx`, `src/components/AddColumnModal.tsx`

---

### 4. `Topbar.tsx` — Remove unnecessary `hidePopover()` call

**Problem:** After `onSignOut()`, the component re-renders without the authed section, removing the popover from the DOM entirely. The `hidePopover()` call is redundant.

**Fix:** Remove `ref={userMenuRef}`, the `userMenuRef` ref declaration, and the `hidePopover()` call in the sign-out handler. Also remove the `PopoverElement` type alias.

**File:** `src/components/Topbar.tsx`

---

### 5. `InlineEdit.tsx` — Document mixed controlled/uncontrolled textarea

**Problem:** `cancel()` directly mutates `textareaRef.current!.value = value` — mixing uncontrolled `defaultValue` with imperative DOM mutation. The pattern is valid but non-obvious.

**Fix:** Add an explanatory comment to `cancel()`. Add a comment to `onKeyUp` explaining that Escape is intentionally on keyup to avoid interfering with keydown handlers elsewhere (e.g. dialog's `onCancel` fires on keydown).

Note: The linter simplified `cancel()` to just `setEditing(false)` (dropping the DOM mutation), keeping `defaultValue` as the source of truth on re-mount.

**File:** `src/components/ui/InlineEdit.tsx`

---

### 6. `AddColumnModal.test.tsx` — Update ESC test to fire `cancel` event

**Problem:** The existing test fired `{Escape}` keyboard input, which relied on the old manual `keydown` listener in Modal. jsdom does not route Escape through `onCancel` on dialog elements.

**Fix:** Replace the keyboard event with `fireEvent(dialog, new Event("cancel", { cancelable: true }))` to match actual browser behavior.

**File:** `src/components/AddColumnModal.test.tsx`

---

## Files Modified

- `src/components/App.tsx`
- `src/components/AuthModal.tsx`
- `src/components/AddColumnModal.tsx`
- `src/components/AddColumnModal.test.tsx`
- `src/components/ui/Modal.tsx`
- `src/components/Topbar.tsx`
- `src/components/ui/InlineEdit.tsx`

## Verification

```bash
npm run build   # TypeScript check + build — must pass
npm run lint    # Must pass
npm test        # Must pass
```

All checks passed. 122 tests passing.
