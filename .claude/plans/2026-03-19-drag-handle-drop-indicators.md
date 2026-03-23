# Plan: Drag Handle + Drop Indicators for Columns

## Context

Previously, the entire column header had `cursor: grab` and the whole `<section>` element was draggable. This adds:

1. A dedicated drag handle icon (⠿) that is the only drag initiator
2. Visual drop indicators (vertical bars) between columns when dragging

## Changes

### `src/components/Column.tsx`

1. Added `const handleRef = useRef<HTMLSpanElement>(null);`
2. Added `const [dropEdge, setDropEdge] = useState<'left' | 'right' | null>(null);`
3. Updated `draggable()` call — added `dragHandle: handleRef.current ?? undefined`
4. Updated `dropTargetForElements()` — added edge-detection callbacks:
   - `onDragEnter`/`onDrag`: compare `clientX` to column midpoint, set `dropEdge`
   - `onDragLeave`/`onDrop`: set `dropEdge(null)`
   - `canDrop`: skip self-drops (`source.data.columnId !== col.id`)
5. Updated `<section>` className: adds `styles.dropLeft` / `styles.dropRight` conditionally
6. Added `<span ref={handleRef} className={styles.dragHandle} aria-hidden="true">⠿</span>` as first child of `<header>`

### `src/components/Column.module.css`

1. Removed `cursor: grab` from `.colHeader`
2. Added `position: relative` to `.column`
3. Added drag handle styles — hidden by default, fades in on header hover, full opacity on direct hover
4. Added drop indicator pseudo-elements — `::before`/`::after` on `.dropLeft`/`.dropRight`, positioned at ±8px (Board gap is 12px), coloured with `--color-accent`

## Status

Implemented and verified:

- `npm run build` — TypeScript passes
- `npm test` — 68/68 tests pass
