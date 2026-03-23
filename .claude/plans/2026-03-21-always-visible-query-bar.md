# Always-Visible Query Bar

## Summary

Replaced the on-demand filter query UI (triggered by a pencil button in the column header controls) with a persistent query bar always shown below the column header.

## Changes

### `src/components/BaseColumn.tsx`

- Removed `queryOpen` state and the conditional rendering of the query bar
- Removed `onOpenSettings` prop passed to `ColumnHeader`
- The query `InlineEdit` is now always rendered, with `placeholder="Add filter…"` when no query is set

### `src/components/ColumnHeader.tsx`

- Removed `onOpenSettings` prop and the "Add filter" pencil button from the controls
- Removed `PencilIcon` import (no longer used here)

### `src/components/ui/InlineEdit.tsx`

- Added optional `placeholder?: string` prop
- In display mode, renders `<span className={styles.placeholder}>` when `value` is empty and a placeholder is provided

### `src/components/ui/InlineEdit.module.css`

- Added `.placeholder { color: var(--text-ghost); }` for the placeholder text
- Bumped display text color from `--text-muted` to `--text-secondary` for better legibility
- Changed confirm button color from `--color-accent` to `--text-muted` (accent color could be red, making the checkmark misleading)

### `src/components/BaseColumn.module.css`

- Removed `flex: 1` from `.colTitleTooltip` so the column title only takes as much space as its content
