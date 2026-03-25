# Fix .colQuery not expanding when textarea grows in Firefox

## Context

`.colQuery` (flex row inside `.column` flex column) → `.editRow` (flex row) → `textarea`. Firefox doesn't propagate dynamic height changes from nested flex containers back up to `.colQuery`'s flex-assigned height. Reading `offsetHeight` on `.colQuery` after resizing the textarea forces a synchronous layout flush, breaking the cache.

Rather than fragile DOM traversal (`el.parentElement.parentElement`), pass a ref to `.colQuery` explicitly from BaseColumn to InlineEdit.

## Fix

**`src/components/ui/InlineEdit.tsx`** — add a `containerRef` prop:

```ts
interface InlineEditProps {
  // ... existing props
  containerRef?: RefObject<HTMLElement | null>;
}
```

In `autoResize`, read `offsetHeight` on the container after setting the textarea height:

```js
const autoResize = () => {
  const el = textareaRef.current;
  if (el) {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
    void containerRef?.current?.offsetHeight;
  }
};
```

**`src/components/BaseColumn.tsx`** — create a ref for `.colQuery` and pass it to `InlineEdit`:

```tsx
const colQueryRef = useRef<HTMLDivElement>(null);
// ...
<div ref={colQueryRef} className={styles.colQuery}>
  <InlineEdit
    containerRef={colQueryRef}
    // ... existing props
  />
```

## Files

- `src/components/ui/InlineEdit.tsx`
- `src/components/BaseColumn.tsx`

## Verification

- Firefox: edit mode with a long string — textarea grows and `.colQuery` expands to contain it, no overflow
