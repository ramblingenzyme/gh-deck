# Column Settings Modal (Phase 1 of 3)

## Context

CI, Releases, Deployments, and Security columns make parallel API requests per `repo:owner/repo` token in the query string. Users currently have no discoverability for this — they must know to type `repo:owner/repo` manually. The long-term goal is a visual repo picker in a Column Settings modal. This plan (Phase 1) lays the foundation: a settings modal accessible via the drag handle, with title and query editing. The repo picker comes in Phases 2–3.

## What Was Built

- Drag handle (`<span>`) converted to a `<button>` that triggers a dropdown menu on click
- Tooltip on the drag handle: "Drag to reorder · Click for settings"
- Clicking "Settings" in the dropdown opens a `ColumnSettingsModal`
- Modal contains: title field + filter query field + Cancel / Save
- Save calls `updateColumnTitle` and `updateColumnQuery` on the layout store

## Files Modified

| File | Change |
|------|--------|
| `src/components/ColumnHeader.tsx` | Drag handle → button; dropdown menu; `onOpenSettings` prop |
| `src/components/BaseColumn.tsx` | `settingsOpen` state; render `ColumnSettingsModal` |
| `src/store/layoutMutations.ts` | Added `applyUpdateTitle` |
| `src/store/layoutStore.ts` | Added `updateColumnTitle` action |
| `src/hooks/useColumnDragDrop.ts` | `handleRef` type `HTMLSpanElement` → `HTMLButtonElement` |

## New Files

| File | Purpose |
|------|---------|
| `src/components/ColumnSettingsModal.tsx` | Settings modal (title + query fields) |
| `src/components/ColumnSettingsModal.module.css` | Modal field label styles |
| `src/components/ColumnHeader.module.css` | Dropdown menu styles |
