# Bundle Size & UX Improvements

## Context

The app shipped a single ~101 KB JS chunk with no code splitting or vendor separation. Every deploy forced users to re-download all vendor code even if only app logic changed. Modals were eagerly bundled even though they aren't needed on first paint.

**SVG migration verdict: skipped.** The 18 icon components are tiny inline TSX files using `currentColor` for theming. Converting to `.svg` files would require either SVGR (round-trip with zero gain) or URL imports (breaks `currentColor`, requires CSS masking hacks). Icons contribute ~2–3 KB total and are not a meaningful optimization target.

## Changes

### 1. Vendor chunk splitting — `vite.config.ts`

Added `build.rollupOptions.output.manualChunks` that splits:

- `@atlaskit/pragmatic-drag-and-drop` → `dnd` chunk (largest single dep, isolated)
- All other `node_modules` → `vendor` chunk
- App code stays in `index` chunk

**Caching win:** vendor/dnd chunks get long-lived cache keys; only `index` changes on app deploys.

### 2. Lazy load modals — `src/components/App.tsx`

Replaced static imports of both modals with `lazy()` from `preact/compat`, wrapped in `<Suspense fallback={null}>`. The `null` fallback is correct — both modals render nothing when `open={false}`, so there's no flash.

**UX win:** Browser parses/executes less JS on initial paint. `AddColumnModal` only loads when the user clicks "+ Add Column".

### 3. Lazy load column types — `src/components/Column.tsx`

Replaced static imports of all 5 column components (`PRColumn`, `IssueColumn`, `CIColumn`, `NotifColumn`, `ActivityColumn`) with `lazy()`, each wrapped in `<Suspense fallback={null}>`.

**Caching + splitting win:** Each column type becomes its own chunk. Users who never add a CI column never download CI column code.

### 4. Test updates

Synchronous `getBy*` queries that ran before lazy components resolved were updated to async `findBy*` in:

- `src/components/Column.test.tsx`
- `src/components/Board.test.tsx`
- `src/components/App.e2e.test.tsx`

## Results

|                | Before  | After                                          |
| -------------- | ------- | ---------------------------------------------- |
| Chunks         | 1 JS    | index + vendor + dnd + per-column/modal chunks |
| `vendor` chunk | —       | 36.7 KB (cached across deploys)                |
| `dnd` chunk    | —       | 20.1 KB (cached across deploys)                |
| `index` chunk  | ~101 KB | 15.5 KB (only this changes on app deploys)     |

## Files changed

- `vite.config.ts` — added `build.rollupOptions.output.manualChunks`
- `src/components/App.tsx` — lazy modals + Suspense
- `src/components/Column.tsx` — lazy column types + Suspense
- `src/components/Column.test.tsx` — async findBy\* queries
- `src/components/Board.test.tsx` — async findBy\* queries
- `src/components/App.e2e.test.tsx` — async findBy\* queries
