# Rename Column.module.css → BaseColumn.module.css + Per-Type Accent CSS

## Context

`Column.module.css` served two distinct concerns: base column layout/UI shared across all column types, and per-type accent color overrides (`.prs`, `.issues`, etc.). Splitting these makes ownership clearer — each column type component owns its own accent color — and the rename aligns the CSS file with the component it primarily serves.

## Approach

### 1. Create per-column CSS files

One CSS module per column type in `src/components/columns/`, each with a single `.accent` class:

- `PRColumn.module.css` — `--color-accent: #818cf8`
- `IssueColumn.module.css` — `--color-accent: #f87171`
- `CIColumn.module.css` — `--color-accent: #fbbf24`
- `NotifColumn.module.css` — `--color-accent: #4ade80`
- `ActivityColumn.module.css` — `--color-accent: #c4b5fd`

### 2. Rename Column.module.css → BaseColumn.module.css

Removed the 5 accent color rules (`.prs`, `.issues`, `.ci`, `.notifications`, `.activity`) from the top of the file.

### 3. Add `accentClass` prop to BaseColumn

```tsx
interface BaseColumnProps {
  col: ColumnConfig;
  onRemove: (id: string) => void;
  renderCard: (item: AnyItem) => ReactNode;
  accentClass?: string;
}
```

Replaced `styles[col.type]` in the `columnClass` array with the `accentClass` prop.

### 4. Each column component imports its CSS and passes `accentClass`

```tsx
import styles from './PRColumn.module.css';
// ...
<BaseColumn accentClass={styles.accent} col={col} onRemove={onRemove} renderCard={...} />
```

### 5. ColumnHeader.tsx and ColumnConfirmDelete.tsx imports updated

```tsx
import styles from "./BaseColumn.module.css";
```

### 6. AddColumnModal.tsx updated

Replaced single `colStyles` import with per-type imports and a lookup map:

```tsx
import prStyles from "./columns/PRColumn.module.css";
// ... (one per type)

const ACCENT_CLASS: Record<ColumnType, string | undefined> = {
  prs: prStyles.accent,
  issues: issueStyles.accent,
  ci: ciStyles.accent,
  notifications: notifStyles.accent,
  activity: activityStyles.accent,
};
```

## Notes

- `accentClass` is typed `string | undefined` because CSS module class lookups return `string | undefined`
- `Column.module.css` deleted after all imports were migrated
